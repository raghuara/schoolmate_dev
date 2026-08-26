import React from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";

export const COMPLAINT_TABS = ["Parent Complaints", "Internal Complaints"];

// Segmented pills, built as buttons rather than MUI Tabs so the treatment from the
// mockup carries over exactly. Shared by the dashboard and the configurations screen.
export default function ComplaintsTabs({ value, onChange, tabs = COMPLAINT_TABS }) {
    const websiteSettings = useSelector(selectWebsiteSettings);

    // The Figma accent #FCBE3A is the school's mainColor — read it from the store
    // so the screen stays correct when a school is white-labelled.
    const accent = websiteSettings.mainColor;

    return (
        <Box
            sx={{
                alignSelf: "flex-start",
                maxWidth: "100%",
                boxSizing: "border-box",
                px: "10px",
                py: "6px",
                bgcolor: C.surface,
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
                overflowX: "auto",
            }}
        >
            {tabs.map((label, i) => {
                const active = value === i;
                return (
                    <Box
                        key={label}
                        onClick={() => onChange(i)}
                        sx={{
                            height: 35,
                            boxSizing: "border-box",
                            px: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            bgcolor: active ? accent : "transparent",
                            border: `1px solid ${active ? C.tabActiveBorder : "transparent"}`,
                            transition: "background-color 0.2s",
                            "&:hover": { bgcolor: active ? accent : websiteSettings.lightColor },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "13px",
                                fontWeight: active ? 700 : 500,
                                color: active ? C.tabActiveText : C.textMuted,
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
