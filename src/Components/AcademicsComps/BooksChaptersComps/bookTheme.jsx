import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export { createBtnSx } from "../../DashBoardComps/dashboardTheme";

export const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: RADIUS,
        fontSize: "13px",
        bgcolor: "#fff",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: DASH.primaryBorder },
        "&.Mui-focused fieldset": { borderColor: DASH.primary },
    },
    "& .MuiInputLabel-root": { fontSize: "13px", color: DASH.muted },
    "& .MuiInputLabel-root.Mui-focused": { color: DASH.primary },
    "& .MuiFormHelperText-root": { fontSize: "11px", color: DASH.muted, ml: 0, mt: 0.5, lineHeight: 1.5 },
};

export const SUBJECT_TONES = {
    Mathematics: { color: "#1F73C2", bg: "#EEF3F9" },
    Maths: { color: "#1F73C2", bg: "#EEF3F9" },
    Science: { color: "#0891B2", bg: "#E0F7FA" },
    Physics: { color: "#7C3AED", bg: "#F5F3FF" },
    Chemistry: { color: "#059669", bg: "#ECFDF5" },
    Biology: { color: "#5E9E38", bg: "#F2F8EE" },
    English: { color: "#E10052", bg: "#FBEBF1" },
    Tamil: { color: "#C2701F", bg: "#FBF4EF" },
    Hindi: { color: "#A749CC", bg: "#F7F0F9" },
    "Social Science": { color: "#C2701F", bg: "#FBF4EF" },
    Social: { color: "#C2701F", bg: "#FBF4EF" },
    EVS: { color: "#10B981", bg: "#ECFDF5" },
    "Computer Science": { color: "#2563EB", bg: "#EEF5FF" },
};

export const subjectTone = (subject) =>
    SUBJECT_TONES[subject] || { color: DASH.muted, bg: DASH.lineSoft };

export const STATUS_TONES = {
    Ready: { bg: DASH.greenLight, color: DASH.green, border: "#BBF7D0" },
    "Needs Review": { bg: DASH.primaryLight, color: "#B45309", border: DASH.primaryBorder },
    Processing: { bg: DASH.blueLight, color: DASH.blue, border: "#BFDBFE" },
    Failed: { bg: DASH.redLight, color: DASH.red, border: "#FECACA" },
};

export const statusTone = (status) =>
    STATUS_TONES[status] || { bg: DASH.lineSoft, color: DASH.muted, border: DASH.line };

export const StatusPill = ({ status, dense = false }) => {
    const tone = statusTone(status);
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: dense ? 0.8 : 1,
                py: dense ? 0.15 : 0.3,
                borderRadius: "20px",
                bgcolor: tone.bg,
                border: `1px solid ${tone.border}`,
                flexShrink: 0,
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tone.color }} />
            <Typography sx={{ fontSize: dense ? "10px" : "10.5px", fontWeight: 700, color: tone.color, whiteSpace: "nowrap" }}>
                {status}
            </Typography>
        </Box>
    );
};

export const Pill = ({ label, color, bg, border }) => (
    <Box
        sx={{
            px: 0.9,
            py: 0.2,
            borderRadius: RADIUS,
            bgcolor: bg || DASH.lineSoft,
            border: `1px solid ${border || "transparent"}`,
            flexShrink: 0,
        }}
    >
        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: color || DASH.muted, whiteSpace: "nowrap" }}>
            {label}
        </Typography>
    </Box>
);

