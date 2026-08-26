import React, { useState } from "react";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, TINT, configCardSx } from "./complaintsTokens";
import ComplaintsTabs from "./ComplaintsTabs";
import { CONFIG_ITEMS } from "./complaintsConfigData";
import { INTERNAL_CONFIG_CARDS } from "./internalConfigData";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the "Configurations" title block.
//
// The two tabs carry different tile sets: the Parent list lives in
// complaintsConfigData.js, the Internal list in internalConfigData.js.

const TILE_SIZE = { xs: 12, sm: 12, md: 6, lg: 6 };

/* One configuration tile: accent icon chip + optional blue tag, then title + copy. */
function ConfigTile({ title, description, icon: Icon, badge, accent, onOpen }) {
    return (
        <Box sx={configCardSx} onClick={onOpen}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box
                    sx={{
                        p: 1,
                        bgcolor: TINT.accent,
                        borderRadius: "8px",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon sx={{ fontSize: "16px", color: accent }} />
                </Box>

                {badge && (
                    <Box
                        sx={{
                            px: "8px",
                            py: "2px",
                            bgcolor: TINT.blue,
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            flexShrink: 0,
                        }}
                    >
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
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

export default function ComplaintsConfigurationPage() {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const tiles = tab === 0 ? CONFIG_ITEMS : INTERNAL_CONFIG_CARDS;

    // The tile sub-screens are not designed yet, so every item's target is still
    // null and this is a no-op. The two data files name the field differently.
    const openTile = (item) => {
        const target = item.path || item.route;
        if (target) navigate(target);
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* The mockup has no back affordance, but this screen is only reachable
                from the dashboard, so leaving it without one strands the user. */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mt: "-4px", ml: "-8px" }}>
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

            <Grid container spacing={2}>
                {tiles.map((item) => (
                    <Grid key={item.key || item.title} size={TILE_SIZE} sx={{ display: "flex" }}>
                        <ConfigTile {...item} accent={accent} onOpen={() => openTile(item)} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
