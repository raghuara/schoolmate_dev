import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { findSubMenuPermissions, hasAnyPermission, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Groups2Icon from "@mui/icons-material/Groups2";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AppsIcon from "@mui/icons-material/Apps";
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from "../DashBoardComps/dashboardTheme";

const MAIN_MENU = "accesscontrol";
const CORE_ACCENT = "#4338CA";

const items = [
    {
        accent: "#A749CC",
        icon: Groups2Icon,
        text: "Users",
        desc: "Manage user accounts, roles and login access.",
        path: "users",
        subMenu: "users",
        links: [
            { label: "User Activity", path: "useractivity", needs: ["allowuseractivity"] },
            { label: "Passwords", path: "password", needs: ["allowpasswordmanagementstudent", "allowpasswordmanagementstaff"] },
        ],
    },
    {
        accent: "#ED9146",
        icon: AutoStoriesIcon,
        text: "Academics",
        desc: "Configure classes, sections, subjects and exams.",
        path: "academics",
        subMenu: "academics",
        links: [
            { label: "Academic Year", path: "academics/academic-year", needs: ["allowacademicyear"] },
            { label: "Class & Section", path: "class-section", needs: ["allowclasssectionmanagement"] },
            { label: "Exams", path: "exam", needs: ["allowexammanagement"] },
            { label: "Subjects", path: "subject", needs: ["allowsubjectmanagement"] },
        ],
    },
    {
        accent: "#7DC353",
        icon: TrendingUpIcon,
        text: "Student Promotion",
        desc: "Promote students to the next academic year.",
        path: "student-promotion",
        subMenu: "studentpromotion",
        links: [],
    },
    {
        accent: "#D97706",
        icon: SchoolIcon,
        text: "Issue TC",
        desc: "Issue transfer certificates for leaving students.",
        path: "issue-tc",
        subMenu: "issuetc",
        links: [],
    },
];

export default function AccessControlPage() {
    const navigate = useNavigate();
    const permissions = useSelector((state) => state.auth.permissions);
    const userTypeID = useSelector(selectUserTypeID);

    // A card appears when its sub menu grants at least one permission in the
    // login response - never on user type.
    const canOpen = (subMenu) => hasAnyPermission(permissions, MAIN_MENU, subMenu);

    const holdsAny = (subMenu, keys) => {
        const perms = findSubMenuPermissions(permissions, MAIN_MENU, subMenu);
        return !!perms && keys.some((k) => perms[k] === "Y");
    };

    const visibleItems = items
        .filter((item) => canOpen(item.subMenu))
        .map((item) => ({ ...item, links: item.links.filter((l) => holdsAny(item.subMenu, l.needs)) }));

    // Roles & Permissions decides what every other screen may do, including this
    // one, so it is not a grantable permission - it is reserved for the Super
    // Admin user type (ID 1). userTypeID is the numeric id from the login
    // response, not the display name, so it is safe to compare.
    const canManageRoles = Number(userTypeID) === 1;

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            <PageHeader
                title="Access Control"
                subtitle="Roles, users and academic setup"
                onBack={() => navigate(-1)}
            />

            {canManageRoles && (
                <>
                    <SectionTitle icon={ShieldOutlinedIcon}>Core</SectionTitle>

                    <Link to="roles-permissions" state={{ value: "Y" }} style={{ textDecoration: "none", display: "block" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.6,
                                flexWrap: "wrap",
                                bgcolor: `${CORE_ACCENT}0A`,
                                borderTop: `1px solid ${CORE_ACCENT}38`,
                                borderLeft: `1px solid ${CORE_ACCENT}38`,
                                borderBottom: "1px solid transparent",
                                borderRight: "1px solid transparent",
                                borderRadius: RADIUS,
                                boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                p: 1.6,
                                mb: 1,
                                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                                "&:hover": {
                                    boxShadow: "0 4px 16px rgba(17,24,39,0.10)",
                                    borderBottomColor: `${CORE_ACCENT}38`,
                                    borderRightColor: `${CORE_ACCENT}38`,
                                    ".acOpen": { transform: "translateX(3px)" },
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    bgcolor: `${CORE_ACCENT}14`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <AdminPanelSettingsIcon sx={{ fontSize: 22, color: CORE_ACCENT }} />
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink }}>
                                        Roles &amp; Permissions
                                    </Typography>
                                    <Box
                                        sx={{
                                            px: 0.8,
                                            borderRadius: "20px",
                                            bgcolor: `${CORE_ACCENT}1F`,
                                            border: `1px solid ${CORE_ACCENT}3D`,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: CORE_ACCENT, lineHeight: "16px", letterSpacing: 0.5 }}>
                                            CORE
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.3, lineHeight: 1.45 }}>
                                    Create dynamic user types and decide who can access which screen across the system.
                                </Typography>
                            </Box>

                            <Box
                                className="acOpen"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    px: 1.4,
                                    py: 0.5,
                                    borderRadius: "20px",
                                    bgcolor: CORE_ACCENT,
                                    flexShrink: 0,
                                    transition: "transform 0.2s ease",
                                }}
                            >
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#fff" }}>Open</Typography>
                                <ArrowForwardIcon sx={{ fontSize: 15, color: "#fff" }} />
                            </Box>
                        </Box>
                    </Link>
                </>
            )}

            <SectionTitle icon={AppsIcon}>Modules</SectionTitle>

            {visibleItems.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have access to any access control screen." />
                </Box>
            )}

            <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
                {visibleItems.map((item) => (
                    <Grid
                        key={item.subMenu}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        sx={{ display: "flex" }}
                    >
                        <ModuleCard
                            accent={item.accent}
                            icon={item.icon}
                            title={item.text}
                            desc={item.desc}
                            to={item.path}
                            links={item.links}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
