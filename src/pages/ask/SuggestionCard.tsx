import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import { CATEGORY_VISUALS } from "../../utils/categoryVisuals";
import { CATEGORY_LABELS, type OutfitSuggestion, type WardrobeCategory } from "../../utils/outfitEngine";

const CATEGORY_ORDER: WardrobeCategory[] = ["dress", "top", "bottom", "shoes", "outerwear", "accessory"];

interface Props {
  suggestion: OutfitSuggestion;
  index: number;
  saved?: boolean;
  saving?: boolean;
  onSave: () => void;
}

export const SuggestionCard = ({ suggestion, index, saved, saving, onSave }: Props) => {
  const presentCategories = CATEGORY_ORDER.filter((c) => suggestion.items[c]);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="overline" color="primary.main">
          Suggestion {index + 1}
        </Typography>
        <Stack spacing={1.5} divider={<Divider />} sx={{ my: 2 }}>
          {presentCategories.map((cat) => {
            const item = suggestion.items[cat]!;
            const visuals = CATEGORY_VISUALS[cat];
            return (
              <Stack key={cat} direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: visuals.bg,
                    color: visuals.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    "& svg": { fontSize: 24 },
                  }}
                >
                  {visuals.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {CATEGORY_LABELS[cat]}
                  </Typography>
                  <Typography variant="body1" noWrap>
                    {item.name}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ bgcolor: "primary.50", borderRadius: 2, p: 1.75, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {suggestion.explanation}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant={saved ? "outlined" : "contained"}
          color={saved ? "success" : "primary"}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : saved ? <BookmarkAddedRoundedIcon /> : <BookmarkAddRoundedIcon />
          }
          sx={{ mt: 2.5 }}
          disabled={saved || saving}
          onClick={onSave}
        >
          {saving ? "Saving…" : saved ? "Saved to Outfits" : "Save this outfit"}
        </Button>
      </CardContent>
    </Card>
  );
};
