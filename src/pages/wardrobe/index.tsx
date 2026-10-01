import { useMemo, useState } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { PageContainer } from "../../components";
import { CATEGORY_OPTIONS } from "../../utils/categoryVisuals";
import { CATEGORY_LABELS, type WardrobeCategory, type WardrobeItem } from "../../utils/outfitEngine";
import { WardrobeItemCard } from "./WardrobeItemCard";
import { WardrobeItemFormDialog, type WardrobeItemFormValues } from "./WardrobeItemFormDialog";

const CARD_SKELETON_COUNT = 8;

export const WardrobeList = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WardrobeCategory | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WardrobeItem | null>(null);

  const filters = useMemo(() => {
    const f: any[] = [];
    if (search.trim()) f.push({ field: "name", operator: "contains", value: search.trim() });
    if (categoryFilter) f.push({ field: "category", operator: "eq", value: categoryFilter });
    return f;
  }, [search, categoryFilter]);

  const { result, query } = useList<WardrobeItem>({
    resource: "wardrobe_items",
    filters,
    sorters: [{ field: "name", order: "asc" }],
    pagination: { pageSize: 100 },
  });

  const { mutate: createItem, mutation: createMutation } = useCreate();
  const { mutate: updateItem, mutation: updateMutation } = useUpdate();
  const { mutate: deleteItem } = useDelete();

  const items = result?.data || [];
  const total = result?.total ?? 0;
  const hasAnyFilter = !!search.trim() || !!categoryFilter;
  const isLoading = query.isLoading;
  const isError = query.isError;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: WardrobeItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmitForm = (values: WardrobeItemFormValues) => {
    if (editingItem) {
      updateItem(
        { resource: "wardrobe_items", id: editingItem.id, values },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createItem(
        { resource: "wardrobe_items", values: { ...values, created_at: new Date().toISOString() } },
        { onSuccess: () => setFormOpen(false) },
      );
    }
  };

  const handleToggleFavorite = (item: WardrobeItem) => {
    updateItem({
      resource: "wardrobe_items",
      id: item.id,
      values: { is_favorite: !item.is_favorite },
      successNotification: false,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteItem(
      { resource: "wardrobe_items", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  const clearSearch = () => setSearch("");
  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">My Wardrobe</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} item{total === 1 ? "" : "s"} · the clothes the advisor picks from
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate}>
          Add item
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search wardrobe items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: { sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <TextField
          size="small"
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as WardrobeCategory | "")}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {CATEGORY_OPTIONS.map((c) => (
            <MenuItem key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={260} />
          ))}
        </Box>
      ) : isError ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <ErrorRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto", color: "error.main" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            Unable to load your wardrobe
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            There was a problem loading your data.
          </Typography>
          <Button variant="contained" onClick={() => query.refetch()}>
            Try again
          </Button>
        </Box>
      ) : items.length === 0 && !hasAnyFilter ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <CheckroomRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            No wardrobe items yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Add the clothes you own so the advisor can suggest outfits from them.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate}>
            Add your first item
          </Button>
        </Box>
      ) : items.length === 0 && search ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <SearchOffRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Try adjusting your search or filter.
          </Typography>
          <Button variant="outlined" onClick={clearSearch}>
            Clear search
          </Button>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <FilterListRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            No matching items
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            No items match the current filters.
          </Typography>
          <Button variant="outlined" onClick={clearFilters}>
            Clear all filters
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          {items.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onEdit={() => handleOpenEdit(item)}
              onDelete={() => setDeleteTarget(item)}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          ))}
        </Box>
      )}

      <WardrobeItemFormDialog
        open={formOpen}
        initialValues={editingItem}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitForm}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.
            It will also be removed from any saved outfits that use it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" startIcon={<DeleteRoundedIcon />} onClick={handleConfirmDelete}>
            Delete item
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
