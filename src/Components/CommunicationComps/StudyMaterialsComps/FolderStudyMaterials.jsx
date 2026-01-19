import { Box, Grid, Typography, Button, IconButton, CardActionArea,  Dialog, DialogContent, TextField } from "@mui/material";
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

export default function FolderStudyMaterialPage() {
    const user = useSelector((state) => state.auth);
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
                    GradeId: gradeId,
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
                    ID: id,
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
                    py: 1.5,
                    px: 2,
                    borderRadius: "10px 10px 10px 0px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom:"1px solid #ddd",
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
                <Typography sx={{fontSize:"16px", fontWeight:"600", pl:1}}> {grade || grades?.[0]?.sign || ""}</Typography>
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
                            <Grid size={{ lg: 2, md: 3, sm: 6 }} sx={{ position: "relative", p: 1 }}>
                                <CardActionArea sx={{
                                    width: "100%",
                                    backgroundColor: "#fff",
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: websiteSettings.mainColor,
                                    borderRadius: "10px"
                                }}
                                    onClick={() => handleClick(folder.folderName)}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            mx: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                borderRadius: "8px",
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <img
                                                src={FolderImage}
                                                alt="folder"
                                                style={{ width: "100%", height: "auto" }}
                                            />

                                        </Box>
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                textAlign: "center",
                                                fontWeight: 600,
                                                fontSize: "14px",
                                                color: "#444",
                                                mb: 1
                                            }}
                                        >
                                            {folder.folderName}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                                {(userType === "superadmin" || userType === "admin" || userType === "staff") &&
                                    <IconButton sx={{
                                        position: "absolute",
                                        bottom: "13px",
                                        right: "13px",
                                        width: "30px",
                                        height: "30px",
                                    }} onClick={() => handleRenameClick(folder.id)}>
                                        <EditIcon style={{ fontSize: "18px" }} />
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
                            sx={{
                                border: "1px solid black",
                                color: "black",
                                borderRadius: "30px",
                                width: "70px",
                                fontSize: '11px',
                                py: 0.2,
                                mr: 2
                            }}
                            onClick={handleCreateFolderClose}>
                            Cancel
                        </Button>

                        <Button
                            disabled={!folderName.trim()}
                            sx={{
                                textTransform: 'none',
                                backgroundColor: websiteSettings.mainColor,
                                width: "80px",
                                borderRadius: '30px',
                                fontSize: '12px',
                                py: 0.2,
                                color: websiteSettings.textColor,
                                fontWeight: "600",
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
