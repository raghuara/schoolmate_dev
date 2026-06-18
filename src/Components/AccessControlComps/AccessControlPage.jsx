import { Box, Button, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import Loader from "../Loader";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from "react";
import NewsIcon from "../../Images/Icons/newspaper-check.png";
import MessagesIcon from "../../Images/Icons/message.png";
import HomeWorkIcon from "../../Images/Icons/class-homework 1.png";
import { Link, Navigate } from "react-router-dom";
import { ApprovalStatusCircularFetch, ApprovalStatusHomeWorkFetch, ApprovalStatusMessageFetch, ApprovalStatusNewsFetch } from "../../Api/Api";
import axios from "axios";
import Groups2Icon from '@mui/icons-material/Groups2';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


export default function AccessControlPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [newsIntimation, setNewsIntimation] = useState(false);
    const [messageIntimation, setMessageIntimation] = useState(false);
    const [circularIntimation, setCircularIntimation] = useState(false);
    const [homeworkIntimation, setHomeworkIntimation] = useState(false);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const websiteSettings = useSelector(selectWebsiteSettings);
    const token = "123"
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const items = [
        { color: "#A749CC", icon: Groups2Icon, text: "Users", desc: "Manage user accounts, roles and login access.", path: 'users', intimation: newsIntimation },
        // Academics + Student Promotion + Issue TC are restricted to superadmin only
        ...(userType === "superadmin" ? [
            { color: "#ED9146", icon: AutoStoriesIcon, text: "Academics", desc: "Configure classes, sections, subjects and exams.", path: 'academics', intimation: messageIntimation },
            { color: "#7DC353", icon: TrendingUpIcon, text: "Student Promotion", desc: "Promote students to the next academic year.", path: 'student-promotion', intimation: circularIntimation },
            { color: "#D97706", icon: SchoolIcon, text: "Issue TC", desc: "Issue transfer certificates for leaving students.", path: 'issue-tc', intimation: false },
        ] : []),
    ];

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: "100%", }}>
            {isLoading && <Loader />}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "260px" : "80px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                py:1,                
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
            }}>
                <Grid container sx={{ width: "100%" }}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center", }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>

                        <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 2 }} >Access Control</Typography>
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
                </Grid>
            </Box>
            <Box>
                <Box sx={{ px:2, pb:2, pt:"65px" }}>
                    {/* Roles & Permissions — the core module that governs all screen access */}
                    {userType === "superadmin" && (
                        <Link to="roles-permissions" state={{ value: 'N' }} style={{ textDecoration: 'none' }}>
                            <Box
                                sx={{
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: "12px",
                                    mb: 2,
                                    p: 2.5,
                                    pl: 3,
                                    height:75,
                                    background: "linear-gradient(120deg, #EEF2FF 0%, #E0E7FF 100%)",
                                    color: "#1E293B",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 2,
                                    flexWrap: "wrap",  
                                    cursor: "pointer",
                                    boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                    border: "1px solid #C7D2FE",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&::before": { content: '""', position: "absolute", left: 0, top: 0, height: "100%", width: 4, bgcolor: "#4338CA" },
                                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 24px rgba(67,56,202,0.20)" },
                                    "&:hover .openBtn": { transform: "translateX(2px)", boxShadow: "0 6px 16px rgba(67,56,202,0.45)" },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0, }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#fff" }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: "18px", color: "#312E81" }}>Roles &amp; Permissions</Typography>
                                            <Box sx={{ px: 0.9, py: 0.2, borderRadius: "20px", bgcolor: "#4338CA", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>CORE</Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 12.5, color: "#475569", mt: 0.3 }}>
                                            Create dynamic user types and decide who can access which screen across the system.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="openBtn" sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.8, py: 0.8, borderRadius: "50px", bgcolor: "#4338CA", color: "#fff", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 4px 12px rgba(67,56,202,0.30)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
                                    Open
                                    <ArrowForwardIcon sx={{ fontSize: 17 }} />
                                </Box>
                            </Box>
                        </Link>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "center", }}>
                        <Grid container spacing={2} sx={{ width: "100%" }}>
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
                                            state={{ value: 'N' }}
                                            style={{ textDecoration: 'none', width: "100%", display: "flex" }}
                                        >
                                            <Box
                                                sx={{
                                                    position: "relative", overflow: "hidden",
                                                    width: "100%", minHeight: 96,
                                                    display: "flex", flexDirection: "column", justifyContent: "center",
                                                    bgcolor: "#fff",
                                                    border: "1px solid #ECEFF3",
                                                    borderRadius: "10px",
                                                    p: 2, pl: 2.4,
                                                    cursor: "pointer",
                                                    boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
                                                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                                                    "&:hover": {
                                                        transform: "translateY(-3px)",
                                                        boxShadow: `0 10px 24px ${item.color}22`,
                                                        borderColor: `${item.color}55`,
                                                        ".arrowIcon": { opacity: 1, transform: "translateX(0)" },
                                                    },
                                                    "&::before": { content: '""', position: "absolute", left: 0, top: 0, height: "100%", width: 4, bgcolor: item.color },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: "11px", bgcolor: `${item.color}16`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        <IconComponent sx={{ fontSize: 24 }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }} noWrap>{item.text}</Typography>
                                                            <ArrowForwardIcon className="arrowIcon" sx={{ fontSize: 18, color: item.color, opacity: 0, transform: "translateX(-6px)", transition: "opacity 0.25s, transform 0.25s", flexShrink: 0 }} />
                                                        </Box>
                                                        <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.4, lineHeight: 1.4 }}>{item.desc}</Typography>
                                                    </Box>
                                                </Box>
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
    );
}