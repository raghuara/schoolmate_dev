import React, { useMemo, useState, useEffect } from "react";
import {
    Box, Grid, Typography, Button, TextField, InputAdornment, IconButton, Avatar, AvatarGroup, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem, Tooltip, CircularProgress, Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SnackBar from "../SnackBar";
import { useDispatch } from "react-redux";
import { fetchUserTypes as refreshUserTypesStore } from "../../Redux/Slices/userTypesSlice";
import { AddUserType, GetAllUserTypes, GetNonStudentUsers, UpdateUsersUserType } from "../../Api/Api";
import ApprovalFlowsTab from "./ApprovalFlowsTab";
import { DASH, RADIUS, createBtnSx } from "../DashBoardComps/dashboardTheme";

const TOKEN = "123";

// `system: true` → always present (cannot be removed). `isStudent: true` → the student
// category: every student belongs here, so no user count / no "view & move" access.
const fmtDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// Map a GetAllUserTypes item to the role shape the UI uses.
const mapUserType = (item) => {
    const name = item.userType || "";
    const key = name.toLowerCase().replace(/\s/g, "");
    const isSuperAdmin = item.userTypeID === 1 || key === "superadmin";
    const isStudent = key === "student";
    return {
        id: item.userTypeID,
        name,
        createdOn: fmtDate(item.createdDate),
        userCount: Number(item.userCount) || 0,
        users: Array.isArray(item.users) ? item.users : [],
        system: isSuperAdmin || isStudent,
        fullAccess: isSuperAdmin,
        isStudent,
    };
};

// Refined, professional accent colours — assigned stably per role name (no loud yellows).
const CARD_COLORS = [
    { bg: "#EEF2FF", accent: "#4F46E5" }, // indigo
    { bg: "#EFF6FF", accent: "#2563EB" }, // blue
    { bg: "#ECFEFF", accent: "#0891B2" }, // cyan
    { bg: "#ECFDF5", accent: "#059669" }, // emerald
    { bg: "#F0FDFA", accent: "#0D9488" }, // teal
    { bg: "#F5F3FF", accent: "#7C3AED" }, // violet
    { bg: "#FFF1F2", accent: "#E11D48" }, // rose
    { bg: "#F8FAFC", accent: "#475569" }, // slate
];
const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

// Real members of a role, mapped from the API `users` array.
const roleMembers = (role) =>
    (role?.users || []).map((u) => ({ id: u.rollNumber, name: u.name, rollNumber: u.rollNumber }));

export default function RolesPermissionsPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const accent = "#4338CA"; // professional indigo for the access-control module

    // One shape for every control on this page, taken from the dashboard theme.
    const ghostBtnSx = {
        textTransform: "none", fontWeight: 700, fontSize: 12.5, color: DASH.text,
        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
        px: 2, height: 34, boxShadow: "none",
        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
        "&.Mui-disabled": { color: DASH.faint, borderColor: DASH.lineSoft },
    };
    const accentBtnSx = {
        textTransform: "none", fontWeight: 700, fontSize: 12.5, color: "#fff",
        bgcolor: accent, borderRadius: RADIUS, px: 2, height: 34, boxShadow: "none",
        "&:hover": { bgcolor: accent, filter: "brightness(0.92)", boxShadow: "none" },
        "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
    };

    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [search, setSearch] = useState("");
    const [mainTab, setMainTab] = useState(0); // 0 = User Types, 1 = Approval Flows

    // Create user-type dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [nameError, setNameError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Snackbar
    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });

    const fetchUserTypes = async () => {
        setLoadingRoles(true);
        try {
            const res = await axios.get(GetAllUserTypes, { headers: { Authorization: `Bearer ${TOKEN}` } });
            const rank = (r) => (r.fullAccess ? 0 : r.isStudent ? 1 : 2);
            const list = (res?.data?.data || []).map(mapUserType).sort((a, b) => rank(a) - rank(b));
            setRoles(list);
            return list;
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to load user types.", false);
            return null;
        } finally {
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        fetchUserTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Manage Users dialog
    const [usersOpen, setUsersOpen] = useState(false);
    const [usersRole, setUsersRole] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [selectedToAdd, setSelectedToAdd] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [movingId, setMovingId] = useState(null);
    const [moveAnchor, setMoveAnchor] = useState(null);
    const [moveMember, setMoveMember] = useState(null);

    // Assignable (non-student) users, loaded once and reused across dialog opens.
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const fetchAssignableUsers = async () => {
        if (usersLoaded || loadingUsers) return;
        setLoadingUsers(true);
        try {
            const res = await axios.get(GetNonStudentUsers, { headers: { Authorization: `Bearer ${TOKEN}` } });
            setAllUsers(res?.data?.data || []);
            setUsersLoaded(true);
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to load users.", false);
        } finally {
            setLoadingUsers(false);
        }
    };

    const openUsers = (role) => {
        setUsersRole(role);
        setUsersList(roleMembers(role));
        setSelectedToAdd([]);
        setUsersOpen(true);
        fetchAssignableUsers();
    };

    // Re-pull user types and re-seed the open dialog with fresh members.
    const refreshOpenRole = async () => {
        const list = await fetchUserTypes();
        const fresh = (list || []).find((r) => r.id === usersRole?.id);
        if (fresh) { setUsersRole(fresh); setUsersList(roleMembers(fresh)); }
        dispatch(refreshUserTypesStore());
    };

    // Users not already in the open role.
    const assignOptions = useMemo(() => {
        const ids = new Set(usersList.map((m) => m.rollNumber));
        return allUsers.filter((u) => !ids.has(u.rollNumber));
    }, [allUsers, usersList]);

    // Assign the selected users to the open role.
    const handleAssign = async () => {
        if (!selectedToAdd.length || !usersRole) return;
        setAssigning(true);
        try {
            const rollNumbers = selectedToAdd.map((u) => u.rollNumber);
            const res = await axios.put(
                UpdateUsersUserType,
                { userTypeID: usersRole.id, rollNumbers },
                { headers: { Authorization: `Bearer ${TOKEN}` } },
            );
            const ok = !res?.data || res.data.error === false || res.status === 200;
            if (!ok) { showSnack(res?.data?.message || "Could not assign users.", false); return; }
            showSnack(res?.data?.message || `Assigned ${rollNumbers.length} user${rollNumbers.length > 1 ? "s" : ""} to ${usersRole.name}.`);
            setSelectedToAdd([]);
            await refreshOpenRole();
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to assign users. Please try again.", false);
        } finally {
            setAssigning(false);
        }
    };

    // Move a user to another role
    const openMove = (e, member) => { setMoveAnchor(e.currentTarget); setMoveMember(member); };
    const closeMove = () => { setMoveAnchor(null); setMoveMember(null); };
    const handleMove = async (target) => {
        const member = moveMember;
        closeMove();
        if (!member || !usersRole) return;
        setMovingId(member.id);
        try {
            const res = await axios.put(
                UpdateUsersUserType,
                { userTypeID: target.id, rollNumbers: [member.rollNumber] },
                { headers: { Authorization: `Bearer ${TOKEN}` } },
            );
            const ok = !res?.data || res.data.error === false || res.status === 200;
            if (!ok) { showSnack(res?.data?.message || "Could not move the user.", false); return; }
            showSnack(res?.data?.message || `Moved ${member.name} to ${target.name}.`);
            await refreshOpenRole();
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to move the user. Please try again.", false);
        } finally {
            setMovingId(null);
        }
    };

    // Roles a member can be moved to (exclude current role and the auto student category)
    const moveTargets = roles.filter((r) => r.id !== usersRole?.id && !r.isStudent);
    const liveCount = (roles.find((r) => r.id === usersRole?.id)?.userCount) ?? 0;

    const filteredRoles = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? roles.filter((r) => r.name.toLowerCase().includes(q)) : roles;
    }, [roles, search]);

    // ── Create user type (alphabetic only) ───────────────────────────────────
    const handleNameChange = (e) => {
        // Allow only alphabets and spaces — strip numbers / special characters
        const cleaned = e.target.value.replace(/[^A-Za-z ]/g, "");
        setNewName(cleaned);
        if (nameError) setNameError("");
    };

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) { setNameError("Please enter a user type name."); return; }
        if (!/^[A-Za-z ]+$/.test(name)) { setNameError("Only alphabets are allowed (no numbers or special characters)."); return; }
        if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) { setNameError("This user type already exists."); return; }

        setIsCreating(true);
        try {
            const res = await axios.post(
                AddUserType,
                { userType: name },
                { headers: { Authorization: `Bearer ${TOKEN}` } }
            );
            const ok = !res?.data || res.data.error === false || res.status === 200 || res.status === 201;
            if (!ok) {
                showSnack(res?.data?.message || "Could not create the user type.", false);
                return;
            }
            setCreateOpen(false);
            setNewName("");
            showSnack(res?.data?.message || `User type "${name}" created.`);
            fetchUserTypes();
            dispatch(refreshUserTypesStore());
        } catch (err) {
            showSnack(err?.response?.data?.message || "Failed to create the user type. Please try again.", false);
        } finally {
            setIsCreating(false);
        }
    };
 
    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={snack.open} color={snack.ok} setOpen={(v) => setSnack((s) => ({ ...s, open: v }))} status={snack.ok} message={snack.msg} />

            {/* Page header - same shape as Books & Chapters and Question Paper. */}
            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>Roles &amp; Permissions</Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Create user types and control who can access which screen
                        </Typography>
                    </Box>
                </Box>

                {mainTab === 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search by role name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: DASH.faint }} /></InputAdornment>),
                        }}
                        sx={{
                            width: { xs: "100%", sm: 280 },
                            "& .MuiOutlinedInput-root": {
                                height: 34, fontSize: 12.5, borderRadius: RADIUS, bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: accent },
                            },
                        }}
                    />
                    <Button
                        onClick={() => { setCreateOpen(true); setNewName(""); setNameError(""); }}
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        sx={createBtnSx}
                    >
                        Create User Type
                    </Button>
                </Box>
                )}
            </Box>

            {/* Content */}
            <Box>
                <Box sx={{ display: "flex", gap: 0.5, mb: 2, borderBottom: `1px solid ${DASH.line}` }}>
                    {[{ k: 0, label: "User Types" }, { k: 1, label: "Approval Flows" }].map((t) => (
                        <Box
                            key={t.k}
                            onClick={() => setMainTab(t.k)}
                            sx={{
                                px: 2, py: 1, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                color: mainTab === t.k ? accent : DASH.muted,
                                "&:hover": { color: mainTab === t.k ? accent : DASH.text },
                                borderBottom: mainTab === t.k ? `2px solid ${accent}` : "2px solid transparent",
                                mb: "-1px", transition: "color 0.2s",
                            }}
                        >
                            {t.label}
                        </Box>
                    ))}
                </Box>

                {mainTab === 1 ? (
                    <ApprovalFlowsTab showSnack={showSnack} />
                ) : loadingRoles ? (
                    <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
                        <CircularProgress size={30} sx={{ color: accent }} />
                    </Box>
                ) : filteredRoles.length === 0 ? (
                    <Box sx={{ py: 7, px: 3, textAlign: "center", borderRadius: RADIUS, border: `1px dashed ${DASH.line}`, bgcolor: "#fff" }}>
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 40, color: DASH.line }} />
                        <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: DASH.ink, mt: 1 }}>
                            {roles.length === 0 ? "No user types yet" : "Nothing matches this search"}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: DASH.muted, mt: 0.5, mb: 2 }}>
                            {roles.length === 0
                                ? "Create a user type, then choose which screens it can open."
                                : "Try a different role name."}
                        </Typography>
                        {roles.length === 0 ? (
                            <Button
                                onClick={() => { setCreateOpen(true); setNewName(""); setNameError(""); }}
                                variant="contained"
                                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                sx={createBtnSx}
                            >
                                Create User Type
                            </Button>
                        ) : (
                            <Button onClick={() => setSearch("")} sx={ghostBtnSx}>Clear search</Button>
                        )}
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredRoles.map((role, index) => {
                            const c = CARD_COLORS[index % CARD_COLORS.length];
                            return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id} sx={{ display: "flex" }}>
                                <Box sx={{
                                    position: "relative", overflow: "hidden",
                                    width: "100%", height: 120, display: "flex", flexDirection: "column", justifyContent: "space-between",
                                    p: 1.5, pl: 1.8, borderRadius: RADIUS, border: `1px solid ${c.accent}2E`, bgcolor: c.bg,
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                                    "&::before": { content: '""', position: "absolute", left: 0, top: 0, height: "100%", width: 3, bgcolor: c.accent },
                                    "&:hover": { transform: "translateY(-2px)", borderColor: `${c.accent}66`, boxShadow: "0 6px 18px rgba(17,24,39,0.09)" },
                                }}>
                                    {/* Identity row */}
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, minWidth: 0 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: RADIUS, bgcolor: "#fff", border: `1px solid ${c.accent}33`, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                                {getInitials(role.name)}
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }} noWrap>{role.name}</Typography>
                                                <Typography sx={{ fontSize: 11, color: DASH.faint }} noWrap>
                                                    {role.isStudent ? "All students" : `${role.userCount.toLocaleString()} users`} · {role.createdOn}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {role.system && (
                                            <Chip size="small" label="Default" sx={{ height: 19, fontSize: 9, fontWeight: 800, letterSpacing: 0.3, borderRadius: RADIUS, bgcolor: "#fff", border: `1px solid ${DASH.line}`, color: DASH.muted, textTransform: "uppercase", flexShrink: 0 }} />
                                        )}
                                    </Box>

                                    {/* Members / info row (fills the middle) */}
                                    {role.isStudent ? (
                                        <Typography sx={{ fontSize: 11.5, color: DASH.muted, lineHeight: 1.4 }}>
                                            Every student is automatically included in this category.
                                        </Typography>
                                    ) : roleMembers(role).length > 0 ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: 10, fontWeight: 700, border: `2px solid ${c.bg}` } }}>
                                                {roleMembers(role).map((m) => (
                                                    <Avatar key={m.id} sx={{ bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Typography sx={{ fontSize: 11, color: DASH.faint, fontWeight: 600 }}>members</Typography>
                                        </Box>
                                    ) : (
                                        <Typography sx={{ fontSize: 11.5, color: DASH.faint }}>No members yet</Typography>
                                    )}

                                    {/* Action row */}
                                    {role.isStudent ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.9, borderRadius: RADIUS, bgcolor: "#fff", border: `1px solid ${c.accent}26` }}>
                                            <Typography sx={{ fontSize: 11.5, color: c.accent, fontWeight: 700 }}>Default category</Typography>
                                            <Typography sx={{ fontSize: 11, color: DASH.faint }}>· cannot be changed</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                onClick={() => openUsers(role)}
                                                startIcon={<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />}
                                                sx={{ flex: 1, textTransform: "none", fontWeight: 700, fontSize: 11.5, color: c.accent, bgcolor: "#fff", border: `1px solid ${c.accent}33`, borderRadius: RADIUS, height: 30, minWidth: 0, "&:hover": { bgcolor: `${c.accent}0F`, borderColor: c.accent } }}
                                            >
                                                Users
                                            </Button>
                                            {role.fullAccess ? (
                                                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, height: 30, borderRadius: RADIUS, bgcolor: "#fff", border: `1px solid ${DASH.line}`, color: DASH.faint, fontSize: 11.5, fontWeight: 700, cursor: "not-allowed" }}>
                                                    <LockOutlinedIcon sx={{ fontSize: 15 }} /> Full Access
                                                </Box>
                                            ) : (
                                                <Button
                                                    onClick={() => navigate("/dashboardmenu/access/feature-permissions", { state: { role, roles } })}
                                                    startIcon={<TuneOutlinedIcon sx={{ fontSize: 16 }} />}
                                                    sx={{ flex: 1, textTransform: "none", fontWeight: 700, fontSize: 11.5, bgcolor: c.accent, color: "#fff", borderRadius: RADIUS, height: 30, minWidth: 0, boxShadow: "none", "&:hover": { bgcolor: c.accent, filter: "brightness(0.92)", boxShadow: "none" } }}
                                                >
                                                    Access
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            {/* ── Create user type dialog ── */}
            <Dialog
                open={createOpen}
                onClose={() => { if (!isCreating) setCreateOpen(false); }}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
            >
                {/* The same accent rule the page header carries. */}
                <Box sx={{ height: 3, bgcolor: accent }} />

                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: RADIUS, bgcolor: `${accent}14`, border: `1px solid ${accent}33`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>Create User Type</Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.2 }}>Name it now - screen access is set next</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setCreateOpen(false)} disabled={isCreating} sx={{ mt: -0.4 }}>
                        <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ px: 2, pt: 0, pb: 1 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.6 }}>
                        User Type Name
                    </Typography>
                    <TextField
                        fullWidth size="small"
                        autoFocus
                        value={newName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                        placeholder="e.g. Office Staff"
                        error={Boolean(nameError)}
                        helperText={nameError || "Letters and spaces only - no numbers or symbols."}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: RADIUS, fontSize: 13, bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: accent },
                            },
                            "& .MuiFormHelperText-root": { fontSize: 11, ml: 0, mt: 0.6, color: DASH.muted },
                        }}
                    />

                    {/* How the type will read on the card, as it is typed. */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 1.6, p: 1.2, borderRadius: RADIUS, border: `1px solid ${DASH.line}`, bgcolor: DASH.surface }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: RADIUS, bgcolor: `${accent}14`, border: `1px solid ${accent}2E`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>
                            {getInitials(newName) || "?"}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: newName.trim() ? DASH.ink : DASH.faint }} noWrap>
                                {newName.trim() || "Your new user type"}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: DASH.faint }}>0 users · no screen access yet</Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2, pb: 2, pt: 1.5, gap: 1 }}>
                    <Button onClick={() => setCreateOpen(false)} disabled={isCreating} sx={ghostBtnSx}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disableElevation
                        disabled={isCreating || !newName.trim()}
                        startIcon={isCreating ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : null}
                        sx={accentBtnSx}
                    >
                        {isCreating ? "Creating…" : "Create User Type"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Manage Users dialog ── */}
            <Dialog open={usersOpen} onClose={() => setUsersOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}>
                <Box sx={{ height: 3, bgcolor: accent }} />
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: RADIUS, bgcolor: `${accent}14`, border: `1px solid ${accent}33`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <ManageAccountsOutlinedIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>Manage Users</Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.2 }}>{usersRole?.name} · {liveCount.toLocaleString()} users</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setUsersOpen(false)}><CloseIcon sx={{ fontSize: 18, color: DASH.muted }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 2, pb: 2 }}>
                    {/* Add user */}
                    <Box sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "flex-start" }}>
                        <Autocomplete
                            multiple
                            size="small"
                            fullWidth
                            options={assignOptions}
                            loading={loadingUsers}
                            value={selectedToAdd}
                            onChange={(e, val) => setSelectedToAdd(val)}
                            getOptionLabel={(o) => o.name || o.rollNumber}
                            isOptionEqualToValue={(o, v) => o.rollNumber === v.rollNumber}
                            disableCloseOnSelect
                            limitTags={2}
                            noOptionsText={loadingUsers ? "Loading users…" : "No users to add"}
                            renderOption={(props, o) => (
                                <Box component="li" {...props} key={o.rollNumber} sx={{ display: "flex", gap: 1 }}>
                                    <Avatar sx={{ width: 26, height: 26, fontSize: 10, fontWeight: 700, bgcolor: `${colorFor(o.name)}22`, color: colorFor(o.name) }}>{getInitials(o.name)}</Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} noWrap>{o.name}</Typography>
                                        <Typography sx={{ fontSize: 10.5, color: "#9CA3AF" }}>Roll No: {o.rollNumber}</Typography>
                                    </Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={selectedToAdd.length ? "" : "Search users to add"}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingUsers ? <CircularProgress size={16} sx={{ color: accent }} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        },
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: RADIUS, fontSize: 13, bgcolor: "#fff",
                                            "& fieldset": { borderColor: DASH.line },
                                            "&:hover fieldset": { borderColor: DASH.faint },
                                            "&.Mui-focused fieldset": { borderColor: accent },
                                        },
                                    }}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            onClick={handleAssign}
                            startIcon={assigning ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                            disabled={!selectedToAdd.length || assigning}
                            sx={{ ...accentBtnSx, height: 40, flexShrink: 0 }}
                        >
                            {assigning ? "Assigning…" : "Assign"}
                        </Button>
                    </Box>

                    {usersList.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "44vh", overflowY: "auto" }}>
                            {usersList.map((m) => (
                                <Box key={m.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, p: 1, borderRadius: RADIUS, border: `1px solid ${DASH.line}`, bgcolor: "#fff" }}>
                                    <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }} noWrap>{m.name}</Typography>
                                        <Typography sx={{ fontSize: 11, color: DASH.faint }}>Roll No: {m.rollNumber}</Typography>
                                    </Box>
                                    <Tooltip title="Move to another role" arrow>
                                        <span>
                                            <Button
                                                onClick={(e) => openMove(e, m)}
                                                disabled={movingId === m.id}
                                                startIcon={movingId === m.id ? <CircularProgress size={13} sx={{ color: accent }} /> : <SwapHorizIcon sx={{ fontSize: 16 }} />}
                                                sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, color: accent, bgcolor: `${accent}0A`, border: `1px solid ${accent}33`, borderRadius: RADIUS, height: 30, px: 1.2, flexShrink: 0, "&:hover": { bgcolor: `${accent}14`, borderColor: accent }, "&.Mui-disabled": { color: DASH.faint, bgcolor: DASH.lineSoft, borderColor: DASH.lineSoft } }}
                                            >
                                                {movingId === m.id ? "Moving…" : "Move"}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                            <Typography sx={{ fontSize: 13, color: DASH.muted, fontWeight: 700 }}>No users in this role yet.</Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.faint, mt: 0.5 }}>Use the field above to add one.</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Move-to-role menu */}
            <Menu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={closeMove} slotProps={{ paper: { sx: { borderRadius: RADIUS, minWidth: 180, border: `1px solid ${DASH.line}`, boxShadow: "0 8px 24px rgba(16,24,40,0.12)" } } }}>
                <Typography sx={{ px: 1.5, py: 0.8, fontSize: 10.5, fontWeight: 800, color: DASH.faint, textTransform: "uppercase", letterSpacing: 0.4 }}>Move to</Typography>
                {moveTargets.length === 0 ? (
                    <MenuItem disabled sx={{ fontSize: 12.5 }}>No other roles</MenuItem>
                ) : (
                    moveTargets.map((r) => (
                        <MenuItem key={r.id} onClick={() => handleMove(r)} sx={{ fontSize: 13, fontWeight: 600, gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 10, fontWeight: 700, bgcolor: `${colorFor(r.name)}22`, color: colorFor(r.name) }}>{getInitials(r.name)}</Avatar>
                            {r.name}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );
}
