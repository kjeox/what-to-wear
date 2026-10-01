import { useMemo, useState } from "react";
import { useList, useDelete } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router";
import { PageContainer } from "../../components";
import { CATEGORY_VISUALS } from "../../utils/categoryVisuals";
import { CATEGORY_LABELS, type WardrobeCategory, type WardrobeItem } from "../../utils/outfitEngine";
import { OutfitCard, type OutfitCardData } from "./OutfitCard";

interface OutfitRow {
  id: string;
  name: string;
  occasion: string;
  explanation?: string | null;
  weather?: string | null;
  temperature?: number | null;
  dress_code?: string | null;
  created_at?: string | null;
}

interface OutfitItemRow {
  id: string;
  outfit_id: string;
  role: WardrobeCategory;
  wardrobe_item_id: WardrobeItem | string;
}

export const OutfitsList = () => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<OutfitRow | null>(null);
  const [detailOutfit, setDetailOutfit] = useState<OutfitCardData | null>(null);

  const { result: outfitsResult, query: outfitsQuery } = useList<OutfitRow>({
    resource: "outfits",
    sorters: [{ field: "created_at", order: "desc" }],
    pagination: { pageSize: 100 },
  });

  const { result: outfitItemsResult, query: outfitItemsQuery } = useList<OutfitItemRow>({
    resource: "outfit_items",
    meta: { populate: ["wardrobe_item_id"] },
    pagination: { pageSize: 500 },
  });

  const { mutate: deleteOutfit } = useDelete();

  const outfits = outfitsResult?.data || [];
  const outfitItems = outfitItemsResult?.data || [];
  const isLoading = outfitsQuery.isLoading || outfitItemsQuery.isLoading;
  const isError = outfitsQuery.isError || outfitItemsQuery.isError;

  const itemsByOutfit = useMemo(() => {
    const map = new Map<string, WardrobeItem[]>();
    for (const oi of outfitItems) {
      const wardrobeItem = typeof oi.wardrobe_item_id === "object" ? oi.wardrobe_item_id : null;
      if (!wardrobeItem) continue;
      const list = map.get(oi.outfit_id) || [];
      list.push(wardrobeItem);
      map.set(oi.outfit_id, list);
    }
    return map;
  }, [outfitItems]);

  const cardsData: OutfitCardData[] = outfits.map((o) => ({
    id: o.id,
    name: o.name,
    occasion: o.occasion,
    weather: o.weather,
    dress_code: o.dress_code,
    created_at: o.created_at,
    items: itemsByOutfit.get(o.id) || [],
  }));

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteOutfit(
      { resource: "outfits", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  const CATEGORY_ORDER: WardrobeCategory[] = ["dress", "top", "bottom", "shoes", "outerwear", "accessory"];

  return (
    <PageContainer>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">Outfits</Typography>
          <Typography variant="body2" color="text.secondary">
            {outfits.length} saved outfit{outfits.length === 1 ? "" : "s"} from past suggestions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/ask")}>
          Get a new suggestion
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={220} />
          ))}
        </Box>
      ) : isError ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <ErrorRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto", color: "error.main" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            Unable to load outfits
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            There was a problem loading your data.
          </Typography>
          <Button variant="contained" onClick={() => { outfitsQuery.refetch(); outfitItemsQuery.refetch(); }}>
            Try again
          </Button>
        </Box>
      ) : cardsData.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <StyleRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            No saved outfits yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ask for a suggestion and save the one you like to see it here.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/ask")}>
            Ask for an outfit
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
          {cardsData.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onOpen={() => setDetailOutfit(outfit)}
              onDelete={() => setDeleteTarget(outfits.find((o) => o.id === outfit.id) || null)}
            />
          ))}
        </Box>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detailOutfit} onClose={() => setDetailOutfit(null)} maxWidth="sm" fullWidth>
        {detailOutfit && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {detailOutfit.name}
              <IconButton size="small" onClick={() => setDetailOutfit(null)}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip size="small" variant="tagPurple" label={detailOutfit.occasion} />
                {detailOutfit.weather && <Chip size="small" variant="tagBlue" label={detailOutfit.weather} />}
              </Stack>
              <Stack spacing={1.5} divider={<Divider />}>
                {CATEGORY_ORDER.filter((cat) => detailOutfit.items.some((i) => i.category === cat)).map((cat) => (
                  <Stack key={cat} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: CATEGORY_VISUALS[cat].bg,
                        color: CATEGORY_VISUALS[cat].fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        "& svg": { fontSize: 24 },
                      }}
                    >
                      {CATEGORY_VISUALS[cat].icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {CATEGORY_LABELS[cat]}
                      </Typography>
                      <Typography variant="body1">
                        {detailOutfit.items.find((i) => i.category === cat)?.name}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setDetailOutfit(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete outfit?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" startIcon={<DeleteRoundedIcon />} onClick={handleConfirmDelete}>
            Delete outfit
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
