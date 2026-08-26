import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoyIcon from "@mui/icons-material/Boy";
import Person4Icon from "@mui/icons-material/Person4";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { DASH, RADIUS, EmptyNote, PageHeader, SectionTitle } from "../DashBoardComps/dashboardTheme";

// Each chip is a real destination rather than a label. `needs` lists the
// permission keys that open that route - matching Router.js exactly - so a chip
// is only offered when it would actually take you somewhere.
const items = [
    {
        accent: "#E30053",
        icon: BoyIcon,
        text: "Student Management",
        desc: "Admissions, personal and academic records, documents and siblings.",
        path: "student/information",
        subMenu: "studentmanagement",
        permissionKeys: ["view", "create", "edit", "siblingapproval"],
        links: [
            { label: "Student List", path: "student/information", needs: ["view", "create", "edit", "siblingapproval"] },
            { label: "Create Student", path: "student/information/create", needs: ["create"] },
            { label: "Sibling Map", path: "student/information/merge-sibling", needs: ["siblingapproval"] },
        ],
    },
    {
        accent: "#8600BB",
        icon: Person4Icon,
        text: "Staff Management",
        desc: "Staff profiles, designation and category, employment details.",
        path: "staff",
        subMenu: "staffmanagement",
        permissionKeys: ["view", "create", "edit"],
        links: [
            { label: "Staff List", path: "staff", needs: ["view", "create", "edit"] },
            { label: "Add Staff", path: "staff/create", needs: ["create"] },
        ],
    },
];

export default function ProfileManagement() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);

    const permsFor = (subMenu) =>
        findSubMenuPermissions(user.permissions, "profilemanagement", subMenu) || null;

    const holdsAny = (perms, keys) => !!perms && keys.some((k) => perms[k] === "Y");

    const visibleItems = items
        .map((item) => {
            const perms = permsFor(item.subMenu);
            return { ...item, perms, links: item.links.filter((l) => holdsAny(perms, l.needs)) };
        })
        .filter((item) => holdsAny(item.perms, item.permissionKeys));

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
            }}
        >
            <PageHeader
                title="Profile Management"
                subtitle="Student and staff records"
                onBack={() => navigate(-1)}
            />

            <SectionTitle icon={BadgeOutlinedIcon}>Records</SectionTitle>

            {visibleItems.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have access to student or staff records." />
                </Box>
            )}

            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Grid key={item.subMenu} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Box
                                sx={{
                                    bgcolor: `${item.accent}0A`,
                                    borderTop: `1px solid ${item.accent}38`,
                                    borderLeft: `1px solid ${item.accent}38`,
                                    borderRadius: RADIUS,
                                    boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                    p: 1.4,
                                    transition: "box-shadow 0.2s ease",
                                    "&:hover": {
                                        boxShadow: "0 4px 16px rgba(17,24,39,0.10)",
                                        ".pmArrow": { transform: "translateX(3px)", opacity: 1 },
                                        borderBottom: `1px solid ${item.accent}38`,
                                        borderRight: `1px solid ${item.accent}38`,
                                    },
                                }}
                            >
                                {/* The head opens the module. It is a sibling of the chips below
                                    rather than wrapping them - an anchor inside an anchor is invalid
                                    markup and the outer one swallows the inner click. */}
                                <Link
                                    to={item.path}
                                    state={{ value: "Y" }}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: "50%",
                                                bgcolor: `${item.accent}14`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon sx={{ color: item.accent, fontSize: 19 }} />
                                        </Box>

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                                    {item.text}
                                                </Typography>
                                                <ArrowForwardIcon
                                                    className="pmArrow"
                                                    sx={{
                                                        fontSize: 16,
                                                        color: item.accent,
                                                        opacity: 0.45,
                                                        transition: "transform 0.2s ease, opacity 0.2s ease",
                                                        ml: "auto",
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.3, lineHeight: 1.45 }}>
                                                {item.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Link>

                                {/* Shortcuts straight into the screens behind this module */}
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.9 }}>
                                    {item.links.map((l) => (
                                        <Link
                                            key={l.path}
                                            to={l.path}
                                            state={{ value: "Y" }}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <Box
                                                sx={{
                                                    px: 0.85,
                                                    py: 0.25,
                                                    borderRadius: "20px",
                                                    bgcolor: `${item.accent}0F`,
                                                    border: `1px solid ${item.accent}24`,
                                                    cursor: "pointer",
                                                    transition: "background-color 0.15s ease, border-color 0.15s ease",
                                                    "&:hover": {
                                                        bgcolor: `${item.accent}1F`,
                                                        borderColor: `${item.accent}59`,
                                                    },
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: item.accent }}>
                                                    {l.label}
                                                </Typography>
                                            </Box>
                                        </Link>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
