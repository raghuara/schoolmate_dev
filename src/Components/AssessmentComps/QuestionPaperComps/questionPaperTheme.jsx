import React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { DIFFICULTY_LEVELS, typeMeta } from "./questionPaperApi";

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

/* Page header actions run taller than the buttons inside a panel, so a header
   row reads as one band. Spread over any of the button styles below. */
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
    "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
    "&.Mui-disabled": { color: DASH.faint, borderColor: DASH.lineSoft },
};

/* Secondary actions take the dashboard's soft treatment - a coloured label on a
   tint of its own hue - so the one solid button on the page is the action the
   teacher actually came for. Same shape as softButtonSx on the dashboards. */
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
    "&:hover": { bgcolor: tone.bg, borderColor: tone.color },
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

export const STATUS_TONES = {
    Pending: { bg: DASH.primaryLight, color: "#B45309", border: DASH.primaryBorder },
    Approved: { bg: DASH.cyanLight, color: DASH.cyan, border: "#A5F3FC" },
    Published: { bg: DASH.greenLight, color: DASH.green, border: "#BBF7D0" },
    // Amber reads as "your move"; red is reserved for the paper that is closed.
    "Sent Back": { bg: DASH.amberLight, color: "#B45309", border: "#FDE68A" },
    Rejected: { bg: DASH.redLight, color: DASH.red, border: "#FECACA" },
};

export const statusTone = (status) =>
    STATUS_TONES[status] || { bg: DASH.lineSoft, color: DASH.muted, border: DASH.line };

export const StatusPill = ({ status }) => {
    const tone = statusTone(status);
    return (
        <Box
            sx={{
                display: "inline-flex", alignItems: "center", gap: 0.5,
                px: 1, py: 0.3, borderRadius: "20px",
                bgcolor: tone.bg, border: `1px solid ${tone.border}`, flexShrink: 0,
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tone.color }} />
            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: tone.color, whiteSpace: "nowrap" }}>
                {status}
            </Typography>
        </Box>
    );
};

export const Pill = ({ label, color, bg, border }) => (
    <Box
        sx={{
            px: 0.9, py: 0.2, borderRadius: RADIUS,
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

export const TypeChip = ({ type }) => {
    const meta = typeMeta(type);
    return <Pill label={meta.short} color={meta.color} bg={meta.bg} border={`${meta.color}33`} />;
};

export const DifficultyChip = ({ level }) => {
    const meta = DIFFICULTY_LEVELS.find((d) => d.key === level) || DIFFICULTY_LEVELS[1];
    return <Pill label={meta.label} color={meta.color} bg={meta.bg} border={`${meta.color}33`} />;
};

export const WizardHeader = ({ steps, step, onJump }) => (
    <Box
        sx={{
            display: "flex", alignItems: "center", gap: { xs: 0.8, md: 1.5 },
            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
            px: { xs: 1.2, md: 2 }, py: 1.1, mb: 1.8, overflowX: "auto",
        }}
    >
        {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
                <React.Fragment key={s.label}>
                    <Box
                        onClick={() => done && onJump && onJump(i)}
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.9, flexShrink: 0,
                            cursor: done && onJump ? "pointer" : "default",
                        }}
                    >
                        <Box
                            sx={{
                                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: done ? DASH.green : active ? DASH.primary : "#fff",
                                border: `2px solid ${done ? DASH.green : active ? DASH.primary : DASH.line}`,
                                color: done || active ? "#fff" : DASH.faint,
                                transition: "all 0.25s ease",
                            }}
                        >
                            {done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <Icon sx={{ fontSize: 14 }} />}
                        </Box>
                        <Typography
                            sx={{
                                fontSize: "12.5px",
                                fontWeight: active ? 700 : 600,
                                color: done || active ? DASH.ink : DASH.faint,
                                display: { xs: active ? "block" : "none", md: "block" },
                                whiteSpace: "nowrap",
                            }}
                        >
                            {s.label}
                        </Typography>
                    </Box>
                    {i < steps.length - 1 && (
                        <Box sx={{ flex: 1, height: 2, minWidth: 14, bgcolor: done ? DASH.green : DASH.lineSoft, borderRadius: 999 }} />
                    )}
                </React.Fragment>
            );
        })}
    </Box>
);

export const WizardFooter = ({ left, right }) => (
    <Box
        sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 1.5, flexWrap: "wrap", mt: 2,
            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, py: 1.4,
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flexWrap: "wrap" }}>{left}</Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{right}</Box>
    </Box>
);

export const Banner = ({ tone = "info", icon: Icon, title, children, right }) => {
    const tones = {
        info: { bg: DASH.blueLight, border: "#BFDBFE", color: "#1E40AF" },
        warn: { bg: DASH.primaryLight, border: DASH.primaryBorder, color: "#92400E" },
        error: { bg: DASH.redLight, border: "#FECACA", color: "#991B1B" },
        ok: { bg: DASH.greenLight, border: "#BBF7D0", color: "#065F46" },
    };
    const t = tones[tone] || tones.info;
    return (
        <Box
            sx={{
                display: "flex", alignItems: "flex-start", gap: 1.2,
                bgcolor: t.bg, border: `1px solid ${t.border}`, borderRadius: RADIUS,
                px: 1.8, py: 1.3, mb: 1.8,
            }}
        >
            {Icon && <Icon sx={{ fontSize: 17, color: t.color, flexShrink: 0, mt: 0.1 }} />}
            <Box sx={{ minWidth: 0, flex: 1 }}>
                {title && (
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: t.color }}>{title}</Typography>
                )}
                <Typography component="div" sx={{ fontSize: "12px", color: t.color, mt: title ? 0.3 : 0, lineHeight: 1.55 }}>
                    {children}
                </Typography>
            </Box>
            {right}
        </Box>
    );
};
