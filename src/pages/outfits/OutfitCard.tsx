import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { CATEGORY_VISUALS } from "../../utils/categoryVisuals";
import type { WardrobeItem } from "../../utils/outfitEngine";

export interface OutfitCardData {
  id: string;
  name: string;
  occasion: string;
  weather?: string | null;
  dress_code?: string | null;
  created_at?: string | null;
  items: WardrobeItem[];
}

interface Props {
  outfit: OutfitCardData;
  onOpen: () => void;
  onDelete: () => void;
}

export const OutfitCard = ({ outfit, onOpen, onDelete }: Props) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onOpen} sx={{ flex: 1, display: "flex", alignItems: "stretch" }}>
        <CardContent sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Typography variant="h5">{outfit.name}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Chip size="small" variant="tagPurple" label={outfit.occasion} />
            {outfit.weather && <Chip size="small" variant="tagBlue" label={outfit.weather} />}
          </Stack>
          <Stack direction="row" spacing={-1} sx={{ mb: 1 }}>
            {outfit.items.slice(0, 5).map((item, idx) => {
              const visuals = CATEGORY_VISUALS[item.category];
              return (
                <Box
                  key={item.id}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: visuals.bg,
                    color: visuals.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: "background.paper",
                    ml: idx === 0 ? 0 : -1,
                    zIndex: 5 - idx,
                    "& svg": { fontSize: 20 },
                  }}
                  title={item.name}
                >
                  {visuals.icon}
                </Box>
              );
            })}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {outfit.items.length} item{outfit.items.length === 1 ? "" : "s"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pb: 1.5 }}>
        <Tooltip title="Delete outfit">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
};
