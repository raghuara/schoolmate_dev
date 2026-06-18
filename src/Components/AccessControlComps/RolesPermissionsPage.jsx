import React, { useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, TextField, InputAdornment, IconButton, Avatar, AvatarGroup, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem, Tooltip,
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
import SnackBar from "../SnackBar";
import { useSelector } from "react-redux";

// NOTE: replace these mocks with the real master-access-control APIs when ready.
// `system: true` → always present (cannot be removed). `isStudent: true` → the student
// category: every student belongs here, so no user count / no "view & move" access.
const INITIAL_ROLES = [
    { id: 1, name: "Super Admin", createdOn: "Default", userCount: 5, system: true, fullAccess: true },
    { id: 2, name: "Student", createdOn: "Default", userCount: 0, system: true, isStudent: true },
    { id: 3, name: "Admin", createdOn: "1 June, 2026", userCount: 10 },
    { id: 4, name: "Office Staffs", createdOn: "1 June, 2026", userCount: 15 },
    { id: 5, name: "Teachers", createdOn: "1 June, 2026", userCount: 50 },
    { id: 6, name: "Parent", createdOn: "1 June, 2026", userCount: 1500 },
];

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

// Mock members for a role (for the "View All access" + move flow)
const buildMembers = (role) =>
    Array.from({ length: Math.min(role.userCount, 8) }, (_, i) => ({
        id: `${role.id}-${i + 1}`,
        name: `${role.name.split(" ")[0]} Member ${i + 1}`,
        rollNumber: `${role.id}${String(i + 1).padStart(4, "0")}`,
    }));

export default function RolesPermissionsPage() {
    const navigate = useNavigate();
    const accent = "#4338CA"; // professional indigo for the access-control module

    const [roles, setRoles] = useState(INITIAL_ROLES);
    const [search, setSearch] = useState("");

    // Create user-type dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [nameError, setNameError] = useState("");

    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    // Snackbar
    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });

    // Manage Users dialog
    const [usersOpen, setUsersOpen] = useState(false);
    const [usersRole, setUsersRole] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [addName, setAddName] = useState("");
    const [moveAnchor, setMoveAnchor] = useState(null);
    const [moveMember, setMoveMember] = useState(null);

    const openUsers = (role) => { setUsersRole(role); setUsersList(buildMembers(role)); setAddName(""); setUsersOpen(true); };

    // Add a user to the open role
    const handleAddUser = () => {
        const name = addName.trim();
        if (!name) return;
        const member = { id: `${usersRole.id}-new-${Date.now()}`, name, rollNumber: "Pending" };
        setUsersList((prev) => [member, ...prev]);
        setRoles((prev) => prev.map((r) => (r.id === usersRole.id ? { ...r, userCount: r.userCount + 1 } : r)));
        setAddName("");
        showSnack(`Added ${name} to ${usersRole.name}.`);
    };

    // Move a user to another role
    const openMove = (e, member) => { setMoveAnchor(e.currentTarget); setMoveMember(member); };
    const closeMove = () => { setMoveAnchor(null); setMoveMember(null); };
    const handleMove = (target) => {
        setUsersList((prev) => prev.filter((m) => m.id !== moveMember.id));
        setRoles((prev) => prev.map((r) => {
            if (r.id === usersRole.id) return { ...r, userCount: Math.max(0, r.userCount - 1) };
            if (r.id === target.id) return { ...r, userCount: r.userCount + 1 };
            return r;
        }));
        showSnack(`Moved ${moveMember.name} to ${target.name}.`);
        closeMove();
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

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) { setNameError("Please enter a user type name."); return; }
        if (!/^[A-Za-z ]+$/.test(name)) { setNameError("Only alphabets are allowed (no numbers or special characters)."); return; }
        if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) { setNameError("This user type already exists."); return; }

        const id = Math.max(0, ...roles.map((r) => r.id)) + 1;
        setRoles((prev) => [...prev, { id, name, createdOn: "Today", userCount: 0 }]);
        setCreateOpen(false);
        setNewName("");
        showSnack(`User type "${name}" created.`);
    };
 
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
                py:1,                
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
                display:"flex",
                justifyContent:"space-between"
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 30, height: 30 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${accent}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 22, color: accent }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Roles &amp; Permissions</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Create user types and control who can access which screen</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search by role name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>),
                        }}
                        sx={{ width: { xs: "100%", sm: 280 }, "& .MuiOutlinedInput-root": { height: 38, fontSize: 13, borderRadius: "10px", bgcolor: "#fff" } }}
                    />
                    <Button
                        onClick={() => { setCreateOpen(true); setNewName(""); setNameError(""); }}
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: accent, color: "#fff", borderRadius: "10px", height: 38, px: 2, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}
                    >
                        Create User Type
                    </Button>
                </Box>
            </Box>

            {/* Role cards */}
            <Box sx={{ px: 2,pb:2, pt:"73px" }}>
                {filteredRoles.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: "center", borderRadius: "12px", border: "1px dashed #E5E7EB", bgcolor: "#FAFAFA" }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>No user types found</Typography>
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
                                    p: 1.5, pl: 1.8, borderRadius: "8px", border: "1px solid #ddd", bgcolor: "#fff",
                                    transition: "transform 0.2s, border-color 0.2s",
                                    "&::before": { content: '""', position: "absolute", left: 0, top: 0, height: "100%", width: 4, bgcolor: c.accent },
                                    "&:hover": { transform: "translateY(-3px)", borderColor: `${c.accent}80` },
                                }}>
                                    {/* Identity row */}
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, minWidth: 0 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${c.accent}14`, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                                {getInitials(role.name)}
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#111827", lineHeight: 1.2 }} noWrap>{role.name}</Typography>
                                                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }} noWrap>
                                                    {role.isStudent ? "All students" : `${role.userCount.toLocaleString()} users`} · {role.createdOn}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {role.system && (
                                            <Chip size="small" label="Default" sx={{ height: 19, fontSize: 9, fontWeight: 800, letterSpacing: 0.3, bgcolor: "#F1F5F9", color: "#475569", textTransform: "uppercase", flexShrink: 0 }} />
                                        )}
                                    </Box>

                                    {/* Members / info row (fills the middle) */}
                                    {role.isStudent ? (
                                        <Typography sx={{ fontSize: 11.5, color: "#6B7280", lineHeight: 1.4 }}>
                                            Every student is automatically included in this category.
                                        </Typography>
                                    ) : buildMembers(role).length > 0 ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { width: 26, height: 26, fontSize: 10, fontWeight: 700, border: "2px solid #fff" } }}>
                                                {buildMembers(role).map((m) => (
                                                    <Avatar key={m.id} sx={{ bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>members</Typography>
                                        </Box>
                                    ) : (
                                        <Typography sx={{ fontSize: 11.5, color: "#9CA3AF" }}>No members yet</Typography>
                                    )}

                                    {/* Action row */}
                                    {role.isStudent ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.9, borderRadius: "8px", bgcolor: `${c.accent}0A`, border: `1px solid ${c.accent}26` }}>
                                            <Typography sx={{ fontSize: 11.5, color: c.accent, fontWeight: 700 }}>Default category</Typography>
                                            <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>· cannot be changed</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                onClick={() => openUsers(role)}
                                                startIcon={<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />}
                                                sx={{ flex: 1, textTransform: "none", fontWeight: 700, fontSize: 11.5, color: c.accent, border: `1px solid ${c.accent}40`, borderRadius: "8px", height: 30, minWidth: 0, "&:hover": { bgcolor: `${c.accent}0A`, borderColor: c.accent } }}
                                            >
                                                Users
                                            </Button>
                                            {role.fullAccess ? (
                                                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, height: 30, borderRadius: "8px", bgcolor: "#F1F5F9", color: "#94A3B8", fontSize: 11.5, fontWeight: 700, cursor: "not-allowed" }}>
                                                    <LockOutlinedIcon sx={{ fontSize: 15 }} /> Full Access
                                                </Box>
                                            ) : (
                                                <Button
                                                    onClick={() => navigate("/dashboardmenu/access/feature-permissions", { state: { role, roles } })}
                                                    startIcon={<TuneOutlinedIcon sx={{ fontSize: 16 }} />}
                                                    sx={{ flex: 1, textTransform: "none", fontWeight: 700, fontSize: 11.5, bgcolor: c.accent, color: "#fff", borderRadius: "8px", height: 30, minWidth: 0, boxShadow: "none", "&:hover": { bgcolor: c.accent, filter: "brightness(0.92)", boxShadow: "none" } }}
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
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "14px" } } }}>
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Create New User Type</Typography>
                    <IconButton size="small" onClick={() => setCreateOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.5 }}>User Type Name</Typography>
                    <TextField
                        fullWidth size="small"
                        autoFocus
                        value={newName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                        placeholder="e.g. Office Staff"
                        error={Boolean(nameError)}
                        helperText={nameError || "Only alphabets are allowed — no numbers or special characters."}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: "none", fontWeight: 700, color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", px: 2, height: 36 }}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disableElevation sx={{ textTransform: "none", fontWeight: 700, bgcolor: accent, color: "#fff", borderRadius: "8px", px: 2.4, height: 36, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* ── Manage Users dialog ── */}
            <Dialog open={usersOpen} onClose={() => setUsersOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "14px" } } }}>
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: `${accent}14`, color: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ManageAccountsOutlinedIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>Manage Users</Typography>
                            <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>{usersRole?.name} · {liveCount.toLocaleString()} users</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setUsersOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 2, pb: 2 }}>
                    {/* Add user */}
                    <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                        <TextField
                            fullWidth size="small"
                            value={addName}
                            onChange={(e) => setAddName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddUser(); }}
                            placeholder="Add user by name"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", height: 38, fontSize: 13 } }}
                        />
                        <Button
                            onClick={handleAddUser}
                            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                            disabled={!addName.trim()}
                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: accent, color: "#fff", borderRadius: "10px", height: 38, px: 2, flexShrink: 0, boxShadow: "none", "&:hover": { bgcolor: accent, filter: "brightness(0.92)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}
                        >
                            Add
                        </Button>
                    </Box>

                    {usersList.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "44vh", overflowY: "auto" }}>
                            {usersList.map((m) => (
                                <Box key={m.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, p: 1, borderRadius: "10px", border: "1px solid #F1F3F5" }}>
                                    <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(m.name)}22`, color: colorFor(m.name) }}>{getInitials(m.name)}</Avatar>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }} noWrap>{m.name}</Typography>
                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Roll No: {m.rollNumber}</Typography>
                                    </Box>
                                    <Tooltip title="Move to another role" arrow>
                                        <Button
                                            onClick={(e) => openMove(e, m)}
                                            startIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, color: accent, border: `1px solid ${accent}40`, borderRadius: "8px", height: 30, px: 1.2, flexShrink: 0, "&:hover": { bgcolor: `${accent}0A`, borderColor: accent } }}
                                        >
                                            Move
                                        </Button>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                            <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>No users in this role yet.</Typography>
                            <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", mt: 0.5 }}>Use the field above to add one.</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Move-to-role menu */}
            <Menu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={closeMove} slotProps={{ paper: { sx: { borderRadius: "10px", minWidth: 180, boxShadow: "0 8px 24px rgba(16,24,40,0.12)" } } }}>
                <Typography sx={{ px: 1.5, py: 0.8, fontSize: 10.5, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}>Move to</Typography>
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
