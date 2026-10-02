import { ThemeOptions } from "@mui/material/styles";
import { lightThemeOptions, darkThemeOptions, taruviTokens } from "../../themeOptions";

/**
 * App-level brand recolor: beige + green, layered on top of the protected
 * `themeOptions.ts` design-system tokens (radii, shadows, typography, spacing
 * stay exactly as spec'd — only hue changes).
 *
 * `themeOptions.ts` is the protected source of truth and must not be edited
 * directly, but a handful of component overrides in it hardcode the old
 * brand-blue hex (`#1E88E5` / `#1976d2`) instead of referencing a token, so a
 * palette swap alone doesn't reach them (e.g. sidebar active item, chip
 * outline color). Those specific style paths are patched below; everything
 * else is inherited untouched from the base theme.
 */

// ─── Brand green / beige ramp ─────────────────────────────────────────
const green = {
  50: "#F3F7F0",
  100: "#E3EEDB",
  200: "#C9DEB8",
  300: "#A9CA8E",
  400: "#86B368",
  500: "#5E8F46",
  600: "#45702F",
  700: "#3A6027",
  800: "#2A4A1C",
  900: "#1C3412",
};

const beige = {
  50: "#FBF8F2",
  100: "#F5EFE3",
  200: "#EAE1CC",
  300: "#D8CBAC",
  400: "#C2B189",
  500: "#A7956C",
  600: "#8A7A57",
  700: "#6B5E42",
  800: "#443B29",
  900: "#2B2418",
};

const olive = {
  50: "#F1EEE3",
  300: "#B29F63",
  500: "#71652F",
  700: "#443D1C",
  900: "#211D0E",
};

const BRAND_PRIMARY = green[600]; // #45702F — replaces #1E88E5
const BRAND_PRIMARY_HOVER = green[700]; // replaces #1565C0
const BRAND_PRIMARY_ACTIVE = green[800]; // replaces #0D47A1
const BRAND_PRIMARY_DISABLED = green[200];
const BRAND_SIDEBAR_ACTIVE_HOVER = green[700];

function patchComponents(base: ThemeOptions["components"], isLight: boolean): ThemeOptions["components"] {
  return {
    ...base,
    MuiButton: {
      ...base?.MuiButton,
      styleOverrides: {
        ...base?.MuiButton?.styleOverrides,
        containedPrimary: {
          backgroundColor: BRAND_PRIMARY,
          color: "#fff",
          "&:hover": { backgroundColor: BRAND_PRIMARY_HOVER, boxShadow: "none" },
          "&:active": { backgroundColor: BRAND_PRIMARY_ACTIVE },
          "&.Mui-disabled": {
            backgroundColor: BRAND_PRIMARY_DISABLED,
            color: beige[600],
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          borderColor: BRAND_PRIMARY,
          color: BRAND_PRIMARY,
          "&:hover": {
            borderWidth: 2,
            backgroundColor: green[50],
            borderColor: BRAND_PRIMARY_HOVER,
          },
        },
        text: {
          color: BRAND_PRIMARY,
          "&:hover": { backgroundColor: "rgba(69,112,47,0.08)" },
        },
      },
    },
    MuiChip: {
      ...base?.MuiChip,
      styleOverrides: {
        ...base?.MuiChip?.styleOverrides,
        colorInfo: { backgroundColor: green[600], color: "#fff" },
      },
    },
    MuiOutlinedInput: {
      ...base?.MuiOutlinedInput,
      styleOverrides: {
        ...base?.MuiOutlinedInput?.styleOverrides,
        root: {
          ...(base?.MuiOutlinedInput?.styleOverrides as any)?.root,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: BRAND_PRIMARY,
            borderWidth: 1,
          },
          "&.Mui-focused": { boxShadow: "0 0 0 2px rgba(69,112,47,0.30)" },
        },
      },
    },
    MuiInputLabel: {
      ...base?.MuiInputLabel,
      styleOverrides: {
        ...base?.MuiInputLabel?.styleOverrides,
        root: {
          ...(base?.MuiInputLabel?.styleOverrides as any)?.root,
          "&.Mui-focused": { color: BRAND_PRIMARY },
        },
      },
    },
    MuiTableRow: {
      ...base?.MuiTableRow,
      styleOverrides: {
        ...base?.MuiTableRow?.styleOverrides,
        root: {
          ...(base?.MuiTableRow?.styleOverrides as any)?.root,
          "&:hover": {
            backgroundColor: isLight ? green[50] : "rgba(94,143,70,0.10)",
          },
          "&.Mui-selected": {
            backgroundColor: isLight ? green[50] : "rgba(94,143,70,0.16)",
            boxShadow: `inset 2px 0 0 ${BRAND_PRIMARY}`,
            "&:hover": {
              backgroundColor: isLight ? green[100] : "rgba(94,143,70,0.22)",
            },
          },
        },
      },
    },
    MuiDataGrid: {
      ...base?.MuiDataGrid,
      styleOverrides: {
        ...base?.MuiDataGrid?.styleOverrides,
        row: {
          ...(base?.MuiDataGrid?.styleOverrides as any)?.row,
          "&:hover": {
            backgroundColor: isLight ? green[50] : "rgba(94,143,70,0.10)",
          },
          "&.Mui-selected": {
            backgroundColor: isLight ? green[50] : "rgba(94,143,70,0.16)",
            boxShadow: `inset 2px 0 0 ${BRAND_PRIMARY}`,
            "&:hover": {
              backgroundColor: isLight ? green[100] : "rgba(94,143,70,0.22)",
            },
          },
        },
        checkboxInput: {
          ...(base?.MuiDataGrid?.styleOverrides as any)?.checkboxInput,
          "&.Mui-checked": { color: BRAND_PRIMARY },
        },
      },
    },
    MuiListItemButton: {
      ...base?.MuiListItemButton,
      styleOverrides: {
        ...base?.MuiListItemButton?.styleOverrides,
        root: {
          ...(base?.MuiListItemButton?.styleOverrides as any)?.root,
          "&.Mui-selected": {
            backgroundColor: BRAND_PRIMARY,
            color: "#fff",
            "& .MuiListItemIcon-root": { color: "#fff" },
            "&:hover": { backgroundColor: BRAND_SIDEBAR_ACTIVE_HOVER },
          },
        },
      },
    },
    MuiAlert: {
      ...base?.MuiAlert,
      styleOverrides: {
        ...base?.MuiAlert?.styleOverrides,
        standardInfo: {
          backgroundColor: green[100],
          borderLeftColor: green[600],
          color: isLight ? taruviTokens.text.primary : "#f8fafc",
          "& .MuiAlert-icon": { color: green[600] },
        },
      },
    },
    MuiCheckbox: {
      ...base?.MuiCheckbox,
      styleOverrides: {
        ...base?.MuiCheckbox?.styleOverrides,
        root: {
          ...(base?.MuiCheckbox?.styleOverrides as any)?.root,
          "&.Mui-checked": { color: BRAND_PRIMARY },
        },
      },
    },
    MuiRadio: {
      ...base?.MuiRadio,
      styleOverrides: {
        ...base?.MuiRadio?.styleOverrides,
        root: {
          ...(base?.MuiRadio?.styleOverrides as any)?.root,
          "&.Mui-checked": { color: BRAND_PRIMARY },
        },
      },
    },
    MuiSwitch: {
      ...base?.MuiSwitch,
      styleOverrides: {
        ...base?.MuiSwitch?.styleOverrides,
        switchBase: {
          ...(base?.MuiSwitch?.styleOverrides as any)?.switchBase,
          "&.Mui-checked": {
            color: BRAND_PRIMARY,
            "& + .MuiSwitch-track": { backgroundColor: BRAND_PRIMARY },
          },
        },
      },
    },
    MuiLink: {
      ...base?.MuiLink,
      styleOverrides: {
        ...base?.MuiLink?.styleOverrides,
        root: {
          ...(base?.MuiLink?.styleOverrides as any)?.root,
          color: green[700],
        },
      },
    },
  };
}

