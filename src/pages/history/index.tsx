import { useList } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router";
import { PageContainer } from "../../components";

interface SuggestionRequestRow {
  id: string;
  occasion: string;
  venue_type?: string | null;
  weather?: string | null;
  temperature?: number | null;
  time_of_day?: string | null;
  dress_code?: string | null;
  notes?: string | null;
  chosen_outfit_id?: { id: string; name: string } | string | null;
  created_at?: string | null;
}

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export const HistoryList = () => {
  const navigate = useNavigate();

  const { result, query } = useList<SuggestionRequestRow>({
    resource: "suggestion_requests",
    sorters: [{ field: "created_at", order: "desc" }],
    meta: { populate: ["chosen_outfit_id"] },
    pagination: { pageSize: 100 },
  });

  const rows = result?.data || [];
  const isLoading = query.isLoading;
  const isError = query.isError;

  return (
    <PageContainer>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2">History</Typography>
          <Typography variant="body2" color="text.secondary">
            Every past question you asked and the outfit chosen
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/ask")}>
          Ask again
        </Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} />
          ))}
        </Stack>
      ) : isError ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <ErrorRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto", color: "error.main" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            Unable to load history
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            There was a problem loading your data.
          </Typography>
          <Button variant="contained" onClick={() => query.refetch()}>
            Try again
          </Button>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5, px: 2.5, color: "text.disabled" }}>
          <HistoryRoundedIcon sx={{ fontSize: 48, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography variant="h5" sx={{ color: "text.secondary", mb: 0.75 }}>
            No history yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ask the advisor for an outfit suggestion to start building your history.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/ask")}>
            Ask for an outfit
          </Button>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Occasion</TableCell>
                <TableCell>Weather</TableCell>
                <TableCell>Dress code</TableCell>
                <TableCell>Chosen outfit</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const chosenOutfit = typeof row.chosen_outfit_id === "object" ? row.chosen_outfit_id : null;
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{row.occasion}</TableCell>
                    <TableCell>
                      {row.weather ? (
                        <Chip size="small" variant="tagBlue" label={`${row.weather}${row.temperature != null ? ` · ${row.temperature}°F` : ""}`} />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{row.dress_code || "—"}</TableCell>
                    <TableCell>
                      {chosenOutfit ? (
                        <Chip size="small" variant="tagGreen" label={chosenOutfit.name} />
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Not saved
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      {row.notes ? (
                        <Tooltip title={row.notes}>
                          <Typography variant="body2" noWrap>
                            {row.notes}
                          </Typography>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
};
