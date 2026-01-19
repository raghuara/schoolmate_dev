import { Box, Button, Grid, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import Loader from "../Loader";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState } from "react";
import NewsIcon from "../../Images/Icons/newspaper-check.png";
import MessagesIcon from "../../Images/Icons/message.png";
import CircularsIcon from "../../Images/Icons/circulars.png";
import ConsentFormIcon from "../../Images/Icons/consent.png";
import TimeTableIcon from "../../Images/Icons/timetable.png";
import HomeWorkIcon from "../../Images/Icons/class-homework 1.png";
import ExamIcon from "../../Images/Icons//class-homework 2.png";
import StudyIcon from "../../Images/Icons/book-open-variant-outline.png";
import MarksIcon from "../../Images/Icons/result-audit (1) 1.png";
import CalendarIcon from "../../Images/Icons/calendar-check-outline.png";
import EventsIcon from "../../Images/Icons/microphone-variant.png";
import FeedbackIcon from "../../Images/Icons/comment-quote-outline.png";
import AttendanceIcon from "../../Images/Icons/chart-timeline-variant-shimmer.png";
import { Link, useNavigate } from "react-router-dom";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';



export default function MyProjectPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState(0);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const websiteSettings = useSelector(selectWebsiteSettings);
    const navigate = useNavigate();
    const handleClick = (path) => {
        navigate(path, { state: { value: 'Y' } });
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const items = [
        { color: "#A749CC", icon: NewspaperIcon, text: "News", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: '/dashboardmenu/news', },
        { color: "#ED9146", icon: MessageIcon, text: "Messages", bgColor: "#FCFBF9", iconBgColor: "#FBF4EF", path: '/dashboardmenu/messages' },
        { color: "#7DC353", icon: StickyNote2Icon, text: "Circulars", bgColor: "#F9FBF7", iconBgColor: "#F2F8EE", path: '/dashboardmenu/circulars' },
        // { color: "#F44336", icon: ConsentFormIcon, text: "Consent Forms", bgColor: "#FCF9F8", iconBgColor: "#FAF0EC", path: '/dashboardmenu/consentforms' },

        // { color: "#EFC701", icon: TimeTableIcon, text: "Time Tables", bgColor: "#FCFBF8", iconBgColor: "#FBF8EC", path: '/dashboardmenu/timetables' },
        { color: "#E10052", icon: MenuBookIcon, text: "Homeworks", bgColor: "#FCF8F9", iconBgColor: "#FBEBF1", path: '/dashboardmenu/homework' },
        // { color: "#4C17A3", icon: ExamIcon, text: "Exam Timetables", bgColor: "#FAF9FB", iconBgColor: "#F0ECF6", path: '/dashboardmenu/examtimetables' },
        { color: "#1F73C2", icon: LibraryBooksIcon, text: "Study Materials", bgColor: "#F9FAFC", iconBgColor: "#EEF3F9", path: '/dashboardmenu/studymaterials' },

        // { color: "#073274", icon: MarksIcon, text: "Marks / Results", bgColor: "#F8F9FA", iconBgColor: "#ECEEF3", path: '/dashboardmenu/marks' },
        // { color: "#12A5B6", icon: CalendarIcon, text: "School Calender", bgColor: "#F8FAFA", iconBgColor: "#F0ECF6", path: '/dashboardmenu/schoolcalendar' },
        // { color: "#4C17A3", icon: EventsIcon, text: "Important Events", bgColor: "#FAF9FB", iconBgColor: "#ECF5F6", path: '/dashboardmenu/events' },
        // { color: "#F44336", icon: FeedbackIcon, text: "Feedback", bgColor: "#FCF9F8", iconBgColor: "#FAF0EC", path: '/dashboardmenu/feedback' },
        // { color: "#AA018D", icon: AttendanceIcon, text: "Attendance", bgColor: "#FBF8FA", iconBgColor: "#F8EBF6", path: '/dashboardmenu/attendance' },
    ];
    const filteredItems = userType === "teacher"
        ? items.filter(item => item.text === "Homeworks" || item.text === "Study Materials")
        : items;
    return (
        <Box sx={{ width: "100%", }}>
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", p: 1.5, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center", }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2.5
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 2 }} >My Projects</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 6
                        }}>
                    </Grid>
                    {/* <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 6
                        }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="attendance tabs"
                            variant="scrollable"
                            TabIndicatorProps={{
                                sx: { display: 'none' },
                            }}
                            sx={{
                                backgroundColor: '#fff',
                                minHeight: "10px",
                                borderRadius: "50px",
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    color: '#555',
                                    fontWeight: 'bold',
                                    minWidth: 0,
                                    paddingX: 1,
                                    minHeight: '30px',
                                    height: '30px',
                                    p: 2,
                                    m: 0.8
                                },
                                '& .Mui-selected': {
                                    color: `${websiteSettings.textColor} !important`,
                                    bgcolor: websiteSettings.mainColor,
                                    borderRadius: "50px",
                                },
                            }}
                        >
                            <Tab label="Communication" />
                            <Tab label="Fee" />
                            <Tab label="Inventory" />
                            <Tab label="Assets" />
                        </Tabs>
                    </Grid> */}
                    <Grid
                        sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3.5
                        }}>
                        {(userType === "admin" || userType === "staff") &&
                            <Link to='/dashboardmenu/status'>
                                <Button
                                    sx={{
                                        marginRight: 1,
                                        textTransform: "none",
                                        color: "#8338EC",
                                        backgroundColor: "#FBF9FE",
                                        borderRadius: "30px",
                                        padding: "2px 20px",
                                        border: "1px solid #8338EC5A"
                                    }}>
                                    <Box sx={{
                                        width: "9px",
                                        height: "10px",
                                        backgroundColor: "#8338EC",
                                        borderRadius: "50%",
                                        mr: 1,
                                    }}></Box>
                                    Approval Status
                                </Button>
                            </Link>
                        }
                        {userType !== "teacher" &&
                            <Link to='/dashboardmenu/draft'>
                                <Button
                                    sx={{
                                        marginRight: 1,
                                        textTransform: "none",
                                        backgroundColor: "#FEF7FA",
                                        borderRadius: "30px",
                                        padding: "2px 20px",
                                        color: "#E60154",
                                        border: "1px solid #E601545A"
                                    }}>
                                    <Box sx={{
                                        width: "9px",
                                        height: "10px",
                                        backgroundColor: "#E60154",
                                        borderRadius: "50%",
                                        mr: 1,
                                    }}></Box>
                                    Draft
                                </Button>
                            </Link>
                        }
                    </Grid>
                </Grid>
            </Box>
            <Box>

                <Box hidden={value !== 0} sx={{ p: 2, }}>
                    <Box sx={{  borderRadius: "15px", height: "72vh", overflowY: "auto" }}>
                        <Grid container spacing={2} pt={1} px={1}>
                            {filteredItems.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "center" }}
                                        key={index}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <Box
                                            onClick={() => handleClick(item.path)}
                                            style={{
                                                textDecoration: 'none',
                                                height: "105px",
                                                width: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: item.bgColor,
                                                    width: "100%",
                                                    height: "105px",
                                                    boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                                    position: 'relative',
                                                    borderRadius: "7px",
                                                    cursor: "pointer",
                                                    '&:hover': {
                                                        '.arrowIcon': {
                                                            opacity: 1,
                                                        },
                                                    },
                                                }}
                                            >


                                                <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                                                    <Grid
                                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                        size={{
                                                            md: 0.5
                                                        }}>
                                                        <Box
                                                            sx={{
                                                                width: '7px',
                                                                backgroundColor: item.color,
                                                                height: '100%',
                                                                position: 'absolute',
                                                                left: 0,
                                                                top: 0,
                                                                borderTopLeftRadius: '5px',
                                                                borderBottomLeftRadius: '5px',
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                        size={{
                                                            md: 2
                                                        }}>
                                                        <Box sx={{
                                                            backgroundColor: item.iconBgColor,
                                                            borderRadius: "50px",
                                                            width: "25px",
                                                            height: "25px",
                                                            p: 1.3,
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center"
                                                        }}>
                                                            {/* <img src={item.icon} width={25} height={25} /> */}
                                                            <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                        size={{
                                                            md: 7
                                                        }}>
                                                        <Typography sx={{ fontWeight: "600", color: "#000" }}>
                                                            {item.text}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: "center",
                                                            alignItems: 'center',
                                                            height: '100%'
                                                        }}
                                                        size={{
                                                            md: 2
                                                        }}>
                                                        <ArrowForwardIcon className="arrowIcon" sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                            color: item.color,
                                                        }} />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Box>

                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Box>
                </Box>

                <Box hidden={value !== 1}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "77vh",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: "700",
                                color: "#2C3E50",
                                mb: 2,
                            }}
                        >
                            Coming Soon
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: "16px",
                                color: "#7F8C8D",
                            }}
                        >
                            Exciting updates are on the way! Stay tuned.
                        </Typography>
                    </Box>
                </Box>


                <Box hidden={value !== 2}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "77vh",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: "700",
                                color: "#2C3E50",
                                mb: 2,
                            }}
                        >
                            Coming Soon
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: "16px",
                                color: "#7F8C8D",
                            }}
                        >
                            Exciting updates are on the way! Stay tuned.
                        </Typography>
                    </Box>
                </Box>


                <Box hidden={value !== 3}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "77vh",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: "700",
                                color: "#2C3E50",
                                mb: 2,
                            }}
                        >
                            Coming Soon
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: "16px",
                                color: "#7F8C8D",
                            }}
                        >
                            Exciting updates are on the way! Stay tuned.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
