import React, { useState } from "react";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, TINT, configCardSx } from "./complaintsTokens";
import ComplaintsTabs from "./ComplaintsTabs";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { INTERNAL_CONFIG_CARDS } from "./internalConfigData";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the "Configurations" title block.

const CARD_SIZE = { xs: 12, sm: 12, md: 6, lg: 6 };

/* Configuration tile — accent icon chip + optional blue tag, then title and blurb.
   Kept local to this screen; the shared card file is being edited elsewhere. */
function ConfigCard({ title, description, icon: Icon, badge, accent, onClick, interactive = true }) {
    return (
        <Box
            onClick={interactive ? onClick : undefined}
            sx={{
                ...configCardSx,
                ...(interactive ? {} : { cursor: "default", "&:hover": {} }),
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: "8px",
                        bgcolor: TINT.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon sx={{ fontSize: "16px", color: accent }} />
                </Box>
                {badge && (
                    <Box sx={{ px: 1, py: "2px", borderRadius: "4px", bgcolor: TINT.blue, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: C.blue, whiteSpace: "nowrap" }}>
                            {badge}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted, lineHeight: "18px" }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

export default function ComplaintsConfigPage() {
    // Opens on Internal Complaints — that is the tab the mockup specifies.
    const [tab, setTab] = useState(1);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open this screen comes from the role permissions, not a userType check.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();
    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mt: "-4px" }}>
                    <ArrowBackIcon sx={{ fontSize: "20px", color: C.text }} />
                </IconButton>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Configurations
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Configure the rules, access, workflow and system behaviour .
                    </Typography>
                </Box>
            </Box>

            <ComplaintsTabs value={tab} onChange={setTab} />

            {tab === 1 ? (
                <Grid container spacing={2}>
                    {INTERNAL_CONFIG_CARDS.map((card) => (
                        <Grid key={card.title} size={CARD_SIZE} sx={{ display: "flex" }}>
                            <ConfigCard
                                {...card}
                                accent={accent}
                                interactive={canEditConfig}
                                onClick={() => card.route && navigate(card.route)}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                // Parent Complaints configuration is being built separately.
                <Box
                    sx={{
                        py: 10,
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: C.textFaint,
                        fontSize: "14px",
                    }}
                >
                    Parent Complaints configuration coming soon.
                </Box>
            )}
        </Box>
    );
}
