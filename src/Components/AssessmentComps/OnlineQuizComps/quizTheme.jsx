import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

export const RADIUS = "5px";

export const QUIZ = {
    primary: "#6D28D9",
    primaryDark: "#5B21B6",
    primaryMid: "#7C3AED",
    primaryLight: "#F5F3FF",
    primarySoft: "#EDE9FE",
    primaryBorder: "#DDD6FE",
    primaryInk: "#4C1D95",
    blue: "#3B82F6",
    blueLight: "#EFF6FF",
    green: "#10B981",
    greenLight: "#ECFDF5",
    red: "#EF4444",
    redLight: "#FEF2F2",
    amber: "#F59E0B",
    amberLight: "#FFFBEB",
    cyan: "#06B6D4",
    cyanLight: "#ECFEFF",
    pink: "#EC4899",
    pinkLight: "#FDF2F8",
    ink: "#111827",
    text: "#374151",
    muted: "#6B7280",
    faint: "#9CA3AF",
    line: "#E5E7EB",
    lineSoft: "#F3F4F6",
    surface: "#FAFAFA",
    canvas: "#F8F7FC",
};

export const QUESTION_TYPES = [
    { key: "mcq", label: "Choose the Best Option", short: "MCQ", color: "#6D28D9", bg: "#F5F3FF" },
    { key: "truefalse", label: "True / False", short: "T/F", color: "#06B6D4", bg: "#ECFEFF" },
    { key: "fillblank", label: "Fill in the Blanks", short: "Fill", color: "#EC4899", bg: "#FDF2F8" },
];

export const DIFFICULTY_LEVELS = [
    {
        key: "easy",
        label: "Easy",
        color: "#10B981",
        bg: "#ECFDF5",
        border: "#A7F3D0",
        hint: "Recall and direct definitions",
    },
    {
        key: "medium",
        label: "Medium",
        color: "#F59E0B",
        bg: "#FFFBEB",
        border: "#FDE68A",
        hint: "Applying concepts to new cases",
    },
    {
        key: "hard",
        label: "Hard",
        color: "#EF4444",
        bg: "#FEF2F2",
        border: "#FECACA",
        hint: "Multi-step reasoning and analysis",
    },
];

export const STATUS_STYLES = {
    Published: { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
    Scheduled: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
    Draft: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
    Completed: { bg: "#F5F3FF", color: "#6D28D9", dot: "#7C3AED" },
    Expired: { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
};

export const StatusPill = ({ status }) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.Draft;
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                bgcolor: s.bg,
                color: s.color,
                borderRadius: RADIUS,
                px: 1.1,
                py: 0.35,
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot, flexShrink: 0 }} />
            {status}
        </Box>
    );
};

export const Panel = ({ title, subtitle, right, children, sx = {}, bodySx = {} }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            border: `1px solid ${QUIZ.line}`,
            borderRadius: RADIUS,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": { borderColor: QUIZ.primaryBorder, boxShadow: "0 1px 10px rgba(109,40,217,0.06)" },
            ...sx,
        }}
    >
        {(title || right) && (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 2,
                    py: 1.4,
                    borderBottom: `1px solid ${QUIZ.lineSoft}`,
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ width: 3, height: 20, borderRadius: RADIUS, bgcolor: QUIZ.primary, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: QUIZ.ink, lineHeight: 1.35 }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography sx={{ fontSize: "11.5px", color: QUIZ.muted, mt: 0.1 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
                {right}
            </Box>
        )}
        <Box sx={{ p: 2, flex: 1, minHeight: 0, ...bodySx }}>{children}</Box>
    </Box>
);

export const StatCard = ({ icon: Icon, label, value, caption, captionColor, captionBg, accent, accentBg }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            border: `1px solid ${QUIZ.line}`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: RADIUS,
            p: 2,
            height: "100%",
            boxSizing: "border-box",
            transition: "box-shadow 0.2s, border-color 0.2s",
            "&:hover": {
                borderColor: accent,
                borderLeftColor: accent,
                boxShadow: "0 4px 14px rgba(17,24,39,0.08)",
            },
        }}
    >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Typography
                sx={{
                    fontSize: "11.5px",
                    color: QUIZ.muted,
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: RADIUS,
                    bgcolor: accentBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 17, color: accent }} />
            </Box>
        </Box>
        <Typography sx={{ fontSize: "27px", fontWeight: 700, color: QUIZ.ink, lineHeight: 1.25, mt: 0.9 }}>
            {value}
        </Typography>
        {caption && (
            <Box
                sx={{
                    display: "inline-block",
                    mt: 0.7,
                    px: 0.9,
                    py: 0.25,
                    borderRadius: RADIUS,
                    bgcolor: captionBg || QUIZ.lineSoft,
                }}
            >
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: captionColor || QUIZ.muted }}>
                    {caption}
                </Typography>
            </Box>
        )}
    </Box>
);

export const MeterRow = ({ label, value, suffix = "%", color = QUIZ.primary, max = 100 }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
        <Typography sx={{ fontSize: "12.5px", color: QUIZ.text, width: 74, flexShrink: 0 }}>
            {label}
        </Typography>
        <LinearProgress
            variant="determinate"
            value={Math.min(100, (value / max) * 100)}
            sx={{
                flex: 1,
                height: 8,
                borderRadius: RADIUS,
                bgcolor: QUIZ.lineSoft,
                "& .MuiLinearProgress-bar": { borderRadius: RADIUS, bgcolor: color },
            }}
        />
        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: QUIZ.ink, width: 40, textAlign: "right", flexShrink: 0 }}>
            {value}{suffix}
        </Typography>
    </Box>
);

export const ChartTooltip = ({ active, payload, label, suffix = "" }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${QUIZ.line}`,
                borderRadius: RADIUS,
                px: 1.4,
                py: 1,
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            }}
        >
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: QUIZ.ink, mb: 0.4 }}>
                {label}
            </Typography>
            {payload.map((p) => (
                <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: p.color || p.fill }} />
                    <Typography sx={{ fontSize: "11.5px", color: QUIZ.muted }}>
                        {p.name}:{" "}
                        <span style={{ color: QUIZ.ink, fontWeight: 700 }}>
                            {p.value}{suffix}
                        </span>
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};
