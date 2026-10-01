/**
 * Rule-based outfit matching engine.
 *
 * Pure, deterministic, browser-side scoring over wardrobe item attributes
 * (category, warmth, formality, weather suitability, color). No network
 * calls, no AI — just weighted rules so the same inputs always produce the
 * same ranked suggestions.
 */

export type WardrobeCategory = "top" | "bottom" | "shoes" | "outerwear" | "accessory" | "dress";

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  color: string;
  warmth: number; // 1 (very light) - 5 (very warm)
  formality: number; // 1 (very casual) - 5 (very formal)
  weather_suitability: string[];
  is_favorite?: boolean;
  notes?: string;
}

export type Occasion =
  | "wedding"
  | "office"
  | "date night"
  | "casual outing"
  | "interview"
  | "party"
  | "outdoor sports";

export type VenueType = "indoor" | "outdoor" | "beach" | "restaurant" | "office";
export type Weather = "sunny" | "rainy" | "cold" | "hot" | "windy";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type DressCode = "casual" | "smart casual" | "business" | "formal";

export interface AskAnswers {
  occasion: Occasion;
  venueType: VenueType;
  weather: Weather;
  temperature: number;
  timeOfDay: TimeOfDay;
  dressCode: DressCode;
  notes?: string;
}

export interface OutfitSuggestion {
  id: string;
  items: Partial<Record<WardrobeCategory, WardrobeItem>>;
  score: number;
  explanation: string;
}

// Target formality (1-5) expected for each dress code — used as the anchor;
// occasion nudges it up/down a little.
const DRESS_CODE_FORMALITY: Record<DressCode, number> = {
  casual: 1.5,
  "smart casual": 2.75,
  business: 4,
  formal: 5,
};

const OCCASION_FORMALITY_NUDGE: Record<Occasion, number> = {
  wedding: 0.75,
  office: 0.25,
  "date night": 0.25,
  "casual outing": -0.25,
  interview: 0.5,
  party: 0.25,
  "outdoor sports": -1,
};

// Ideal warmth (1-5) by temperature band — colder temps want higher warmth.
function idealWarmth(temperature: number): number {
  if (temperature <= 35) return 5;
  if (temperature <= 50) return 4;
  if (temperature <= 65) return 3;
  if (temperature <= 78) return 2;
  return 1;
}

function targetFormality(answers: AskAnswers): number {
  const base = DRESS_CODE_FORMALITY[answers.dressCode];
  const nudge = OCCASION_FORMALITY_NUDGE[answers.occasion] ?? 0;
  return Math.min(5, Math.max(1, base + nudge));
}

/** How well an item's weather tags match the requested weather/venue. */
function weatherScore(item: WardrobeItem, answers: AskAnswers): number {
  let score = 0;
  const tags = (item.weather_suitability || []).map((w) => w.toLowerCase());
  if (tags.includes(answers.weather)) score += 3;
  if (answers.venueType === "beach" && tags.includes("beach")) score += 2;
  if (answers.venueType === "outdoor" && (tags.includes("windy") || tags.includes("rainy"))) score += 0.5;
  // Penalize clearly wrong-season picks (e.g. shorts for cold, puffer for hot)
  if (answers.weather === "cold" && item.warmth <= 1) score -= 2;
  if (answers.weather === "hot" && item.warmth >= 4) score -= 2;
  if (answers.weather === "rainy" && item.category === "shoes" && tags.length && !tags.includes("rainy")) score -= 0.5;
  return score;
}

/** How close an item's formality is to the occasion/dress-code target. */
function formalityScore(item: WardrobeItem, target: number): number {
  const diff = Math.abs(item.formality - target);
  return 3 - diff; // 0 diff -> 3, 1 -> 2, 2 -> 1, 3+ -> negative
}

/** How close an item's warmth is to what the temperature calls for. */
function warmthScore(item: WardrobeItem, answers: AskAnswers): number {
  const ideal = idealWarmth(answers.temperature);
  const diff = Math.abs(item.warmth - ideal);
  return 2 - diff * 0.75;
}

function favoriteBonus(item: WardrobeItem): number {
  return item.is_favorite ? 0.5 : 0;
}

/** Combined per-item score for a given set of answers. Higher is better. */
export function scoreItem(item: WardrobeItem, answers: AskAnswers): number {
  const target = targetFormality(answers);
  return (
    weatherScore(item, answers) +
    formalityScore(item, target) +
    warmthScore(item, answers) +
    favoriteBonus(item)
  );
}

const CORE_SLOTS: WardrobeCategory[] = ["top", "bottom", "shoes"];
const DRESS_REPLACES: WardrobeCategory[] = ["top", "bottom"];

function byScoreDesc(answers: AskAnswers) {
  return (a: WardrobeItem, b: WardrobeItem) => scoreItem(b, answers) - scoreItem(a, answers);
}

/** Pick the N best-scoring, distinct items for a category, excluding used IDs. */
function topCandidates(
  items: WardrobeItem[],
  category: WardrobeCategory,
  answers: AskAnswers,
  excludeIds: Set<string>,
  count: number,
): WardrobeItem[] {
  return items
    .filter((i) => i.category === category && !excludeIds.has(i.id))
    .sort(byScoreDesc(answers))
    .slice(0, count);
}

