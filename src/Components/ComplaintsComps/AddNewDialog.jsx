import React from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

import { C, TINT } from "./complaintsTokens";

// "Add New" picker, opened from the Add New button on the Complaints Management
// workspace. It only routes the user into one of the two intake streams — the
// entry forms themselves are separate screens.
//
// Width is not in the export (the frame is 100% of its container); 420 keeps the
// two option rows at the proportions the comp draws them.
const DIALOG_WIDTH = 420;

// This frame ships its own neutral ramp rather than the slate one in
// complaintsTokens — the tiles sit on #F9F9FA with an #E5E5EB hairline.
const TILE_BG = "#F9F9FA";
const TILE_BORDER = "#E5E5EB";
const TILE_TITLE = C.onAccent;
const TILE_DESC = "#667080";
const CHEVRON = "#99A1AB";
const ICON_COLOR = "#D9990D";

export const ADD_NEW_OPTIONS = [
    {
        key: "staffConcern",
        title: "Staff Concern",
        description: "Report an issue or concern identified by staff.",
        Icon: ReportProblemOutlinedIcon,
    },
    {
        key: "parentComplaint",
        title: "Parent Complaint",
        description: "Register a complaint on behalf of a parent.",
        Icon: ChatBubbleOutlineOutlinedIcon,
    },
];

export default function AddNewDialog({ open, onClose, onSelect }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: DIALOG_WIDTH,
                        maxWidth: "100%",
                        m: 2,
                        px: 4,
                        py: 3.5,
                        boxSizing: "border-box",
                        bgcolor: C.surface,
                        borderRadius: "12px",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.15)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    },
                },
            }}
        >
            {/* Title */}
            <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography sx={{ fontSize: "20px", fontWeight: 700, color: TILE_TITLE }}>
                    Add New
                </Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 400, color: TILE_DESC }}>
                    Choose what you want to add.
                </Typography>
            </Box>

            {/* Options */}
            <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1.5 }}>
                {ADD_NEW_OPTIONS.map(({ key, title, description, Icon }) => (
                    <Box
                        key={key}
                        onClick={() => onSelect(key)}
                        sx={{
                            alignSelf: "stretch",
                            minHeight: 100,
                            p: 2,
                            boxSizing: "border-box",
                            bgcolor: TILE_BG,
                            borderRadius: "10px",
                            border: `1px solid ${TILE_BORDER}`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            transition: "background-color 0.2s, border-color 0.2s",
                            "&:hover": { bgcolor: "#F3F4F6", borderColor: CHEVRON },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                                bgcolor: TINT.accent,
                                borderRadius: "20px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Icon sx={{ fontSize: "18px", color: ICON_COLOR }} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: TILE_TITLE }}>
                                {title}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 400, color: TILE_DESC }}>
                                {description}
                            </Typography>
                        </Box>

                        <ChevronRightOutlinedIcon sx={{ fontSize: "16px", color: CHEVRON, flexShrink: 0 }} />
                    </Box>
                ))}
            </Box>

            <Button
                onClick={onClose}
                sx={{
                    alignSelf: "stretch",
                    height: 40,
                    boxSizing: "border-box",
                    borderRadius: "9px",
                    border: "1px solid #D9D9DE",
                    color: "#4D545E",
                    fontSize: "14px",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#F8FAFC", border: "1px solid #D9D9DE" },
                }}
            >
                Cancel
            </Button>
        </Dialog>
    );
}
