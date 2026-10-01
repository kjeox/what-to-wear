import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Small persistent footer line, rendered once in the authenticated app shell
 * (src/App.tsx) so it appears under every page's content.
 */
export const AppFooter = () => (
  <Box
    component="footer"
    sx={{
      py: 2,
      px: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="caption" color="text.disabled">
      Styled by Fashionoozy
    </Typography>
  </Box>
);
