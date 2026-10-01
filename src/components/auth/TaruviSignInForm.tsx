import { useState } from "react";
import { useLogin } from "@refinedev/core";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { taruviTokens } from "../../theme/themeOptions";

/**
 * TaruviBase sign-in, rendered inside the app.
 *
 * Used only when the app is embedded in the build platform's preview iframe:
 * the hosted TaruviBase login page sends `X-Frame-Options: DENY`, so
 * redirecting the frame to it leaves the preview blank. Standalone, the app
 * still redirects to the hosted page (see LoginRedirect).
 *
 * This is NOT a second identity system. It submits through the app's auth
 * provider, which posts the same credentials to TaruviBase's allauth endpoint
 * and yields the same session as the hosted page.
 *
 * Built from MUI v7 primitives rather than `@refinedev/mui`'s `AuthPage`:
 * that package resolves to its own nested MUI v6 copy, with its own
 * ThemeProvider and emotion cache, so anything it renders silently ignores
 * `themeOptions.ts` - and sign-in is the first screen every end user sees.
 */
export const TaruviSignInForm: React.FC<{ title?: string }> = ({
  title = "Sign in",
}) => {
  const { mutate: login, isPending } = useLogin<{
    email?: string;
    username?: string;
    password: string;
  }>();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const value = identifier.trim();
    if (!value || !password) {
      setError("Enter your email or username, and your password.");
      return;
    }
    // TaruviBase accepts either identifier, and allauth wants exactly ONE of
    // them - sending both is rejected. The hosted console login takes either,
    // so this form must too: an email-only field silently sent a username in
    // the `email` field, which allauth answered as "wrong email or password".
    const credentials = value.includes("@")
      ? { email: value, password }
      : { username: value, password };
    login(
      credentials,
      {
        onError: (loginError) =>
          setError(loginError?.message || "Sign in failed. Check your details and try again."),
        onSuccess: (result) => {
          // The provider resolves rather than rejects on a rejected
          // credential, so a failed attempt has to be read off the result or
          // the form would look like it succeeded and simply not navigate.
          if (result && result.success === false) {
            setError(result.error?.message || "Sign in failed. Check your details and try again.");
          }
        },
      },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? taruviTokens.neutral.darkest
            : taruviTokens.neutral[50],
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }} elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontFamily: taruviTokens.font.title, mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your TaruviBase account.
          </Typography>

          <Box component="form" onSubmit={submit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Email or username"
                // Deliberately not type="email": the browser would reject a
                // bare username before submit.
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                autoFocus
                fullWidth
                required
                disabled={isPending}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                fullWidth
                required
                disabled={isPending}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                {isPending ? "Signing in" : "Sign in"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
