import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import DirectionsWalkRoundedIcon from "@mui/icons-material/DirectionsWalkRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import HikingRoundedIcon from "@mui/icons-material/HikingRounded";
import HouseRoundedIcon from "@mui/icons-material/HouseRounded";
import ParkRoundedIcon from "@mui/icons-material/ParkRounded";
import BeachAccessRoundedIcon from "@mui/icons-material/BeachAccessRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import UmbrellaRoundedIcon from "@mui/icons-material/UmbrellaRounded";
import AcUnitRoundedIcon from "@mui/icons-material/AcUnitRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import WbTwilightRoundedIcon from "@mui/icons-material/WbTwilightRounded";
import NightlightRoundedIcon from "@mui/icons-material/NightlightRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import type { AskAnswers, DressCode, Occasion, TimeOfDay, VenueType, Weather } from "../../utils/outfitEngine";

const OCCASION_META: Record<Occasion, { icon: React.ReactNode; label: string }> = {
  wedding: { icon: <FavoriteRoundedIcon />, label: "Wedding" },
  office: { icon: <WorkRoundedIcon />, label: "Office" },
  "date night": { icon: <RecordVoiceOverRoundedIcon />, label: "Date Night" },
  "casual outing": { icon: <DirectionsWalkRoundedIcon />, label: "Casual Outing" },
  interview: { icon: <WorkRoundedIcon />, label: "Interview" },
  party: { icon: <CelebrationRoundedIcon />, label: "Party" },
  "outdoor sports": { icon: <HikingRoundedIcon />, label: "Outdoor Sports" },
};

const VENUE_META: Record<VenueType, { icon: React.ReactNode; label: string }> = {
  indoor: { icon: <HouseRoundedIcon />, label: "Indoor" },
  outdoor: { icon: <ParkRoundedIcon />, label: "Outdoor" },
  beach: { icon: <BeachAccessRoundedIcon />, label: "Beach" },
  restaurant: { icon: <RestaurantRoundedIcon />, label: "Restaurant" },
  office: { icon: <ApartmentRoundedIcon />, label: "Office" },
};

const WEATHER_META: Record<Weather, { icon: React.ReactNode; label: string }> = {
  sunny: { icon: <WbSunnyRoundedIcon />, label: "Sunny" },
  rainy: { icon: <UmbrellaRoundedIcon />, label: "Rainy" },
  cold: { icon: <AcUnitRoundedIcon />, label: "Cold" },
  hot: { icon: <LocalFireDepartmentRoundedIcon />, label: "Hot" },
  windy: { icon: <AirRoundedIcon />, label: "Windy" },
};

const TIME_META: Record<TimeOfDay, { icon: React.ReactNode; label: string }> = {
  morning: { icon: <LightModeRoundedIcon />, label: "Morning" },
  afternoon: { icon: <WbSunnyRoundedIcon />, label: "Afternoon" },
  evening: { icon: <WbTwilightRoundedIcon />, label: "Evening" },
  night: { icon: <NightlightRoundedIcon />, label: "Night" },
};

const DRESS_CODE_META: Record<DressCode, { icon: React.ReactNode; label: string }> = {
  casual: { icon: <DirectionsWalkRoundedIcon />, label: "Casual" },
  "smart casual": { icon: <CelebrationRoundedIcon />, label: "Smart Casual" },
  business: { icon: <WorkRoundedIcon />, label: "Business" },
  formal: { icon: <DarkModeRoundedIcon />, label: "Formal" },
};

const STEPS = ["Occasion", "Venue", "Weather", "Timing", "Dress code", "Notes"];

interface Props {
  onSubmit: (answers: AskAnswers) => void;
  submitting?: boolean;
}

const PillGrid = <T extends string>({
  options,
  meta,
  value,
  onChange,
}: {
  options: T[];
  meta: Record<T, { icon: React.ReactNode; label: string }>;
  value: T | null;
  onChange: (v: T) => void;
}) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
    {options.map((opt) => {
      const selected = value === opt;
      return (
        <Card
          key={opt}
          variant="outlined"
          onClick={() => onChange(opt)}
          sx={{
            cursor: "pointer",
            borderWidth: 2,
            borderColor: selected ? "primary.main" : "divider",
            bgcolor: selected ? "primary.50" : "background.paper",
            transition: "all 0.15s ease",
            boxShadow: "none",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ color: selected ? "primary.main" : "text.secondary", "& svg": { fontSize: 28 } }}>{meta[opt].icon}</Box>
            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "center" }}>
              {meta[opt].label}
            </Typography>
          </CardContent>
        </Card>
      );
    })}
  </Box>
);

export const AskForm = ({ onSubmit, submitting }: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [venueType, setVenueType] = useState<VenueType | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [temperature, setTemperature] = useState<number>(68);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [dressCode, setDressCode] = useState<DressCode | null>(null);
  const [notes, setNotes] = useState("");

  const stepValid = [!!occasion, !!venueType, !!weather, !!timeOfDay, !!dressCode, true];
  const canProceed = stepValid[activeStep];

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      if (!occasion || !venueType || !weather || !timeOfDay || !dressCode) return;
      onSubmit({ occasion, venueType, weather, temperature, timeOfDay, dressCode, notes: notes.trim() || undefined });
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ py: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                What's the occasion?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Pick what best describes where you're headed.
              </Typography>
              <PillGrid
                options={["wedding", "office", "date night", "casual outing", "interview", "party", "outdoor sports"]}
                meta={OCCASION_META}
                value={occasion}
                onChange={setOccasion}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                Where will you be?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The venue affects how formal and weather-ready your outfit should be.
              </Typography>
              <PillGrid options={["indoor", "outdoor", "beach", "restaurant", "office"]} meta={VENUE_META} value={venueType} onChange={setVenueType} />
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                What's the weather like?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the condition, then fine-tune the temperature.
              </Typography>
              <PillGrid options={["sunny", "rainy", "cold", "hot", "windy"]} meta={WEATHER_META} value={weather} onChange={setWeather} />
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Temperature: {temperature}°F
                </Typography>
                <Slider
                  value={temperature}
                  min={20}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  onChange={(_, v) => setTemperature(v as number)}
                />
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                What time of day?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Evenings can call for a different look than mornings.
              </Typography>
              <PillGrid options={["morning", "afternoon", "evening", "night"]} meta={TIME_META} value={timeOfDay} onChange={setTimeOfDay} />
            </Box>
          )}

          {activeStep === 4 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                What's the dress code?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This sets the formality target for your outfit.
              </Typography>
              <PillGrid options={["casual", "smart casual", "business", "formal"]} meta={DRESS_CODE_META} value={dressCode} onChange={setDressCode} />
            </Box>
          )}

          {activeStep === 5 && (
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                Anything else? (optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Mention specific preferences — a color you'd like to wear, a venue detail, etc.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g. I'd love to wear something green, and there's a lot of walking involved."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : activeStep === STEPS.length - 1 ? (
              <AutoAwesomeRoundedIcon />
            ) : (
              <ArrowForwardRoundedIcon />
            )
          }
          onClick={handleNext}
          disabled={!canProceed || submitting}
        >
          {activeStep === STEPS.length - 1 ? (submitting ? "Finding outfits…" : "Get suggestions") : "Next"}
        </Button>
      </Stack>
    </Box>
  );
};
