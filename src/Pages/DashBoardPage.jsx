import { Box, Button, createTheme, Grid, IconButton, Tab, Tabs, ThemeProvider, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SliderComponent from "../Components/Slider/SlickSlider";
import BirthdayPage from "../Components/DashBoard/BirthdayPage";
import { DashboardManagement, DashboardNews,  DashboardTeachersAttendance } from "../Api/Api";
import axios from "axios";
import GroupBarChartPage from "../Components/Chart/GroupBarChart";
import dayjs from "dayjs";
import CircularSlider from "../Components/Slider/CircularSlider";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import AddIcon from '@mui/icons-material/Add';
import AttendanceTablePage from "../Components/Chart/GroupTable";

export default function DashBoardPage() {
    const navigate = useNavigate();
    const token = '123';
    const user = useSelector((state) => state.auth);
    const [managementCount, setManagementCount] = useState({
        curriculamManagement: [{ count: 0 }],
        facilitiesManagement: [{ count: 0 }],
        performanceMetrics: [{ count: 0 }],
        parentsFeedback: [{ count: 0 }],
    });
    const [newsDetails, setNewsDetails] = useState([]);
    const [teachersGraphData, setTeachersGraphData] = useState([]);
    const [studentsGraphData, setStudentsGraphData] = useState([]);
    const [circularDetails, setCircularDetails] = useState([]);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);


    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const handleOpen1 = () => setOpenCal1(true);
    const handleClose1 = () => setOpenCal1(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(today.format('DD-MM-YYYY'));
    const [selectedDate1, setSelectedDate1] = useState(dayjs());
    const [formattedDate1, setFormattedDate1] = useState(today.format('DD-MM-YYYY'));
    const [openCal, setOpenCal] = useState(false);
    const [openCal1, setOpenCal1] = useState(false);
    const [value, setValue] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState("Nursery");

    const isMobile = useMediaQuery('(max-width:600px)');

    const fadeInLeftToRight = {
        hidden: { opacity: 0, x: -200 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };
    const fadeInLeftToRight1 = {
        hidden: { opacity: 0, x: -200 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
        }
    };
    const fadeInLeftToRight2 = {
        hidden: { opacity: 0, x: -200 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut", delay: 0.4 }
        }
    };
    const fadeInLeftToRight3 = {
        hidden: { opacity: 0, x: -200 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut", delay: 0.6 }
        }
    };

    const fadeUpEffect = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 0.9 }
        },
    };

    const fadeUpEffect1 = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 1.2 }
        },
    };

    const fadeUpEffect2 = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 1.5 }
        },
    };
    const fadeUpEffect3 = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 1.8 }
        },
    };
    const fadeUpEffect4 = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 2.1 }
        },
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

    const handleClick = (value) => {
        navigate("page", { state: { packageType: value } });
    };

    const handleCreateNews = () => {
        navigate('create')
    }

    useEffect(() => {
        fetchNewsData()
    }, []);


    useEffect(() => {
        fetchTeacherGraphData()
    }, [formattedDate1]);

    useEffect(() => {
        fetchManagementCount()
    }, []);

    const fetchManagementCount = async () => {
        try {
            const res = await axios.get(DashboardManagement, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setManagementCount(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchNewsData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(DashboardNews, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const formattedNewsDetails = res.data.newsDetails.map(item => ({
                heading: item.headline,
                content: item.newscontent,
                posted: item.postedOn,
                image: item.filepath,
                count: item.count,
                fileType: item.filetype
            }));

            const formattedCircularDetails = res.data.circularDetails.map(item => ({
                heading: item.headline,
                content: item.circularcontent,
                posted: item.postedOn,
                image: item.filepath,
                count: item.count,
                fileType: item.filetype
            }));

            setNewsDetails(formattedNewsDetails);
            setCircularDetails(formattedCircularDetails);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    };

    const fetchTeacherGraphData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(DashboardTeachersAttendance, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate1,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setTeachersGraphData(res.data.teacher_attendance);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <Box sx={{ backgroundColor: "#FFFDF7", width: "100%" }}>
            {/* {isLoading && 
                <Loader /> } */}
            <Box sx={{ backgroundColor: "#F6F6F8", padding: 2, borderRadius: "10px 10px 10px 0px" }}>
                {userType !== "teacher" &&
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontWeight: "600" }} mb={2} variant="h5">Management</Typography>
                            {(userType === "superadmin" || userType === "admin") &&
                                <Button
                                    onClick={handleCreateNews}
                                    variant="outlined"
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        backgroundColor: "#000",
                                        py: 0.3,
                                        width: "150px",
                                        height: "30px",
                                        color: "#fff",
                                        textTransform: "none",
                                        border: "none",

                                    }}
                                >
                                    <AddIcon sx={{ fontSize: "20px" }} />
                                    &nbsp;Carousel Post
                                </Button>
                            }
                        </Box>
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 3
                                }}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInLeftToRight}
                                >
                                    <Box sx={{
                                        backgroundColor: "#F4EBF0", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer",
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }} onClick={() => handleClick("lite")}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#D5004D',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600", display: 'flex', py:1.6, justifyContent: 'space-between', alignItems: 'center' }}>
                                            Schoolmate - Lite
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#D5004D" }} />
                                            </Box>
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 3
                                }}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInLeftToRight1}
                                >
                                    <Box sx={{
                                        backgroundColor: "#EBF2F0", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer",
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }

                                    }} onClick={() => handleClick("pro")}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#2BA95A',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600",py:1.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Schoolmate - Pro
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>
                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#2BA95A" }} />
                                            </Box>
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>


                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 3
                                }}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInLeftToRight2}
                                >
                                    <Box sx={{
                                        backgroundColor: "#F1EDF5", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer",
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }} onClick={() => handleClick("plus")}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#984FC0',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600",py:1.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Schoolmate - Plus
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#984FC0" }} />
                                            </Box>
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>


                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 3
                                }}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInLeftToRight3}
                                >
                                    <Box sx={{
                                        backgroundColor: "#F4EBF0", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer",
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }} onClick={() => handleClick("premium")}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#EF8E15',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600",py:1.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Schoolmate - 360
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#EF8E15" }} />
                                            </Box>
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </>
                }



                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 12,
                            lg: 6
                        }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpEffect}
                        >
                            <Box sx={{ backgroundColor: "#fff", boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)", borderRadius: "6px", mt: 2, px: 1.5, pb: 1.5, pt: 0.6, position: "relative" }}>
                                {/* {newsDetails.length > 0 && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-6px",
                                            width: "15px",
                                            height: "15px",
                                            backgroundImage: "linear-gradient(180deg, #FBAE4E 0%, #EB8200 100%)",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "3px",
                                        }}
                                    >
                                        {newsDetails.length}
                                    </Box>
                                )} */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                        News
                                        <span style={{ fontSize: "11px", color: "#777" }}>
                                            &nbsp; Latest Update
                                        </span>
                                    </Typography>
                                    <Link to="/dashboardmenu/news" style={{ textDecoration: "none" }}>
                                        <Typography
                                            variant="body1"
                                            className="seeAllText"
                                            sx={{
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "end",
                                                transition: "transform 0.3s ease",
                                                cursor: "pointer",
                                                color: '#000',
                                                position: "relative",
                                            }}
                                        >
                                            See all
                                            <ArrowForwardIcon
                                                className="arrowIcon"
                                                sx={{
                                                    opacity: 0,
                                                    transform: "translateX(10px)",
                                                    transition: "opacity 0.3s ease, transform 0.3s ease",
                                                    ml: 0.5,
                                                }}
                                            />
                                        </Typography>
                                    </Link>

                                    <style jsx>{`
                                        .seeAllText {
                                            display: flex;
                                            align-items: center;
                                        }

                                        .seeAllText:hover {
                                            transform: translateX(-12px); 
                                        }

                                        .seeAllText:hover .arrowIcon {
                                            opacity: 1;
                                            transform: translateX(0);
                                        }
                                    `}</style>

                                </Box>
                                <Box sx={{ border: "1px solid #e8e8e8", borderRadius: "6px", }}>
                                    <SliderComponent
                                        items={newsDetails}
                                        title="News"
                                        subtitle="Latest Update"
                                        link="/dashboardmenu/news"
                                    />
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 12,
                            lg: 6
                        }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpEffect1}
                        >
                            <Box sx={{ backgroundColor: "#fff", boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)", borderRadius: "6px", mt: 2, px: 1.5, pb: 1.5, pt: 0.6, position: "relative" }}>
                                {/* {newsDetails.length > 0 && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-6px",
                                            width: "15px",
                                            height: "15px",
                                            backgroundImage: "linear-gradient(180deg, #FBAE4E 0%, #EB8200 100%)",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "3px",
                                        }}
                                    >
                                        3
                                    </Box>
                                )} */}
                                <Box px={1} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                        Circular
                                        <span style={{ fontSize: "11px", color: "#777" }}>
                                            &nbsp; Latest Update
                                        </span>
                                    </Typography>
                                    <Link to="/dashboardmenu/circulars" style={{ textDecoration: "none" }}>
                                        <Typography
                                            variant="body1"
                                            className="seeAllText"
                                            sx={{
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                transition: "transform 0.3s ease",
                                                cursor: "pointer",
                                                color: '#000',
                                            }}
                                        >
                                            See all
                                            <ArrowForwardIcon
                                                className="arrowIcon"
                                                sx={{
                                                    opacity: 0,
                                                    transform: "translateX(5px)",
                                                    transition: "opacity 0.3s ease, transform 0.3s ease",
                                                    ml: 0.5,
                                                }}
                                            />
                                        </Typography>
                                    </Link>
                                    <style jsx>{`
                                .seeAllText:hover {
                                    transform: translateX(-5px); 
                                }
                                .seeAllText:hover .arrowIcon {
                                    opacity: 1; 
                                    transform: translateX(0); 
                                }
                            `}</style>
                                </Box>
                                <Box sx={{ border: "1px solid #e8e8e8", borderRadius: "6px", }}>
                                    <CircularSlider
                                        items={circularDetails}
                                    />
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Bar Chart */}
                <Box mt={2} >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 1.5 }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: "600", pb: 2 }}>
                            Attendance Graph
                        </Typography>
                    </motion.div>

                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 6
                            }}>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeUpEffect2}
                            >
                                <Box sx={{ p: 2, boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)", borderRadius: "6px", backgroundColor: "#fff" }}>
                                    <GroupBarChartPage />
                                </Box>
                            </motion.div>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 6
                            }}>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeUpEffect3}
                            >
                                <AttendanceTablePage />
                            </motion.div>
                        </Grid>
                        {/* {userType !== "teacher" &&
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeUpEffect3}
                                >
                                    <Box sx={{ p: 2, boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)", borderRadius: "6px", backgroundColor: "#fff" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Box>
                                                <Typography sx={{ fontSize: "16px", fontWeight: "600", }}>
                                                    Staffs Attendance
                                                </Typography>
                                                <Typography style={{ fontSize: "12px", color: "#777", display: "inline" }}>
                                                    {dayjs(selectedDate1).format('DD MMMM YYYY')}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: "flex", justifyContent: "end" }}>
                                                <ThemeProvider theme={darkTheme}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            open={openCal1}
                                                            onClose={handleClose1}
                                                            value={selectedDate1}
                                                            onChange={(newValue) => {
                                                                setSelectedDate1(newValue);
                                                                const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                                                setFormattedDate1(newFormattedDate);
                                                                handleClose1();
                                                            }}
                                                            // disableFuture
                                                            views={['year', 'month', 'day']}
                                                            renderInput={() => null}
                                                            sx={{
                                                                opacity: 0,
                                                                pointerEvents: 'none',
                                                                width: "10px",
                                                                marginRight: "80px"
                                                            }}
                                                        />
                                                        <IconButton sx={{
                                                            width: '45px',
                                                            height: '45px',
                                                            marginLeft: '-100px',
                                                            transition: 'color 0.3s, background-color 0.3s',
                                                            '&:hover': {
                                                                color: '#fff',
                                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                            },

                                                        }}
                                                            onClick={handleOpen1}>
                                                            <CalendarMonthIcon style={{ color: "#000" }} />
                                                        </IconButton>
                                                    </LocalizationProvider>
                                                </ThemeProvider>
                                                <Link style={{ textDecoration: "none" }}>
                                                    <Typography
                                                        variant="body1"
                                                        className="seeAllText"
                                                        sx={{
                                                            fontWeight: "600",
                                                            fontSize: "14px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            transition: "transform 0.3s ease",
                                                            cursor: "pointer",
                                                            color: '#000',
                                                            marginTop: "10px"
                                                        }}
                                                    >
                                                        View all
                                                        <ArrowForwardIcon
                                                            className="arrowIcon"
                                                            sx={{
                                                                opacity: 0,
                                                                transform: "translateX(5px)",
                                                                transition: "opacity 0.3s ease, transform 0.3s ease",
                                                                ml: 0.5,
                                                            }}
                                                        />
                                                    </Typography>
                                                </Link>
                                            </Box>
                                        </Box>
                                        <BarChartPage teachersData={teachersGraphData} />
                                    </Box>
                                </motion.div>
                            </Grid>
                        } */}
                    </Grid>
                </Box>
                <Box>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpEffect4}
                    >
                        <BirthdayPage />
                    </motion.div>
                </Box>


            </Box>
        </Box >
    );
}