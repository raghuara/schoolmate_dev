import React, { useState } from "react";
import { Box, Chip, Divider, Grid, IconButton, InputAdornment, TextField, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import { selectGrades } from "../../Redux/Slices/DropdownController";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";


const categoryColorMap = {
    Nursery: {
        primary: "#A749CC",
        light: "rgba(167, 73, 204, .1)",
        dark: "rgba(167, 73, 204, .2)",
    },
    Primary: {
        primary: "#F6A059",
        light: "rgba(246, 160, 89, .1)",
        dark: "rgba(246, 160, 89, .2)",
    },
    Secondary: {
        primary: "#CF02AB",
        light: "rgba(159, 1, 132, .1)",
        dark: "rgba(159, 1, 132, .2)",
    },
};

const getCategoryColors = (category) =>
    categoryColorMap[category] || {
        primary: "#6C757D",
        light: "#E9ECEF",
        dark: "#343A40",
    };

export default function StudyMaterialPage() {
    const navigate = useNavigate()
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userName = user.name
    const canCreate = (findSubMenuPermissions(user.permissions, "communication", "studymaterial") || {}).create === "Y";

    const [searchQuery, setSearchQuery] = useState("");

    // Search narrows on the class label before grouping, so an empty category
    // never renders a heading with nothing under it.
    const visibleGrades = (grades || []).filter((g) =>
        String(g?.sign || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    const totalGrades = visibleGrades.length;

    const groupedGrades = visibleGrades.reduce((acc, item) => {
        const category = item.category || "Others";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const handleClick = (grade, gradeId) => {
        localStorage.setItem("studyMaterialGrade", JSON.stringify({ grade, gradeId }));
        navigate("folder");
    };

    const handleCreateNews = () => {
        navigate('create')
    }
    return (
        <Box sx={{ width: "100%" }}>
            {/* ═══ TOOLBAR — same shape as the other Communication listings ═══ */}
            <Box
                sx={{
                    backgroundColor: "#f2f2f2",
                    py: 1,
                    px: 2,
                    borderRadius: "10px 10px 10px 0px",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px", color: DASH.ink, whiteSpace: "nowrap" }}>
                        Study Materials
                    </Typography>
                    <Chip
                        size="small"
                        label={totalGrades}
                        sx={{
                            height: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "6px",
                            backgroundColor: "#fff",
                            border: "1px solid #DDE1E6",
                            color: "#4B5563",
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto", flexWrap: "wrap" }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search by class"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: "#8A93A0" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
                                            <HighlightOffIcon sx={{ fontSize: 15, color: "#8A93A0" }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                                sx: {
                                    padding: "0 10px",
                                    borderRadius: "50px",
                                    height: "28px",
                                    fontSize: "12px",
                                },
                            },
                        }}
                        sx={{
                            width: { xs: "100%", sm: 240 },
                            "& .MuiOutlinedInput-root": {
                                minHeight: "28px",
                                paddingRight: "3px",
                                backgroundColor: "#fff",
                            },
                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#DDE1E6" },
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primary },
                        }}
                    />

                    {canCreate && (
                        <Button
                            onClick={handleCreateNews}
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: "none",
                                bgcolor: "#000",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 12.5,
                                borderRadius: "50px",
                                px: 2,
                                py: 0.6,
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                "&:hover": { bgcolor: "#1a1a1a", boxShadow: "0 4px 12px rgba(0,0,0,0.22)" },
                            }}
                        >
                            Materials
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 2, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
                <Box sx={{
                    height: "75vh",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}>
                    {Object.keys(groupedGrades).length === 0 ? (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "60vh",
                            textAlign: "center",
                        }}>
                            <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: "#C9CFD8" }} />
                            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: DASH.text, mt: 1.5 }}>
                                {searchQuery ? "No classes match your search" : "No classes yet"}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: DASH.faint, mt: 0.5, maxWidth: 340 }}>
                                {searchQuery
                                    ? "Try a different class name, or clear the search to see everything."
                                    : "Once classes are set up they will appear here."}
                            </Typography>
                        </Box>
                    ) : (
                        Object.entries(groupedGrades).map(([category, items]) => {
                            const { primary } = getCategoryColors(category);

                            return (
                                <Box key={category} sx={{ mb: 3 }}>
                                    {/* Category band — the dashboard's SectionTitle language */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 1.6 }}>
                                        <Box sx={{ width: 3, height: 18, borderRadius: RADIUS, bgcolor: primary, flexShrink: 0 }} />
                                        <Typography sx={{
                                            fontSize: "11.5px",
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: DASH.muted,
                                            whiteSpace: "nowrap",
                                        }}>
                                            {category} Materials
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={items.length}
                                            sx={{
                                                height: 18,
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                borderRadius: RADIUS,
                                                bgcolor: `${primary}1A`,
                                                color: primary,
                                            }}
                                        />
                                        <Divider sx={{ flex: 1 }} />
                                    </Box>

                                    <Grid container spacing={2}>
                                        {items.map((item, index) => (
                                            <Grid
                                                key={item.id ?? index}
                                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                <Box
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => handleClick(item.sign, item.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            handleClick(item.sign, item.id);
                                                        }
                                                    }}
                                                    sx={{
                                                        position: "relative",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        cursor: "pointer",
                                                        userSelect: "none",
                                                        overflow: "hidden",
                                                        bgcolor: "#fff",
                                                        border: `1px solid ${DASH.line}`,
                                                        borderRadius: "12px",
                                                        boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
                                                        "&:hover": {
                                                            boxShadow: "0px 6px 18px rgba(16,24,40,0.10)",
                                                            borderColor: `${primary}66`,
                                                            transform: "translateY(-2px)",
                                                            ".smArrow": { opacity: 1, transform: "translateX(3px)" },
                                                            ".smFooter": { bgcolor: `${primary}0F` },
                                                        },
                                                        "&:focus-visible": { outline: `2px solid ${primary}`, outlineOffset: 2 },
                                                    }}
                                                >
                                                    {/* accent rail */}
                                                    <Box sx={{ height: 3, bgcolor: primary, flexShrink: 0 }} />
                                            
                                                    <Box sx={{ p: 1.8, display: "flex", alignItems: "flex-start", gap: 1.4, flex: 1 }}>
                                                        <Box sx={{
                                                            width: 42,
                                                            height: 42,
                                                            flexShrink: 0,
                                                            borderRadius: "12px",
                                                            bgcolor: `${primary}14`,
                                                            border: `1px solid ${primary}33`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}>
                                                            <MenuBookOutlinedIcon sx={{ color: primary, fontSize: 21 }} />
                                                        </Box>
                                            
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography sx={{ fontWeight: 700, fontSize: "15.5px", color: DASH.ink, lineHeight: 1.3 }} noWrap>
                                                                {item.sign}
                                                            </Typography>
                                                            <Chip
                                                                size="small"
                                                                label={item.category || "Others"}
                                                                sx={{
                                                                    mt: 0.6,
                                                                    height: 19,
                                                                    fontSize: "10px",
                                                                    fontWeight: 700,
                                                                    borderRadius: "6px",
                                                                    bgcolor: `${primary}14`,
                                                                    color: primary,
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                            
                                                    <Box
                                                        className="smFooter"
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            gap: 1,
                                                            px: 1.8,
                                                            py: 1,
                                                            borderTop: `1px solid ${DASH.lineSoft}`,
                                                            bgcolor: DASH.surface,
                                                            transition: "background-color 0.2s",
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: primary }}>
                                                            View materials
                                                        </Typography>
                                                        <ArrowForwardIcon
                                                            className="smArrow"
                                                            sx={{
                                                                opacity: 0.45,
                                                                fontSize: "16px",
                                                                color: primary,
                                                                transition: "opacity 0.25s ease, transform 0.25s ease",
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Box>
        </Box>
    );
}