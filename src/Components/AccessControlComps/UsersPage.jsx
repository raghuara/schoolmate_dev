import { Box, Grid, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { hasPermission } from "../../Redux/Slices/AuthSlice";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppsIcon from '@mui/icons-material/Apps';
import { DASH, RADIUS, BRAND, CARD_DESC_H, PageHeader, SectionTitle, EmptyNote } from "../DashBoardComps/dashboardTheme";
import { ApprovalStatusCircularFetch, ApprovalStatusHomeWorkFetch, ApprovalStatusMessageFetch, ApprovalStatusNewsFetch } from "../../Api/Api";
import axios from "axios";
import HttpsIcon from '@mui/icons-material/Https';
import LoginIcon from '@mui/icons-material/Login';

export default function UsersPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [newsIntimation, setNewsIntimation] = useState(false);
    const [messageIntimation, setMessageIntimation] = useState(false);
    const [circularIntimation, setCircularIntimation] = useState(false);
    const [homeworkIntimation, setHomeworkIntimation] = useState(false);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userName = user.name
    const permissions = useSelector((state) => state.auth.permissions);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const token = "123"

    // Each card follows its own key under accesscontrol > users. Password
    // Management needs only one of the two sides to be allowed.
    const can = (key) => hasPermission(permissions, "accesscontrol", "users", key);
    const canPasswords = can("allowpasswordmanagementstudent") || can("allowpasswordmanagementstaff");

    const items = [
        { color: BRAND.purple.main, icon: LoginIcon, text: "Users Activity", desc: "See who signed in, from where and when across the school.", path: '/dashboardmenu/access/useractivity', show: can("allowuseractivity") },
        { color: BRAND.orange.main, icon: HttpsIcon, text: "Password Management", desc: "Reset or reissue login passwords for staff and students.", path: '/dashboardmenu/access/password', show: canPasswords },
    ].filter((item) => item.show);


    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                minHeight: "100%",
                boxSizing: "border-box",
            }}
        >
            <PageHeader
                title="Users"
                subtitle="Login activity and password control for staff and students"
                onBack={() => navigate("/dashboardmenu/access")}
            />

            <SectionTitle icon={AppsIcon}>Screens</SectionTitle>

            {items.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have access to any user screens." />
                </Box>
            )}

            <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
                {items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <Grid key={item.path} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Link
                                to={item.path}
                                state={{ value: "N" }}
                                style={{ textDecoration: "none", display: "block", height: "100%" }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: `${item.color}0A`,
                                        borderTop: `1px solid ${item.color}38`,
                                        borderLeft: `1px solid ${item.color}38`,
                                        borderBottom: "1px solid transparent",
                                        borderRight: "1px solid transparent",
                                        borderRadius: RADIUS,
                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                        p: 1.4,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 16px rgba(17,24,39,0.10)",
                                            borderBottomColor: `${item.color}38`,
                                            borderRightColor: `${item.color}38`,
                                            ".upArrow": { transform: "translateX(3px)", opacity: 1 },
                                        },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: "50%",
                                                bgcolor: `${item.color}14`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <IconComponent sx={{ color: item.color, fontSize: 19 }} />
                                        </Box>

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "13.5px",
                                                        fontWeight: 700,
                                                        color: DASH.ink,
                                                        minWidth: 0,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {item.text}
                                                </Typography>
                                                <ArrowForwardIcon
                                                    className="upArrow"
                                                    sx={{
                                                        fontSize: 16,
                                                        color: item.color,
                                                        opacity: 0.45,
                                                        transition: "transform 0.2s ease, opacity 0.2s ease",
                                                        ml: "auto",
                                                    }}
                                                />
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: "11.5px",
                                                    color: DASH.muted,
                                                    mt: 0.3,
                                                    lineHeight: 1.45,
                                                    height: CARD_DESC_H,
                                                    display: "-webkit-box",
                                                    WebkitBoxOrient: "vertical",
                                                    WebkitLineClamp: 2,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {item.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Link>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
