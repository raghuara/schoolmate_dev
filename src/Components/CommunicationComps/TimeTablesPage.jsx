import { Autocomplete, Box, Button, Chip, DialogActions, Dialog, Divider, Fab, IconButton, InputAdornment, Paper, Switch, TextField, Tooltip, Typography, ToggleButton, ToggleButtonGroup, Grid } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { DeleteTimeTable, GettingGrades, TimeTableFetch } from "../../Api/Api";
import Loader from "../Loader";
import { PostedCardsSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const timetablePerms = findSubMenuPermissions(user.permissions, "communication", "timetable") || {};
    const canView = timetablePerms.view === "Y";
    const canCreate = timetablePerms.create === "Y";
    const canEdit = timetablePerms.edit === "Y";
    const canDelete = timetablePerms.delete === "Y";
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
    const [openCreateTimetableAlert, setOpenCreateTimetableAlert] = useState(false);
    const [editId, setEditId] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(0);

    const [view, setView] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewChange = (event, nextView) => {
        if (nextView) {
            setView(nextView);
        }
    };

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
        setSelectedGradeId(newValue?.id || null);
    };

    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const handleCreateNews = () => {
        setOpenCreateTimetableAlert(true)
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

    const handleCreateTimetable = (type) => {
        if (type === "student") {
            navigate('create')
        } else if (type === "teacher") {
            navigate('teachercreate')
        }
        setOpenCreateTimetableAlert(false);
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
        fetchTimeTables()
    }, [checked, selectedGradeId, academicYear])


    const fetchTimeTables = async () => {
        // The API rejects the call without an academic year, so wait until the
        // header's selected year is in the store before asking for the list.
        if (!academicYear) return;
        setIsLoading(true);
        try {
            const res = await axios.get(TimeTableFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    grade: selectedGradeId || "",
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
            const res = await axios.delete(DeleteTimeTable, {
                params: {
                    id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchTimeTables();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Time Table Deleted Successfully");
            console.log('Time Table deleted successfully:', res.data);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete time Table. Please try again.");
            console.error('Error deleting time Table:', error);
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

    // Search narrows on class/section, then the flat list is grouped by posted
    // date so it reads as one dated band per day, like the other Communication
    // listings. Both steps live in one memo - splitting them rebuilds the array
    // on every render and the memo below would never hit.
    const groupedTimeTables = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const matches = (timeTableData || []).filter((t) =>
            (t.gradeSection || "").toLowerCase().includes(query)
        );

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
    }, [timeTableData, searchQuery]);

    const visibleCount = groupedTimeTables.reduce((n, g) => n + g.items.length, 0);

    const CardActions = ({ table }) => (
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
                        size={{ xs: 6, sm: 6, md: 3, lg: 2.5 }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Time Tables</Typography>
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
                        size={{ xs: 6, sm: 6, md: 3, lg: 1.8 }}>
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
                        size={{ xs: 6, sm: 6, md: 3, lg: 3.2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by class or section"
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
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#DDE1E6",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 1, px: 1 }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 4.5 }}>
                        {canView &&
                            <Autocomplete
                                disablePortal
                                options={grades}
                                getOptionLabel={(option) => option.sign}
                                value={grades.find((item) => item.id === selectedGradeId) || null}
                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ width: 150 }}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{
                                            ...props.style,
                                            maxHeight: "150px",
                                            backgroundColor: "#000",
                                            color: "#fff",
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} className="classdropdownOptions">
                                        {option.sign}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        placeholder="All classes"
                                        {...params}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "28px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    borderRadius: "50px",
                                                    backgroundColor: "#fff",
                                                },
                                            },
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#DDE1E6",
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: websiteSettings.mainColor,
                                            },
                                        }}
                                    />
                                )}
                            />
                        }

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
                                    "&:hover": {
                                        bgcolor: "#1a1a1a",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                                    },
                                }}
                            >
                                Time Tables
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
                                columns={view === "grid" ? { xs: 12, sm: 6, md: 4 } : { xs: 12, sm: 12, md: 12, lg: 12 }}
                                rows={view === "grid" ? 4 : 2}
                            />
                        </Grid>
                    </Box>
                ) : groupedTimeTables.length > 0 ? (
                    groupedTimeTables.map((group, gIdx) => (
                        <Box key={group.postedOn || gIdx} sx={{ mb: 3, px: 2.2, pb: 2 }}>
                            {/* Dated band header — the pattern every Communication listing uses */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 2, pb: 1.5 }}>
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "#6B7280",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Posted on {group.postedOn}{group.day ? ` | ${group.day}` : ""}
                                </Typography>
                                <Divider sx={{ flex: 1 }} />
                            </Box>

                            {view === "grid" ? (
                                <Grid container spacing={2}>
                                    {group.items.map((table, index) => (
                                        <Grid key={table.id ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Box
                                                sx={{
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
                                                }}
                                            >
                                                <Box sx={{ p: 2, pb: 1.2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }} noWrap>
                                                                {table.gradeSection || "Timetable"}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#777" }}>
                                                                Posted on {table.postedOn}
                                                            </Typography>
                                                        </Box>
                                                        {(canEdit || canDelete) && <CardActions table={table} />}
                                                    </Box>

                                                    {table.day && (
                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 1 }}>
                                                            <Chip
                                                                size="small"
                                                                icon={<CalendarMonthIcon />}
                                                                label={table.day}
                                                                sx={{
                                                                    ...metaChipSx,
                                                                    backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                                    color: "#4B5563",
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
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
                                                        alt={`Timetable for ${table.gradeSection || "class"}`}
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
                                                                "&:hover": {
                                                                    border: "2px solid white",
                                                                    backgroundColor: "rgba(255,255,255,0.14)",
                                                                },
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
                                                alt={`Timetable for ${table.gradeSection || "class"}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            />
                                        </Box>

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }} noWrap>
                                                {table.gradeSection || "Timetable"}
                                            </Typography>
                                            <Typography sx={{ fontSize: "12px", color: "#777" }}>
                                                Posted on {table.postedOn}{table.day ? ` | ${table.day}` : ""}
                                            </Typography>
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

                                        {(canEdit || canDelete) && <CardActions table={table} />}
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
                            style={{
                                width: "30%",
                                height: "auto",
                                marginBottom: "16px",
                            }}
                        />
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                            {searchQuery
                                ? "No timetables match your search"
                                : selectedGradeId
                                    ? "No timetables for this class"
                                    : checked
                                        ? "You have not uploaded any timetables"
                                        : "No timetables yet"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                            {searchQuery
                                ? "Try a different class or section, or clear the search to see everything."
                                : selectedGradeId
                                    ? "Clear the class filter to see all timetables."
                                    : canCreate
                                        ? "Upload your first timetable and it will show up here."
                                        : "Nothing has been uploaded yet."}
                        </Typography>
                        {!searchQuery && !selectedGradeId && canCreate && (
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
                                Upload Timetable
                            </Button>
                        )}
                    </Box>
                )}

                {showButton && (
                    <Fab
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        sx={{
                            position: "absolute",
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
                        Delete this timetable?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        This will remove the timetable for everyone. It cannot be undone.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={dialogGhostSx}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleCloseDialog(true)} sx={dialogPrimarySx}>
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
                        Reupload this timetable?
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

            {/* ═══ Who is this timetable for? ═══ */}
            <Dialog
                open={openCreateTimetableAlert}
                onClose={() => setOpenCreateTimetableAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "460px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827", textAlign: "center" }}>
                        Who is this timetable for?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8, textAlign: "center" }}>
                        Pick the audience and we will open the matching upload screen.
                    </Typography>

                    <Grid container spacing={1.5} sx={{ mt: 2 }}>
                        {[
                            { key: "student", label: "Students", desc: "A class & section timetable", icon: SchoolOutlinedIcon },
                            { key: "teacher", label: "Teachers", desc: "A staff period timetable", icon: PersonOutlineIcon },
                        ].map((opt) => {
                            const OptIcon = opt.icon;
                            return (
                                <Grid size={{ xs: 12, sm: 6 }} key={opt.key}>
                                    <Box
                                        onClick={() => handleCreateTimetable(opt.key)}
                                        sx={{
                                            cursor: "pointer",
                                            height: "100%",
                                            textAlign: "center",
                                            px: 1.5, py: 2,
                                            borderRadius: "5px",
                                            border: "1px solid #E6E8EC",
                                            backgroundColor: "#fff",
                                            transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
                                            "&:hover": {
                                                borderColor: "#D6DAE1",
                                                boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                transform: "translateY(-2px)",
                                            },
                                        }}
                                    >
                                        <Box sx={{
                                            width: 40, height: 40, mx: "auto", mb: 1,
                                            borderRadius: "10px",
                                            backgroundColor: "#F3F4F6",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <OptIcon sx={{ fontSize: 21, color: "#374151" }} />
                                        </Box>
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                                            {opt.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.3 }}>
                                            {opt.desc}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                        <Button variant="outlined" onClick={() => setOpenCreateTimetableAlert(false)} sx={dialogGhostSx}>
                            Cancel
                        </Button>
                    </Box>
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
                BackdropProps={{
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <img
                        src={imageUrl}
                        alt="Timetable"
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