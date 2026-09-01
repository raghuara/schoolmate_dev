import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";

/* Every approval queue reads the same way: a band naming the group, then the
   cards, then one decline / accept pair. Keeping the shapes here stops the
   four queues drifting apart again. */

export const SectionBand = ({ label, accent = DASH.violet, count }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 3, height: 18, borderRadius: RADIUS, bgcolor: accent, flexShrink: 0 }} />
        <Typography
            sx={{
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: DASH.muted,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </Typography>
        {count !== undefined && (
            <Box
                sx={{
                    px: 0.8,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: RADIUS,
                    bgcolor: `${accent}1A`,
                    color: accent,
                    fontSize: "10px",
                    fontWeight: 700,
                }}
            >
                {count}
            </Box>
        )}
        <Divider sx={{ flex: 1 }} />
    </Box>
);

/* ── Edit screens ────────────────────────────────────────────────────────
   The approval edit forms are the create screens with a different verb on
   the submit button, so they borrow the same field and dropzone shapes. */

export const fieldLabelSx = { fontSize: "13px", fontWeight: 600, color: DASH.text, mb: 0.7 };

export const requiredMark = { color: "#E30053" };

export const fieldErrorStyle = { color: "#E30053", fontSize: "11px" };

export const counterSx = (over) => ({
    fontSize: "11px",
    mt: 0.5,
    textAlign: "right",
    color: over ? "#E30053" : DASH.faint,
});

/* The image / link panel that sits under the description. */
export const uploadPanelSx = {
    width: "100%",
    backgroundColor: "#FAFBFC",
    border: `1px solid ${DASH.lineSoft}`,
    borderRadius: "10px",
    p: 1.5,
    mt: 3,
};

export const uploadTabsSx = (accent) => ({
    minHeight: "34px",
    "& .MuiTab-root": {
        textTransform: "none",
        minHeight: "34px",
        py: 0,
        fontSize: "13px",
        fontWeight: 600,
        color: DASH.muted,
    },
    "& .Mui-selected": { color: `${DASH.ink} !important` },
    "& .MuiTabs-indicator": { backgroundColor: accent, height: "3px", borderRadius: "3px" },
});

export const dropzoneSx = (isDragActive) => ({
    border: isDragActive ? "2px dashed #1976d2" : "2px dashed #C7D6EA",
    borderRadius: "10px",
    p: 1.5,
    backgroundColor: isDragActive ? "#E3F2FD" : "#F6F9FD",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": { borderColor: "#1976d2", backgroundColor: "#EDF4FC" },
});

/* The decline reason box. TextareaAutosize takes a plain style object, not sx. */
export const reasonBoxStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: RADIUS,
    border: `1px solid ${DASH.line}`,
    fontSize: "13px",
    fontFamily: "inherit",
    color: DASH.ink,
    resize: "none",
    outline: "none",
};

/* Neutral action - Edit, Cancel, Close. */
export const ghostBtnSx = {
    textTransform: "none",
    borderRadius: RADIUS,
    px: 2,
    height: 32,
    fontSize: "12.5px",
    fontWeight: 700,
    color: DASH.text,
    borderColor: DASH.line,
    backgroundColor: "#fff",
    boxShadow: "none",
    "&:hover": { borderColor: DASH.faint, backgroundColor: DASH.lineSoft },
};

/* Turning something down - reads as a warning, not as the main action. */
export const declineBtnSx = {
    textTransform: "none",
    borderRadius: RADIUS,
    px: 2,
    height: 32,
    fontSize: "12.5px",
    fontWeight: 700,
    color: DASH.red,
    borderColor: `${DASH.red}55`,
    backgroundColor: "#fff",
    boxShadow: "none",
    "&:hover": { borderColor: DASH.red, backgroundColor: DASH.redLight },
};

/* The action the approver came for - the one solid button on the card. */
export const acceptBtnSx = {
    textTransform: "none",
    borderRadius: RADIUS,
    px: 2.4,
    height: 32,
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: "#00963C",
    boxShadow: "none",
    "&:hover": { backgroundColor: "#047857", boxShadow: "none" },
    "&.Mui-disabled": { backgroundColor: DASH.line, color: DASH.faint },
};

/* Destructive confirmation inside a dialog. */
export const dangerBtnSx = {
    textTransform: "none",
    borderRadius: RADIUS,
    px: 2.4,
    height: 34,
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: DASH.red,
    boxShadow: "none",
    "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
};

/* Submitting a dialog in the school's own colour. */
export const brandBtnSx = (websiteSettings = {}) => ({
    textTransform: "none",
    borderRadius: RADIUS,
    px: 2.4,
    height: 34,
    fontSize: "12.5px",
    fontWeight: 700,
    color: websiteSettings.textColor || "#fff",
    backgroundColor: websiteSettings.mainColor || DASH.primary,
    boxShadow: "none",
    "&:hover": {
        backgroundColor: websiteSettings.mainColor || DASH.primary,
        filter: "brightness(0.92)",
        boxShadow: "none",
    },
    "&.Mui-disabled": { backgroundColor: DASH.line, color: DASH.faint },
});

/* Expanding a long post - a quiet control, not a solid black lozenge over
   the text it belongs to. */
export const readMoreBtnSx = {
    mt: 1,
    position: "absolute",
    bottom: "10px",
    textTransform: "none",
    borderRadius: RADIUS,
    px: 1.4,
    py: 0.3,
    fontSize: "11.5px",
    fontWeight: 700,
    color: DASH.text,
    backgroundColor: "#fff",
    border: `1px solid ${DASH.line}`,
    boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
    "&:hover": { backgroundColor: DASH.lineSoft, borderColor: DASH.faint },
};

/* Small square icon button - delete on a card. */
export const iconBtnSx = {
    width: 30,
    height: 30,
    borderRadius: RADIUS,
    border: `1px solid ${DASH.line}`,
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: DASH.redLight, borderColor: "#FECACA" },
};
