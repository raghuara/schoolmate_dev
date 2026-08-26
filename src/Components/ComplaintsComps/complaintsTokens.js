// Design tokens lifted straight from the dev-Figma export for the Complaints module.
// Figma expresses inner borders as `outline: 1px solid X` with outlineOffset -1 —
// that is just a plain CSS border, which is what these use.

export const C = {
    border: "#E8ECF4",       // card / control border
    inputBorder: "#E2E8F0",  // form-field border — a shade darker than the card border
    labelText: "#475569",    // form-field label
    divider: "#F1F5F9",      // row separator inside cards
    track: "#F1F5F9",        // progress-bar track + neutral icon chip bg
    surface: "#FFFFFF",
    fieldBg: "#F4F6FB",

    text: "#1E293B",         // primary
    textMuted: "#64748B",    // secondary / labels
    textFaint: "#94A3B8",    // chevrons, captions
    onAccent: "#0D1929",     // text on the yellow accent
    tabActiveText: "#1B2559",
    tabActiveBorder: "#F5B731",

    blue: "#3B82F6",
    green: "#22C55E",
    amber: "#F5A623",
    red: "#EF4444",
    redDark: "#991B1B",
};

// Alpha tints Figma used behind the KPI icons.
export const TINT = {
    neutral: C.track,
    accent: "rgba(252, 190, 58, 0.12)",
    blue: "rgba(59, 130, 246, 0.10)",
    green: "rgba(34, 197, 94, 0.10)",
    amber: "rgba(245, 166, 35, 0.10)",
    red: "rgba(239, 68, 68, 0.10)",
    redDark: "rgba(153, 27, 27, 0.12)",
};

export const CARD_SHADOW = "0px 4px 12px rgba(0, 0, 0, 0.05)";

// NOTE ON SIZING: this app has no CssBaseline and no global `box-sizing` reset,
// so everything defaults to content-box. `height: 100%` + padding would make a
// card overflow its grid cell by the padding + border and collide with the row
// below. These cards therefore fill their cell with `flexGrow` (the Grid item is
// set to display:flex) and pin box-sizing locally instead of using a % height.

// Large content card — Figma: padding 24, radius 16.
export const cardSx = {
    p: 3,
    flexGrow: 1,
    minWidth: 0,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "16px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
};

// Compact KPI card — Figma: padding 16, radius 16.
export const statCardSx = {
    p: 2,
    flexGrow: 1,
    minWidth: 0,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "16px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

// Configuration tile — Figma: padding 20, radius 12. Same box-sizing note as above.
export const configCardSx = {
    p: 2.5,
    flexGrow: 1,
    minWidth: 0,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.10)",
    },
};

// Secondary header button — Figma: h40, radius 9, white, 1px border.
export const outlineBtnSx = {
    height: 40,
    boxSizing: "border-box",
    px: "14px",
    gap: 1,
    bgcolor: C.surface,
    color: C.text,
    borderRadius: "9px",
    border: `1px solid ${C.border}`,
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "none",
    whiteSpace: "nowrap",
    "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
};
