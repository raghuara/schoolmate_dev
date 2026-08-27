import { Box, Grid, Typography, Button, IconButton, CardActionArea, Dialog, DialogContent, TextField, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderImage from "../../../Images/PagesImage/folder.png"
import { useEffect, useState } from "react";
import { getStudyMaterialFolderById, getStudyMaterialFoldersByGrade, updateStudyMaterialFolder } from "../../../Api/Api";
import axios from "axios";
import Loader from "../../Loader";
import EditIcon from "@mui/icons-material/Edit";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export default function FolderStudyMaterialPage() {
    const user = useSelector((state) => state.auth);
    const studyPerms = findSubMenuPermissions(user.permissions, "communication", "studymaterial") || {};
    const canEdit = studyPerms.edit === "Y";
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
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
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

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
    const handleClick = (folderName) => {
        navigate("/dashboardmenu/studymaterials/main");
        localStorage.setItem("FolderName", folderName)
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

            const res = await axios.put(updateStudyMaterialFolder, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Folder created successfully.");
            handleCreateFolderClose();
            fetchFolder()
        } catch (error) {
            setMessage("An error occurred while creating the message.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <Box
                sx={{
                    backgroundColor: "#f2f2f2",
                    py: 1,
                    px: 2,
                    borderRadius: "10px 10px 10px 0px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <Box sx={{ display: "flex" }}>
                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials">
                        <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px', mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                    </Link>
                    <Typography
                        sx={{
                            fontWeight: "600",
                            fontSize: "20px",
                        }}
                    >
                        Folders
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: "600", pl: 1 }}> {grade || grades?.[0]?.sign || ""}</Typography>
                {folders.length === 0 && !isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "70vh",
                            textAlign: "center"
                        }}
                    >
                        <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "#888" }}>
                            No folder found
                        </Typography>
                    </Box>
                ) : (
                    <Grid container>
                        {folders.map((folder) => (
                            <Grid
                                key={folder.id}
                                size={{ lg: 2, md: 3, sm: 6 }}
                                sx={{
                                    position: "relative",
                                    p: 1,
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleClick(folder.folderName)}
                                    sx={{
                                        width: "100%",
                                        backgroundColor: "#fff",
                                        border: `1px solid ${websiteSettings.mainColor}`,
                                        borderRadius: "14px",
                                        overflow: "hidden",
                                        transition: "all .25s ease",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                        minHeight: "220px",

                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            height: "100%",
                                            py: 2,
                                            px: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: "100%",
                                                height: 140,
                                            }}
                                        >
                                            <img
                                                src={FolderImage}
                                                alt="folder"
                                                style={{
                                                    width: "90px",
                                                    height: "90px",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        </Box>

                                        <Tooltip title={folder.folderName}>
                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                    fontWeight: 600,
                                                    fontSize: "15px",
                                                    color: "#333",
                                                    textAlign: "center",
                                                    width: "100%",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {folder.folderName}
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                </CardActionArea>
                                {canEdit &&
                                    <IconButton
                                        onClick={() => handleRenameClick(folder.id)}
                                        sx={{
                                            position: "absolute",
                                            top: "16px",
                                            right: "16px",
                                            zIndex: 2,
                                            width: "28px",
                                            height: "28px",
                                            backgroundColor: "#fff",
                                            border: `1px solid ${websiteSettings.mainColor}`,
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: websiteSettings.mainColor,
                                                "& .edit-icon-svg": { color: websiteSettings.textColor || "#fff" },
                                            },
                                        }}
                                    >
                                        <EditIcon className="edit-icon-svg" sx={{ fontSize: "16px", color: websiteSettings.mainColor }} />
                                    </IconButton>
                                }
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
            <Dialog maxWidth="xs" fullWidth open={openFolderPopup} onClose={handleCreateFolderClose}>
                <DialogContent>
                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontSize: '16px',
                            mb: 1,
                            display: 'inline',
                            borderBottom: `3px solid ${websiteSettings.mainColor}`,
                            pb: 1,
                        }}
                    >
                        Rename Folder
                    </Typography>

                    <Typography sx={{ mb: 1, mt: 2 }}>Folder Name<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                    <TextField
                        type="text"
                        size="small"
                        fullWidth
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        inputProps={{ maxLength: 30 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "end", pt: 2, }}>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                borderRadius: RADIUS,
                                px: 2,
                                height: 34,
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: DASH.text,
                                borderColor: "#D6DAE1",
                                backgroundColor: "#fff",
                                mr: 1.5,
                                "&:hover": { borderColor: "#9AA3AF", backgroundColor: DASH.surface },
                            }}
                            onClick={handleCreateFolderClose}>
                            Cancel
                        </Button>

                        <Button
                            disabled={!folderName.trim()}
                            sx={{
                                textTransform: "none",
                                backgroundColor: websiteSettings.mainColor,
                                borderRadius: RADIUS,
                                px: 2.4,
                                height: 34,
                                fontSize: "12.5px",
                                fontWeight: 700,
                                color: websiteSettings.textColor,
                                boxShadow: "none",
                                "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9, boxShadow: "none" },
                                "&.Mui-disabled": { backgroundColor: "#E5E7EB", color: DASH.faint },
                            }}
                            onClick={handleSubmitCreateFolder}>
                            Rename
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
