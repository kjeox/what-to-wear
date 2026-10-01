import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

/**
 * Shown while the auth provider's `check()` is still in flight.
 *
 * Refine's `<Authenticated>` renders `loading ?? null` during the check, so
 * without this the app rendered an EMPTY PAGE for the whole round trip - and
 * `check()` is a cross-origin request to TaruviBase, which can be slow, or
 * hang, or fail silently. A blank white pane is indistinguishable from a
 * broken preview, which is how it was usually reported.
 *
 * Deliberately says what it is waiting for: if this persists, the problem is
 * reaching TaruviBase, not the app.
 */
export const AuthCheckPending: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      Checking your TaruviBase session...
    </Typography>
  </Box>
);
