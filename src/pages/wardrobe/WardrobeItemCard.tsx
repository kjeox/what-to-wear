import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import DeviceThermostatRoundedIcon from "@mui/icons-material/DeviceThermostatRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { CATEGORY_VISUALS } from "../../utils/categoryVisuals";
import { CATEGORY_LABELS, type WardrobeItem } from "../../utils/outfitEngine";

interface Props {
  item: WardrobeItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const Dots = ({ value, icon }: { value: number; icon: React.ReactNode }) => (
  <Stack direction="row" spacing={0.25} alignItems="center">
    {icon}
    <Stack direction="row" spacing={0.25} sx={{ ml: 0.5 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: i < value ? "primary.main" : "action.disabledBackground",
          }}
        />
      ))}
    </Stack>
  </Stack>
);

export const WardrobeItemCard = ({ item, onEdit, onDelete, onToggleFavorite }: Props) => {
  const visuals = CATEGORY_VISUALS[item.category];

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: 120,
          bgcolor: visuals.bg,
          color: visuals.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {visuals.icon}
        <Tooltip title={item.is_favorite ? "Remove from favorites" : "Mark as favorite"}>
          <IconButton
            size="small"
            onClick={onToggleFavorite}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255,255,255,0.85)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            {item.is_favorite ? (
              <StarRoundedIcon fontSize="small" sx={{ color: "#f57c00" }} />
            ) : (
              <StarBorderRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h5" sx={{ fontSize: 15 }}>
            {item.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" variant="tagBlue" label={CATEGORY_LABELS[item.category]} />
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: item.color.toLowerCase().replace(/\s+/g, ""),
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {item.color}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          <Dots value={item.warmth} icon={<DeviceThermostatRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />} />
          <Dots value={item.formality} icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />} />
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
};
