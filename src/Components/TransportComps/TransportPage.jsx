import { Box, Grid } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AppsIcon from "@mui/icons-material/Apps";
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from "../DashBoardComps/dashboardTheme";

const MAIN_MENU = "transport";

const items = [
    {
        accent: "#A749CC",
        icon: DirectionsBusIcon,
        text: "Vehicle Details",
        desc: "Fleet records, documents and vehicle safety details.",
        path: "details",
        subMenu: "vehicledetails",
        needs: ["view", "create", "edit", "delete"],
        links: [
            { label: "Vehicle List", path: "details", needs: ["view", "create", "edit", "delete"] },
            { label: "Add Vehicle", path: "details/add", needs: ["create"] },
        ],
    },
    {
        accent: "#ED9146",
        icon: AltRouteIcon,
        text: "Route Management",
        desc: "Routes, stops and the vehicle running each trip.",
        path: "route",
        subMenu: "routemanagement",
        needs: ["view", "create", "edit", "delete"],
        links: [
            { label: "Route List", path: "route", needs: ["view", "create", "edit", "delete"] },
        ],
    },
    {
        accent: "#7DC353",
        icon: HowToRegIcon,
        text: "Transport Student Mapping",
        desc: "Assign students to a route, stop and vehicle.",
        path: "student-map",
        subMenu: "studentmapping",
        needs: ["allowstudentmapping", "allowediting"],
        links: [
            { label: "Mapped Students", path: "student-map", needs: ["allowstudentmapping", "allowediting"] },
        ],
    },
];

export default function TransportPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);

    const permsFor = (subMenu) => findSubMenuPermissions(user.permissions, MAIN_MENU, subMenu) || null;

    const holdsAny = (perms, keys) => !!perms && keys.some((k) => perms[k] === "Y");

    const visibleItems = items
        .map((item) => {
            const perms = permsFor(item.subMenu);
            return { ...item, perms, links: item.links.filter((l) => holdsAny(perms, l.needs)) };
        })
        .filter((item) => holdsAny(item.perms, item.needs));

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
                title="Transport"
                subtitle="Vehicles, routes and student mapping"
                onBack={() => navigate(-1)}
            />

            <SectionTitle icon={AppsIcon}>Modules</SectionTitle>

            {visibleItems.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have access to any transport records." />
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
