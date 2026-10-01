# What to Wear

A personal outfit advisor app. Users answer a step-by-step questionnaire about an occasion and conditions; a browser-side rule engine matches wardrobe items into outfit suggestions with explanations. Users save outfits, manage their wardrobe, and review history.

## Views

### Ask

Step-by-step questionnaire and results page with outfit suggestions.

### My Wardrobe

Card grid of wardrobe items, add and edit, search and filter.

### Outfits

Saved outfits as cards with detail view and delete.

### History

List of past suggestion requests and chosen outfits.

## Build plan

- [x] Create TaruviBase schema: wardrobe_items, outfits, outfit_items, suggestion_requests
- [x] Seed 30 wardrobe items, 3 outfits, 5 suggestion history entries
- [ ] Register Refine resources + sidebar icons (in progress)
- [ ] Build rule-based outfit matching engine (pure TS)
- [ ] Build Ask page + results
- [ ] Build My Wardrobe page
- [ ] Build Outfits page
- [ ] Build History page
- [ ] Deploy and verify

---

_Maintained by the build agent via the `set_blueprint` tool; updated when the plan changes._
