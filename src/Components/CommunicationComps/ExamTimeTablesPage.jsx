import { Autocomplete, Box, Button, Chip, DialogActions, Dialog, Divider, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, Tooltip, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { DeleteExamTimeTable, DeleteTimeTable, ExamTimeTableFetch, GettingGrades, TimeTableFetch } from "../../Api/Api";
import Loader from "../Loader";
import { PostedCardsSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NoData from '../../Images/Login/No Data.png'

export default function TimeTablePage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [timeTableData, setTimeTableData] = useState([]);
    const user = useSelector((state) => state.auth);
    const examPerms = findSubMenuPermissions(user.permissions, "communication", "examtimetable") || {};
    const canView = examPerms.view === "Y";
    const canCreate = examPerms.create === "Y";
    const canEdit = examPerms.edit === "Y";
    const canDelete = examPerms.delete === "Y";
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // The empty state must not paint before the first fetch has actually
    // finished, otherwise "no data" flashes on every visit.
    const [hasLoaded, setHasLoaded] = useState(false);
    const token = '123';
    const [deleteId, setDeleteId] = useState('');
    const location = useLocation();
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
    const [selectedGrade, setSelectedGrade] = useState([]);
    const [examOptions, setExamOptions] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");

    const [view, setView] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewChange = (event, nextView) => {
        if (nextView) {
            setView(nextView);
        }
    };

    useEffect(() => {
        if (grades && grades.length > 0) {
            const defaultGrade = grades[0];
            const defaultExams = defaultGrade.exams?.map(e => e.exam) || [];
            setSelectedGrade(defaultGrade.id);
            setExamOptions(defaultExams);
            setSelectedExam(defaultExams[0] || "");
        }
    }, [grades]);


    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGrade(newValue.id || "");

            const exams = Array.isArray(newValue.exams)
                ? newValue.exams.map(e => e.exam)
                : [];

            setExamOptions(exams);
            setSelectedExam(exams.length > 0 ? exams[0] : "");
        } else {
            setSelectedGrade('');
            setExamOptions([]);
            setSelectedExam('');
        }
    };

    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const getGradeName = (gradeId) => {
        const grade = grades.find((item) => item.id === gradeId);
        return grade ? grade.sign : 'Unknown Grade';
    };

    const handleCreateNews = () => {
        navigate('create')
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
            navigate('edit', { state: { id: editId } });
        }
    };



    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
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
        fetchExamTimeTables()
    }, [checked, selectedGrade, selectedExam, academicYear])


    const fetchExamTimeTables = async () => {
        // The API rejects the call without an academic year, so wait until the
        // header's selected year is in the store before asking for the list.
        if (!academicYear) return;
        setIsLoading(true);
        try {
            const res = await axios.get(ExamTimeTableFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    grade: selectedGrade || "",
                    exam: selectedExam || "",
                    isMyProject: isMyProject,
                    academicYear: academicYear || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTimeTableData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };


    const DeleteTimeTableId = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteExamTimeTable, {
                params: {
                    id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchExamTimeTables();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Exam Time Table Deleted Successfully");
            console.log('Exam Time Table deleted successfully:', res.data);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete exam time Table. Please try again.");
            console.error('Error deleting exam time Table:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const metaChipSx = {
        height: "20px",
        fontSize: "10.5px",
        fontWeight: 600,
        borderRadius: "6px",
        "& .MuiChip-icon": { fontSize: 13, ml: "6px", color: "inherit" },
        "& .MuiChip-label": { px: "7px" },
    };

    const dialogGhostSx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 600,
        px: 2.4,
        py: 0.6,
        color: "#374151",
        borderColor: "#D6DAE1",
        backgroundColor: "#fff",
        "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
    };

    const dialogPrimarySx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 700,
        px: 2.4,
        py: 0.7,
        boxShadow: "none",
        whiteSpace: "nowrap",
        backgroundColor: websiteSettings.mainColor,
        color: websiteSettings.textColor,
        "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9, boxShadow: "none" },
    };

    const smallActionSx = {
        width: "26px",
        height: "26px",
        border: "1px solid #DDE1E6",
        backgroundColor: "#fff",
        transition: "0.2s",
        "&:hover": { backgroundColor: "#EFEFEF", borderColor: "#9AA3AF" },
    };

    const pillInputSx = {
        paddingRight: 0,
        height: "28px",
        fontSize: "12px",
        fontWeight: 600,
        borderRadius: "50px",
        backgroundColor: "#fff",
    };

    const pillFieldSx = {
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#DDE1E6" },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: websiteSettings.mainColor },
    };

    // Search narrows on exam name or class, then the flat list is grouped by
    // posted date - one dated band per day, like the other Communication pages.
    const groupedExamTables = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const matches = (timeTableData || []).filter((t) => {
            const exam = (t.exam || "").toLowerCase();
            const gradeName = (getGradeName(t.gradeId) || "").toString().toLowerCase();
            return exam.includes(query) || gradeName.includes(query);
        });

        const groups = [];
        const byDate = new Map();
        matches.forEach((table) => {
            const key = table.postedOn || "";
            if (!byDate.has(key)) {
                const group = { postedOn: table.postedOn, day: table.day, items: [] };
                byDate.set(key, group);
                groups.push(group);
            }
            byDate.get(key).items.push(table);
        });
        return groups;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeTableData, searchQuery, grades]);

    const visibleCount = groupedExamTables.reduce((n, g) => n + g.items.length, 0);

    const RowActions = ({ table }) => (
        <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
            {canEdit && (
                <Tooltip title="Reupload">
                    <IconButton onClick={() => handleEdit(table.id)} sx={smallActionSx}>
                        <UploadOutlinedIcon sx={{ fontSize: 14, color: "#374151" }} />
                    </IconButton>
                </Tooltip>
            )}
            {canDelete && (
                <Tooltip title="Delete">
                    <IconButton
                        onClick={() => handleDelete(table.id)}
                        sx={{
                            ...smallActionSx,
                            "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#f44336" },
                        }}
                    >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 14, color: "#f44336" }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* ═══ TOOLBAR — same shape as Circulars / News / Messages ═══ */}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 0.13, }}>
                <Grid container alignItems="center">
                    <Grid
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 2.4 }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px", whiteSpace: "nowrap" }}>Exam Time Tables</Typography>
                        {hasLoaded && (
                            <Chip
                                size="small"
                                label={visibleCount}
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
                        )}
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 1.6 }}>
                        {canCreate &&
                            <>
                                <Typography sx={{ fontWeight: "600", fontSize: "12px" }}>My Projects</Typography>
                                <Switch
                                    checked={checked}
                                    onChange={handleCheck}
                                    inputProps={{ "aria-label": "controlled" }}
                                    sx={{
                                        // Same switch, just stops its 12px padding from setting the toolbar height.
                                        my: "-6px",
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: checked ? websiteSettings.mainColor : "default",
                                        },
                                        "& .MuiSwitch-track": {
                                            borderWidth: checked ? "0" : "1px",
                                            borderStyle: "solid",
                                            backgroundColor: checked ? `${websiteSettings.mainColor} !important` : "#fff",
                                        },
                                        "&.MuiSwitch-root.Mui-focusVisible .MuiSwitch-thumb": {
                                            backgroundColor: checked ? websiteSettings.mainColor : "default",
                                        },
                                        "&.MuiSwitch-root.Mui-focusVisible .MuiSwitch-track": {
                                            backgroundColor: checked ? websiteSettings.mainColor : "#bdbdbd",
                                        },
                                        "& .MuiSwitch-focusVisible": {
                                            outline: "none !important",
                                        },
                                    }}
                                />
                            </>
                        }
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 2.2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by exam or class"
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
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
                                },
                                ...pillFieldSx,
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: { xs: "flex-start", lg: "flex-end" }, alignItems: "center", gap: 1, px: 1, flexWrap: "wrap", rowGap: 1 }}
                        size={{ xs: 12, sm: 12, md: 3, lg: 5.8 }}>
                        {canView && (
                            <Autocomplete
                                disablePortal
                                options={grades}
                                getOptionLabel={(option) => option.sign}
                                value={grades.find((item) => item.id === selectedGrade) || null}
                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ width: 130 }}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff", fontSize: "13px" }}
                                    />
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Class"
                                        fullWidth
                                        slotProps={{ input: { ...params.InputProps, sx: pillInputSx } }}
                                        sx={pillFieldSx}
                                    />
                                )}
                            />
                        )}

                        {canView && (
                            <Autocomplete
                                disablePortal
                                options={examOptions}
                                getOptionLabel={(option) => option}
                                onChange={(event, newValue) => setSelectedExam(newValue)}
                                value={selectedExam}
                                sx={{ width: 160 }}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff", fontSize: "14px" }}
                                    />
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Exam"
                                        fullWidth
                                        slotProps={{ input: { ...params.InputProps, sx: pillInputSx } }}
                                        sx={pillFieldSx}
                                    />
                                )}
                            />
                        )}

                        {canView && (
                            <ToggleButtonGroup
                                value={view}
                                exclusive
                                onChange={handleViewChange}
                                aria-label="View Toggle"
                                sx={{
                                    height: "28px",
                                    "& .MuiToggleButton-root": {
                                        px: 1.4,
                                        border: "1px solid #DDE1E6",
                                        backgroundColor: "#fff",
                                        color: "#374151",
                                        "&:hover": { backgroundColor: "#EFEFEF" },
                                        "&.Mui-selected": {
                                            backgroundColor: websiteSettings.mainColor,
                                            color: websiteSettings.textColor,
                                            "&:hover": { backgroundColor: websiteSettings.mainColor },
                                        },
                                    },
                                    "& .MuiToggleButton-root:first-of-type": { borderRadius: "50px 0 0 50px", pl: 1.7 },
                                    "& .MuiToggleButton-root:last-of-type": { borderRadius: "0 50px 50px 0", pr: 1.7 },
                                }}
                            >
                                <ToggleButton value="grid" aria-label="Grid View">
                                    <GridViewIcon sx={{ fontSize: "16px" }} />
                                </ToggleButton>
                                <ToggleButton value="list" aria-label="List View">
                                    <FormatListBulletedIcon sx={{ fontSize: "16px" }} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}

                        {canCreate &&
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
                                Exam Tables
                            </Button>
                        }
                    </Grid>
                </Grid>
            </Box>

            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                {!hasLoaded ? (
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <PostedCardsSkeleton
                                count={view === "grid" ? 6 : 4}
                                columns={view === "grid" ? { xs: 12, sm: 6, md: 4 } : { xs: 12, sm: 12, md: 12, lg: 6 }}
                                rows={view === "grid" ? 4 : 2}
                            />
                        </Grid>
                    </Box>
                ) : groupedExamTables.length > 0 ? (
                    groupedExamTables.map((group, gIdx) => (
                        <Box key={group.postedOn || gIdx} sx={{ mb: 3, px: 2.2, pb: 2 }}>
                            {/* Dated band header */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 2, pb: 1.5 }}>
                                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>
                                    Posted on {group.postedOn}{group.day ? ` | ${group.day}` : ""}
                                </Typography>
                                <Divider sx={{ flex: 1 }} />
                            </Box>

                            {view === "grid" ? (
                                <Grid container spacing={2}>
                                    {group.items.map((table, index) => (
                                        <Grid key={table.id ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Box sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                border: "1px solid #E6E8EC",
                                                boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                borderRadius: "5px",
                                                backgroundColor: "#fff",
                                                overflow: "hidden",
                                                transition: "box-shadow 0.2s, border-color 0.2s",
                                                "&:hover": {
                                                    boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                    borderColor: "#D6DAE1",
                                                },
                                            }}>
                                                <Box sx={{ p: 2, pb: 1.2 }}>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            label={getGradeName(table.gradeId)}
                                                            sx={{
                                                                ...metaChipSx,
                                                                backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                                color: "#4B5563",
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }} noWrap>
                                                                {table.exam}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#777" }}>
                                                                Posted on {table.postedOn}
                                                            </Typography>
                                                        </Box>
                                                        {(canEdit || canDelete) && <RowActions table={table} />}
                                                    </Box>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        mx: 2,
                                                        mb: 2,
                                                        borderRadius: "5px",
                                                        overflow: "hidden",
                                                        border: "1px solid #EDEFF3",
                                                        backgroundColor: "#F7F8FA",
                                                        "&:hover .overlay": { opacity: 1 },
                                                    }}
                                                >
                                                    <img
                                                        src={table.filePath}
                                                        alt={`Exam timetable: ${table.exam || ""}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "190px",
                                                            objectFit: "cover",
                                                            display: "block",
                                                        }}
                                                    />
                                                    <Box
                                                        className="overlay"
                                                        sx={{
                                                            position: "absolute",
                                                            inset: 0,
                                                            backgroundColor: "rgba(17,24,39,0.55)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            opacity: 0,
                                                            transition: "opacity 0.25s ease-in-out",
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                textTransform: "none",
                                                                padding: "2px 15px",
                                                                borderRadius: "30px",
                                                                fontSize: "12px",
                                                                border: "2px solid white",
                                                                color: "white",
                                                                fontWeight: "600",
                                                                backgroundColor: "transparent",
                                                                "&:hover": { border: "2px solid white", backgroundColor: "rgba(255,255,255,0.14)" },
                                                            }}
                                                            onClick={() => handleViewClick(table.filePath)}
                                                        >
                                                            View Image
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                group.items.map((table, index) => (
                                    <Box
                                        key={table.id ?? index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            border: "1px solid #E6E8EC",
                                            boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                            borderRadius: "5px",
                                            backgroundColor: "#fff",
                                            p: 2,
                                            mb: 2,
                                            transition: "box-shadow 0.2s, border-color 0.2s",
                                            "&:hover": {
                                                boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                borderColor: "#D6DAE1",
                                            },
                                        }}
                                    >
                                        <Box
                                            onClick={() => handleViewClick(table.filePath)}
                                            sx={{
                                                width: 52,
                                                height: 52,
                                                flexShrink: 0,
                                                borderRadius: "5px",
                                                overflow: "hidden",
                                                border: "1px solid #EDEFF3",
                                                backgroundColor: "#F7F8FA",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <img
                                                src={table.filePath}
                                                alt={`Exam timetable: ${table.exam || ""}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            />
                                        </Box>

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }} noWrap>
                                                {table.exam}
                                            </Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 0.5, alignItems: "center" }}>
                                                <Chip
                                                    size="small"
                                                    label={getGradeName(table.gradeId)}
                                                    sx={{
                                                        ...metaChipSx,
                                                        backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                        color: "#4B5563",
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>
                                                    Posted on {table.postedOn}{table.day ? ` | ${table.day}` : ""}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            sx={{
                                                textTransform: "none",
                                                padding: "2px 15px",
                                                borderRadius: "30px",
                                                fontSize: "12px",
                                                color: "#E60154",
                                                fontWeight: "600",
                                                backgroundColor: "#fcf6f0",
                                                border: "none",
                                                flexShrink: 0,
                                                display: { xs: "none", sm: "inline-flex" },
                                                "&:hover": { border: "none", backgroundColor: "#fbeee2" },
                                            }}
                                            onClick={() => handleViewClick(table.filePath)}
                                        >
                                            View Image
                                        </Button>

                                        {(canEdit || canDelete) && <RowActions table={table} />}
                                    </Box>
                                ))
                            )}
                        </Box>
                    ))
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "77vh",
                            textAlign: "center",
                        }}
                    >
                        <img
                            src={NoData}
                            alt="No data"
                            style={{ width: "30%", height: "auto", marginBottom: "16px" }}
                        />
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                            {searchQuery
                                ? "No exam timetables match your search"
                                : selectedExam
                                    ? "No timetables for this exam"
                                    : checked
                                        ? "You have not uploaded any exam timetables"
                                        : "No exam timetables yet"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                            {searchQuery
                                ? "Try a different exam or class, or clear the search to see everything."
                                : selectedExam
                                    ? "Clear the exam filter to see all timetables."
                                    : canCreate
                                        ? "Upload your first exam timetable and it will show up here."
                                        : "Nothing has been uploaded yet."}
                        </Typography>
                        {!searchQuery && !selectedExam && canCreate && (
                            <Button
                                onClick={handleCreateNews}
                                variant="contained"
                                startIcon={<AddIcon sx={{ fontSize: "18px" }} />}
                                sx={{
                                    mt: 2,
                                    backgroundColor: "#000",
                                    borderRadius: "50px",
                                    px: 2.5,
                                    py: 0.5,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                    "&:hover": { backgroundColor: "#1a1a1a" },
                                }}
                            >
                                Upload Exam Timetable
                            </Button>
                        )}
                    </Box>
                )}

                {showButton && (
                    <Fab
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        sx={{
                            position: 'absolute',
                            width: 35,
                            height: 35,
                            bottom: 18,
                            right: 18,
                            zIndex: 1000,
                            backgroundColor: "#000",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#1a1a1a" },
                        }}
                    >
                        <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                    </Fab>
                )}
            </Box>

            {/* ═══ Delete confirmation ═══ */}
            <Dialog
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        Delete this exam timetable?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        This will remove it for everyone. It cannot be undone.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={dialogGhostSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleCloseDialog(true)}
                            sx={{
                                ...dialogPrimarySx,
                                backgroundColor: "#f44336",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ═══ Reupload confirmation ═══ */}
            <Dialog
                open={openEditAlert}
                onClose={() => setOpenEditAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        Reupload this exam timetable?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        You will be taken to the upload screen to replace the current image.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleEditCloseDialog(false)} sx={dialogGhostSx}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleEditCloseDialog(true)} sx={dialogPrimarySx}>
                            Continue
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ═══ Image lightbox ═══ */}
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
                BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <Box sx={{ position: 'relative' }}>
                    <img
                        src={imageUrl}
                        alt="Exam timetable"
                        style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '80vw',
                            maxHeight: '80vh',
                            display: 'block',
                            margin: 'auto',
                            borderRadius: '10px',
                        }}
                    />
                    <IconButton
                        onClick={handleImageClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.45)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Dialog>
        </Box>
    );
}