import React, { useState } from "react";
import { Box, Chip, IconButton, InputAdornment, TextField, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import { selectGrades } from "../../Redux/Slices/DropdownController";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { DASH, createBtnSx } from "../DashBoardComps/dashboardTheme";
import ClassPickerGrid from "./ClassPickerGrid";

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
                            sx={createBtnSx}
                        >
                            Materials
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 2, pb: 4, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
                <Box>
                    {visibleGrades.length === 0 ? (
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
                        <ClassPickerGrid
                            grades={visibleGrades}
                            icon={MenuBookOutlinedIcon}
                            sectionSuffix="Materials"
                            onSelect={(item) => handleClick(item.sign, item.id)}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}