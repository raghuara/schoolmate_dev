import React from "react";
import { Box, Typography } from "@mui/material";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

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
