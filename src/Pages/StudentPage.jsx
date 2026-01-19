import { Box, Button, Divider, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../Redux/Slices/websiteSettingsSlice";
import Loader from "../Components/Loader";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState } from "react";
import FolderIcon from "../Images/Icons/folder-information-outline.png";
import StudentIcon from "../Images/Icons/student-management-4 1.png";
import ChartIcon from "../Images/Icons/chart-timeline.png";
import CreditIcon from "../Images/Icons/credit-card-settings-outline.png";
import BusIcon from "../Images/Icons/bus-marker.png";
import SchoolIcon from "../Images/Icons/school-outline.png";
import { Link } from "react-router-dom";

const items = [
    { color: "#E30053", icon: StudentIcon, text: "Admission", text2: "New student entries and admission forms", bgColor: "#FCF8F9", iconBgColor: "#fbebf1", path: '/dashboardmenu/soon', disabled: true },
    { color: "#8600BB", icon: FolderIcon, text: "Student Info", text2: "Manage Student Data & Academic History", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'information', disabled: false },
    { color: "#FF0004", icon: ChartIcon, text: "Attendance", text2: "Daily Attendance Records & Reports", bgColor: "#FDF5F5", iconBgColor: "#FDE9E9", path: '/dashboardmenu/soon', disabled: true },
    { color: "#E7C101", icon: SchoolIcon, text: "LMS", text2: "Access Learning Materials & Assignments", bgColor: "#FCFBF8", iconBgColor: "#FCF9EB", path: '/dashboardmenu/soon', disabled: true },
];

const items1 = [
    { color: "#DA701A", icon: CreditIcon, text: "Fee & Finance", text2: "Configure fees, manage transactions, and track dues.", bgColor: "#FCF9F6", iconBgColor: "#FBF3ED", path: 'fee', disabled: false },
    { color: "#8600BB", icon: FolderIcon, text: "Fees Concession", text2: "Maintain concession students list & detail", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'fee', disabled: true },
    { color: "#7DC353", icon: BusIcon, text: "Transport", text2: "Assign routes and track bus details", bgColor: "#F9FBF7", iconBgColor: "#F2F8EE", path: '/dashboardmenu/soon', disabled: true },
];

// const items2 = [
//     { color: "#8600BB", icon: FolderIcon, text: "Concession", text2: "Apply discounts or fee relaxations", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'information', disabled: true },
//     { color: "#DA701A", icon: CreditIcon, text: "RTE", text2: "Manage Rights to Education records", bgColor: "#FCF9F6", iconBgColor: "#FBF3ED", path: 'fee', disabled: true },
// ];

