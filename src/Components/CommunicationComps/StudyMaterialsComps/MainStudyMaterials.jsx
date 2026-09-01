import { Autocomplete, Box, Button, Chip, DialogActions, Dialog, Fab, IconButton, Paper, Switch, TextField, Typography, ThemeProvider, createTheme, Grid, Tooltip } from "@mui/material";
import axios from "axios";
import { PostedCardsSkeleton } from "../../InnerLoader";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { DeleteHomeWork, DeleteStudyMaterial, DeleteTimeTable, GettingGrades, HomeWorkFetch, StudyMaterialFetch, TimeTableFetch } from "../../../Api/Api";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export default function MainStudyMaterialsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const folderName = localStorage.getItem("FolderName")
    const websiteSettings = useSelector(selectWebsiteSettings);
    const mainColor = websiteSettings.mainColor || DASH.primary;

    const ghostBtnSx = {
        textTransform: "none", fontSize: "12.5px", fontWeight: 600, color: DASH.text,
        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
        px: 2, height: 34, boxShadow: "none",
        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
    };

    const primaryBtnSx = {
        textTransform: "none", fontSize: "12.5px", fontWeight: 700,
        color: websiteSettings.textColor || "#fff", bgcolor: websiteSettings.mainColor || DASH.primary,
        borderRadius: RADIUS, px: 2.4, height: 34, boxShadow: "none",
        "&:hover": { bgcolor: websiteSettings.mainColor || DASH.primary, filter: "brightness(0.92)", boxShadow: "none" },
    };
    const academicYear = useSelector(selectAcademicYear);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [openPdf, setOpenPdf] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [timeTableData, setTimeTableData] = useState([]);
    const user = useSelector((state) => state.auth);
    const studyPerms = findSubMenuPermissions(user.permissions, "communication", "studymaterial") || {};
    const canView = studyPerms.view === "Y";
    const canCreate = studyPerms.create === "Y";
    const canEdit = studyPerms.edit === "Y";
    const canDelete = studyPerms.delete === "Y";
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // Only the materials fetch, so deleting does not blank the list behind the overlay.
    const [hasLoaded, setHasLoaded] = useState(false);
    const token = '123';
    const [deleteId, setDeleteId] = useState('');
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [editId, setEditId] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectOptions, setSubjectOptions] = useState([]);

    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const [view, setView] = useState('grid');
    const [grade, setGrade] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [selectedSection, setSelectedSection] = useState(null);
    const storedGradeData = localStorage.getItem("studyMaterialGrade");
    const parsedGradeData = storedGradeData ? JSON.parse(storedGradeData) : null;
    const selectedGradeId = parsedGradeData?.gradeId;
    const selectedGradeName = parsedGradeData?.grade;

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({
        sectionName: section,
    })) || [];


    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    useEffect(() => {
        const selectedGrade = grades.find((g) => g.id === Number(gradeId));
        if (selectedGrade) {
            setSubjectOptions(selectedGrade.subjects || []);
            setSelectedSubject(null);
        } else {
            setSubjectOptions([]);
        }
    }, [gradeId]);


    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
    };

    const groupedData = timeTableData.reduce((acc, table) => {

        const key = `${table.postedOn}-${table.day}`;

        if (!acc[key]) {
            acc[key] = {
                date: table.postedOn,
                day: table.day,
                items: []
            };
        }
        acc[key].items.push(table);
        return acc;
    }, {});


    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            background: {
                paper: '#121212',
            },
            text: {
                primary: '#ffffff',
            },
        },
    });

    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);


    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const handleCreateNews = () => {
        navigate('/dashboardmenu/studymaterials/create')
    }
    const handleEdit = (id) => {
        setEditId(id)
        setOpenEditAlert(true);

    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenAlert(true);
    };

    const handleCloseDialog = (deleted) => {

        setOpenAlert(false);

        if (deleted) {
            DeleteTimeTableId(deleteId)
            setOpenAlert(false);
        }
    };

    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            navigate('/dashboardmenu/studymaterials/edit', { state: { id: editId } });
        }
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handlePdfViewClick = (url) => {
        setPdfUrl(url);
        setOpenPdf(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handlePdfClose = () => {
        setOpenPdf(false);
    };

    const [showButton, setShowButton] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (boxRef.current) {
                if (boxRef.current.scrollTop > 100) {
                    setShowButton(true);
                } else {
                    setShowButton(false);
                }
            }
        };

        const boxElement = boxRef.current;
        if (boxElement) {
            boxElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (boxElement) {
                boxElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const scrollToTop = () => {
        if (boxRef.current) {
            boxRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        fetchTimeTables()
    }, [checked, selectedSection, formattedDate, selectedSubject])


    const fetchTimeTables = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(StudyMaterialFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    grade: selectedGradeId || grades?.[0]?.id,
                    section: selectedSection || grades?.[0].sections[0] || "",
                    isMyProject: isMyProject,
                    date: formattedDate || "",
                    subject: selectedSubject || "",
                    folder: folderName,
                    academicYear: academicYear || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTimeTableData(res.data.data)
        } catch (error) {
            console.error(error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No Data");
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };


    const DeleteTimeTableId = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteStudyMaterial, {
                params: {
                    id: id,
                    academicYear: academicYear || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchTimeTables();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Deleted Successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{
                backgroundColor: "#f2f2f2",
                px: 2,
                py: 1,
                borderRadius: "10px 10px 10px 0px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials/folder">
                        <IconButton sx={{ width: "27px", height: "27px" }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                    </Link>

                    <Box sx={{
                        width: 30, height: 30, flexShrink: 0, borderRadius: RADIUS,
                        bgcolor: `${mainColor}14`, border: `1px solid ${mainColor}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <FolderOutlinedIcon sx={{ fontSize: 16, color: mainColor }} />
                    </Box>

                    <Tooltip title={folderName} arrow>
                        <Typography sx={{
                            fontSize: "19px", fontWeight: 600, color: DASH.ink,
                            maxWidth: { xs: "140px", sm: "240px", md: "340px" },
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {folderName}
                        </Typography>
                    </Tooltip>

                    {selectedGradeName && (
                        <Chip
                            size="small"
                            label={selectedGradeName}
                            sx={{
                                height: 20, fontSize: "11px", fontWeight: 700, borderRadius: "6px",
                                bgcolor: `${mainColor}14`, color: mainColor,
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto", flexWrap: "wrap" }}>
                    <Autocomplete
                        disablePortal
                        size="small"
                        options={sections}
                        getOptionLabel={(option) => option.sectionName}
                        value={sections.find((option) => option.sectionName === selectedSection) || null}
                        onChange={handleSectionChange}
                        isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                        PaperComponent={(props) => (
                            <Paper {...props} style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff" }} />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} className="classdropdownOptions">{option.sectionName}</li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                placeholder="All sections"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: 30, fontSize: "12.5px", borderRadius: RADIUS, bgcolor: "#fff", paddingRight: 0,
                                        "& fieldset": { borderColor: "#DDE1E6" },
                                        "&:hover fieldset": { borderColor: "#9AA3AF" },
                                        "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
                                    },
                                }}
                            />
                        )}
                        sx={{ width: { xs: "100%", sm: 160 } }}
                    />

                    <ThemeProvider theme={darkTheme}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                open={openCal}
                                onClose={handleClose}
                                value={selectedDate}
                                onChange={(newValue) => {
                                    setSelectedDate(newValue);
                                    setFormattedDate(dayjs(newValue).format('DD-MM-YYYY'));
                                    handleClose();
                                }}
                                disableFuture
                                views={['year', 'month', 'day']}
                                sx={{ opacity: 0, pointerEvents: 'none', width: 0, position: "absolute" }}
                            />

                            {selectedDate ? (
                                <Chip
                                    size="small"
                                    icon={<CalendarMonthIcon sx={{ fontSize: 15 }} />}
                                    label={formattedDate}
                                    onClick={handleOpen}
                                    onDelete={handleClearDate}
                                    deleteIcon={<HighlightOffIcon sx={{ fontSize: 15 }} />}
                                    sx={{
                                        height: 30, fontSize: "12px", fontWeight: 700, borderRadius: RADIUS,
                                        bgcolor: `${mainColor}14`, color: mainColor, border: `1px solid ${mainColor}33`,
                                        "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: "inherit" },
                                    }}
                                />
                            ) : (
                                <Tooltip title="Filter by date" arrow>
                                    <IconButton
                                        onClick={handleOpen}
                                        sx={{
                                            width: 30, height: 30, borderRadius: RADIUS,
                                            border: "1px solid #DDE1E6", bgcolor: "#fff",
                                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: "#9AA3AF" },
                                        }}
                                    >
                                        <CalendarMonthIcon sx={{ fontSize: 16, color: DASH.text }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </LocalizationProvider>
                    </ThemeProvider>

                    {canCreate && (
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 0.4, height: 30, pl: 1.2, pr: 0.4,
                            borderRadius: RADIUS, border: "1px solid #DDE1E6", bgcolor: "#fff",
                        }}>
                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: checked ? mainColor : DASH.muted, whiteSpace: "nowrap" }}>
                                My Projects
                            </Typography>
                            <Switch
                                size="small"
                                checked={checked}
                                onChange={handleCheck}
                                inputProps={{ "aria-label": "My projects only" }}
                                sx={{
                                    "& .MuiSwitch-thumb": { backgroundColor: checked ? mainColor : "#fff" },
                                    "& .MuiSwitch-track": { backgroundColor: checked ? `${mainColor} !important` : "#C9CFD8" },
                                }}
                            />
                        </Box>
                    )}

                    {canView && (
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 0.4, height: 30, p: 0.4,
                            borderRadius: RADIUS, border: "1px solid #DDE1E6", bgcolor: "#fff",
                        }}>
                            {[
                                { key: "grid", icon: GridViewIcon, label: "Grid view" },
                                { key: "list", icon: FormatListBulletedIcon, label: "List view" },
                            ].map((option) => {
                                const OptionIcon = option.icon;
                                const active = view === option.key;
                                return (
                                    <Tooltip key={option.key} title={option.label} arrow>
                                        <Box
                                            onClick={() => setView(option.key)}
                                            sx={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: 26, height: 22, borderRadius: RADIUS, cursor: "pointer",
                                                bgcolor: active ? `${mainColor}14` : "transparent",
                                                transition: "background-color .15s ease",
                                                "&:hover": { bgcolor: active ? `${mainColor}14` : DASH.lineSoft },
                                            }}
                                        >
                                            <OptionIcon sx={{ fontSize: 15, color: active ? mainColor : DASH.faint }} />
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Dialog
                    open={openAlert}
                    onClose={() => setOpenAlert(false)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
                >
                    <Box sx={{ height: 3, bgcolor: DASH.red }} />
                    <Box sx={{ p: 2.4, textAlign: "center" }}>
                        <Box sx={{
                            width: 40, height: 40, mx: "auto", borderRadius: RADIUS,
                            bgcolor: DASH.redLight, border: "1px solid #FECACA",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 21, color: DASH.red }} />
                        </Box>
                        <Typography sx={{ fontSize: "15.5px", fontWeight: 700, color: DASH.ink, mt: 1.4 }}>
                            Delete this study material?
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, lineHeight: 1.6 }}>
                            Students will no longer see it. This cannot be undone.
                        </Typography>
                        <DialogActions sx={{ justifyContent: "center", pt: 2.4, gap: 1 }}>
                            <Button sx={ghostBtnSx} onClick={() => handleCloseDialog(false)}>Cancel</Button>
                            <Button
                                sx={{ ...primaryBtnSx, bgcolor: DASH.red, color: "#fff", "&:hover": { bgcolor: "#DC2626", boxShadow: "none" } }}
                                onClick={() => handleCloseDialog(true)}
                            >
                                Yes, delete
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                <Dialog
                    open={openEditAlert}
                    onClose={() => setOpenEditAlert(false)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
                >
                    <Box sx={{ height: 3, bgcolor: mainColor }} />
                    <Box sx={{ p: 2.4, textAlign: "center" }}>
                        <Box sx={{
                            width: 40, height: 40, mx: "auto", borderRadius: RADIUS,
                            bgcolor: `${mainColor}14`, border: `1px solid ${mainColor}33`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <EditOutlinedIcon sx={{ fontSize: 20, color: mainColor }} />
                        </Box>
                        <Typography sx={{ fontSize: "15.5px", fontWeight: 700, color: DASH.ink, mt: 1.4 }}>
                            Replace this study material?
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, lineHeight: 1.6 }}>
                            You will be taken to the edit screen to upload a new file.
                        </Typography>
                        <DialogActions sx={{ justifyContent: "center", pt: 2.4, gap: 1 }}>
                            <Button sx={ghostBtnSx} onClick={() => handleEditCloseDialog(false)}>Cancel</Button>
                            <Button sx={primaryBtnSx} onClick={() => handleEditCloseDialog(true)}>Continue</Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                <Box sx={{ p: 2 }}>
                    <Box>

                        {view === 'grid' ? (
                            <Grid container spacing={3}>
                                {!hasLoaded && (
                                    <PostedCardsSkeleton count={6} columns={{ xs: 12, sm: 6, md: 4 }} rows={3} />
                                )}
                                {hasLoaded && Object.values(groupedData).map(({ date, day, items }) => (
                                    <React.Fragment key={date}>
                                        {/* Render the date */}
                                        <Grid size={12}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                <Typography sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                    color: DASH.muted,
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {date} · {day}
                                                </Typography>
                                                <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
                                            </Box>
                                        </Grid>

                                        {items.map((table, index) => (
                                            <Grid
                                                key={index}
                                                sx={{ position: 'relative', display: 'flex' }}
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                    md: 4
                                                }}>

                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        overflow: "hidden",
                                                        bgcolor: "#fff",
                                                        border: `1px solid ${DASH.line}`,
                                                        borderRadius: RADIUS,
                                                        boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                        transition: "box-shadow .2s ease, border-color .2s ease, transform .2s ease",
                                                        "&:hover": {
                                                            transform: "translateY(-2px)",
                                                            borderColor: `${mainColor}66`,
                                                            boxShadow: "0 6px 18px rgba(17,24,39,0.10)",
                                                            ".smOverlay": { opacity: 1 },
                                                        },
                                                    }}
                                                >
                                                    <Box sx={{ px: 1.4, py: 1.2, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.6, flexWrap: "wrap" }}>
                                                            <Chip
                                                                size="small"
                                                                label={`${selectedGradeName} - ${selectedSection || "A1"}`}
                                                                sx={{ height: 19, fontSize: "10px", fontWeight: 700, borderRadius: RADIUS, bgcolor: `${mainColor}14`, color: mainColor }}
                                                            />
                                                            {table.subject && (
                                                                <Chip
                                                                    size="small"
                                                                    label={table.subject}
                                                                    sx={{ height: 19, fontSize: "10px", fontWeight: 700, borderRadius: RADIUS, bgcolor: DASH.lineSoft, color: DASH.muted }}
                                                                />
                                                            )}
                                                        </Box>
                                                        <Tooltip title={table.heading} arrow>
                                                            <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }} noWrap>
                                                                {table.heading}
                                                            </Typography>
                                                        </Tooltip>
                                                    </Box>

                                                    <Box sx={{
                                                        position: "relative",
                                                        height: 200,
                                                        bgcolor: DASH.surface,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        overflow: "hidden",
                                                    }}>
                                                        {table.fileType === "image" ? (
                                                            <Box
                                                                component="img"
                                                                src={table.filePath}
                                                                alt={table.heading}
                                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            <Box sx={{ textAlign: "center" }}>
                                                                <PictureAsPdfOutlinedIcon sx={{ fontSize: 38, color: DASH.red }} />
                                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.4 }}>
                                                                    PDF document
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        <Box
                                                            className="smOverlay"
                                                            sx={{
                                                                position: "absolute",
                                                                inset: 0,
                                                                bgcolor: "rgba(17,24,39,0.55)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                opacity: 0,
                                                                transition: "opacity .25s ease",
                                                            }}
                                                        >
                                                            <Button
                                                                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                onClick={() => (
                                                                    table.fileType === "image"
                                                                        ? handleViewClick(table.filePath)
                                                                        : handlePdfViewClick(table.filePath)
                                                                )}
                                                                sx={{
                                                                    textTransform: "none",
                                                                    fontSize: "12px",
                                                                    fontWeight: 700,
                                                                    color: "#fff",
                                                                    border: "1px solid rgba(255,255,255,0.7)",
                                                                    borderRadius: RADIUS,
                                                                    px: 1.8,
                                                                    height: 30,
                                                                    "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                                                                }}
                                                            >
                                                                {table.fileType === "image" ? "View image" : "View PDF"}
                                                            </Button>
                                                        </Box>
                                                    </Box>

                                                    {(canEdit || canDelete) && (
                                                        <Box sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "flex-end",
                                                            gap: 0.8,
                                                            px: 1.4,
                                                            py: 1,
                                                            borderTop: `1px solid ${DASH.lineSoft}`,
                                                            bgcolor: DASH.surface,
                                                        }}>
                                                            {canEdit && (
                                                                <Button
                                                                    onClick={() => handleEdit(table.id)}
                                                                    startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        fontSize: "11.5px",
                                                                        fontWeight: 700,
                                                                        color: DASH.text,
                                                                        bgcolor: "#fff",
                                                                        border: `1px solid ${DASH.line}`,
                                                                        borderRadius: RADIUS,
                                                                        height: 28,
                                                                        px: 1.2,
                                                                        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                                                    }}
                                                                >
                                                                    Reupload
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Tooltip title="Delete" arrow>
                                                                    <IconButton
                                                                        onClick={() => handleDelete(table.id)}
                                                                        sx={{
                                                                            width: 28,
                                                                            height: 28,
                                                                            borderRadius: RADIUS,
                                                                            border: `1px solid ${DASH.line}`,
                                                                            bgcolor: "#fff",
                                                                            "&:hover": { bgcolor: DASH.redLight, borderColor: "#FECACA" },
                                                                        }}
                                                                    >
                                                                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 15, color: DASH.red }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </Grid>

                        ) : (
                            <Grid container spacing={1.5}>
                                {Object.values(groupedData).map(({ date, day, items }) => (
                                    <React.Fragment key={date}>
                                        {/* Render the date */}
                                        <Grid size={12}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                <Typography sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                    color: DASH.muted,
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {date} · {day}
                                                </Typography>
                                                <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
                                            </Box>
                                        </Grid>

                                        {/* Render the grids for that date */}
                                        {items.map((table, index) => (
                                            <Grid key={table.id ?? index} size={12} sx={{ mb: 0, mt: 0 }}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: "#fff",
                                                        border: `1px solid ${DASH.line}`,
                                                        borderRadius: RADIUS,
                                                        boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                        transition: "box-shadow 0.2s, border-color 0.2s",
                                                        "&:hover": {
                                                            boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                            borderColor: "#D6DAE1",
                                                        },
                                                    }}
                                                >
                                                    <Grid container sx={{ py: 1 }}>
                                                        <Grid sx={{ display: "flex", alignItems: "center" }} size={{ xs: 12, lg: 6 }}>
                                                            <Typography sx={{ fontSize: '14px', color: '#000', fontWeight: '600' }}>
                                                                {selectedGradeName} - {selectedSection || grades[0].sections[0] || ""} : {table.heading} ({table.subject})
                                                            </Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, lg: 6 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: { lg: 'flex-end', xs: "start" }, }}>

                                                                {canEdit && (
                                                                    <IconButton
                                                                        onClick={() => handleEdit(table.id)}
                                                                        sx={{
                                                                            border: '1px solid black',
                                                                            width: '25px',
                                                                            height: '25px',
                                                                            mr: 2
                                                                        }}
                                                                    >
                                                                        <UploadOutlinedIcon style={{ fontSize: '15px', color: '#000' }} />
                                                                    </IconButton>
                                                                )}
                                                                {canDelete && (
                                                                    <IconButton
                                                                        onClick={() => handleDelete(table.id)}
                                                                        sx={{
                                                                            border: '1px solid black',
                                                                            width: '25px',
                                                                            height: '25px',
                                                                        }}
                                                                    >
                                                                        <DeleteOutlineOutlinedIcon style={{ fontSize: '15px', color: '#000' }} />
                                                                    </IconButton>
                                                                )}
                                                                <Box sx={{ px: 2 }}>|</Box>
                                                                <Box sx={{ width: "100px", display: "flex", justifyContent: "center" }}>
                                                                    {table.fileType === "image" &&
                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                padding: '2px 15px',
                                                                                borderRadius: '10px',
                                                                                fontSize: '12px',
                                                                                color: '#E60154',
                                                                                fontWeight: '600',
                                                                                backgroundColor: '#fcf6f0',
                                                                                border: "none"
                                                                            }}
                                                                            onClick={() => handleViewClick(table.filePath)}
                                                                        >
                                                                            View Image
                                                                        </Button>
                                                                    }
                                                                    {table.fileType === "pdf" &&
                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                padding: '2px 15px',
                                                                                borderRadius: '10px',
                                                                                fontSize: '12px',
                                                                                color: '#E60154',
                                                                                fontWeight: '600',
                                                                                backgroundColor: '#fcf6f0',
                                                                                border: "none"
                                                                            }}
                                                                            onClick={() => handlePdfViewClick(table.filePath)}
                                                                        >
                                                                            View Pdf
                                                                        </Button>
                                                                    }
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                </Box>
                                            </Grid>
                                        ))}
                                        <Box sx={{ borderTop: "1px solid #C5C5C5", height: "1.5px", width: "100%", my: 2 }}></Box>
                                    </React.Fragment>
                                ))}
                            </Grid>
                        )}
                    </Box>
                    <Dialog
                        open={openPdf}
                        onClose={handlePdfClose}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& .MuiPaper-root': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                borderRadius: 0,
                                padding: 0,
                                overflow: 'visible',
                                maxWidth: '80vw',
                                maxHeight: '90vh',
                            },
                        }}
                        BackdropProps={{
                            style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                        }}
                    >
                        {/* PDF iframe */}
                        <iframe
                            src={pdfUrl}
                            style={{
                                width: '80vw',
                                height: '80vh',
                                border: 'none',
                            }}
                        ></iframe>

                        <DialogActions
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                padding: 0,
                            }}
                        >
                            <IconButton
                                onClick={handlePdfClose}
                                sx={{
                                    position: 'absolute',
                                    top: '-40px',
                                    right: "-50px",
                                    color: '#fff',
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogActions>
                    </Dialog>
                </Box>
                {showButton && (
                    <Fab
                        color="primary"
                        onClick={scrollToTop}
                        style={{
                            position: 'absolute',
                            width: "35px",
                            height: "35px",
                            bottom: '18px',
                            right: '18px',
                            zIndex: 1000,
                            backgroundColor: "#000"
                        }}
                    >
                        <ArrowUpwardIcon />
                    </Fab>
                )}
            </Box>
            <Dialog
                open={openImage}
                onClose={handleImageClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiPaper-root': {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: 0,
                        padding: 0,
                        overflow: 'visible',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                    },
                }}
                BackdropProps={{
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
            >
                {/* Image */}
                <img
                    src={imageUrl}
                    alt="Popup"
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                        display: 'block',
                        margin: 'auto',
                    }}
                />

                {/* Close Button */}
                <DialogActions
                    sx={{
                        position: 'absolute',
                        top: '-40px',
                        right: "-50px",
                        padding: 0,
                    }}
                >
                    <IconButton
                        onClick={handleImageClose}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            color: '#fff',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
