import { Box, Button, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectVersion } from "../../Redux/Slices/versionSlice";
import Loader from "../Loader";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from "react";
import NewsIcon from "../../Images/Icons/newspaper-check.png";
import MessagesIcon from "../../Images/Icons/message.png";
import CircularsIcon from "../../Images/Icons/circulars.png";
import HomeWorkIcon from "../../Images/Icons/class-homework 1.png";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ApprovalStatusCircularFetch, ApprovalStatusHomeWorkFetch, ApprovalStatusMessageFetch, ApprovalStatusNewsFetch, GetOverallLeaveDetails } from "../../Api/Api";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { findSubMenuPermissions, hasMainMenuAccess } from "../../Redux/Slices/AuthSlice";
import axios from "axios";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EventBusyIcon from '@mui/icons-material/EventBusy';

export default function ApprovalPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [newsIntimation, setNewsIntimation] = useState(false);
    const [messageIntimation, setMessageIntimation] = useState(false);
    const [circularIntimation, setCircularIntimation] = useState(false);
    const [homeworkIntimation, setHomeworkIntimation] = useState(false);
    const [leavePending, setLeavePending] = useState(0);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const permissions = user.permissions;

    // Access comes from the login response, never from userType.
    // Until the backend publishes an "approvals" main menu, the tree is absent
    // and the module stays open; once it arrives, it takes over completely.
    const approvalsMenu = (permissions?.mainMenus || []).find((m) => m.mainMenu === "approvals");
    const rbacReady = Boolean(approvalsMenu);
    const hasApprovalsAccess = !rbacReady || hasMainMenuAccess(permissions, "approvals");

    // A tab is hidden only when the backend explicitly says so. An unknown
    // subMenu name falls through to visible, so a naming mismatch cannot lock
    // an approver out of their own queue.
    const canSeeTab = (subMenu) => {
        if (!rbacReady) return true;
        const perms = findSubMenuPermissions(permissions, "approvals", subMenu);
        if (!perms) return true;
        return Object.values(perms).some((v) => v === "Y");
    };
    const websiteSettings = useSelector(selectWebsiteSettings);
    const version = useSelector(selectVersion);
    const academicYear = useSelector(selectAcademicYear);
    const token = "123"
    const location = useLocation();

    const [value, setValue] = useState(
        location.state?.tabIndex !== undefined
            ? location.state.tabIndex
            : 0
    );

    const tabs = [
        ...(version.LITE && canSeeTab('leave') ? [{ id: 'leave', label: 'Leave' }] : []),
        ...(version.LITE && canSeeTab('communication') ? [{ id: 'communication', label: 'Communication' }] : []),
        ...(version.PRO && canSeeTab('fee') ? [{ id: 'fee', label: 'Fee', sx: { width: "100px" } }] : []),
        ...(canSeeTab('inventory') ? [{ id: 'inventory', label: 'Inventory' }] : []),
        ...(canSeeTab('assets') ? [{ id: 'assets', label: 'Assets' }] : []),
    ];
    const activeTabId = tabs[value]?.id;

    useEffect(() => {
        if (location.state?.tabIndex !== undefined) {
            setValue(location.state.tabIndex);
        }
    }, [location.state]);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetchApprovalData(ApprovalStatusNewsFetch, setNewsIntimation),
            fetchApprovalData(ApprovalStatusMessageFetch, setMessageIntimation),
            fetchApprovalData(ApprovalStatusCircularFetch, setCircularIntimation),
            fetchApprovalData(ApprovalStatusHomeWorkFetch, setHomeworkIntimation),
        ]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    // Pending student-leave count → badge on the Student Leave card.
    useEffect(() => {
        axios.get(GetOverallLeaveDetails, {
            params: { academicYear, status: "pending" },
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setLeavePending(res.data?.cards?.pending || 0))
            .catch((err) => console.error("GetOverallLeaveDetails (count) failed:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const fetchApprovalData = async (endpoint, setIntimation) => {
        try {
            const res = await axios.get(endpoint, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    screen: "approver",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const postData = res.data.post || [];
            const scheduleData = res.data.schedule || [];

            const allData = [...postData, ...scheduleData];
            const filteredData = allData.filter(
                (item) => item.createdByRollNumber !== rollNumber
            );
            setIntimation(filteredData.length > 0);
        } catch (error) {
            console.error(`Error fetching approval from ${endpoint}`, error);
        }
    };

    const items = [
        { color: "#A749CC", icon: NewspaperIcon, text: "News", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'news', intimation: newsIntimation },
        { color: "#ED9146", icon: MessageIcon, text: "Messages", bgColor: "#FCFBF9", iconBgColor: "#FBF4EF", path: 'messages', intimation: messageIntimation },
        { color: "#7DC353", icon: StickyNote2Icon, text: "Circulars", bgColor: "#F9FBF7", iconBgColor: "#F2F8EE", path: 'circulars', intimation: circularIntimation },
        { color: "#E10052", icon: MenuBookIcon, text: "Homework", bgColor: "#FCF8F9", iconBgColor: "#FBEBF1", path: 'homework', intimation: homeworkIntimation },
        // { color: "#E10052", icon: HomeWorkIcon, text: "Fees", bgColor: "#FCF8F9", iconBgColor: "#FBEBF1", path: 'homework', intimation: homeworkIntimation },
    ];

    const leaveItems = [
        { color: "#3457D5", icon: EventBusyIcon, text: "Student Leave Management", bgColor: "#F7F9FE", iconBgColor: "#EAF0FC", path: 'student-leave', intimation: false },
    ];

    const items1 = [
        { color: "#A749CC", icon: SchoolIcon, text: "School Fee", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'school', intimation: newsIntimation },
        { color: "#ED9146", icon: DirectionsBusIcon, text: "Transport Fee", bgColor: "#FCFBF9", iconBgColor: "#FBF4EF", path: 'transport', intimation: messageIntimation },
        { color: "#7DC353", icon: SportsSoccerIcon, text: "ECA  Fee", bgColor: "#F9FBF7", iconBgColor: "#F2F8EE", path: 'eca', intimation: circularIntimation },
        { color: "#E10052", icon: AddBoxIcon, text: "Additional Fee", bgColor: "#FCF8F9", iconBgColor: "#FBEBF1", path: 'additional', intimation: homeworkIntimation },
    ];

    if (!hasApprovalsAccess) {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: "100%", }}>
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 1.5, py:0.9, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container sx={{ width: "100%" }}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center", }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>

                        <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 2 }} >Approvals</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 6,
                            lg: 6
                        }}>

                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="attendance tabs"
                            variant="scrollable"
                            slotProps={{
                                indicator: {
                                  sx: { display: "none" },
                                },
                              }}
                            sx={{
                                backgroundColor: '#fff',
                                minHeight: "10px",
                                borderRadius: "50px",
                                border: "1px solid rgba(0,0,0,0.1)",
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '13px',
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
                                    boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            {tabs.map((tab, i) => (
                                <Tab key={tab.id} label={tab.label} sx={tab.sx || {}} />
                            ))}
                        </Tabs>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Box sx={{  mt: 1 }}>
                    <Box hidden={activeTabId !== 'leave'}>
                        <Box sx={{ display: "flex", justifyContent: "center", height: "70vh", overflowY: "auto" }}>
                            <Grid container spacing={2} sx={{ width: "100%", p: 2 }}>
                                {leaveItems.map((item, index) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <Grid
                                            sx={{ display: "flex", justifyContent: "center" }}
                                            key={index}
                                            size={{ xs: 12, sm: 6, md: 5, lg:3 }}>
                                            <Link
                                                to={item.path}
                                                state={{ tabIndex: 0 }}
                                                style={{ textDecoration: 'none', height: "60px", width: "100%" }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        backgroundColor: item.bgColor,
                                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                                        width: "100%",
                                                        height: "105px",
                                                        borderRadius: "7px",
                                                        cursor: "pointer",
                                                        '&:hover': { '.arrowIcon': { opacity: 1 } },
                                                    }}
                                                >
                                                    {leavePending > 0 && (
                                                        <Box sx={{
                                                            position: "absolute", top: "-8px", right: "-8px",
                                                            minWidth: 20, height: 20, px: 0.6,
                                                            borderRadius: "10px", bgcolor: "#EA580C", color: "#fff",
                                                            fontSize: 10.5, fontWeight: 800,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            zIndex: 1, border: "2px solid #fff",
                                                        }}>
                                                            {leavePending}
                                                        </Box>
                                                    )}
                                                    <Grid container spacing={1} sx={{ height: '100%', px: 2 }}>
                                                        <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} size={{ md: 0.5 }}>
                                                            <Box sx={{ width: '7px', backgroundColor: item.color, height: '100%', position: 'absolute', left: 0, top: 0, borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px' }} />
                                                        </Grid>
                                                        <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} size={{ md: 2 }}>
                                                            <Box sx={{ backgroundColor: item.iconBgColor, borderRadius: "50px", width: "25px", height: "25px", p: 1.3, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                                                            </Box>
                                                        </Grid>
                                                        <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} size={{ md: 7 }}>
                                                            <Typography sx={{ fontWeight: "600", color: "#000" }}>
                                                                {item.text}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', height: '100%' }} size={{ md: 2 }}>
                                                            <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: item.color }} />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Link>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Box>
                    </Box>
                    <Box hidden={activeTabId !== 'communication'}>
                        <Box sx={{ display: "flex", justifyContent: "center", height: "70vh", overflowY: "auto" }}>
                            <Grid container spacing={2} sx={{ width: "100%", p:2 }}>
                                {items.map((item, index) => {
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
                                            <Link
                                                to={item.path}
                                                state={{ tabIndex: 0 }}
                                                style={{
                                                    textDecoration: 'none',
                                                    height: "60px",
                                                    width: "100%",
                                                }}
                                            >
                                                {/* <Box sx={{ width: "20px", height: "20px", backgroundColor: "black", position: "absolute" }} /> */}
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        backgroundColor: item.bgColor,
                                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                                        width: "100%",
                                                        height: "105px",
                                                        borderRadius: "7px",
                                                        cursor: "pointer",
                                                        '&:hover': {
                                                            '.arrowIcon': {
                                                                opacity: 1,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {
                                                        (item.text === "News" && newsIntimation) ||
                                                            (item.text === "Messages" && messageIntimation) ||
                                                            (item.text === "Homework" && homeworkIntimation) ||
                                                            (item.text === "Circulars" && circularIntimation) ? (
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: "-4px",
                                                                    right: "-4px",
                                                                    width: "12px",
                                                                    height: "12px",
                                                                    backgroundColor: "#f00",
                                                                    borderRadius: "50%",
                                                                    zIndex: 1,
                                                                    border: "2px solid #fff",
                                                                }}
                                                            />
                                                        ) : null}

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
                                            </Link>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Box>
                    </Box>
                    <Box hidden={activeTabId !== 'fee'}>
                        <Box sx={{ display: "flex", justifyContent: "center", height: "70vh", overflowY: "auto" }}>
                            <Grid container spacing={2} sx={{ width: "100%", p:2 }}>
                                {items1.map((item, index) => {
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
                                            <Link
                                                to={item.path}
                                                state={{ tabIndex: 1 }}
                                                style={{
                                                    textDecoration: 'none',
                                                    height: "60px",
                                                    width: "100%",
                                                }}
                                            >
                                                {/* <Box sx={{ width: "20px", height: "20px", backgroundColor: "black", position: "absolute" }} /> */}
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        backgroundColor: item.bgColor,
                                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                                        width: "100%",
                                                        height: "105px",
                                                        borderRadius: "7px",
                                                        cursor: "pointer",
                                                        '&:hover': {
                                                            '.arrowIcon': {
                                                                opacity: 1,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {
                                                        (item.text === "News" && newsIntimation) ||
                                                            (item.text === "Messages" && messageIntimation) ||
                                                            (item.text === "Homework" && homeworkIntimation) ||
                                                            (item.text === "Circulars" && circularIntimation) ? (
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: "-4px",
                                                                    right: "-4px",
                                                                    width: "12px",
                                                                    height: "12px",
                                                                    backgroundColor: "#f00",
                                                                    borderRadius: "50%",
                                                                    zIndex: 1,
                                                                    border: "2px solid #fff",
                                                                }}
                                                            />
                                                        ) : null}

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
                                            </Link>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}