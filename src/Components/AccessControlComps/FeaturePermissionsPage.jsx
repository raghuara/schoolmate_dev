import React, { useMemo, useState, useEffect } from "react";
import {
    Box, Grid, Typography, Button, TextField, InputAdornment, IconButton, Switch, Chip,
    Avatar, AvatarGroup, Dialog, DialogTitle, DialogContent, Menu, MenuItem, Divider, Tooltip, CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SnackBar from "../SnackBar";
import { useSelector } from "react-redux";
import { GetUserTypePermissions, UpdateUsersUserType } from "../../Api/Api";

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

// NOTE: replace with the real feature-list / permissions APIs when ready.
const MODULES = [
    { key: "profile", name: "Profile Management", desc: "Manage student and staff profiles, records, and personal information.", tags: ["Student", "Staff"], color: "#DB2777", icon: BadgeOutlinedIcon },
    { key: "communication", name: "Communication", desc: "School communication and parent engagement tools.", tags: ["News", "Circulars", "Messages", "Notifications"], color: "#2563EB", icon: ForumOutlinedIcon },
    { key: "finance", name: "Fee & Finance", desc: "Handle fee collection, billing, expenses, concessions, and financial operations.", tags: ["Billing", "Expenses", "Concession"], color: "#EA580C", icon: PaymentsOutlinedIcon },
    { key: "leave", name: "Leave & Payroll", desc: "Manage student leave, staff attendance, leave requests, and payroll processing.", tags: ["Student Leave & Attendance", "Teacher Leave & Attendance"], color: "#7C3AED", icon: ReceiptLongOutlinedIcon },
    { key: "transport", name: "Transport", desc: "Manage vehicles, routes, student transportation, and travel assignments.", tags: ["Vehicles details", "Route management"], color: "#059669", icon: DirectionsBusOutlinedIcon },
    { key: "myprojects", name: "My Projects", desc: "Track staff work done — daily entries, teacher-wise, class-wise, and period settings.", tags: ["Workdone"], color: "#0891B2", icon: WorkOutlineOutlinedIcon },
    { key: "access", name: "Access Control", desc: "Manage roles, permissions, and who can access which screen.", tags: ["Roles", "Permissions"], color: "#DC2626", icon: AdminPanelSettingsOutlinedIcon },
];

const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const roleMembers = (role) =>
    (role?.users || []).map((u) => ({ id: u.rollNumber, name: u.name, rollNumber: u.rollNumber }));

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

    // Members / move
    const [membersOpen, setMembersOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [moveAnchor, setMoveAnchor] = useState(null);
    const [moveMember, setMoveMember] = useState(null);
    const [movingId, setMovingId] = useState(null);

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
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

    const filteredModules = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? MODULES.filter((m) => m.name.toLowerCase().includes(q)) : MODULES;
    }, [search]);

    const enabledCount = MODULES.filter((m) => access[m.key]).length;

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
        <Box sx={{ width: "100%" }}>
            <SnackBar open={snack.open} color={snack.ok} setOpen={(v) => setSnack((s) => ({ ...s, open: v }))} status={snack.ok} message={snack.msg} />

            {/* Header */}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "260px" : "80px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
                display: "flex",
                justifyContent: "space-between",
                py: 1,
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 30, height: 30 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Feature Permissions</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Access Control / Roles &amp; Permissions / {role.name}</Typography>
                    </Box>
                </Box>
                <TextField
                    size="small"
                    placeholder="Search by feature name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>) }}
                    sx={{ width: { xs: "100%", sm: 300 }, "& .MuiOutlinedInput-root": { height: 38, fontSize: 13, borderRadius: "8px", bgcolor: "#fff" } }}
                />
            </Box>

            <Box sx={{ px: 2, pb: 2, pt: "70px" }}>
                {/* Role summary banner */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", p: 2, mb: 2, borderRadius: "10px", border: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${ACCENT}14`, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                            {getInitials(role.name)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{role.name}</Typography>
                                <Chip size="small" label="ACTIVE" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: "#E8F5E9", color: "#16A34A" }} />
                            </Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.2 }}>
                                {isSuperAdmin ? "Full system administration access across SchoolMate. Overrides all module restrictions." : `Controls which screens the ${role.name} role can access.`}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 2, borderLeft: "1px solid #EEF0F2" }}>
                        <Box>
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}>Users Assigned</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                                <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: 10, fontWeight: 700, border: "2px solid #fff" } }}>
                                    {memberAvatars.slice(0, 4).map((m) => (
                                        <Avatar key={m.id} sx={{ bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                    ))}
                                </AvatarGroup>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{(role.userCount || 0).toLocaleString()} Users</Typography>
                            </Box>
                        </Box>
                        <Button
                            onClick={openMembers}
                            endIcon={<NorthEastIcon sx={{ fontSize: 14 }} />}
                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, color: ACCENT, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                        >
                            Manage Users
                        </Button>
                    </Box>
                </Box>

                {isSuperAdmin && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.2, mb: 2, borderRadius: "8px", bgcolor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
                        <Typography sx={{ fontSize: 12, color: "#3730A3", fontWeight: 600 }}>
                            Super Admin has full access to every feature — these toggles are locked on.
                        </Typography>
                    </Box>
                )}

                {/* Feature/module cards */}
                <Grid container spacing={2}>
                    {filteredModules.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 6, textAlign: "center", borderRadius: "10px", border: "1px dashed #E5E7EB", bgcolor: "#FAFAFA" }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>No features found</Typography>
                            </Box>
                        </Grid>
                    ) : filteredModules.map((m) => {
                        const Icon = m.icon;
                        const on = isSuperAdmin || access[m.key];
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.key} sx={{ display: "flex" }}>
                                <Box sx={{
                                    width: "100%", display: "flex", flexDirection: "column",
                                    p: 2, borderRadius: "5px", border: "1px solid #ECEFF3", bgcolor: "#fff",
                                    boxShadow: "0 1px 2px rgba(16,24,40,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
                                    opacity: on ? 1 : 0.7,
                                    "&:hover": { transform: "translateY(-3px)", boxShadow: `0 10px 24px ${m.color}22` },
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${m.color}16`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon sx={{ fontSize: 22 }} />
                                        </Box>
                                        <Tooltip title={isSuperAdmin ? "Always on for Super Admin" : on ? "Access enabled" : "Access disabled"} arrow>
                                            <span>
                                                <Switch
                                                    checked={on}
                                                    onChange={() => toggle(m.key)}
                                                    disabled={isSuperAdmin}
                                                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: m.color }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: m.color } }}
                                                />
                                            </span>
                                        </Tooltip>
                                    </Box>

                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827", mt: 1.2 }}>{m.name}</Typography>
                                    <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.4, lineHeight: 1.4 }}>{m.desc}</Typography>

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 1.2 }}>
                                        {m.tags.map((t) => (
                                            <Chip key={t} size="small" label={t} sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: "#F3F4F6", color: "#475569" }} />
                                        ))}
                                    </Box>

                                    <Box sx={{ height: "1px", bgcolor: "#F1F3F5", mt: "auto", mb: 1.4 }} />
                                    <Button
                                        onClick={() => (on
                                            ? navigate(`/dashboardmenu/access/config/${m.key}`, { state: { role, roles: allRoles, permissions, mainMenu: MODULE_TO_MAINMENU[m.key] } })
                                            : showSnack(`Enable ${m.name} first.`, false))}
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                        disabled={!on}
                                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, color: m.color, alignSelf: "flex-start", minWidth: 0, p: 0.4, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                                    >
                                        Manage Access
                                    </Button>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", mt: 2 }}>
                    {enabledCount} of {MODULES.length} features enabled for {role.name}.
                </Typography>
            </Box>

            {/* Manage Users dialog */}
            <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "14px" } } }}>
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
                    <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{role.name} — Users</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>{members.length.toLocaleString()} users in this role</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setMembersOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {members.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                            <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>No users to show.</Typography>
                        </Box>
                    ) : members.map((m, i) => (
                        <Box key={m.id}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                    <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }} noWrap>{m.name}</Typography>
                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>#{m.rollNumber}</Typography>
                                    </Box>
                                </Box>
                                <Tooltip title="Move to another user type" arrow>
                                    <span>
                                        <Button
                                            size="small"
                                            onClick={(e) => openMoveMenu(e, m)}
                                            disabled={movingId === m.id}
                                            startIcon={movingId === m.id ? <CircularProgress size={13} sx={{ color: "#374151" }} /> : <SwapHorizIcon sx={{ fontSize: 15 }} />}
                                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", height: 30, px: 1.2, "&:hover": { bgcolor: "#F9FAFB" }, "&.Mui-disabled": { color: "#9CA3AF", borderColor: "#E5E7EB" } }}
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
            <Menu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={closeMoveMenu} slotProps={{ paper: { sx: { borderRadius: "10px", minWidth: 180 } } }}>
                <Typography sx={{ px: 1.6, py: 0.8, fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}>Move to</Typography>
                {(() => {
                    const targets = (allRoles || []).filter((r) => r.id !== role.id && !r.isStudent);
                    return targets.length === 0 ? (
                        <MenuItem disabled sx={{ fontSize: 12.5 }}>No other user types</MenuItem>
                    ) : (
                        targets.map((r) => (
                            <MenuItem key={r.id} onClick={() => handleMove(r)} sx={{ fontSize: 13, fontWeight: 600 }}>{r.name}</MenuItem>
                        ))
                    );
                })()}
            </Menu>
        </Box>
    );
}
