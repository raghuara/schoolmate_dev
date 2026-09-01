import { Box, Grid, Typography, Button, IconButton, Chip, Dialog, DialogContent, TextField, Tooltip, InputAdornment } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import { useEffect, useState } from "react";
import { getStudyMaterialFolderById, getStudyMaterialFoldersByGrade, updateStudyMaterialFolder } from "../../../Api/Api";
import axios from "axios";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export default function FolderStudyMaterialPage() {
    const user = useSelector((state) => state.auth);
    const studyPerms = findSubMenuPermissions(user.permissions, "communication", "studymaterial") || {};
    const canEdit = studyPerms.edit === "Y";
    const navigate = useNavigate()
    const grades = useSelector(selectGrades);
    const [folders, setFolders] = useState([]);
    const token = "123";
    const [isLoading, setIsLoading] = useState('');
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [grade, setGrade] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [openFolderPopup, setOpenFolderPopup] = useState(false);
    const [renameId, setRenameId] = useState("");
    const [folderName, setFolderName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const mainColor = websiteSettings.mainColor || DASH.primary;

    useEffect(() => {
        const stored = localStorage.getItem("studyMaterialGrade");
        if (stored) {
            const parsed = JSON.parse(stored);
            setGrade(parsed.grade);
            setGradeId(parsed.gradeId);
        }
    }, []);

    const handleCreateFolderClose = () => {
        setOpenFolderPopup(false);
        setFolderName("");
    };

    const handleClick = (name) => {
        navigate("/dashboardmenu/studymaterials/main");
        localStorage.setItem("FolderName", name)
    };

    const handleRenameClick = (id) => {
        fetchFolderById(id)
        setRenameId(id);
        setOpenFolderPopup(true);
    };

    useEffect(() => {
        if (gradeId) {
            fetchFolder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gradeId]);

    const fetchFolder = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getStudyMaterialFoldersByGrade, {
                params: {
                    gradeId: gradeId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFolders(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFolderById = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(getStudyMaterialFolderById, {
                params: {
                    id: id,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFolderName(res.data.folderName)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitCreateFolder = async () => {
        setIsLoading(true);

        try {
            const sendData = {
                id: renameId,
                folderName: folderName,
                gradeId: gradeId.toString()
            };

            await axios.put(updateStudyMaterialFolder, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Folder renamed successfully.");
            handleCreateFolderClose();
            fetchFolder()
        } catch (error) {
            setMessage("An error occurred while renaming the folder.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const visibleFolders = (folders || []).filter((f) =>
        String(f?.folderName || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    const ghostBtnSx = {
        textTransform: "none",
        fontSize: "12.5px",
        fontWeight: 600,
        color: DASH.text,
        bgcolor: "#fff",
        border: `1px solid ${DASH.line}`,
        borderRadius: RADIUS,
        px: 2,
        height: 34,
        boxShadow: "none",
        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
    };

    const primaryBtnSx = {
        textTransform: "none",
        fontSize: "12.5px",
        fontWeight: 700,
        color: websiteSettings.textColor || "#fff",
        bgcolor: mainColor,
        borderRadius: RADIUS,
        px: 2.4,
        height: 34,
        boxShadow: "none",
        "&:hover": { bgcolor: mainColor, filter: "brightness(0.92)", boxShadow: "none" },
        "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
    };

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* ═══ TOOLBAR — same shape as the Study Materials listing ═══ */}
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
                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials">
                        <IconButton sx={{ width: "27px", height: "27px" }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                    </Link>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px", color: DASH.ink, whiteSpace: "nowrap" }}>
                        Folders
                    </Typography>
                    <Chip
                        size="small"
                        label={visibleFolders.length}
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
                    <Chip
                        size="small"
                        label={grade || grades?.[0]?.sign || ""}
                        sx={{
                            height: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "6px",
                            backgroundColor: `${mainColor}14`,
                            color: mainColor,
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto", flexWrap: "wrap" }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search folders"
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
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: mainColor },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ p: 2, pb: 4, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
                {visibleFolders.length === 0 && !isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "60vh",
                            textAlign: "center",
                        }}
                    >
                        <FolderOffOutlinedIcon sx={{ fontSize: 40, color: "#C9CFD8" }} />
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: DASH.text, mt: 1.5 }}>
                            {searchQuery ? "No folders match your search" : "No folders yet"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: DASH.faint, mt: 0.5, maxWidth: 340 }}>
                            {searchQuery
                                ? "Try a different name, or clear the search to see everything."
                                : "Folders are created on the Create Study Material screen."}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={1.5}>
                        {visibleFolders.map((folder) => (
                            <Grid key={folder.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                                {/* A real folder silhouette - a tab on the top left, then the
                                   body with a squared-off top-left corner to meet it. */}
                                <Box
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleClick(folder.folderName)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleClick(folder.folderName);
                                        }
                                    }}
                                    sx={{
                                        position: "relative",
                                        pt: "13px",
                                        cursor: "pointer",
                                        userSelect: "none",
                                        transition: "transform .2s ease",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            ".fmTab": { bgcolor: mainColor, filter: "brightness(0.94)" },
                                            ".fmBody": {
                                                bgcolor: `${mainColor}33`,
                                                borderColor: `${mainColor}8C`,
                                                boxShadow: "0 8px 20px rgba(17,24,39,0.12)",
                                            },
                                            ".fmArrow": { opacity: 1, transform: "translateX(2px)" },
                                            ".fmEdit": { opacity: 1 },
                                        },
                                        "&:focus-visible": { outline: `2px solid ${mainColor}`, outlineOffset: 2 },
                                    }}
                                >
                                    {/* tab */}
                                    <Box
                                        className="fmTab"
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "46%",
                                            height: 14,
                                            bgcolor: mainColor,
                                            borderRadius: "5px 10px 0 0",
                                            transition: "background-color .2s ease, filter .2s ease",
                                        }}
                                    />

                                    {/* body */}
                                    <Box
                                        className="fmBody"
                                        sx={{
                                            position: "relative",
                                            overflow: "hidden",
                                            height: 96,
                                            p: 1.4,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            bgcolor: `${mainColor}24`,
                                            border: `1px solid ${mainColor}59`,
                                            borderTop: `3px solid ${mainColor}`,
                                            borderRadius: "0 8px 8px 8px",
                                            transition: "background-color .2s ease, border-color .2s ease, box-shadow .2s ease",
                                        }}
                                    >
                                        {/* a large, faint folder mark for texture */}
                                        <FolderRoundedIcon
                                            sx={{
                                                position: "absolute",
                                                right: -10,
                                                bottom: -12,
                                                fontSize: 74,
                                                color: mainColor,
                                                opacity: 0.16,
                                                pointerEvents: "none",
                                            }}
                                        />

                                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5 }}>
                                            <Tooltip title={folder.folderName} arrow>
                                                <Typography
                                                    sx={{
                                                        fontSize: "13.5px",
                                                        fontWeight: 700,
                                                        color: DASH.ink,
                                                        lineHeight: 1.35,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {folder.folderName}
                                                </Typography>
                                            </Tooltip>

                                            {canEdit && (
                                                <Tooltip title="Rename folder" arrow>
                                                    <IconButton
                                                        className="fmEdit"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRenameClick(folder.id);
                                                        }}
                                                        sx={{
                                                            flexShrink: 0,
                                                            width: 24,
                                                            height: 24,
                                                            opacity: 0,
                                                            bgcolor: "#fff",
                                                            border: `1px solid ${mainColor}33`,
                                                            borderRadius: RADIUS,
                                                            transition: "opacity .2s ease",
                                                            "&:hover": { bgcolor: `${mainColor}14` },
                                                        }}
                                                    >
                                                        <EditOutlinedIcon sx={{ fontSize: 13, color: mainColor }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5, position: "relative" }}>
                                            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: mainColor }}>
                                                Open
                                            </Typography>
                                            <ArrowForwardIcon
                                                className="fmArrow"
                                                sx={{
                                                    fontSize: 15,
                                                    color: mainColor,
                                                    opacity: 0.35,
                                                    transition: "opacity .25s ease, transform .25s ease",
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* ═══ RENAME ═══ */}
            <Dialog
                maxWidth="xs"
                fullWidth
                open={openFolderPopup}
                onClose={handleCreateFolderClose}
                slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
            >
                <Box sx={{ height: 3, bgcolor: mainColor }} />
                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                        <Box sx={{
                            width: 34, height: 34, flexShrink: 0, borderRadius: RADIUS,
                            bgcolor: `${mainColor}14`, border: `1px solid ${mainColor}33`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <EditOutlinedIcon sx={{ fontSize: 17, color: mainColor }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                Rename folder
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                Files inside it are not affected
                            </Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text, mb: 0.6 }}>
                        Folder name <span style={{ color: "#E30053" }}>*</span>
                    </Typography>
                    <TextField
                        type="text"
                        size="small"
                        fullWidth
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        inputProps={{ maxLength: 30 }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                                fontSize: "13px",
                                borderRadius: RADIUS,
                                bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
                            },
                        }}
                    />
                    <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.5 }}>
                        {`${folderName.length}/30`}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1.5 }}>
                        <Button sx={ghostBtnSx} onClick={handleCreateFolderClose}>Cancel</Button>
                        <Button disabled={!folderName.trim()} sx={primaryBtnSx} onClick={handleSubmitCreateFolder}>
                            Rename
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
