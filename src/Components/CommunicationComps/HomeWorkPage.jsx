import { Autocomplete, Box, Button, DialogActions, Dialog, Fab, IconButton, Paper, Switch, TextField, Typography, ThemeProvider, createTheme, Grid, styled, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
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
import { DeleteHomeWork, DeleteTimeTable, GettingGrades, HomeWorkFetch, HomeWorkFetch01, TimeTableFetch } from "../../Api/Api";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import pdfDemo from '../../Images/PDF.png'

export default function HomeWorkPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [openPdf, setOpenPdf] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [timeTableData, setTimeTableData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
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
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];

    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const [view, setView] = useState('grid');

    const handleViewChange = (event, nextView) => {
        if (nextView) {
            setView(nextView);
        }
    };



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

    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1.5),
        color: theme.palette.text.secondary,
    }));


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
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
        }
    };


    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const handleCreateNews = () => {
        navigate('create')
    }

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
    };
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



    const handleViewClick = (file, url) => {
        if (file === "pdf") {
            setOpenPdf(true);
        } else {
            setOpenImage(true);
        }
        setImageUrl(url);
    };

    const handleImageClose = () => {
        setOpenImage(false);
        setOpenPdf(false)
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
    }, [checked, selectedGradeId, selectedSection, formattedDate])


    const fetchTimeTables = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(HomeWorkFetch01, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Grade: selectedGradeId || "131",
                    section: selectedSection || "A1",
                    IsMyProject: isMyProject,
                    Date: formattedDate || "",
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
        }
    };


    const DeleteTimeTableId = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteHomeWork, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchTimeTables();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Homework Deleted Successfully");
            console.log('Homework deleted successfully:', res.data);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete homework. Please try again.");
            console.error('Error deleting homework:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2.5
                        }}>

                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Home Work</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", pr: 2 }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2.5
                        }}>
                        {userType !== "teacher" &&
                            <>
                                <Typography sx={{ fontWeight: "600", fontSize: "12px" }} >My Projects</Typography>
                                <Switch
                                    checked={checked}
                                    onChange={handleCheck}
                                    inputProps={{ "aria-label": "controlled" }}
                                    sx={{
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: checked ? websiteSettings.mainColor : "default",
                                        },
                                        "& .MuiSwitch-track": {
                                            borderWidth: checked ? "0" : "1px",
                                            borderStyle: "solid",
                                            backgroundColor: checked ? `${websiteSettings.mainColor} !important` : "#fff",
                                            // borderColor: checked ? websiteSettings.mainColor : "#bdbdbd",
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
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 4
                        }}>
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    lg: 6
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => {
                                        handleGradeChange(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: "150px" }}
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
                                            placeholder="Select Class"
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />


                            </Grid>
                            <Grid
                                size={{
                                    lg: 6
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={sections}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        sections.find((option) => option.sectionName === selectedSection) ||
                                        null
                                    }
                                    onChange={handleSectionChange}
                                    isOptionEqualToValue={(option, value) =>
                                        option.sectionName === value.sectionName
                                    }
                                    sx={{ width: "150px" }}
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
                                            {option.sectionName}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            xs: 8,
                            sm: 8,
                            md: 3,
                            lg: 3
                        }}>
                        <Box sx={{ width: "100px" }}>
                            <ThemeProvider theme={darkTheme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        open={openCal}
                                        onClose={handleClose}
                                        value={selectedDate}
                                        onChange={(newValue) => {
                                            setSelectedDate(newValue);
                                            const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                            setFormattedDate(newFormattedDate);
                                            handleClose();
                                        }}
                                        disableFuture
                                        views={['year', 'month', 'day']}
                                        renderInput={() => null}
                                        sx={{
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            width: "0px",
                                        }}

                                    />

                                    <IconButton sx={{
                                        width: '40px',
                                        mt: 0.8,
                                        height: '40px',
                                        transition: 'color 0.3s, background-color 0.3s',
                                        '&:hover': {
                                            color: '#fff',
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                        },

                                    }}
                                        onClick={handleOpen}>
                                        <CalendarMonthIcon style={{ color: "#000" }} />
                                    </IconButton>
                                    {selectedDate ? (
                                        <Tooltip title="Clear Date">
                                            <IconButton sx={{
                                                marginTop: '10px',
                                                width: '40px',
                                                mt: 0.8,
                                                height: '40px',
                                                transition: 'color 0.3s, background-color 0.3s',
                                                '&:hover': {
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                },
                                            }} onClick={handleClearDate}>
                                                <HighlightOffIcon style={{ color: "#000" }} />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Box sx={{ width: "80px" }}>
                                        </Box>
                                    )}
                                </LocalizationProvider>
                            </ThemeProvider>
                        </Box>
                        {userType !== "teacher" &&
                            <Button
                                onClick={handleCreateNews}
                                variant="outlined"
                                sx={{
                                    borderColor: "#A9A9A9",
                                    backgroundColor: "#000",
                                    py: 0.3,
                                    width: "130px",
                                    height: "30px",
                                    color: "#fff",
                                    textTransform: "none",
                                    border: "none",

                                }}
                            >
                                <AddIcon sx={{ fontSize: "20px" }} />
                                &nbsp;Homework
                            </Button>
                        }
                    </Grid>
                </Grid>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete
                                this homework?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleCloseDialog(false)}
                                    sx={{
                                        textTransform: 'none',
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        border: '1px solid black',
                                        color: 'black',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleCloseDialog(true)}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: websiteSettings.mainColor,
                                        width: "90px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        color: websiteSettings.textColor,
                                    }}
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>

                <Dialog open={openEditAlert} onClose={() => setOpenEditAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}>Do you really want to make
                                changes to this homework?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleEditCloseDialog(false)}
                                    sx={{
                                        textTransform: 'none',
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        border: '1px solid black',
                                        color: 'black',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleEditCloseDialog(true)}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: websiteSettings.mainColor,
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        color: websiteSettings.textColor,
                                    }}
                                >
                                    Edit
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>


                <Box sx={{ p: 2 }}>
                    <Box
                        sx={{
                            position: "fixed",
                            top: "120px",
                            right: "20px",
                            zIndex: 999,
                        }}
                    >
                        {userType !== "teacher" && (
                            <ToggleButtonGroup
                                value={view}
                                exclusive
                                onChange={handleViewChange}
                                sx={{ marginBottom: 2 }}
                                aria-label="View Toggle"
                            >
                                <ToggleButton
                                    value="grid"
                                    aria-label="Grid View"
                                    sx={{
                                        borderRadius: "50px",
                                        pl: 2,
                                        pt: 0.3,
                                        pb: 0.3,
                                        color: "#000",
                                        backgroundColor: "#E3E3E5",
                                        '&:hover': {
                                            backgroundColor: "#d0d0d0",
                                        },
                                        '&.Mui-selected': {
                                            backgroundColor: websiteSettings.mainColor,
                                            color: websiteSettings.textColor,
                                            '&:hover': {
                                                backgroundColor: websiteSettings.mainColor,
                                            },
                                        },
                                    }}
                                >
                                    <GridViewIcon sx={{ fontSize: "18px" }} />
                                </ToggleButton>

                                <ToggleButton
                                    value="list"
                                    aria-label="List View"
                                    sx={{
                                        borderRadius: "50px",
                                        pr: 2,
                                        pt: 0.3,
                                        pb: 0.3,
                                        color: "#000",
                                        backgroundColor: "#E3E3E5",
                                        '&:hover': {
                                            backgroundColor: "#d0d0d0",
                                        },
                                        '&.Mui-selected': {
                                            backgroundColor: websiteSettings.mainColor,
                                            color: '#000',
                                            '&:hover': {
                                                backgroundColor: websiteSettings.mainColor,
                                            },
                                        },
                                    }}
                                >
                                    <FormatListBulletedIcon sx={{ fontSize: "18px" }} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    </Box>
                    {view === 'grid' ? (
                        <>
                            {timeTableData.length > 0 && timeTableData[0].status === "schedule" && (
                                <Box sx={{ backgroundColor: "#8338EC", width: "200px", borderRadius: "50px", display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#fff",
                                            py: 0.5,
                                        }}
                                    >
                                        Upcoming Homework
                                    </Typography>
                                </Box>
                            )}
                            <Grid container spacing={3}>
                                {timeTableData.map((table, index) => (
                                    <Grid
                                        key={index}
                                        sx={{ position: 'relative' }}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 4
                                        }}>
                                        <Typography sx={{ fontSize: '12px', color: '#595959', pb: 2 }}>
                                            {table.status === "schedule" ? " Scheduled on :" : "Posted on :"}
                                            {table.status === "schedule" ? table.scheduleOn : table.postedOn} {table.status !== "schedule" && "|"} {table.day}
                                        </Typography>

                                        <Box
                                            sx={{
                                                backgroundColor: '#00467B',
                                                p: 0.5,
                                                borderRadius: '5px 5px 0px 0px',
                                                width: '100px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>
                                            {selectedGradeSign || grades?.[0]?.sign || ""} - {selectedSection || grades?.[0]?.sections[0]}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ border: "1px solid #ccc", borderRadius: "0px 5px 5px 5px", backgroundColor: "#fff" }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: "600", px: 2, minHeight: "60px", display: "flex", alignItems: "center" }}>{table.headLine}</Typography>
                                            </Box>
                                            {table.fileType === "image" &&
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        borderRadius: "5px",
                                                        '&:hover .overlay': {
                                                            opacity: 1,
                                                        },
                                                    }}
                                                >
                                                    <img
                                                        src={table.filePath}
                                                        alt={`Homework for ${table.gradeSection}`}
                                                        width="100%"
                                                        height="271px"
                                                        style={{ borderRadius: "5px", }}
                                                    />

                                                    {/* Overlay Box for the View Button */}
                                                    <Box
                                                        className="overlay"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease-in-out',
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            sx={{
                                                                textTransform: 'none',
                                                                padding: '2px 15px',
                                                                borderRadius: '30px',
                                                                fontSize: '12px',
                                                                border: '2px solid white',
                                                                color: 'white',
                                                                fontWeight: '600',
                                                                backgroundColor: 'transparent',
                                                            }}
                                                            onClick={() => handleViewClick("", table.filePath)}
                                                        >
                                                            View Image
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            }
                                            {table.fileType === "pdf" &&

                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        borderRadius: "5px",
                                                        "&:hover .overlay": {
                                                            opacity: 1,
                                                        },
                                                    }}
                                                >
                                                    <img
                                                        src={pdfDemo}
                                                        alt={`Timetable for ${table.gradeSection}`}
                                                        width="100%"
                                                        height="271px"
                                                        style={{ borderRadius: '5px' }}
                                                    />
                                                    <Box
                                                        className="overlay"
                                                        sx={{
                                                            position: "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            width: "100%",
                                                            height: "100%",
                                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            opacity: 0,
                                                            transition: "opacity 0.3s ease-in-out",
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            sx={{
                                                                textTransform: "none",
                                                                padding: "2px 15px",
                                                                borderRadius: "30px",
                                                                fontSize: "12px",
                                                                border: "2px solid white",
                                                                color: "white",
                                                                fontWeight: "600",
                                                                backgroundColor: "transparent",
                                                            }}
                                                            onClick={() => handleViewClick("pdf", table.filePath)}
                                                        >
                                                            View PDF
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            }
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "end", pb: 2 }}>
                                            <Box
                                                sx={{
                                                    borderRadius: "7px",
                                                    marginTop: "0px",
                                                    width: "200px",
                                                    backgroundColor: '#F1EAFC',
                                                    p: 0.3,
                                                    marginRight: "15px",
                                                    borderRadius: "0px 0px 5px 5px",
                                                    visibility: table.status === "schedule" ? "visible" : "hidden",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: "600",
                                                        fontSize: "12px",
                                                        color: "#8338EC",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span style={{
                                                        height: '8px',
                                                        width: '8px',
                                                        backgroundColor: '#8338EC',
                                                        borderRadius: ' 50%',
                                                        display: 'inline-block'
                                                    }} ></span>  Scheduled For {table.scheduleOn}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {userType !== "teacher" &&
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleEdit(table.id)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        width: '100px',
                                                        height: '25px',
                                                        mr: 1,
                                                        borderRadius: '30px',
                                                        fontSize: '10px',
                                                        border: '1px solid black',
                                                        color: 'black',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <EditOutlinedIcon style={{ fontSize: '15px' }} />
                                                    &nbsp;Reupload
                                                </Button>

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
                                            </Box>
                                        }
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <>
                            {timeTableData.length > 0 && timeTableData[0].status === "schedule" && (
                                <Box sx={{ backgroundColor: "#8338EC", width: "200px", borderRadius: "50px", display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#fff",
                                            py: 0.5,
                                        }}
                                    >
                                        Upcoming Homework
                                    </Typography>
                                </Box>
                            )}

                            <Grid container spacing={1.5} sx={{ mt: 2 }}>
                                {timeTableData.map((table, index) => (
                                    <Grid
                                        key={index}
                                        sx={{ position: 'relative' }}
                                        size={{
                                            lg: 6
                                        }}>
                                        <Typography sx={{ fontSize: '12px', color: '#595959', pb: 2 }}>
                                            {table.status === "schedule" ? " Scheduled on :" : "Posted on :"}
                                            {table.status === "schedule" ? table.scheduleOn : table.postedOn} {table.status !== "schedule" && "|"} {table.day}
                                        </Typography>
                                        {table.updatedOn && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: "22px",
                                                    right: "15px",
                                                    width: "190px",
                                                    backgroundColor: websiteSettings.lightColor,
                                                    p: 0.5,
                                                    borderRadius: "5px 5px 0px 0px",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: "600",
                                                        fontSize: "10px",
                                                        color: "#353535",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Updated on {table.updatedOn}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Main content */}
                                        <Item>
                                            <Grid container sx={{ py: 1 }}>
                                                <Grid
                                                    sx={{ display: "flex", alignItems: "center" }}
                                                    size={{
                                                        xs: 12,
                                                        lg: 6
                                                    }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '11px', }}>
                                                            {table.gradeSection}
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: "600", display: "flex", alignItems: "center" }}>{table.headLine}</Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        lg: 6
                                                    }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: { lg: 'flex-end', xs: 'flex-start' },
                                                            alignItems: 'center',
                                                            flexWrap: 'wrap',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={() => handleEdit(table.id)}
                                                            sx={{
                                                                border: '1px solid black',
                                                                width: '25px',
                                                                height: '25px',
                                                            }}
                                                        >
                                                            <UploadOutlinedIcon sx={{ fontSize: '15px', color: '#000' }} />
                                                        </IconButton>

                                                        <IconButton
                                                            onClick={() => handleDelete(table.id)}
                                                            sx={{
                                                                border: '1px solid black',
                                                                width: '25px',
                                                                height: '25px',
                                                            }}
                                                        >
                                                            <DeleteOutlineOutlinedIcon sx={{ fontSize: '15px', color: '#000' }} />
                                                        </IconButton>

                                                        <Box sx={{ px: 1 }}>|</Box>
                                                        {table.fileType === "image" &&
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleViewClick("", table.filePath)}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    px: 2,
                                                                    borderRadius: '30px',
                                                                    fontSize: '12px',
                                                                    color: '#E60154',
                                                                    fontWeight: '600',
                                                                    backgroundColor: '#fcf6f0',
                                                                    border: "none",
                                                                }}
                                                            >
                                                                View Image
                                                            </Button>
                                                        }
                                                        {table.fileType === "pdf" &&
                                                            <Button
                                                                variant="outlined"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    px: 2,
                                                                    borderRadius: '30px',
                                                                    fontSize: '12px',
                                                                    color: '#E60154',
                                                                    fontWeight: '600',
                                                                    backgroundColor: '#fcf6f0',
                                                                    border: "none",
                                                                }}
                                                                onClick={() => handleViewClick("pdf", table.filePath)}
                                                            >
                                                                View PDF
                                                            </Button>
                                                        }
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Item>

                                        {/* Bottom "Scheduled For" tag */}
                                        {table.status === "schedule" && (
                                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "0px" }}>
                                                <Box
                                                    sx={{
                                                        width: "200px",
                                                        backgroundColor: '#F1EAFC',
                                                        p: 0.3,
                                                        mr: "15px",
                                                        borderRadius: "0px 0px 5px 5px",
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "600",
                                                            fontSize: "12px",
                                                            color: "#8338EC",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                height: '8px',
                                                                width: '8px',
                                                                backgroundColor: '#8338EC',
                                                                borderRadius: '50%',
                                                                display: 'inline-block',
                                                                marginRight: '6px',
                                                            }}
                                                        />
                                                        Scheduled For {table.scheduleOn}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
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
            <Dialog
                open={openPdf}
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
                <iframe
                    src={imageUrl}
                    title="PDF Preview"
                    style={{
                        width: '80vw',
                        height: '80vh',
                        border: 'none',
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
