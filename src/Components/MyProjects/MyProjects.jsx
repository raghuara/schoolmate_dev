import { Box, Button, Grid } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { findSubMenuPermissions, hasAnyPermission, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, mustRequestApproval, selectApprovalMatrix, selectApprovalMatrixReady } from "../../Redux/Slices/approvalMatrixSlice";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import MessageIcon from "@mui/icons-material/Message";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AppsIcon from "@mui/icons-material/Apps";
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from "../DashBoardComps/dashboardTheme";

const items = [
    {
        accent: "#A749CC",
        icon: NewspaperIcon,
        text: "News",
        desc: "News posts you have created for the school.",
        path: "/dashboardmenu/news",
        mainMenu: "communication",
        subMenu: "news",
        flowKey: APPROVAL_SUBMENUS.NEWS,
        statusPath: "/dashboardmenu/status/news",
    },
    {
        accent: "#ED9146",
        icon: MessageIcon,
        text: "Messages",
        desc: "Messages you have sent to parents and staff.",
        path: "/dashboardmenu/messages",
        mainMenu: "communication",
        subMenu: "message",
        flowKey: APPROVAL_SUBMENUS.MESSAGE,
        statusPath: "/dashboardmenu/status/messages",
    },
    {
        accent: "#7DC353",
        icon: StickyNote2Icon,
        text: "Circulars",
        desc: "Circulars you have issued to grades and sections.",
        path: "/dashboardmenu/circulars",
        mainMenu: "communication",
        subMenu: "circular",
        flowKey: APPROVAL_SUBMENUS.CIRCULAR,
        statusPath: "/dashboardmenu/status/circulars",
    },
    {
        accent: "#E10052",
        icon: MenuBookIcon,
        text: "Homeworks",
        desc: "Homework you have assigned to your classes.",
        path: "/dashboardmenu/homework",
        mainMenu: "communication",
        subMenu: "homework",
        flowKey: APPROVAL_SUBMENUS.HOMEWORK,
        statusPath: "/dashboardmenu/status/homework",
    },
    {
        accent: "#1F73C2",
        icon: LibraryBooksIcon,
        text: "Study Materials",
        desc: "Study material you have shared with students.",
        path: "/dashboardmenu/studymaterials",
        mainMenu: "communication",
        subMenu: "studymaterial",
    },
    {
        accent: "#0891B2",
        icon: AssignmentTurnedInIcon,
        text: "Work Done",
        desc: "Your day to day work entries and settings.",
        path: "/dashboardmenu/workdone",
        mainMenu: "myprojects",
        subMenu: "workdone",
    },
];

export default function MyProjectPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const matrixReady = useSelector(selectApprovalMatrixReady);

    // My Projects lists what this user has created, so a module only belongs
    // here if they can create in it. Work Done is the exception - it lives under
    // myprojects with its own operations rather than a create flag.
    const rbacReady = (user?.permissions?.mainMenus || []).length > 0;
    const canOpen = (item) => {
        if (!rbacReady) return true;
        if (item.mainMenu === "myprojects") {
            return hasAnyPermission(user.permissions, "myprojects", item.subMenu);
        }
        return findSubMenuPermissions(user.permissions, item.mainMenu, item.subMenu)?.create === "Y";
    };

    // Approval Status lists work you sent for approval. The button follows the
    // same rule as the page's cards: you must be able to create in a module AND
    // your work there must actually queue. Level 1 posts straight out, and a
    // module with no flow never queues, so both give an empty page - hide the
    // button rather than open one.
    const tracksApproval = ([mainMenu, subMenu, flowKey]) =>
        findSubMenuPermissions(user.permissions, mainMenu, subMenu)?.create === "Y"
        && mustRequestApproval(approvalMatrix, flowKey, userTypeID);

    const canSeeApprovalStatus = !rbacReady || (matrixReady && [
        ["communication", "news", APPROVAL_SUBMENUS.NEWS],
        ["communication", "message", APPROVAL_SUBMENUS.MESSAGE],
        ["communication", "circular", APPROVAL_SUBMENUS.CIRCULAR],
        ["communication", "homework", APPROVAL_SUBMENUS.HOMEWORK],
        ["feeandfinance", "createfeesstructure", APPROVAL_SUBMENUS.FEE_STRUCTURE],
    ].some(tracksApproval));

    const statusLinks = (item) => {
        if (!item.flowKey) return [];
        if (!rbacReady) return [{ label: "Approval Status", path: item.statusPath }];
        if (!matrixReady) return [];
        return tracksApproval([item.mainMenu, item.subMenu, item.flowKey])
            ? [{ label: "Approval Status", path: item.statusPath }]
            : [];
    };

    const visibleItems = items
        .filter(canOpen)
        .map((item) => ({ ...item, links: statusLinks(item) }));

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
                title="My Projects"
                subtitle="Everything you have created, by module"
                onBack={() => navigate(-1)}
                right={canSeeApprovalStatus && (
                    <Button
                        component={Link}
                        to="/dashboardmenu/status"
                        disableElevation
                        startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: "none",
                            fontSize: "13px",
                            fontWeight: 700,
                            height: 34,
                            px: 1.8,
                            borderRadius: RADIUS,
                            color: "#8338EC",
                            bgcolor: "#F6F0FE",
                            border: "1px solid #8338EC33",
                            "&:hover": { bgcolor: "#EDE0FC" },
                        }}
                    >
                        Approval Status
                    </Button>
                )}
            />

            <SectionTitle icon={AppsIcon}>Modules</SectionTitle>

            {visibleItems.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have create access in any module yet." />
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