export default function StudentPage() {
    const [isLoading, setIsLoading] = useState(false);
    const websiteSettings = useSelector(selectWebsiteSettings);
    return (
        <Box sx={{ width: "100%", borderRadius: "15px", border: "1px solid #DFDFDF", minHeight:"91vh" }}>
            {isLoading && <Loader />}
            <Box sx={{ px: 2, pt: 2, borderRadius: "10px 10px 10px 0px", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center", }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Student Management</Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ pt: 2 }} />
            </Box>
            <Box>
                <Box sx={{ px: 2, mt: 2 }}>
                    <Box >
                        <Box sx={{ border: "1px solid #DFDFDF", borderRadius: "5px", p: 1 }}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "600", pb: 2 }}>General</Typography>
                            <Grid container spacing={2} >
                                {items.map((item, index) => (
                                    <Grid
                                    sx={{ display: "flex", justifyContent: "center", pb: 6, mb: 1 }}
                                        key={index}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 4,
                                            lg: 3
                                        }}>
                                        <Link
                                            to={item.disabled ? "#" : item.path}
                                            state={{ value: 'Y' }}
                                            style={{
                                                textDecoration: 'none',
                                                height: "60px",
                                                width: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: item.bgColor,
                                                    width: "100%",
                                                    height: "115px",
                                                    borderRadius: "7px",
                                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                                    opacity: item.disabled ? 0.5 : 1,
                                                    '&:hover': {
                                                        '.arrowIcon': {
                                                            opacity: item.disabled ? 0 : 1,
                                                        },
                                                    },
                                                }}
                                            >

                                                <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                                                    <Grid
                                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                        size={{
                                                            md: 3
                                                        }}>
                                                        <Box sx={{
                                                            backgroundColor: item.iconBgColor,
                                                            borderRadius: "50px",
                                                            width: "25px",
                                                            height: "25px",
                                                            p: 1.3
                                                        }}>
                                                            <img src={item.icon} width={25} height={25} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                        size={{
                                                            md: 6
                                                        }}>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: "600", color: "#000", pl: 1 }}>
                                                                {item.text}
                                                            </Typography>
                                                            <Typography sx={{ fontSize:"11px", color: "#767676", pl: 1 }}>
                                                                {item.text2}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: "center",
                                                            alignItems: 'center',
                                                            height: '100%'
                                                        }}
                                                        size={{
                                                            md: 3
                                                        }}>
                                                        <ArrowForwardIcon className="arrowIcon" sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                            color: item.color,
                                                        }} />
                                                    </Grid>
                                                </Grid>

                                            </Box>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                        <Box sx={{ border: "1px solid #DFDFDF", borderRadius: "5px", p: 1, mt:2}}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "600", pb: 2 }}>Fee & Transport</Typography>
                            <Grid container spacing={2} >
                                {items1.map((item, index) => (
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "center", pb: 6, mb: 1 }}
                                        key={index}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 4,
                                            lg: 3
                                        }}>
                                        <Link
                                            to={item.disabled ? "#" : item.path}
                                            state={{ value: 'Y' }}
                                            style={{
                                                textDecoration: 'none',
                                                height: "60px",
                                                width: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: item.bgColor,
                                                    width: "100%",
                                                    height: "115px",
                                                    borderRadius: "7px",
                                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                                    opacity: item.disabled ? 0.5 : 1,
                                                    '&:hover': {
                                                        '.arrowIcon': {
                                                            opacity: item.disabled ? 0 : 1,
                                                        },
                                                    },
                                                }}
                                            >

                                                <Grid container spacing={2} sx={{ height: '100%', px: 2, }}>
                                                    <Grid
                                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                        size={{
                                                            md: 3,
                                                            xs: 3,
                                                        }}>
                                                        <Box sx={{
                                                            backgroundColor: item.iconBgColor,
                                                            borderRadius: "50px",
                                                            width: "25px",
                                                            height: "25px",
                                                            p: 1.3
                                                        }}>
                                                            <img src={item.icon} width={25} height={25} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                        size={{
                                                            md: 6,
                                                            xs: 3,
                                                        }}>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: "600", color: "#000", pl: 1 }}>
                                                                {item.text}
                                                            </Typography>
                                                            <Typography sx={{ fontSize:"11px", color: "#767676", pl: 1 }}>
                                                                {item.text2}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: "center",
                                                            alignItems: 'center',
                                                            height: '100%'
                                                        }}
                                                        size={{
                                                            md: 3,
                                                            xs: 3,
                                                        }}>
                                                        <ArrowForwardIcon className="arrowIcon" sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                            color: item.color,
                                                            fontSize: { xs: "18px", sm: "20px" },
                                                        }} />
                                                    </Grid>
                                                </Grid>

                                            </Box>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                        {/* <Box sx={{ border: "1px solid #DFDFDF", borderRadius: "5px", p: 1, my:2 }}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "600", pb: 2 }}>Consession</Typography>
                            <Grid container spacing={2} >
                                {items2.map((item, index) => (
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "center", py: 6, mt: 1 }}
                                        key={index}
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3,
                                            lg: 3
                                        }}>
                                        <Link
                                            to={item.disabled ? "#" : item.path}
                                            state={{ value: 'Y' }}
                                            style={{
                                                textDecoration: 'none',
                                                height: "60px",
                                                width: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: item.bgColor,
                                                    width: "100%",
                                                    height: "115px",
                                                    borderRadius: "7px",
                                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                                    opacity: item.disabled ? 0.5 : 1,
                                                    '&:hover': {
                                                        '.arrowIcon': {
                                                            opacity: item.disabled ? 0 : 1,
                                                        },
                                                    },
                                                }}
                                            >

                                                <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                                                    <Grid
                                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                        size={{
                                                            md: 3
                                                        }}>
                                                        <Box sx={{
                                                            backgroundColor: item.iconBgColor,
                                                            borderRadius: "50px",
                                                            width: "25px",
                                                            height: "25px",
                                                            p: 1.3
                                                        }}>
                                                            <img src={item.icon} width={25} height={25} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                        size={{
                                                            md: 6
                                                        }}>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: "600", color: "#000", pl: 1 }}>
                                                                {item.text}
                                                            </Typography>
                                                            <Typography sx={{ fontSize:"11px", color: "#767676", pl: 1 }}>
                                                                {item.text2}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: "center",
                                                            alignItems: 'center',
                                                            height: '100%'
                                                        }}
                                                        size={{
                                                            md: 3
                                                        }}>
                                                        <ArrowForwardIcon className="arrowIcon" sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                            color: item.color,
                                                        }} />
                                                    </Grid>
                                                </Grid>

                                            </Box>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box> */}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}