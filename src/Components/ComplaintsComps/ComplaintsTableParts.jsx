import React from "react";
import { Box, Typography } from "@mui/material";
import { C } from "./complaintsTokens";

// Bits shared by the Complaints config tables (Categories, Notification
// Templates). The comps draw both tables identically apart from their columns.

// 12/700 uppercase-ish header cell styling from the comps.
export const tableHeaderCellSx = { fontSize: "12px", fontWeight: 700, color: C.textMuted };

// Header strip: #F8FAFC fill, 12/10 padding, hairline underneath.
export const tableHeaderRowSx = {
    px: "12px",
    py: "10px",
    bgcolor: "#F8FAFC",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
};

export const tableBodyRowSx = {
    p: "12px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
};

/* Status / priority / channel / module pill. `width` fixes the pill size where the
   comp pins one (Status = 80, Priority = 100); omit it to hug the label. Pass
   `tone` directly when every row shares one colour (the Audit Log module column),
   otherwise `palette` looks the tone up by label. */
export function TableChip({ label, palette, tone: toneProp, width, fontSize = "11px", fontWeight = 700 }) {
    const tone = toneProp || palette?.[label] || { bg: C.track, color: C.textMuted };
    return (
        <Box
            sx={{
                width,
                px: "8px",
                py: "4px",
                bgcolor: tone.bg,
                borderRadius: "4px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <Typography sx={{ fontSize, fontWeight, color: tone.color, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
        </Box>
    );
}

/* The blue/red text action at the end of a row ("Edit Template", "Disable"). */
export function RowAction({ label, color, onClick }) {
    return (
        <Typography
            onClick={onClick}
            sx={{
                fontSize: "13px",
                fontWeight: 600,
                color,
                cursor: "pointer",
                whiteSpace: "nowrap",
                "&:hover": { textDecoration: "underline" },
            }}
        >
            {label}
        </Typography>
    );
}
