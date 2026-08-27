import React, { useMemo, useState, useEffect } from "react";
import {
    Box, Grid, Typography, Button, TextField, InputAdornment, IconButton, Switch, Chip,
    Avatar, AvatarGroup, Dialog, DialogTitle, DialogContent, Menu, MenuItem, Divider, Tooltip, CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SnackBar from "../SnackBar";
import { GetUserTypePermissions, UpdateUserTypePermissions, UpdateUsersUserType } from "../../Api/Api";
import { DASH, RADIUS, BRAND, CARD_DESC_H, PageHeader, SectionTitle, EmptyNote } from "../DashBoardComps/dashboardTheme";

const TOKEN = "123";

// Map each UI module to the backend `mainMenu` key returned by GetUserTypePermissions.
const MODULE_TO_MAINMENU = {
    profile: "profilemanagement",
    communication: "communication",
    finance: "feeandfinance",
    leave: "leaveandpayroll",
    transport: "transport",
    myprojects: "myprojects",
    access: "accesscontrol",
};

const ACCENT = "#4338CA";

const DASHBOARD_MAINMENU = "dashboard";
const DASHBOARD_SUBMENU = "overview";

const DASHBOARD_VIEWS = [
    {
        key: "common",
        name: "Common Dashboard",
        caption: "Announcements, timetable, quick actions",
        desc: "Day-to-day landing screen — announcements, timetable, attendance and quick actions.",
        color: DASH.blue,
        icon: SpaceDashboardOutlinedIcon,
        permKey: "allowcommondashboard",
    },
    {
        key: "master",
        name: "Master Dashboard",
        caption: "School-wide KPIs and analytics",
        desc: "Management view — school-wide KPIs, fee collection, payroll and transport analytics.",
        color: DASH.primary,
        icon: InsightsOutlinedIcon,
        permKey: "allowmasterdashboard",
    },
];

const DEFAULT_DASHBOARD_VIEW = "common";

// NOTE: replace with the real feature-list / permissions APIs when ready.
const MODULES = [
    { key: "profile", name: "Profile Management", desc: "Manage student and staff profiles, records, and personal information.", tags: ["Student", "Staff"], color: BRAND.pink.main, icon: BadgeOutlinedIcon },
    { key: "communication", name: "Communication", desc: "School communication and parent engagement tools.", tags: ["News", "Circulars", "Messages"], color: BRAND.blue.main, icon: ForumOutlinedIcon },
    { key: "finance", name: "Fee & Finance", desc: "Handle fee collection, billing, expenses, concessions, and financial operations.", tags: ["Billing", "Expenses", "Concession"], color: BRAND.orange.main, icon: PaymentsOutlinedIcon },
    { key: "leave", name: "Leave & Payroll", desc: "Manage student leave, staff attendance, leave requests, and payroll processing.", tags: ["Student Leave", "Teacher Leave"], color: BRAND.purple.main, icon: ReceiptLongOutlinedIcon },
    { key: "transport", name: "Transport", desc: "Manage vehicles, routes, student transportation, and travel assignments.", tags: ["Vehicles", "Routes"], color: BRAND.green.main, icon: DirectionsBusOutlinedIcon },
    { key: "myprojects", name: "My Projects", desc: "Track staff work done — daily entries, teacher-wise, class-wise, and period settings.", tags: ["Workdone"], color: BRAND.cyan.main, icon: WorkOutlineOutlinedIcon },
    { key: "access", name: "Access Control", desc: "Manage roles, permissions, and who can access which screen.", tags: ["Roles", "Permissions"], color: ACCENT, icon: AdminPanelSettingsOutlinedIcon },
];

const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const roleMembers = (role) =>
    (role?.users || []).map((u) => ({ id: u.rollNumber, name: u.name, rollNumber: u.rollNumber }));

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export default function FeaturePermissionsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || { id: 0, name: "Super Admin", userCount: 5, system: true };
    const allRoles = location.state?.roles || [];
    const isSuperAdmin = (role.name || "").toLowerCase() === "super admin";

    const [search, setSearch] = useState("");
    // Access map — driven by GetUserTypePermissions (super admin always full).
    const [access, setAccess] = useState(() => Object.fromEntries(MODULES.map((m) => [m.key, isSuperAdmin])));
    const [permissions, setPermissions] = useState(null);
    const [loadingPerms, setLoadingPerms] = useState(false);

    const [dashboardView, setDashboardView] = useState(DEFAULT_DASHBOARD_VIEW);
    const [savedDashboardView, setSavedDashboardView] = useState(DEFAULT_DASHBOARD_VIEW);
    const [savingDashboard, setSavingDashboard] = useState(false);

    // Members / move
    const [membersOpen, setMembersOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [moveAnchor, setMoveAnchor] = useState(null);
    const [moveMember, setMoveMember] = useState(null);
    const [movingId, setMovingId] = useState(null);

    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });

    const fetchPermissions = async () => {
        if (role?.id == null) return;
        setLoadingPerms(true);
        try {
            const res = await axios.post(
                GetUserTypePermissions,
                { userTypeID: role.id, userType: role.name },
                { headers: { Authorization: `Bearer ${TOKEN}` } },
            );
            const data = res?.data?.data || null;
            setPermissions(data);

            const dashPerms = (data?.mainMenus || [])
                .find((m) => m.mainMenu === DASHBOARD_MAINMENU)
                ?.subMenus?.find((s) => s.subMenu === DASHBOARD_SUBMENU)?.permissions || null;
            const storedView = DASHBOARD_VIEWS.find((v) => dashPerms?.[v.permKey] === "Y")?.key || DEFAULT_DASHBOARD_VIEW;
            setDashboardView(storedView);
            setSavedDashboardView(storedView);

            const menus = data?.mainMenus || [];
            // A module is enabled if its mainMenu is present in the response (super admin = all on).
            setAccess(Object.fromEntries(MODULES.map((m) => {
                const present = menus.some((x) => x.mainMenu === MODULE_TO_MAINMENU[m.key]);
                return [m.key, isSuperAdmin ? true : present];
            })));
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to load permissions for this user type.", false);
        } finally {
            setLoadingPerms(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role?.id]);

    const toggle = (key) => {
        if (isSuperAdmin) { showSnack("Super Admin always has full access.", false); return; }
        setAccess((prev) => ({ ...prev, [key]: !prev[key] }));
        // TODO: PUT module-access for this role
    };

    const dashboardDirty = dashboardView !== savedDashboardView;
    const activeDashboard = DASHBOARD_VIEWS.find((v) => v.key === dashboardView);

    const saveDashboardView = async () => {
        if (role?.id == null) return;
        setSavingDashboard(true);
        try {
            const payload = {
                data: {
                    userTypeID: role.id,
                    userType: role.name,
                    mainMenus: [{
                        mainMenu: DASHBOARD_MAINMENU,
                        subMenus: [{
                            subMenu: DASHBOARD_SUBMENU,
                            permissions: {
                                view: "Y",
                                ...Object.fromEntries(DASHBOARD_VIEWS.map((v) => [v.permKey, v.key === dashboardView ? "Y" : "N"])),
                            },
                        }],
                    }],
                },
            };
            const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
            const ok = !res?.data || res.data.error === false || res.status === 200;
            if (!ok) { showSnack(res?.data?.message || "Could not save the dashboard view.", false); return; }
            setSavedDashboardView(dashboardView);
            showSnack(res?.data?.message || `${activeDashboard?.name} set for ${role.name}.`);
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to save the dashboard view. Please try again.", false);
        } finally {
            setSavingDashboard(false);
        }
    };

    const filteredModules = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? MODULES.filter((m) => m.name.toLowerCase().includes(q)) : MODULES;
    }, [search]);

    const enabledCount = MODULES.filter((m) => access[m.key]).length;

    const showDashboardPicker = useMemo(() => {
        const q = search.trim().toLowerCase();
        return !q || "dashboard".includes(q) || DASHBOARD_VIEWS.some((v) => v.name.toLowerCase().includes(q));
    }, [search]);

    const openMembers = () => { setMembers(roleMembers(role)); setMembersOpen(true); };
    const openMoveMenu = (e, m) => { setMoveAnchor(e.currentTarget); setMoveMember(m); };
    const closeMoveMenu = () => { setMoveAnchor(null); setMoveMember(null); };
    const handleMove = async (target) => {
        const member = moveMember;
        closeMoveMenu();
        if (!member || target?.id == null) return;
        setMovingId(member.id);
        try {
            const res = await axios.put(
                UpdateUsersUserType,
                { userTypeID: target.id, rollNumbers: [member.rollNumber] },
                { headers: { Authorization: `Bearer ${TOKEN}` } },
            );
            const ok = !res?.data || res.data.error === false || res.status === 200;
            if (!ok) { showSnack(res?.data?.message || "Could not move the user.", false); return; }
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            showSnack(res?.data?.message || `Moved ${member.name} to ${target.name}.`);
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to move the user. Please try again.", false);
        } finally {
            setMovingId(null);
        }
    };

    const memberAvatars = roleMembers(role);

    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, boxSizing: "border-box" }}>
            <SnackBar open={snack.open} color={snack.ok} setOpen={(v) => setSnack((s) => ({ ...s, open: v }))} status={snack.ok} message={snack.msg} />

            <PageHeader
                title="Feature Permissions"
                subtitle={`Access Control / Roles & Permissions / ${role.name}`}
                onBack={() => navigate(-1)}
                right={(
                    <TextField
                        size="small"
                        placeholder="Search by feature name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            width: { xs: 190, sm: 280 },
                            "& .MuiOutlinedInput-root": {
                                height: 34, fontSize: "12.5px", borderRadius: RADIUS, bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                            },
                        }}
                    />
                )}
            />

            {/* Role summary */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap",
                    bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                    boxShadow: "1px 1px 2px 0.5px rgba(0,0,0,0.06)", p: 1.6,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 40, height: 40, borderRadius: "50%", bgcolor: `${ACCENT}14`, color: ACCENT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13.5px", fontWeight: 800, flexShrink: 0,
                        }}
                    >
                        {getInitials(role.name)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink }}>{role.name}</Typography>
                            <Box sx={{ px: 0.8, borderRadius: "20px", bgcolor: DASH.greenLight, border: `1px solid ${DASH.green}3D` }}>
                                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: DASH.green, lineHeight: "16px", letterSpacing: 0.5 }}>ACTIVE</Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.3, lineHeight: 1.45 }}>
                            {isSuperAdmin
                                ? "Full system administration access across SchoolMate. Overrides all module restrictions."
                                : `Controls which screens the ${role.name} role can access.`}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, pl: 2, borderLeft: `1px solid ${DASH.lineSoft}` }}>
                    <Box>
                        <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: DASH.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Users Assigned
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4 }}>
                            <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 9.5, fontWeight: 700, border: "2px solid #fff" } }}>
                                {memberAvatars.slice(0, 4).map((m) => (
                                    <Avatar key={m.id} sx={{ bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                ))}
                            </AvatarGroup>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                                {(role.userCount || 0).toLocaleString()} Users
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        onClick={openMembers}
                        endIcon={<NorthEastIcon sx={{ fontSize: 13 }} />}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: "12px", color: ACCENT, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                    >
                        Manage Users
                    </Button>
                </Box>
            </Box>

            {isSuperAdmin && (
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 1, mt: 1,
                        px: 1.4, py: 0.9, borderRadius: RADIUS, bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}38`,
                    }}
                >
                    <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 17, color: ACCENT }} />
                    <Typography sx={{ fontSize: "11.5px", color: ACCENT, fontWeight: 600 }}>
                        Super Admin has full access to every feature — these toggles are locked on.
                    </Typography>
                </Box>
            )}

            {/* Dashboard view */}
            {showDashboardPicker && (
                <>
                    <SectionTitle icon={SpaceDashboardOutlinedIcon}>Dashboard View</SectionTitle>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 1.2 }}>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                            Pick the dashboard {role.name} lands on after login — only one can be active.
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {dashboardDirty && (
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.amber }}>Unsaved change</Typography>
                            )}
                            <Button
                                onClick={saveDashboardView}
                                disabled={!dashboardDirty || savingDashboard || loadingPerms}
                                startIcon={savingDashboard
                                    ? <CircularProgress size={13} sx={{ color: "#fff" }} />
                                    : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                    textTransform: "none", fontWeight: 700, fontSize: "12px", color: "#fff",
                                    bgcolor: ACCENT, borderRadius: RADIUS, height: 30, px: 1.6, boxShadow: "none",
                                    "&:hover": { bgcolor: "#3730A3", boxShadow: "none" },
                                    "&.Mui-disabled": { bgcolor: DASH.lineSoft, color: DASH.faint },
                                }}
                            >
                                {savingDashboard ? "Saving…" : "Save"}
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={1.5} role="radiogroup" aria-label="Dashboard view">
                        {DASHBOARD_VIEWS.map((v) => {
                            const Icon = v.icon;
                            const selected = dashboardView === v.key;
                            const isActive = selected && !dashboardDirty;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={v.key} sx={{ display: "flex" }}>
                                    <Tooltip arrow title={v.desc} enterDelay={600}>
                                        <Box
                                            role="radio"
                                            aria-checked={selected}
                                            tabIndex={0}
                                            onClick={() => setDashboardView(v.key)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDashboardView(v.key); }
                                            }}
                                            sx={{
                                                width: "100%", boxSizing: "border-box", cursor: "pointer", outline: "none",
                                                display: "flex", alignItems: "center", gap: 1.1, p: 1.1,
                                                bgcolor: selected ? `${v.color}0A` : "#fff",
                                                borderTop: `1px solid ${selected ? `${v.color}38` : DASH.line}`,
                                                borderLeft: `1px solid ${selected ? `${v.color}38` : DASH.line}`,
                                                borderBottom: `1px solid ${selected ? "transparent" : DASH.line}`,
                                                borderRight: `1px solid ${selected ? "transparent" : DASH.line}`,
                                                borderRadius: RADIUS,
                                                boxShadow: "1px 1px 2px 0.5px rgba(0,0,0,0.2)",
                                                transition: "box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                                                "&:hover": {
                                                    boxShadow: "0 4px 16px rgba(17,24,39,0.10)",
                                                    borderBottomColor: `${v.color}38`,
                                                    borderRightColor: `${v.color}38`,
                                                },
                                                "&:focus-visible": { boxShadow: `0 0 0 2px ${v.color}66` },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 30, height: 30, borderRadius: "50%", bgcolor: `${v.color}14`,
                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                }}
                                            >
                                                <Icon sx={{ fontSize: 17, color: v.color }} />
                                            </Box>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, ...oneLine }}>
                                                        {v.name}
                                                    </Typography>
                                                    {isActive && (
                                                        <Box sx={{ px: 0.6, borderRadius: "20px", bgcolor: `${v.color}1F`, border: `1px solid ${v.color}3D`, flexShrink: 0 }}>
                                                            <Typography sx={{ fontSize: 8.5, fontWeight: 800, color: v.color, lineHeight: "14px", letterSpacing: 0.4 }}>
                                                                ACTIVE
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Typography sx={{ fontSize: "10.5px", color: DASH.muted, mt: 0.1, ...oneLine }}>
                                                    {v.caption}
                                                </Typography>
                                            </Box>

                                            {selected
                                                ? <CheckCircleIcon sx={{ fontSize: 18, color: v.color, flexShrink: 0 }} />
                                                : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: DASH.line, flexShrink: 0 }} />}
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            );
                        })}
                    </Grid>
                </>
            )}

            {/* Feature/module cards */}
            <SectionTitle icon={AppsIcon}>Modules</SectionTitle>

            {filteredModules.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="No features match that search." />
                </Box>
            ) : (
                <Grid container spacing={1.5}>
                    {filteredModules.map((m) => {
                        const Icon = m.icon;
                        const on = isSuperAdmin || access[m.key];
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={m.key} sx={{ display: "flex" }}>
                                <Box
                                    sx={{
                                        width: "100%", height: "100%", boxSizing: "border-box",
                                        display: "flex", flexDirection: "column", p: 1.4,
                                        bgcolor: on ? `${m.color}0A` : "#fff",
                                        borderTop: `1px solid ${on ? `${m.color}38` : DASH.line}`,
                                        borderLeft: `1px solid ${on ? `${m.color}38` : DASH.line}`,
                                        borderBottom: `1px solid ${on ? "transparent" : DASH.line}`,
                                        borderRight: `1px solid ${on ? "transparent" : DASH.line}`,
                                        borderRadius: RADIUS,
                                        boxShadow: "1px 1px 2px 0.5px rgba(0,0,0,0.2)",
                                        opacity: on ? 1 : 0.75,
                                        transition: "box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 16px rgba(17,24,39,0.10)",
                                            borderBottomColor: `${m.color}38`,
                                            borderRightColor: `${m.color}38`,
                                            ".fpArrow": { transform: "translateX(3px)" },
                                        },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
                                        <Box
                                            sx={{
                                                width: 32, height: 32, borderRadius: "50%", bgcolor: `${m.color}14`,
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 18, color: m.color }} />
                                        </Box>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink, flex: 1, minWidth: 0, ...oneLine }}>
                                            {m.name}
                                        </Typography>
                                        <Tooltip arrow title={isSuperAdmin ? "Always on for Super Admin" : on ? "Access enabled" : "Access disabled"}>
                                            <span>
                                                <Switch
                                                    size="small"
                                                    checked={on}
                                                    onChange={() => toggle(m.key)}
                                                    disabled={isSuperAdmin}
                                                    sx={{
                                                        "& .MuiSwitch-switchBase.Mui-checked": { color: m.color },
                                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: m.color },
                                                    }}
                                                />
                                            </span>
                                        </Tooltip>
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontSize: "11.5px", color: DASH.muted, mt: 0.8, lineHeight: 1.45,
                                            height: CARD_DESC_H, overflow: "hidden",
                                        }}
                                    >
                                        {m.desc}
                                    </Typography>

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.9 }}>
                                        {m.tags.map((t) => (
                                            <Chip
                                                key={t}
                                                size="small"
                                                label={t}
                                                sx={{
                                                    height: 18, fontSize: 9.5, fontWeight: 700,
                                                    bgcolor: on ? `${m.color}14` : DASH.lineSoft,
                                                    color: on ? m.color : DASH.muted,
                                                    "& .MuiChip-label": { px: 0.7 },
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    <Box sx={{ height: "1px", bgcolor: `${m.color}1F`, mt: "auto", mb: 1 }} />

                                    <Button
                                        onClick={() => (on
                                            ? navigate(`/dashboardmenu/access/config/${m.key}`, { state: { role, roles: allRoles, permissions, mainMenu: MODULE_TO_MAINMENU[m.key] } })
                                            : showSnack(`Enable ${m.name} first.`, false))}
                                        endIcon={<ArrowForwardIcon className="fpArrow" sx={{ fontSize: 14, transition: "transform 0.2s ease" }} />}
                                        disabled={!on}
                                        sx={{
                                            textTransform: "none", fontWeight: 700, fontSize: "11.5px", color: m.color,
                                            alignSelf: "flex-start", minWidth: 0, p: 0.3,
                                            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                                            "&.Mui-disabled": { color: DASH.faint },
                                        }}
                                    >
                                        Manage Access
                                    </Button>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 1.6 }}>
                {enabledCount} of {MODULES.length} features enabled for {role.name}.
            </Typography>

            {/* Manage Users dialog */}
            <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "10px" } } }}>
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${DASH.lineSoft}` }}>
                    <Box>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>{role.name} — Users</Typography>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>{members.length.toLocaleString()} users in this role</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setMembersOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {members.length === 0 ? (
                        <EmptyNote text="No users to show." />
                    ) : members.map((m, i) => (
                        <Box key={m.id}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: "11.5px", fontWeight: 700, bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>
                                        {getInitials(m.name)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }} noWrap>{m.name}</Typography>
                                        <Typography sx={{ fontSize: "10.5px", color: DASH.faint, fontFamily: "monospace" }}>#{m.rollNumber}</Typography>
                                    </Box>
                                </Box>
                                <Tooltip title="Move to another user type" arrow>
                                    <span>
                                        <Button
                                            size="small"
                                            onClick={(e) => openMoveMenu(e, m)}
                                            disabled={movingId === m.id}
                                            startIcon={movingId === m.id
                                                ? <CircularProgress size={12} sx={{ color: DASH.text }} />
                                                : <SwapHorizIcon sx={{ fontSize: 15 }} />}
                                            sx={{
                                                textTransform: "none", fontWeight: 700, fontSize: "11.5px", color: DASH.text,
                                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, height: 28, px: 1.2,
                                                "&:hover": { bgcolor: DASH.surface },
                                                "&.Mui-disabled": { color: DASH.faint, borderColor: DASH.line },
                                            }}
                                        >
                                            {movingId === m.id ? "Moving…" : "Move"}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                            {i < members.length - 1 && <Divider />}
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>

            {/* Move target menu */}
            <Menu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={closeMoveMenu} slotProps={{ paper: { sx: { borderRadius: RADIUS, minWidth: 180 } } }}>
                <Typography sx={{ px: 1.6, py: 0.8, fontSize: 10, fontWeight: 700, color: DASH.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Move to
                </Typography>
                {(() => {
                    const targets = (allRoles || []).filter((r) => r.id !== role.id && !r.isStudent);
                    return targets.length === 0 ? (
                        <MenuItem disabled sx={{ fontSize: "12.5px" }}>No other user types</MenuItem>
                    ) : (
                        targets.map((r) => (
                            <MenuItem key={r.id} onClick={() => handleMove(r)} sx={{ fontSize: "12.5px", fontWeight: 600 }}>{r.name}</MenuItem>
                        ))
                    );
                })()}
            </Menu>
        </Box>
    );
}
