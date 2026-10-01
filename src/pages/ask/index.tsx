import { useState } from "react";
import { useList, useCreate, useCreateMany, useUpdate } from "@refinedev/core";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import { PageContainer } from "../../components";
import { AskForm } from "./AskForm";
import { SuggestionCard } from "./SuggestionCard";
import { suggestOutfits, type AskAnswers, type OutfitSuggestion, type WardrobeItem } from "../../utils/outfitEngine";

type Stage = "form" | "results";

const occasionName = (answers: AskAnswers) =>
  `${answers.occasion.replace(/\b\w/g, (c) => c.toUpperCase())} Outfit`;

export const AskPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("form");
  const [answers, setAnswers] = useState<AskAnswers | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const { result: wardrobeResult, query: wardrobeQuery } = useList<WardrobeItem>({
    resource: "wardrobe_items",
    pagination: { pageSize: 100 },
  });

  const { mutateAsync: createRequest } = useCreate();
  const { mutateAsync: createOutfit } = useCreate();
  const { mutateAsync: createOutfitItems } = useCreateMany();
  const { mutateAsync: updateRequest } = useUpdate();

  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const wardrobe = wardrobeResult?.data || [];

  const handleSubmitAnswers = async (newAnswers: AskAnswers) => {
    const results = suggestOutfits(wardrobe, newAnswers, 3);
    setAnswers(newAnswers);
    setSuggestions(results);
    setSavedIds(new Set());
    setStage("results");

    try {
      const { data } = await createRequest({
        resource: "suggestion_requests",
        values: {
          occasion: newAnswers.occasion,
          venue_type: newAnswers.venueType,
          weather: newAnswers.weather,
          temperature: newAnswers.temperature,
          time_of_day: newAnswers.timeOfDay,
          dress_code: newAnswers.dressCode,
          notes: newAnswers.notes || "",
          created_at: new Date().toISOString(),
        },
        successNotification: false,
      });
      setCurrentRequestId((data as any)?.id ?? null);
    } catch {
      // History logging is best-effort; suggestions still work without it.
      setCurrentRequestId(null);
    }
  };

  const handleSave = async (suggestion: OutfitSuggestion) => {
    if (!answers) return;
    setSavingId(suggestion.id);
    try {
      const { data: outfit } = await createOutfit({
        resource: "outfits",
        values: {
          name: occasionName(answers),
          occasion: answers.occasion,
          explanation: suggestion.explanation,
          weather: answers.weather,
          temperature: answers.temperature,
          dress_code: answers.dressCode,
          created_at: new Date().toISOString(),
        },
      });
      const outfitId = (outfit as any)?.id;
      if (outfitId) {
        const rows = Object.entries(suggestion.items)
          .filter(([, item]) => !!item)
          .map(([role, item]) => ({
            outfit_id: outfitId,
            wardrobe_item_id: (item as WardrobeItem).id,
            role,
          }));
        if (rows.length) {
          await createOutfitItems({ resource: "outfit_items", values: rows, successNotification: false });
        }
        if (currentRequestId) {
          await updateRequest({
            resource: "suggestion_requests",
            id: currentRequestId,
            values: { chosen_outfit_id: outfitId },
            successNotification: false,
          });
        }
      }
      setSavedIds((prev) => new Set(prev).add(suggestion.id));
    } finally {
      setSavingId(null);
    }
  };

  const handleAskAgain = () => {
    setStage("form");
    setAnswers(null);
    setSuggestions([]);
    setSavedIds(new Set());
    setCurrentRequestId(null);
  };

  return (
    <PageContainer maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2">What should I wear?</Typography>
        <Typography variant="body2" color="text.secondary">
          Tell us about your plans and we'll put an outfit together from your own wardrobe.
        </Typography>
      </Box>

      {wardrobeQuery.isLoading ? (
        <Stack spacing={2} sx={{ maxWidth: 720, mx: "auto" }}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={260} />
        </Stack>
      ) : stage === "form" ? (
        <>
          {wardrobe.length === 0 && (
            <Alert severity="info" sx={{ maxWidth: 720, mx: "auto", mb: 3 }}>
              Your wardrobe is empty. Add a few items in <strong>My Wardrobe</strong> first so we have something to suggest from.
            </Alert>
          )}
          <AskForm onSubmit={handleSubmitAnswers} />
        </>
      ) : (
        <Box>
          {suggestions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2.5, color: "text.disabled", maxWidth: 480, mx: "auto" }}>
              <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
              <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
                Nothing quite fits yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your wardrobe doesn't have enough items to cover this occasion and weather. Try adding a top,
                bottom, and a pair of shoes suited to {answers?.weather ?? "these"} conditions, then ask again.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={handleAskAgain}>
                  Ask again
                </Button>
                <Button variant="contained" onClick={() => navigate("/wardrobe")}>
                  Go to My Wardrobe
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  Here {suggestions.length === 1 ? "is" : "are"} {suggestions.length} outfit{suggestions.length === 1 ? "" : "s"} for your{" "}
                  <strong>{answers?.occasion}</strong>.
                </Typography>
                <Button variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={handleAskAgain}>
                  Ask again
                </Button>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: suggestions.length > 1 ? "1fr 1fr" : "1fr", lg: `repeat(${suggestions.length}, 1fr)` }, gap: 2.5 }}>
                {suggestions.map((s, idx) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    index={idx}
                    saved={savedIds.has(s.id)}
                    saving={savingId === s.id}
                    onSave={() => handleSave(s)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </PageContainer>
  );
};
