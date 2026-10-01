import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { CATEGORY_OPTIONS } from "../../utils/categoryVisuals";
import { CATEGORY_LABELS, WEATHERS, type WardrobeCategory, type WardrobeItem } from "../../utils/outfitEngine";

export interface WardrobeItemFormValues {
  name: string;
  category: WardrobeCategory;
  color: string;
  warmth: number;
  formality: number;
  weather_suitability: string[];
  is_favorite: boolean;
  notes: string;
}

interface Props {
  open: boolean;
  initialValues?: WardrobeItem | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: WardrobeItemFormValues) => void;
}

const EMPTY_VALUES: WardrobeItemFormValues = {
  name: "",
  category: "top",
  color: "",
  warmth: 2,
  formality: 2,
  weather_suitability: [],
  is_favorite: false,
  notes: "",
};

export const WardrobeItemFormDialog = ({ open, initialValues, submitting, onClose, onSubmit }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WardrobeItemFormValues>({ defaultValues: EMPTY_VALUES });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? {
              name: initialValues.name,
              category: initialValues.category,
              color: initialValues.color,
              warmth: initialValues.warmth,
              formality: initialValues.formality,
              weather_suitability: initialValues.weather_suitability || [],
              is_favorite: !!initialValues.is_favorite,
              notes: initialValues.notes || "",
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, initialValues, reset]);

  const isEdit = !!initialValues;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit wardrobe item" : "Add wardrobe item"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required", maxLength: { value: 120, message: "Max 120 characters" } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Item name"
                  required
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message || "e.g. Navy Merino Crewneck Sweater"}
                />
              )}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Controller
                name="category"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} select label="Category" required fullWidth>
                    {CATEGORY_OPTIONS.map((c) => (
                      <MenuItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="color"
                control={control}
                rules={{ required: "Color is required", maxLength: { value: 40, message: "Max 40 characters" } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Color"
                    required
                    fullWidth
                    error={!!errors.color}
                    helperText={errors.color?.message || "e.g. Navy"}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Warmth
              </Typography>
              <Controller
                name="warmth"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    min={1}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    onChange={(_, v) => field.onChange(v)}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                1 = very light, 5 = very warm
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Formality
              </Typography>
              <Controller
                name="formality"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    min={1}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    onChange={(_, v) => field.onChange(v)}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                1 = very casual, 5 = very formal
              </Typography>
            </Box>

            <Controller
              name="weather_suitability"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Weather suitability"
                  fullWidth
                  slotProps={{ select: { multiple: true } }}
                  helperText="Select all the conditions this item works well in"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {WEATHERS.concat(["beach"] as any).map((w) => (
                    <MenuItem key={w} value={w}>
                      {w.charAt(0).toUpperCase() + w.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Notes (optional)" fullWidth multiline rows={2} />
              )}
            />

            <Controller
              name="is_favorite"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Mark as favorite"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add item"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
