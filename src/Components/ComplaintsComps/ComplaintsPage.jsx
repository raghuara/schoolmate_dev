import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, outlineBtnSx } from "./complaintsTokens";
import ComplaintsDashboard from "./ComplaintsDashboard";
import InternalComplaintsDashboard from "./InternalComplaintsDashboard";
import ComplaintsTabs from "./ComplaintsTabs";
import AddNewDialog from "./AddNewDialog";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the "Management Dashboard" title block.

// The dashboard names the second stream after the people who raise it. The
// configuration screens still say "Internal Complaints", so this stays local
// rather than changing COMPLAINT_TABS.
const DASHBOARD_TABS = ["Parent Complaints", "Staff Concerns"];


export default function ComplaintsPage() {
    const [tab, setTab] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const navigate = useNavigate();

    // The Figma accent #FCBE3A is the school's mainColor — read it from the store
    // so the screen stays correct when a school is white-labelled.
    const accent = websiteSettings.mainColor;

    // The two intake forms are separate screens that are not built yet; the picker
    // only has to report which stream was chosen. Swap the log for the navigate
    // call once those routes exist.
    const handleAddNew = (option) => {
        setAddOpen(false);
        console.log("Add New:", option);
    };

    return (
        <Box sx={{ px: "28px", py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Title + actions */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text }}>
                        Management Dashboard
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Monitor complaints, internal actions, and items requiring management attention.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => navigate("/dashboardmenu/complaints/configuration")}
                        startIcon={<SettingsOutlinedIcon sx={{ fontSize: "16px" }} />}
                        sx={outlineBtnSx}
                    >
                        Configuration
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboardmenu/complaints/manage")}
                        startIcon={<InboxOutlinedIcon sx={{ fontSize: "16px" }} />}
                        sx={outlineBtnSx}
                    >
                        Manage Complaints
                    </Button>
                    {/* One entry point for both intake streams — the picker asks
                        which one before opening its form. */}
                    <Button
                        onClick={() => setAddOpen(true)}
                        startIcon={<AddOutlinedIcon sx={{ fontSize: "16px" }} />}
                        sx={{
                            ...outlineBtnSx,
                            bgcolor: accent,
                            color: C.onAccent,
                            fontWeight: 700,
                            border: "none",
                            "&:hover": { bgcolor: websiteSettings.darkColor, border: "none" },
                        }}
                    >
                        Add New
                    </Button>
                </Box>
            </Box>

            <ComplaintsTabs value={tab} onChange={setTab} tabs={DASHBOARD_TABS} />

            {tab === 0 ? <ComplaintsDashboard /> : <InternalComplaintsDashboard />}

            <AddNewDialog open={addOpen} onClose={() => setAddOpen(false)} onSelect={handleAddNew} />
        </Box>
    );
}
