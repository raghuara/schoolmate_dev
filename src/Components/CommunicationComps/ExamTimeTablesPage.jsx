import { Autocomplete, Box, Button, DialogActions, Dialog, Fab, Grid, IconButton, Paper, Switch, TextField, Typography, ToggleButtonGroup, ToggleButton, styled } from "@mui/material";
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
import { DeleteExamTimeTable, DeleteTimeTable, ExamTimeTableFetch, GettingGrades, TimeTableFetch } from "../../Api/Api";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import NoData from '../../Images/Login/No Data.png'

export default function TimeTablePage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
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
    const [selectedGrade, setSelectedGrade] = useState([]);
    const [examOptions, setExamOptions] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");

    const [view, setView] = useState('grid');

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


    const Item = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(2),
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
    }, [checked, selectedGrade, selectedExam])


    const fetchExamTimeTables = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(ExamTimeTableFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Grade: selectedGrade || "",
                    Exam: selectedExam || "",
                    IsMyProject: isMyProject,
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
        }
    };


    const DeleteTimeTableId = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteExamTimeTable, {
                params: {
                    Id: id
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

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: userType === "teacher" ? 3 : 3
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Exam Time Tables</Typography>
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
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
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
                            </Box>
                        }
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", pb: 1 }}
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
                                    value={grades.find((item) => item.id === selectedGrade) || null}
                                    onChange={(event, newValue) => handleGradeChange(newValue)}
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
                                                fontSize: "13px"
                                            }}
                                        />
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Class"
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
                                    options={examOptions}
                                    getOptionLabel={(option) => option}
                                    onChange={(event, newValue) => setSelectedExam(newValue)}
                                    value={selectedExam}
                                    sx={{ width: "150px" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                                fontSize: "14px",
                                            }}
                                        />
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Exam"
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
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2.5
                        }}>
                        {userType !== "teacher" &&
                            <Button
                                onClick={handleCreateNews}
                                variant="outlined"
                                sx={{
                                    borderColor: "#A9A9A9",
                                    backgroundColor: "#000",
                                    py: 0.3,
                                    width: "180px",
                                    height: "30px",
                                    color: "#fff",
                                    textTransform: "none",
                                    border: "none",

                                }}
                            >
                                <AddIcon sx={{ fontSize: "20px" }} />
                                &nbsp;Exam Tables
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
                                this?</Typography>
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
                                changes to this exam timetable?</Typography>
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
                        <Grid container spacing={3}>
                            {timeTableData && timeTableData.length > 0 ? (
                                timeTableData.map((table, index) => (
                                    <Grid
                                        key={index}
                                        sx={{ position: 'relative' }}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 4
                                        }}>
                                        <Typography sx={{ fontSize: '12px', color: '#595959', pb: 2 }}>
                                            Posted on: {table.postedOn} | {table.day}
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
                                                {getGradeName(table.gradeId)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ border: "1px solid #e7e7e7", borderRadius: "0px 5px 5px 5px" }}>
                                            <Box
                                                sx={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '5px 5px 0px 0px',
                                                    width: '100%',
                                                    py: 1
                                                }}
                                            >
                                                <Typography sx={{ fontSize: '14px', color: '#000', fontWeight: '600', pl: 1 }}>
                                                    {table.exam}
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    '&:hover .overlay': {
                                                        opacity: 1,
                                                    },
                                                }}
                                            >
                                                <img
                                                    src={table.filePath}
                                                    alt={`Timetable for ${table.gradeSection}`}
                                                    width="100%"
                                                    height="271px"
                                                    style={{ borderRadius: '0px 0px 5px 5px' }}
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
                                                        onClick={() => handleViewClick(table.filePath)}
                                                    >
                                                        View Image
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
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
                                    </Grid>
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
                            </Box>
                            )}
                        </Grid>
                    ) : (
                        <Grid container spacing={1.5}>
                             {timeTableData && timeTableData.length > 0 ? (
                                timeTableData.map((table, index) => (
                                <React.Fragment>
                                    <Grid size={12}>
                                        <Typography sx={{
                                            fontSize: "11px",
                                            color: "rgba(0,0,0,0.7)",
                                        }}>
                                            Posted on: {table.postedOn} | {table.day}
                                        </Typography>
                                    </Grid>
                                    <Grid  key={index} size={6} sx={{ mb: 0, mt: 0 }}>
                                        <Box sx={{backgroundColor:"#fff", px:2, py:1 ,border:"1px solid #ccc", borderRadius:"5px"}} >
                                            <Grid container sx={{ py: 1 }}>
                                                <Grid sx={{ display: "flex", alignItems: "center" }} size={{ xs: 12, lg: 6 }}>
                                                    <Typography sx={{ fontSize: '14px', color: '#000', fontWeight: '600' }}>
                                                        {getGradeName(table.gradeId)} : {table.exam}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={{ xs: 12, lg: 6 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: { lg: 'flex-end', xs: "start" }, }}>

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
                                                        <Box sx={{ px: 2 }}>|</Box>
                                                        <Box sx={{ width: "100px", display: "flex", justifyContent: "center" }}>
                                                            <Button
                                                                variant="outlined"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    padding: '2px 15px',
                                                                    borderRadius: '30px',
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
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                        </Box>
                                    </Grid>
                                    {/* <Box sx={{borderTop:"1px solid #C5C5C5", height:"1.5px", width:"100%", my:2}}></Box> */}
                                </React.Fragment>
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
                            </Box>
                            )}
                        </Grid>
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
        </Box>
    );
}