function explain(items: Partial<Record<WardrobeCategory, WardrobeItem>>, answers: AskAnswers): string {
  const parts: string[] = [];
  const dress = items.dress;
  if (dress) {
    parts.push(`the ${dress.color.toLowerCase()} ${dress.name.toLowerCase()} sets a ${answers.dressCode} tone fit for ${answers.occasion}`);
  } else {
    const top = items.top;
    const bottom = items.bottom;
    if (top && bottom) {
      parts.push(`pairing the ${top.color.toLowerCase()} ${top.name.toLowerCase()} with ${bottom.color.toLowerCase()} ${bottom.name.toLowerCase()} matches a ${answers.dressCode} dress code for ${answers.occasion}`);
    }
  }
  if (items.outerwear) {
    parts.push(`the ${items.outerwear.name.toLowerCase()} adds warmth for ${answers.temperature}°F ${answers.weather} weather`);
  } else if (answers.weather === "cold" || answers.temperature <= 50) {
    parts.push(`layered for ${answers.temperature}°F conditions`);
  }
  if (items.shoes) {
    parts.push(`${items.shoes.name.toLowerCase()} keep footing appropriate for a ${answers.venueType} venue`);
  }
  if (items.accessory) {
    parts.push(`finished with the ${items.accessory.name.toLowerCase()}`);
  }
  if (parts.length === 0) return `A simple pick suited to ${answers.occasion} in ${answers.weather} weather.`;
  const joined = parts.join("; ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

/**
 * Build 2-3 outfit suggestions from the wardrobe for the given answers.
 * Returns fewer (or zero) suggestions when the wardrobe can't cover the
 * essentials — callers should show a clear "nothing fits" message in that case.
 */
export function suggestOutfits(wardrobe: WardrobeItem[], answers: AskAnswers, maxSuggestions = 3): OutfitSuggestion[] {
  const target = targetFormality(answers);
  const wantsDress = target >= 4 && (answers.occasion === "wedding" || answers.occasion === "party" || answers.occasion === "date night");

  const dresses = wardrobe.filter((i) => i.category === "dress").sort(byScoreDesc(answers));
  const hasViableDress = dresses.length > 0 && scoreItem(dresses[0], answers) > -1;

  const suggestions: OutfitSuggestion[] = [];
  const usedCombos = new Set<string>();

  for (let variant = 0; variant < maxSuggestions; variant++) {
    const excludeIds = new Set<string>();
    // Avoid literally repeating the previous suggestion's primary items by
    // excluding the top-1 picks from earlier variants once we have >=1 already.
    suggestions.forEach((s) => {
      Object.values(s.items).forEach((it) => it && excludeIds.add(it.id));
    });

    const items: Partial<Record<WardrobeCategory, WardrobeItem>> = {};
    let coreFilled = 0;

    if (wantsDress && hasViableDress && variant === 0) {
      const dressPick = topCandidates(wardrobe, "dress", answers, excludeIds, 1)[0];
      if (dressPick) {
        items.dress = dressPick;
        coreFilled++;
      }
    }

    if (!items.dress) {
      for (const slot of CORE_SLOTS) {
        const pick = topCandidates(wardrobe, slot, answers, excludeIds, 1)[0];
        if (pick) {
          items[slot] = pick;
          coreFilled++;
        }
      }
    } else {
      const shoePick = topCandidates(wardrobe, "shoes", answers, excludeIds, 1)[0];
      if (shoePick) {
        items.shoes = shoePick;
        coreFilled++;
      }
    }

    // Need at least shoes + (dress OR top+bottom) to call this a real outfit.
    const hasBase = items.dress ? !!items.shoes : !!(items.top && items.bottom);
    if (!hasBase) {
      // Not enough wardrobe coverage for another distinct variant — stop here.
      break;
    }

    const outerwearNeeded = answers.weather === "cold" || answers.weather === "windy" || answers.weather === "rainy" || answers.temperature <= 55;
    if (outerwearNeeded) {
      const pick = topCandidates(wardrobe, "outerwear", answers, excludeIds, 1)[0];
      if (pick) items.outerwear = pick;
    }

    const accessoryPick = topCandidates(wardrobe, "accessory", answers, excludeIds, 1)[0];
    if (accessoryPick) items.accessory = accessoryPick;

    const comboKey = Object.values(items)
      .map((i) => i?.id)
      .sort()
      .join("|");
    if (usedCombos.has(comboKey)) break;
    usedCombos.add(comboKey);

    const totalScore = Object.values(items).reduce((sum, it) => sum + (it ? scoreItem(it, answers) : 0), 0);

    suggestions.push({
      id: `suggestion-${variant}-${comboKey.slice(0, 24)}`,
      items,
      score: totalScore,
      explanation: explain(items, answers),
    });
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, maxSuggestions);
}

export const OCCASIONS: Occasion[] = [
  "wedding",
  "office",
  "date night",
  "casual outing",
  "interview",
  "party",
  "outdoor sports",
];

export const VENUE_TYPES: VenueType[] = ["indoor", "outdoor", "beach", "restaurant", "office"];
export const WEATHERS: Weather[] = ["sunny", "rainy", "cold", "hot", "windy"];
export const TIMES_OF_DAY: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];
export const DRESS_CODES: DressCode[] = ["casual", "smart casual", "business", "formal"];

export const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessory: "Accessory",
  dress: "Dress",
};
