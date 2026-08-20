import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

export const RADIUS = "5px";

export const DASH = {
    primary: "#EEA200",
    primaryLight: "#FFF7E5",
    primaryBorder: "#FCE3A8",
    blue: "#3B82F6",
    blueLight: "#EFF6FF",
    green: "#10B981",
    greenLight: "#ECFDF5",
    red: "#EF4444",
    redLight: "#FEF2F2",
    amber: "#F59E0B",
    amberLight: "#FFFBEB",
    violet: "#7C3AED",
    violetLight: "#F5F3FF",
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
    // Matches the page background used across the rest of the product
    // (DashBoardLayout sets the same value for every other screen).
    canvas: "#F6F6F8",
};

// SchoolMate brand palette - the same colours used by MyProjects, Approvals
// and Transport cards, so the dashboard matches the rest of the product.
// main = accent bar / icon / value, bg = card wash, icon = icon circle.
export const BRAND = {
    purple: { main: "#A749CC", bg: "#FBF9FC", icon: "#F7F0F9" },
    orange: { main: "#ED9146", bg: "#FCFBF9", icon: "#FBF4EF" },
    green: { main: "#7DC353", bg: "#F9FBF7", icon: "#F2F8EE" },
    pink: { main: "#E10052", bg: "#FCF8F9", icon: "#FBEBF1" },
    blue: { main: "#1F73C2", bg: "#F9FAFC", icon: "#EEF3F9" },
    cyan: { main: "#0891B2", bg: "#F0FAFB", icon: "#E0F7FA" },
};

export const KPI_TONES = {
    orange: {
        bg: "#FFF5E8",
        fg: "#111827",
        accent: "#F28C00",
        border: "#F3D2A8",
        iconBorder: "#F8DFC0",
        wave: "rgba(245, 158, 11, 0.29)",
        wave2: "rgba(245, 158, 11, 0.39)",
    },

    violet: {
        bg: "#F7F0FF",
        fg: "#111827",
        accent: "#7C3AED",
        border: "#DCC7F3",
        iconBorder: "#E5D7F8",
        wave: "rgba(139, 92, 246, 0.23)",
        wave2: "rgba(139, 92, 246, 0.11)",
    },

    pink: {
        bg: "#FFF3F1",
        fg: "#111827",
        accent: "#C94B4B",
        border: "#F0CBC7",
        iconBorder: "#F5DCD9",
        wave: "rgba(201, 75, 75, 0.22)",
        wave2: "rgba(201, 75, 75, 0.10)",
    },

    cyan: {
        bg: "#EDF9FD",
        fg: "#111827",
        accent: "#0891B2",
        border: "#BFE1EA",
        iconBorder: "#D1EDF3",
        wave: "rgba(14, 165, 217, 0.23)",
        wave2: "rgba(14, 165, 217, 0.11)",
    },

    blue: {
        bg: "#EEF5FF",
        fg: "#111827",
        accent: "#2563EB",
        border: "#C9DCF5",
        iconBorder: "#D8E7FA",
        wave: "rgba(59, 130, 246, 0.22)",
        wave2: "rgba(59, 130, 246, 0.10)",
    },

    green: {
        bg: "#EEF9F4",
        fg: "#111827",
        accent: "#059669",
        border: "#C5E5D6",
        iconBorder: "#D6EFE2",
        wave: "rgba(16, 185, 129, 0.22)",
        wave2: "rgba(16, 185, 129, 0.10)",
    },
};

