import { useEffect } from "react";
import { useLogin } from "@refinedev/core";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { TaruviSignInForm } from "./TaruviSignInForm";

/**
 * True when this document is embedded in another page - the platform's
 * preview iframe. Guarded for non-browser execution.
 */
const isEmbedded = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent throws on access; that can only happen when framed.
    return true;
  }
};

/**
 * Unauthenticated fallback.
 *
 * Standalone, this triggers the hosted redirect login. Inside the platform's
 * preview iframe it renders an in-app credentials form instead: the hosted
 * login page sends `X-Frame-Options: DENY`, so redirecting the frame to it
 * leaves the preview blank. The form submits through the credentials-aware
 * auth provider, so the session is established without leaving the app.
 *
 * Password reset and registration are not offered here: TaruviBase's hosted
 * pages own those flows. This app has exactly one auth surface, and its
 * identity provider is TaruviBase either way.
 */
export const LoginRedirect: React.FC = () => {
  const { mutate: login } = useLogin();
  const embedded = isEmbedded();

  useEffect(() => {
    if (embedded) return;
    // Trigger the redirect-based login with full callback URL
    const callbackUrl = window.location.origin + window.location.pathname;
    login({ redirect: true, callbackUrl });
  }, [embedded, login]);

  if (embedded) {
    return <TaruviSignInForm title="Sign in to preview this app" />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1">Redirecting to login...</Typography>
    </Box>
  );
};
