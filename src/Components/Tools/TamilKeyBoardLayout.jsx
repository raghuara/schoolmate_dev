import React from "react";
import { Box, Button, IconButton, Typography, Tooltip } from "@mui/material";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import CloseIcon from "@mui/icons-material/Close";

const VOWELS      = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"];
const VOWEL_MARKS = ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"];
const CONSONANTS_1 = ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர"];
const CONSONANTS_2 = ["ல", "வ", "ழ", "ள", "ற", "ன", "ஸ", "ஹ", "ஜ", "ஷ"];

const PRIMARY = "#8600BB";
const PRIMARY_LIGHT = "#F8F0FE";
const PRIMARY_BORDER = "#E6CDF5";

export default function TamilKeyboard({ value = "", setValue, onClose, maxLength = 25 }) {
    const insertChar = (char) => {
        const newValue = (value + char).slice(0, maxLength);
        setValue(newValue);
    };

    const handleBackspace = () => {
        setValue(value.slice(0, -1));
    };

    const handleClear = () => {
        setValue("");
    };

    const renderRow = (keys, tone) => (
        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0.6, mb: 0.8 }}>
            {keys.map((key) => (
                <Button
                    key={key}
                    onClick={() => insertChar(key)}
                    disableRipple
                    sx={{
                        minWidth: 34,
                        width: 34,
                        height: 34,
                        p: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: "#1F2937",
                        bgcolor: "#fff",
                        border: `1px solid ${tone.border}`,
                        borderBottomWidth: 2,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontFamily: "'Noto Sans Tamil', 'Latha', sans-serif",
                        transition: "all 0.12s ease",
                        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                        "&:hover": {
                            bgcolor: tone.bg,
                            color: tone.color,
                            borderColor: tone.color,
                            transform: "translateY(-1px)",
                            boxShadow: `0 3px 8px ${tone.color}33`,
                        },
                        "&:active": { transform: "translateY(0)" },
                    }}
                >
                    {key}
                </Button>
            ))}
        </Box>
    );

    const TONES = {
        vowel:    { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
        mark:     { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
        consonant:{ color: "#0E7490", bg: "#F0FDFA", border: "#D5E8E2" },
    };

    return (
        <Box
            sx={{
                bgcolor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                overflow: "hidden",
                width: 540,
                maxWidth: "calc(100vw - 32px)",
                border: `1px solid ${PRIMARY_BORDER}`,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1.5, py: 1,
                    bgcolor: PRIMARY_LIGHT,
                    borderBottom: `1px solid ${PRIMARY_BORDER}`,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                    <Box sx={{
                        width: 22, height: 22, borderRadius: "6px",
                        bgcolor: PRIMARY, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800,
                        fontFamily: "'Noto Sans Tamil', 'Latha', sans-serif",
                    }}>
                        அ
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: 0.3 }}>
                        Tamil Keyboard
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{
                        px: 1, py: 0.3,
                        bgcolor: "#fff",
                        border: `1px solid ${PRIMARY_BORDER}`,
                        borderRadius: "6px",
                        fontSize: 11, fontWeight: 600,
                        color: "#6B7280",
                        minWidth: 50, textAlign: "center",
                    }}>
                        {value.length}/{maxLength}
                    </Box>
                    {onClose && (
                        <Tooltip title="Close keyboard" arrow>
                            <IconButton
                                size="small"
                                onClick={onClose}
                                sx={{ color: PRIMARY, "&:hover": { bgcolor: "#fff" } }}
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Live value preview */}
            <Box sx={{
                mx: 1.5, mt: 1.2, mb: 0.8,
                px: 1.2, py: 0.8,
                bgcolor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                minHeight: 32,
                display: "flex", alignItems: "center",
            }}>
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: value ? "#111827" : "#9CA3AF",
                        fontFamily: "'Noto Sans Tamil', 'Latha', sans-serif",
                        wordBreak: "break-word",
                    }}
                >
                    {value || "Tap a key to begin…"}
                </Typography>
            </Box>

            {/* Keys */}
            <Box sx={{ p: 1.2, pt: 0.5 }}>
                {renderRow(VOWELS, TONES.vowel)}
                {renderRow(VOWEL_MARKS, TONES.mark)}
                {renderRow(CONSONANTS_1, TONES.consonant)}
                {renderRow(CONSONANTS_2, TONES.consonant)}

                {/* Action row */}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8, mt: 1, flexWrap: "wrap" }}>
                    <Button
                        variant="contained"
                        disableRipple
                        onClick={() => insertChar(" ")}
                        sx={{
                            flex: 1,
                            maxWidth: 220, height: 38,
                            textTransform: "none",
                            fontSize: 13, fontWeight: 700, letterSpacing: 1,
                            bgcolor: PRIMARY,
                            borderRadius: "8px", boxShadow: "none",
                            "&:hover": { bgcolor: "#6F009A", boxShadow: `0 3px 8px ${PRIMARY}55` },
                        }}
                    >
                        SPACE
                    </Button>
                    <Button
                        variant="contained"
                        disableRipple
                        onClick={() => insertChar(".")}
                        sx={{
                            minWidth: 50, height: 38,
                            textTransform: "none",
                            fontSize: 16, fontWeight: 800,
                            bgcolor: "#fff",
                            color: "#374151",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px", boxShadow: "none",
                            "&:hover": { bgcolor: "#F3F4F6", borderColor: "#9CA3AF" },
                        }}
                    >
                        .
                    </Button>
                    <Tooltip title="Clear all" arrow>
                        <span>
                            <Button
                                variant="outlined"
                                disableRipple
                                disabled={!value}
                                onClick={handleClear}
                                sx={{
                                    minWidth: 50, height: 38,
                                    textTransform: "none",
                                    fontSize: 11, fontWeight: 700,
                                    color: "#6B7280",
                                    borderColor: "#E5E7EB",
                                    borderRadius: "8px",
                                    "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" },
                                }}
                            >
                                CLR
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip title="Backspace" arrow>
                        <span>
                            <Button
                                variant="contained"
                                disableRipple
                                color="error"
                                disabled={!value}
                                onClick={handleBackspace}
                                sx={{
                                    minWidth: 50, height: 38,
                                    bgcolor: "#DC2626",
                                    borderRadius: "8px", boxShadow: "none",
                                    "&:hover": { bgcolor: "#B91C1C", boxShadow: "0 3px 8px #DC262655" },
                                }}
                            >
                                <BackspaceOutlinedIcon sx={{ fontSize: 18 }} />
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
}