export const MetaItem = ({ icon: Icon, label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
        <Icon sx={{ fontSize: 13, color: DASH.faint, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "11px", color: DASH.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
        </Typography>
    </Box>
);

/* Every action in a page header is the same size, whatever its treatment -
   soft, solid or a plain status block - so the row reads as one strip. */
export const HEADER_ACTION_H = 38;

export const headerActionSx = {
    height: HEADER_ACTION_H,
    fontSize: "13px",
    px: 2,
};

export const outlineBtnSx = {
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 600,
    color: DASH.text,
    bgcolor: "#fff",
    border: `1px solid ${DASH.line}`,
    borderRadius: RADIUS,
    px: 1.6,
    height: 34,
    "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
    "&.Mui-disabled": { color: DASH.faint, borderColor: DASH.lineSoft },
};

/* Secondary actions take the dashboard's soft treatment - a coloured label on a
   tint of its own hue - so the one solid button on the page stays the action the
   teacher actually came for. Same shape as softBtnSx on the question paper screens. */
export const softBtnSx = (tone) => ({
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 600,
    color: tone.color,
    bgcolor: tone.bg,
    border: `1px solid ${tone.border}`,
    borderRadius: RADIUS,
    px: 1.6,
    height: 34,
    "&:hover": { bgcolor: tone.hover, borderColor: tone.color },
    "&.Mui-disabled": { color: DASH.faint, bgcolor: DASH.surface, borderColor: DASH.lineSoft },
});

export const primaryBtnSx = {
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#fff",
    bgcolor: DASH.primary,
    borderRadius: RADIUS,
    px: 2,
    height: 34,
    boxShadow: "none",
    "&:hover": { bgcolor: "#D89400", boxShadow: "none" },
    "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
};

/* ------------------------------- Skeletons -------------------------------- */

/* One source for the book grid. The skeletons and the real cards read the same
   breakpoints, so a placeholder can never sit in a different column count than
   the row it is standing in for. */
export const BOOK_GRID = { xs: 12, sm: 6, md: 4, lg: 3 };
export const KPI_GRID = { xs: 12, sm: 6, md: 3, lg: 3 };

// Matches SolidStatCard's fixed 100px tile.
export const KpiSkeleton = () => (
    <Box
        sx={{
            height: 100, borderRadius: "7px", boxSizing: "border-box",
            border: `1px solid ${DASH.line}`, bgcolor: "#fff", p: "11px 14px",
        }}
    >
        <Skeleton variant="text" width="52%" height={11} />
        <Skeleton variant="text" width="38%" height={30} sx={{ mt: 0.4 }} />
        <Skeleton variant="text" width="64%" height={11} />
    </Box>
);

/* Mirrors BookCard: the spine, the two title lines, the pill row, the chapter
   block and the footer - at the height a real card settles on, so the page does
   not jump when the answer lands. */
export const BookCardSkeleton = () => (
    <Box
        sx={{
            display: "flex", height: 226, boxSizing: "border-box",
            bgcolor: "#fff", border: `1px solid ${DASH.line}`,
            borderRadius: "8px", overflow: "hidden",
        }}
    >
        <Box sx={{ width: 34, flexShrink: 0, bgcolor: DASH.lineSoft }} />
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <Box sx={{ p: 1.7, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Skeleton variant="text" width="88%" height={17} />
                        <Skeleton variant="text" width="52%" height={13} />
                    </Box>
                    <Skeleton variant="rounded" width={62} height={17} sx={{ flexShrink: 0 }} />
                </Box>

                <Box sx={{ display: "flex", gap: 0.6, mt: 1.3 }}>
                    <Skeleton variant="rounded" width={34} height={17} />
                    <Skeleton variant="rounded" width={58} height={17} />
                    <Skeleton variant="rounded" width={46} height={17} />
                </Box>

                <Skeleton variant="rounded" height={44} sx={{ mt: 1.4, borderRadius: RADIUS }} />

                <Box sx={{ display: "flex", gap: 1.4, mt: 1.4 }}>
                    <Skeleton variant="text" width={68} height={13} />
                    <Skeleton variant="text" width={52} height={13} />
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 1.7, py: 1.1, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD",
                }}
            >
                <Skeleton variant="text" width={94} height={12} />
                <Skeleton variant="text" width={38} height={12} />
            </Box>
        </Box>
    </Box>
);

// One row of the chapter list, at the height the real row occupies.
export const ChapterRowSkeleton = () => (
    <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 1.2, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Skeleton variant="rounded" width={22} height={22} sx={{ flexShrink: 0 }} />
            <Skeleton variant="text" width="70%" height={16} />
        </Box>
        <Skeleton variant="text" width="55%" height={13} sx={{ mt: 0.8, ml: 3.6 }} />
    </Box>
);

/* A panel-shaped placeholder: the header band with its accent bar, then a body
   of lines. Used where the panel's contents are one block of text rather than a
   list of rows. */
export const PanelSkeleton = ({ accent = DASH.primary, lines = 4, bodyHeight }) => (
    <Box
        sx={{
            bgcolor: "#fff", border: `1px solid ${accent}38`, borderRadius: RADIUS,
            display: "flex", flexDirection: "column", overflow: "hidden",
        }}
    >
        <Box
            sx={{
                display: "flex", alignItems: "center", gap: 1.2,
                px: 2, py: 1.4, borderBottom: `1px solid ${accent}22`,
            }}
        >
            <Box sx={{ width: 3, height: 20, borderRadius: RADIUS, bgcolor: `${accent}55`, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="34%" height={16} />
                <Skeleton variant="text" width="52%" height={12} />
            </Box>
        </Box>
        <Box sx={{ p: 2 }}>
            {bodyHeight
                ? <Skeleton variant="rounded" height={bodyHeight} sx={{ borderRadius: RADIUS }} />
                : Array.from({ length: lines }, (_, i) => (
                    <Skeleton key={i} variant="text" height={14} width={`${92 - i * 9}%`} sx={{ mb: 0.6 }} />
                ))}
        </Box>
    </Box>
);
