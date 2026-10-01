import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import HikingRoundedIcon from "@mui/icons-material/HikingRounded";
import DryCleaningRoundedIcon from "@mui/icons-material/DryCleaningRounded";
import WatchRoundedIcon from "@mui/icons-material/WatchRounded";
import WomanRoundedIcon from "@mui/icons-material/WomanRounded";
import type { WardrobeCategory } from "./outfitEngine";
import { taruviTokens } from "../../themeOptions";

/** Icon + background tint per wardrobe category — used as an image placeholder. */
export const CATEGORY_VISUALS: Record<
  WardrobeCategory,
  { icon: React.ReactNode; bg: string; fg: string }
> = {
  top: { icon: <CheckroomRoundedIcon sx={{ fontSize: 40 }} />, bg: taruviTokens.primary[100], fg: taruviTokens.primary[800] },
  bottom: { icon: <StraightenRoundedIcon sx={{ fontSize: 40 }} />, bg: taruviTokens.tagPalette[1].bg, fg: taruviTokens.tagPalette[1].text },
  shoes: { icon: <HikingRoundedIcon sx={{ fontSize: 40 }} />, bg: taruviTokens.tagPalette[2].bg, fg: taruviTokens.tagPalette[2].text },
  outerwear: { icon: <DryCleaningRoundedIcon sx={{ fontSize: 40 }} />, bg: taruviTokens.tagPalette[3].bg, fg: taruviTokens.tagPalette[3].text },
  accessory: { icon: <WatchRoundedIcon sx={{ fontSize: 40 }} />, bg: taruviTokens.neutral[100], fg: taruviTokens.neutral[700] },
  dress: { icon: <WomanRoundedIcon sx={{ fontSize: 40 }} />, bg: "#FCE4EC", fg: "#AD1457" },
};

export const CATEGORY_OPTIONS: WardrobeCategory[] = ["top", "bottom", "shoes", "outerwear", "accessory", "dress"];
