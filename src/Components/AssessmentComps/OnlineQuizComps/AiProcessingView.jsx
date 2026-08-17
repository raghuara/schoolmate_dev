import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { DASH, RADIUS, BRAND } from "../../DashBoardComps/dashboardTheme";

const ACCENT = BRAND.purple.main;
const ACCENT_SOFT = BRAND.cyan.main;

const STEP_TONES = [BRAND.purple.main, BRAND.blue.main, BRAND.cyan.main, BRAND.orange.main, BRAND.green.main];

const shimmerSx = (delay = 0) => ({
    position: "relative",
    overflow: "hidden",
    bgcolor: DASH.lineSoft,
    borderRadius: RADIUS,
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        transform: "translateX(-100%)",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
        animation: "aiShimmer 1.7s ease-in-out infinite",
        animationDelay: `${delay}s`,
    },
    "@keyframes aiShimmer": { "100%": { transform: "translateX(100%)" } },
});

const Bar = ({ w, h = 9, delay = 0, sx = {} }) => (
    <Box sx={{ ...shimmerSx(delay), width: w, height: h, ...sx }} />
);

const AiOrb = () => (
    <Box sx={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <Box
            sx={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${ACCENT}55 0%, transparent 68%)`,
                animation: "aiHalo 2.6s ease-in-out infinite",
                "@keyframes aiHalo": {
                    "0%, 100%": { transform: "scale(0.92)", opacity: 0.5 },
                    "50%": { transform: "scale(1.08)", opacity: 0.85 },
                },
            }}
        />
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: `conic-gradient(from 0deg, transparent 0deg, ${ACCENT_SOFT} 120deg, ${ACCENT} 250deg, transparent 340deg)`,
                animation: "aiSpin 1.4s linear infinite",
                "@keyframes aiSpin": { to: { transform: "rotate(360deg)" } },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 3,
                    borderRadius: "50%",
                    background: "#fff",
                },
            }}
        />
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AutoAwesomeIcon
                sx={{
                    fontSize: 17,
                    color: ACCENT,
                    animation: "aiSparkle 1.9s ease-in-out infinite",
                    "@keyframes aiSparkle": {
                        "0%, 100%": { opacity: 0.55, transform: "scale(0.88)" },
                        "50%": { opacity: 1, transform: "scale(1.12)" },
                    },
                }}
            />
        </Box>
    </Box>
);

const SkeletonQuestion = ({ index }) => {
    const delay = index * 0.18;
    return (
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${DASH.lineSoft}`,
                borderRadius: RADIUS,
                p: 1.5,
                mb: 1.2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.3 }}>
                <Box sx={{ ...shimmerSx(delay), width: 30, height: 30, flexShrink: 0 }} />
                <Bar w="68%" h={11} delay={delay + 0.05} />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                {[0, 1, 2, 3].map((i) => (
                    <Box
                        key={i}
                        sx={{ display: "flex", alignItems: "center", gap: 0.9, width: { xs: "100%", sm: "calc(50% - 6px)" } }}
                    >
                        <Box sx={{ ...shimmerSx(delay + i * 0.06), width: 14, height: 14, borderRadius: "50%", flexShrink: 0 }} />
                        <Bar w={`${58 + ((i * 13) % 30)}%`} h={9} delay={delay + i * 0.06} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default function AiProcessingView({
    steps,
    activeIndex,
    progress,
    fileName,
    pageLabel,
    secondsLeft,
    onCancel,
    skeletonCount = 3,
}) {
    const active = steps[activeIndex] || steps[steps.length - 1];

    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.8,
                    px: 2,
                    py: 1.8,
                    flexWrap: "wrap",
                    background: `linear-gradient(115deg, ${BRAND.purple.icon} 0%, #FFFFFF 55%, ${BRAND.cyan.icon} 100%)`,
                }}
            >
                <AiOrb />

                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, letterSpacing: "-0.01em" }}>
                        Generating your questions
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.25 }}>
                        <strong style={{ color: ACCENT, fontWeight: 700 }}>{active?.title}</strong>
                        {" — "}
                        {active?.detail}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: ACCENT, lineHeight: 1.1 }}>
                            {Math.round(progress)}%
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                                textTransform: "uppercase", color: DASH.faint, whiteSpace: "nowrap",
                            }}
                        >
                            {secondsLeft > 0 ? `${secondsLeft}s remaining` : "almost done"}
                        </Typography>
                    </Box>
                    {onCancel && (
                        <Button
                            onClick={onCancel}
                            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                            sx={{
                                textTransform: "none", fontSize: "12px", fontWeight: 600, color: DASH.muted,
                                bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.5,
                                "&:hover": { bgcolor: DASH.redLight, color: DASH.red, borderColor: "#FECACA" },
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ position: "relative", height: 4, bgcolor: DASH.lineSoft, overflow: "hidden" }}>
                <Box
                    sx={{
                        height: "100%",
                        width: `${Math.min(100, progress)}%`,
                        background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
                        transition: "width 0.6s ease",
                        position: "relative",
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                            animation: "aiSweep 1.5s ease-in-out infinite",
                        },
                        "@keyframes aiSweep": {
                            "0%": { transform: "translateX(-100%)" },
                            "100%": { transform: "translateX(100%)" },
                        },
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1.4, px: 2, py: 1.2,
                    borderBottom: `1px solid ${DASH.lineSoft}`, flexWrap: "wrap", bgcolor: DASH.surface,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.7 }, flex: 1, minWidth: 190, flexWrap: "wrap" }}>
                    {steps.map((s, i) => {
                        const tone = STEP_TONES[i % STEP_TONES.length];
                        const done = i < activeIndex;
                        const current = i === activeIndex;
                        return (
                            <Box key={s.title} sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                                <Box
                                    sx={{
                                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        bgcolor: done ? DASH.green : current ? tone : "#fff",
                                        border: `1.5px solid ${done ? DASH.green : current ? tone : DASH.line}`,
                                        transition: "all 0.35s ease",
                                        ...(current && {
                                            animation: "aiDot 1.5s ease-in-out infinite",
                                            "@keyframes aiDot": {
                                                "0%, 100%": { boxShadow: `0 0 0 0 ${tone}55` },
                                                "50%": { boxShadow: `0 0 0 5px ${tone}00` },
                                            },
                                        }),
                                    }}
                                >
                                    {done && <CheckIcon sx={{ fontSize: 9, color: "#fff" }} />}
                                </Box>
                                <Typography
                                    sx={{
                                        fontSize: "10.5px",
                                        fontWeight: current ? 700 : 500,
                                        color: done ? DASH.muted : current ? DASH.ink : DASH.faint,
                                        whiteSpace: "nowrap",
                                        display: { xs: current ? "block" : "none", md: "block" },
                                    }}
                                >
                                    {s.title}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {fileName && (
                    <Box
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.6, maxWidth: 270,
                            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1, py: 0.4,
                        }}
                    >
                        <DescriptionOutlinedIcon sx={{ fontSize: 14, color: DASH.muted, flexShrink: 0 }} />
                        <Typography
                            sx={{
                                fontSize: "10.5px", fontWeight: 600, color: DASH.text,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                        >
                            {fileName}
                        </Typography>
                    </Box>
                )}
                {pageLabel && (
                    <Typography sx={{ fontSize: "10.5px", color: DASH.faint, whiteSpace: "nowrap" }}>{pageLabel}</Typography>
                )}
            </Box>

            <Box sx={{ p: 1.6 }}>
                {Array.from({ length: skeletonCount }, (_, i) => (
                    <SkeletonQuestion key={i} index={i} />
                ))}
                <Typography sx={{ fontSize: "11.5px", color: DASH.faint, textAlign: "center", pt: 0.4 }}>
                    Questions appear here as soon as the document has been read.
                </Typography>
            </Box>
        </Box>
    );
}