// Tinted button surfaces built from the same brand hues.
export const SOFT = {
    purple: { color: "#8E33B0", bg: BRAND.purple.bg, border: "#EADFF0", hover: BRAND.purple.icon },
    orange: { color: "#C2701F", bg: BRAND.orange.bg, border: "#F5E2D2", hover: BRAND.orange.icon },
    green: { color: "#5E9E38", bg: BRAND.green.bg, border: "#DCEBD2", hover: BRAND.green.icon },
    pink: { color: "#E10052", bg: BRAND.pink.bg, border: "#F7D6E2", hover: BRAND.pink.icon },
    blue: { color: "#1F73C2", bg: BRAND.blue.bg, border: "#D8E4F1", hover: BRAND.blue.icon },
    cyan: { color: "#0891B2", bg: BRAND.cyan.bg, border: "#C7EDF3", hover: BRAND.cyan.icon },
};

export const SEVERITY = {
    critical: { color: DASH.red, bg: DASH.redLight, border: "#FECACA" },
    warning: { color: DASH.amber, bg: DASH.amberLight, border: "#FDE68A" },
    info: { color: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE" },
};

export const Panel = ({ title, subtitle, right, children, sx = {}, bodySx = {} }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            border: `1px solid ${DASH.line}`,
            borderRadius: RADIUS,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": { borderColor: DASH.primaryBorder, boxShadow: "0 1px 10px rgba(17,24,39,0.05)" },
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
                    borderBottom: `1px solid ${DASH.lineSoft}`,
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ width: 3, height: 20, borderRadius: RADIUS, bgcolor: DASH.primary, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35 }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.1 }}>
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

export const StatTile = ({ icon: Icon, label, value, caption, captionColor, captionBg, accent, accentBg, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            position: "relative",
            background: `linear-gradient(135deg, ${accentBg} 0%, #ffffff 62%)`,
            border: `1px solid ${DASH.line}`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: RADIUS,
            p: 1.8,
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            cursor: onClick ? "pointer" : "default",
            overflow: "hidden",
            transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
            "&:hover": {
                borderColor: accent,
                boxShadow: "0 6px 18px rgba(17,24,39,0.10)",
                transform: onClick ? "translateY(-2px)" : "none",
            },
        }}
    >
        {/* soft accent bloom behind the icon */}
        <Box
            sx={{
                position: "absolute",
                top: -26,
                right: -26,
                width: 78,
                height: 78,
                borderRadius: "50%",
                bgcolor: accent,
                opacity: 0.07,
                pointerEvents: "none",
            }}
        />

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, position: "relative" }}>
            <Typography
                sx={{
                    fontSize: "10.5px",
                    color: DASH.muted,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    lineHeight: 1.35,
                    // reserve two lines so values stay aligned across the row
                    minHeight: 28,
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: RADIUS,
                    bgcolor: "#fff",
                    border: `1px solid ${DASH.line}`,
                    boxShadow: "0 1px 3px rgba(17,24,39,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 17, color: accent }} />
            </Box>
        </Box>

        <Typography sx={{ fontSize: "26px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2, mt: 0.4 }}>
            {value}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {caption && (
            <Box
                sx={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    mt: 0.8,
                    px: 0.9,
                    py: 0.25,
                    borderRadius: RADIUS,
                    bgcolor: captionBg || DASH.lineSoft,
                    border: `1px solid ${captionBg ? "transparent" : DASH.line}`,
                }}
            >
                <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: captionColor || DASH.muted }}>
                    {caption}
                </Typography>
            </Box>
        )}
    </Box>
);

