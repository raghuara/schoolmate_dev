import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, createTheme, Dialog, DialogActions, Fab, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { ConsentFormFetchAll, DeleteNewsApi, } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ImageIcon from '@mui/icons-material/Image';
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import NoData from '../../../Images/Login/No Data.png'

export default function ResponsesPage() {
    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [allData, setAllData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const token = '123';
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState('');
    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [expanded, setExpanded] = useState(false);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const [currentPage, setCurrentPage] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
        setExpanded(false)
        setRowsPerPage(5)
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
    };

    const handleChangePage = (event, newPage, itemIndex) => {
        setCurrentPage((prev) => ({ ...prev, [itemIndex]: newPage }));
    };

    const handleChangeRowsPerPage = (event, itemIndex) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage((prev) => ({ ...prev, [itemIndex]: 0 }));
    };
    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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

    const filteredData = allData.filter((dateGroup) =>
        dateGroup.consentForm.some((dataItem) =>
            dataItem.question.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const handleCreateNews = () => {
        navigate('/dashboardmenu/consentforms/create')
    }


    const handleCloseDialog = (deleted) => {

        setOpenAlert(false);

        if (deleted) {
            DeleteNews(deleteId)
            setOpenAlert(false);
        }
    };

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections[0]);
            setExpanded(false)
            setRowsPerPage(5)
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
            setExpanded(false)
            setRowsPerPage(5)
        }
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
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
        fetchData()
    }, [checked, formattedDate, selectedGradeId, selectedSection])

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(ConsentFormFetchAll, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || '',
                    GradeId: selectedGradeId || "131",
                    Section: selectedSection || "A1"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteNewsApi, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchData();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("News Deleted Successfully");
            console.log('News deleted successfully:', res.data);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete news. Please try again.");
            console.error('Error deleting news:', error);
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
                            md: 4,
                            lg: 4
                        }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/consentforms">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Responses</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", pr: 2 }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 2.5,
                            lg: 2.5
                        }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search form by heading"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                sx: {
                                    padding: "0 10px",
                                    borderRadius: "50px",
                                    height: "28px",
                                    fontSize: "12px",
                                },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
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
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 4,
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
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 1.5
                        }}>
                        <Box>
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
                    </Grid>
                </Grid>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                    <Box sx={{ p: 2, backgroundColor: '#333', }}>
                        <Typography sx={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: "25px",
                            backgroundColor: '#333',
                        }}>
                            Are you sure?
                        </Typography>
                        <Box sx={{
                            textAlign: 'center',
                            color: 'white',
                            backgroundColor: '#333',
                        }}>
                            <Grid container>
                                <Grid
                                    sx={{ display: "flex", alignItems: "center" }}
                                    size={{
                                        lg: 4
                                    }}>
                                    <DeleteOutlineOutlinedIcon style={{ fontSize: "100px" }} />
                                </Grid>
                                <Grid
                                    sx={{ display: "flex", alignItems: "center" }}
                                    size={{
                                        lg: 7
                                    }}>
                                    <p>Do you really want to delete this news?</p>
                                </Grid>
                            </Grid>
                        </Box>
                        <DialogActions sx={{
                            justifyContent: 'center',
                            backgroundColor: '#333',
                        }}>
                            <Button
                                onClick={() => handleCloseDialog(false)}
                                sx={{
                                    textTransform: 'none',
                                    width: "80px",
                                    borderRadius: '30px',
                                    fontSize: '16px',
                                    py: 0.2,
                                    border: '1px solid white',
                                    color: 'white',
                                    fontWeight: "600",
                                }}
                            >
                                No
                            </Button>
                            <Button
                                onClick={() => handleCloseDialog(true)}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    width: "80px",
                                    borderRadius: '30px',
                                    fontSize: '16px',
                                    py: 0.2,
                                    color: websiteSettings.textColor,
                                    fontWeight: "600",
                                }}
                            >
                                Yes
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                <Box>
                    <Box sx={{ p: 2 }}>
                        {filteredData.length > 0 ? (
                            filteredData.map((data, dataIndex) => (
                                <Box key={dataIndex}>
                                    <Typography sx={{ fontSize: '12px', color: '#595959', py: 2 }}>
                                        Posted on: {data.postedOnDate} | {data.postedOnDay}
                                    </Typography>
                                    {data.consentForm
                                        .filter((item) =>
                                            item.question.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((item, itemIndex) => {
                                            return (
                                                <Accordion
                                                    key={itemIndex}
                                                    sx={{ py: 1, mb: 2 }}
                                                    expanded={!!expanded[`panel${dataIndex}-${itemIndex}`]}
                                                    onChange={handleAccordionChange(`panel${dataIndex}-${itemIndex}`)}
                                                >
                                                    <AccordionSummary
                                                        aria-controls={`panel${dataIndex}-${itemIndex}-content`}
                                                        id={`panel${dataIndex}-${itemIndex}-header`}
                                                        sx={{ position: 'relative' }}
                                                    >
                                                        <Grid container>
                                                            <Grid
                                                                size={{
                                                                    lg: 10
                                                                }}>
                                                                <Typography sx={{ fontWeight: '600' }}>
                                                                    {item.heading}
                                                                    <br />
                                                                    <span
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            color: '#595959',
                                                                            fontWeight: '500',
                                                                        }}
                                                                    >
                                                                        Posted by: {item.name} | at: {item.time}
                                                                    </span>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid
                                                                sx={{ display: 'flex', alignItems: 'center' }}
                                                                size={{
                                                                    lg: 2
                                                                }}>
                                                                <Button
                                                                    size="small"
                                                                    onClick={() =>
                                                                        setExpanded((prev) => ({
                                                                            ...prev,
                                                                            [`panel${dataIndex}-${itemIndex}`]:
                                                                                !prev[`panel${dataIndex}-${itemIndex}`],
                                                                        }))
                                                                    }
                                                                    sx={{
                                                                        width: '200px',
                                                                        fontSize: '14px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        color: '#E60154',
                                                                        textTransform: 'none',
                                                                        borderRadius: '50px',
                                                                        backgroundColor: 'rgba(230, 1, 84, 0.1)',
                                                                    }}
                                                                >
                                                                    {!!expanded[`panel${dataIndex}-${itemIndex}`]
                                                                        ? 'View Responses'
                                                                        : 'View Responses'}
                                                                    <span
                                                                        style={{ marginLeft: '5px', display: 'flex', alignItems: 'center' }}
                                                                    >
                                                                        {!!expanded[`panel${dataIndex}-${itemIndex}`] ? (
                                                                            <ExpandLessIcon />
                                                                        ) : (
                                                                            <ExpandMoreIcon />
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ display: "flex", justifyContent: "end", pb: 2 }}>
                                                            <Autocomplete
                                                                disablePortal
                                                                options={['Yes', 'No', 'Nill']}
                                                                value={filter}
                                                                onChange={(event, newValue) => handleFilterChange(newValue)}
                                                                sx={{ width: "200px" }}
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
                                                                        {option}
                                                                    </li>
                                                                )}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        placeholder="Select Filter"
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
                                                        </Box>

                                                        <TableContainer
                                                            sx={{
                                                                border: '1px solid #E8DDEA',
                                                                height: '60vh',
                                                                overflowY: 'auto',
                                                            }}
                                                        >
                                                            <Table stickyHeader sx={{ minWidth: '100%' }}>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        {['S.No', 'Roll Number', 'Student Name', 'Grade', 'Sec', 'Student Picture', 'Responses'].map((header, index) => (
                                                                            <TableCell
                                                                                key={index}
                                                                                sx={{
                                                                                    borderRight: 1,
                                                                                    borderColor: '#E8DDEA',
                                                                                    textAlign: 'center',
                                                                                    backgroundColor: '#faf6fc',
                                                                                }}
                                                                            >
                                                                                {header}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {item.responseAnswers
                                                                        .filter((row) => {
                                                                            if (filter === "") return true;
                                                                            if (filter === "Yes") return row.responses === "Y";
                                                                            if (filter === "No") return row.responses === "N";
                                                                            if (filter === "Nill") return row.responses === null;
                                                                            return true;
                                                                        })
                                                                        .map((row, rowIndex) => (
                                                                            <TableRow key={row.rollNumber}>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    {rowIndex + 1}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    {row.rollNumber}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    {row.studentName}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    {row.class}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    {row.section}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                    }}
                                                                                >
                                                                                    <Button
                                                                                        sx={{ color: '#000', textTransform: 'none' }}
                                                                                        onClick={() => handleViewClick(row.profile)}
                                                                                    >
                                                                                        <ImageIcon sx={{ color: '#000', marginRight: 1 }} />
                                                                                        View
                                                                                    </Button>
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        borderRight: 1,
                                                                                        borderColor: '#E8DDEA',
                                                                                        textAlign: 'center',
                                                                                        color:
                                                                                            row.responses === 'Yes'
                                                                                                ? '#00963C'
                                                                                                : row.responses === 'No'
                                                                                                    ? '#DA0000'
                                                                                                    : '#000',
                                                                                    }}
                                                                                >
                                                                                    {row.responses === "Y" ? "Yes" : row.responses === "N" ? "No" : 'Nill'}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>

                                                    </AccordionDetails>
                                                </Accordion>
                                            );
                                        })}
                                </Box>
                            ))) : (
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
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box>

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
                    '& .MuiPaper-root': {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: 0,
                        padding: 0,
                        overflow: 'visible',
                    },
                }}
                BackdropProps={{
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
            >
                <img
                    src={imageUrl}
                    alt="Popup"
                    style={{
                        width: '25vw',
                        maxHeight: '80vh',
                    }}
                />
                <DialogActions sx={{ padding: 0 }}>
                    <IconButton onClick={handleImageClose} sx={{ position: 'absolute', top: -10, right: -40 }}>
                        <CloseIcon style={{ color: "#fff" }} />
                    </IconButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