export const brandLightThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    ...lightThemeOptions.palette,
    mode: "light",
    primary: {
      main: BRAND_PRIMARY,
      light: green[400],
      dark: BRAND_PRIMARY_ACTIVE,
      contrastText: "#ffffff",
    },
    secondary: {
      main: olive[700],
      light: olive[300],
      dark: olive[900],
      contrastText: "#ffffff",
    },
    info: {
      main: green[600],
      light: green[300],
      dark: olive[700],
      contrastText: "#ffffff",
    },
    success: {
      main: "#3F7D3B",
      light: green[200],
      dark: green[800],
      contrastText: "#ffffff",
    },
    grey: {
      50: beige[50],
      100: beige[100],
      200: beige[200],
      300: beige[300],
      400: beige[400],
      500: beige[500],
      600: beige[600],
      700: beige[700],
      800: beige[800],
      900: beige[900],
    },
    background: {
      default: "#F3EFE4",
      paper: "#FFFDF8",
    },
    text: {
      primary: "#2B2418",
      secondary: "#6B5E42",
      disabled: beige[400],
    },
    divider: "rgba(69,58,33,0.10)",
  },
  components: patchComponents(lightThemeOptions.components, true),
};

export const brandDarkThemeOptions: ThemeOptions = {
  ...darkThemeOptions,
  palette: {
    ...darkThemeOptions.palette,
    mode: "dark",
    primary: {
      main: green[400],
      light: green[300],
      dark: green[700],
      contrastText: "#152010",
    },
    secondary: {
      main: olive[300],
      light: olive[50],
      dark: olive[700],
      contrastText: "#211D0E",
    },
    info: {
      main: green[300],
      light: green[200],
      dark: green[600],
      contrastText: "#0f1a0b",
    },
    success: {
      main: green[400],
      light: green[200],
      dark: green[800],
      contrastText: "#000000",
    },
    grey: {
      50: beige[50],
      100: beige[100],
      200: beige[200],
      300: beige[300],
      400: beige[400],
      500: beige[500],
      600: beige[600],
      700: beige[700],
      800: beige[800],
      900: beige[900],
    },
    background: {
      default: "#141a10",
      paper: "#1c2417",
    },
    text: {
      primary: "#f5f3ec",
      secondary: beige[300],
      disabled: beige[600],
    },
    divider: "rgba(201,222,184,0.10)",
  },
  components: patchComponents(darkThemeOptions.components, false),
};