export const AlertCard = ({
    icon: Icon,
    label,
    count,
    severity = "warning",
    onClick,
}) => {
    const s = SEVERITY[severity] || SEVERITY.warning;

    return (
        <Box
            onClick={onClick}
            sx={{
                position: "relative",
                minWidth: 0,
                height: 50,

                display: "flex",
                flexDirection: "column",
                justifyContent: "center",

                px: 1.4,
                py: 1,

                borderRadius: "7px",

                background: `linear-gradient(
                    135deg,
                    ${s.bg} 0%,
                    #FFFFFF 100%
                )`,

                border: `1px solid ${s.border}`,

                cursor: onClick ? "pointer" : "default",

                transition:
                    "transform .18s ease, box-shadow .18s ease",

                "&:hover": onClick
                    ? {
                        transform: "translateY(-2px)",
                        boxShadow:
                            "0 5px 14px rgba(17,24,39,.08)",
                    }
                    : {},
            }}
        >
            {/* COUNT + ICON */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    mb: 0.45,
                }}
            >
                <Box
                    sx={{
                        width: 23,
                        height: 23,
                        borderRadius: "50%",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        bgcolor: "#FFFFFF",
                        border: `1px solid ${s.border}`,
                    }}
                >
                    <Icon
                        sx={{
                            fontSize: 13,
                            color: s.color,
                        }}
                    />
                </Box>

                <Typography
                    sx={{
                        fontSize: "20px",
                        fontWeight: 800,
                        lineHeight: 1,
                        color: s.color,
                    }}
                >
                    {count}
                </Typography>
            </Box>

            {/* LABEL */}
            <Typography
                sx={{
                    fontSize: "10.5px",
                    lineHeight: 1.3,
                    fontWeight: 600,
                    color: DASH.text,

                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};
export const StatCard = ({
    icon: Icon, label, value, delta, deltaDirection, note, accent, accentBg, spark, sparkId, onClick,
}) => {
    const isUp = deltaDirection === "up";
    const isDown = deltaDirection === "down";
    const deltaColor = isUp ? DASH.green : isDown ? DASH.red : DASH.muted;

    return (
        <Box
            onClick={onClick}
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                px: 2,
                pt: 1.8,
                pb: spark ? 0 : 1.8,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                cursor: onClick ? "pointer" : "default",
                transition: "border-color 0.18s, box-shadow 0.18s",
                "&:hover": {
                    borderColor: DASH.faint,
                    boxShadow: "0 2px 10px rgba(17,24,39,0.06)",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 30 }}>
                <Box
                    sx={{
                        width: 26,
                        height: 26,
                        borderRadius: RADIUS,
                        bgcolor: accentBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon sx={{ fontSize: 15, color: accent }} />
                </Box>
                <Typography
                    sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        color: DASH.muted,
                        lineHeight: 1.3,
                    }}
                >
                    {label}
                </Typography>
            </Box>

            <Typography
                sx={{
                    fontSize: "27px",
                    fontWeight: 700,
                    color: DASH.ink,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    mt: 1,
                }}
            >
                {value}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5, minHeight: 18 }}>
                {isUp && <ArrowUpwardRoundedIcon sx={{ fontSize: 13, color: deltaColor }} />}
                {isDown && <ArrowDownwardRoundedIcon sx={{ fontSize: 13, color: deltaColor }} />}
                <Typography sx={{ fontSize: "11.5px", fontWeight: delta ? 600 : 400, color: delta ? deltaColor : DASH.faint }}>
                    {delta || note}
                </Typography>
            </Box>

            {spark && (
                <Box sx={{ height: 34, mx: -2, mt: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id={`spark-${sparkId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
                                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={accent}
                                strokeWidth={1.6}
                                fill={`url(#spark-${sparkId})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Box>
    );
};
export const SolidStatCard = ({
    icon: Icon,
    label,
    value,
    note,
    tone,
    onClick,
}) => (
    <Box
        onClick={onClick}
        sx={{
            position: "relative",
            height: 125,
            minHeight: 125,
            overflow: "hidden",
            boxSizing: "border-box",

            bgcolor: tone.bg,
            border: `1px solid ${tone.border}`,
            borderRadius: "7px",

            cursor: onClick ? "pointer" : "default",

            transition: "transform .2s ease, box-shadow .2s ease",

            "&:hover": onClick
                ? {
                    transform: "translateY(-2px)",
                    boxShadow:
                        "0 6px 18px rgba(17,24,39,.09)",
                }
                : {},
        }}
    >
        {/* CONTENT */}
        <Box
            sx={{
                position: "relative",
                zIndex: 5,
                p: "11px 14px",
            }}
        >
            <Typography
                sx={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: tone.accent,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    mt: 0.80,
                    fontSize: "28px",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: tone.fg,
                    letterSpacing: "-0.02em",
                }}
            >
                {value}
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#475569",
                }}
            >
                {note}
            </Typography>
        </Box>


        {/* WAVE 1 */}
        {/* SMOOTH BOTTOM WAVE */}
        <Box
            sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "63%",
                zIndex: 1,
                pointerEvents: "none",
            }}
        >
            <svg
                viewBox="0 0 600 140"
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                style={{
                    display: "block",
                }}
            >
                <path
                    d="
                M0,108
                C45,96 85,94 125,104
                C170,115 205,118 245,104
                C285,90 320,72 360,82
                C400,92 435,103 470,91
                C515,75 550,52 600,45
                L600,140
                L0,140
                Z
            "
                    fill={tone.wave}
                />
            </svg>
        </Box>
    </Box>
);

