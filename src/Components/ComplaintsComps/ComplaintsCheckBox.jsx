import React from "react";
import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { C } from "./complaintsTokens";

// Shared by the Parent and Internal permissions screens.

/* 18px square check control drawn to match the comps — MUI's Checkbox carries
   its own ripple and padding, which would break the tight row rhythm. */
export function CheckBox({ checked, onChange, accent }) {
    return (
        <Box
            onClick={onChange}
            role="checkbox"
            aria-checked={!!checked}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange();
                }
            }}
            sx={{
                width: 18,
                height: 18,
                flexShrink: 0,
                boxSizing: "border-box",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: checked ? accent : C.surface,
                border: `2px solid ${checked ? accent : C.border}`,
                "&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 2 },
            }}
        >
            {checked && <CheckIcon sx={{ fontSize: "12px", color: "#fff" }} />}
        </Box>
    );
}

/* Circular initials badge with the brand gradient. */
export function UserAvatar({ initials, accent, size = 28 }) {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${accent} 0%, #F59E0B 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>
                {initials}
            </Typography>
        </Box>
    );
}
