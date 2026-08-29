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
import MyWorkPage from "./MyWorkPage";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the "Management Dashboard" title block.

// The dashboard names the second stream after the people who raise it. The
// configuration screens still say "Internal Complaints", so this stays local
// rather than changing COMPLAINT_TABS.
const DASHBOARD_TABS = ["Parent Complaints", "Staff Concerns"];

// TEMPORARY — a preview switch, not access control.
//
// Which of these two views a user actually gets will come from their role
// permissions (see complaintsAccess.js / useComplaintsPermissions), exactly as
// every other screen in this module resolves. Until that backend lands there is
// no way to see the staff side without logging in as a staff member, so this
// toggle renders both. Delete it — and the `view` state below — once the
// permissions decide the view.
const ADMIN_VIEW = "Admin";
const STAFF_VIEW = "Staff";
const ROLE_VIEWS = [ADMIN_VIEW, STAFF_VIEW];

const VIEW_COPY = {
    [ADMIN_VIEW]: {
        title: "Management Dashboard",
        subtitle: "Monitor complaints, internal actions, and items requiring management attention.",
    },
    [STAFF_VIEW]: {
        title: "My Work",
        subtitle: "Complaints and internal actions assigned to you.",
    },
};


export default function ComplaintsPage() {
    const [tab, setTab] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const [view, setView] = useState(ADMIN_VIEW);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const navigate = useNavigate();

    // The Figma accent #FCBE3A is the school's mainColor — read it from the store
    // so the screen stays correct when a school is white-labelled.
    const accent = websiteSettings.mainColor;

    // Each option opens its own intake screen.
    const isAdminView = view === ADMIN_VIEW;
    const copy = VIEW_COPY[view];

    const handleAddNew = (option) => {
        setAddOpen(false);
        if (option === "parentComplaint") navigate("/dashboardmenu/complaints/register");
        if (option === "staffConcern") navigate("/dashboardmenu/complaints/add-issue");
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
                        {copy.title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {copy.subtitle}
                    </Typography>
                </Box>

                {/* These are the management dashboard's actions. The staff view is
                    the assigned-work queue, which carries its own intake button —
                    repeating one here would give the same task two entry points. */}
                {isAdminView && (
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
                )}
            </Box>

            {/* TEMPORARY preview switch — see the note above ROLE_VIEWS. Styled as a
                dev affordance rather than a page control so it does not read as
                part of the design. */}
            <Box
                sx={{
                    alignSelf: "flex-start",
                    px: 1,
                    py: 0.5,
                    boxSizing: "border-box",
                    bgcolor: "#F8FAFC",
                    borderRadius: "8px",
                    border: `1px dashed ${C.textFaint}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        color: C.textFaint,
                    }}
                >
                    Preview as
                </Typography>
                {ROLE_VIEWS.map((option) => {
                    const active = view === option;
                    return (
                        <Box
                            key={option}
                            onClick={() => setView(option)}
                            sx={{
                                px: 1.5,
                                py: "4px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                bgcolor: active ? accent : "transparent",
                                transition: "background-color 0.2s",
                                "&:hover": { bgcolor: active ? accent : "#EEF2F7" },
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: active ? 700 : 500,
                                    color: active ? C.onAccent : C.textMuted,
                                }}
                            >
                                {option}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {isAdminView ? (
                <>
                    <ComplaintsTabs value={tab} onChange={setTab} tabs={DASHBOARD_TABS} />

                    {tab === 0 ? <ComplaintsDashboard /> : <InternalComplaintsDashboard />}
                </>
            ) : (
                // Placeholder for the staff portal: the existing assigned-work queue
                // stands in until that code arrives. Swap this one line for it.
                <MyWorkPage embedded />
            )}

            <AddNewDialog open={addOpen} onClose={() => setAddOpen(false)} onSelect={handleAddNew} />
        </Box>
    );
}