export const HeroStat = ({ icon: Icon, label, value, caption, gradient, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            position: "relative",
            background: gradient,
            borderRadius: RADIUS,
            p: 2,
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            cursor: onClick ? "pointer" : "default",
            boxShadow: "0 4px 14px rgba(17,24,39,0.12)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
                transform: onClick ? "translateY(-3px)" : "none",
                boxShadow: "0 10px 26px rgba(17,24,39,0.20)",
            },
        }}
    >
        {/* decorative rings */}
        <Box sx={{ position: "absolute", top: -40, right: -30, width: 110, height: 110, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.14)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -46, right: 14, width: 78, height: 78, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, position: "relative" }}>
            <Typography
                sx={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.35,
                    minHeight: 28,
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: RADIUS,
                    bgcolor: "rgba(255,255,255,0.22)",
                    border: "1px solid rgba(255,255,255,0.30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backdropFilter: "blur(2px)",
                }}
            >
                <Icon sx={{ fontSize: 19, color: "#fff" }} />
            </Box>
        </Box>

        <Typography sx={{ fontSize: "30px", fontWeight: 800, color: "#fff", lineHeight: 1.15, mt: 0.4, position: "relative", textShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
            {value}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {caption && (
            <Box
                sx={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    mt: 0.9,
                    px: 1,
                    py: 0.3,
                    borderRadius: RADIUS,
                    bgcolor: "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    position: "relative",
                }}
            >
                <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#fff" }}>
                    {caption}
                </Typography>
            </Box>
        )}
    </Box>
);

export const MeterRow = ({ label, value, suffix = "%", color = DASH.blue, max = 100, right }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.7 }}>
        <Typography sx={{ fontSize: "12.5px", color: DASH.text, width: 78, flexShrink: 0 }}>
            {label}
        </Typography>
        <LinearProgress
            variant="determinate"
            value={Math.min(100, (value / max) * 100)}
            sx={{
                flex: 1,
                height: 7,
                borderRadius: RADIUS,
                bgcolor: DASH.lineSoft,
                "& .MuiLinearProgress-bar": { borderRadius: RADIUS, bgcolor: color },
            }}
        />
        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, width: right ? 64 : 42, textAlign: "right", flexShrink: 0 }}>
            {right || `${value}${suffix}`}
        </Typography>
    </Box>
);

export const ChartTooltip = ({ active, payload, label, suffix = "" }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                px: 1.4,
                py: 1,
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            }}
        >
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink, mb: 0.4 }}>
                {label}
            </Typography>
            {payload.map((p) => (
                <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: p.color || p.fill }} />
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                        {p.name}:{" "}
                        <span style={{ color: DASH.ink, fontWeight: 700 }}>
                            {p.value}{suffix}
                        </span>
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export const EmptyNote = ({ text }) => (
    <Typography sx={{ fontSize: "12.5px", color: DASH.faint, textAlign: "center", py: 3 }}>
        {text}
    </Typography>
);
