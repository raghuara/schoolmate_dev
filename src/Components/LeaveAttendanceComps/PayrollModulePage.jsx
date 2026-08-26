import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { useNavigate, useParams } from "react-router-dom";

import { PAYROLL_MODULES } from "./PayrollManagementPage";

const PAGE_BG = "#F7F9F9";

/* Shell for a payroll module screen. Each module gets its own layout as the
   design lands; until then this keeps the card navigation working. */
export default function PayrollModulePage() {
    const navigate = useNavigate();
    const { module: slug } = useParams();
    const module = PAYROLL_MODULES.find((item) => item.slug === slug) || PAYROLL_MODULES[0];
    const ModuleIcon = module.icon;

    return (
        <Box
            sx={{
                height: "calc(100vh - 76px)",
                display: "flex",
                flexDirection: "column",
                bgcolor: PAGE_BG,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.8,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    flexShrink: 0,
                }}
            >
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: "19px", color: "#111827" }} />
                </IconButton>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "11px",
                        bgcolor: "#fff",
                        border: `1.5px solid ${module.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <ModuleIcon sx={{ fontSize: "23px", color: module.color }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        {module.title}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>{module.description}</Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        maxWidth: "440px",
                        p: 4,
                        borderRadius: "12px",
                        bgcolor: module.bg,
                        border: `1px solid ${module.color}22`,
                    }}
                >
                    <ConstructionOutlinedIcon sx={{ fontSize: "38px", color: module.color, mb: 1.5 }} />
                    <Typography sx={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>
                        {module.title}
                    </Typography>
                    <Typography sx={{ fontSize: "13.5px", color: "#4B5563", mt: 1, lineHeight: 1.7 }}>
                        This screen is next in line — the layout will be built here.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
