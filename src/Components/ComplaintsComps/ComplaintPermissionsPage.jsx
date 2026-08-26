import React, { useMemo, useState } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";


import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, TINT, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import { CheckBox, UserAvatar } from "./ComplaintsCheckBox";
import {
    PERMISSION_ROLES,
    ROLE_USERS,
    COMPLAINT_PERMISSIONS,
    DEFAULT_ROLE_PERMISSIONS,
} from "./complaintPermissionsData";

// Reached from the "Role & Permission Configuration" tile on the Configurations
// screen. Three columns: roles rail, users in the selected role, and that role's
// complaint permissions.

const panelSx = {
    p: 3,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
};

export default function ComplaintPermissionsPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [roleId, setRoleId] = useState("admin");
    const [userSearch, setUserSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState(["ad1"]);
    const [permissions, setPermissions] = useState(DEFAULT_ROLE_PERMISSIONS);

    const role = PERMISSION_ROLES.find((r) => r.id === roleId);
    const users = ROLE_USERS[roleId] || [];
    const rolePerms = permissions[roleId] || {};

    const visibleUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) => u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q),
        );
    }, [users, userSearch]);

    const allVisibleSelected =
        visibleUsers.length > 0 && visibleUsers.every((u) => selectedUsers.includes(u.id));

    // Switching role resets the user selection — the previous ids belong to the
    // old role and would leave a stale "n users selected" count.
    const selectRole = (id) => {
        setRoleId(id);
        setSelectedUsers([]);
        setUserSearch("");
    };

    const toggleUser = (id) =>
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
        );

    const toggleSelectAll = () =>
        setSelectedUsers((prev) => {
            const ids = visibleUsers.map((u) => u.id);
            return allVisibleSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])];
        });

    const togglePermission = (key) =>
        setPermissions((prev) => ({
            ...prev,
            [roleId]: { ...prev[roleId], [key]: !prev[roleId]?.[key] },
        }));

    const resetPermissions = () =>
        setPermissions((prev) => ({ ...prev, [roleId]: { ...DEFAULT_ROLE_PERMISSIONS[roleId] } }));

    // No endpoint for saving yet — wire these to the permissions API when it lands.
    const savePermissions = () => {};
    const savePermissionsForAll = () => {};

    const primaryBtnSx = {
        px: "18px",
        py: "10px",
        bgcolor: accent,
        color: "#191C1E",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "none",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        "&:hover": { bgcolor: websiteSettings.darkColor },
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <ComplaintsBreadcrumb
                    currentColor={accent}
                    trail={[
                        { label: "Administration" },
                        {
                            label: "Complaint Configuration",
                            onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                        },
                        { label: "Role & Permissions" },
                    ]}
                />
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                    Complaint Permissions
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    Configure which roles can perform complaint management actions.
                </Typography>
            </Box>

            {/* The two left panels are fixed width in the comp; they wrap onto their
                own line rather than squashing once the viewport gets narrow. */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
                {/* Roles rail */}
                <Box
                    sx={{
                        ...panelSx,
                        p: 0,
                        py: 2,
                        width: { xs: "100%", md: 220 },
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ px: 2, pb: 1.5, borderBottom: `1px solid ${C.border}` }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                            SchoolMate Roles
                        </Typography>
                    </Box>

                    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        {PERMISSION_ROLES.map((r) => {
                            const active = r.id === roleId;
                            return (
                                <Box
                                    key={r.id}
                                    onClick={() => selectRole(r.id)}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 1,
                                        borderTopRightRadius: "8px",
                                        borderBottomRightRadius: "8px",
                                        bgcolor: active ? "#FFFCF5" : "transparent",
                                        borderLeft: `3px solid ${active ? accent : "transparent"}`,
                                        "&:hover": { bgcolor: active ? "#FFFCF5" : "#F8FAFC" },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            fontWeight: active ? 600 : 500,
                                            color: active ? C.text : C.textMuted,
                                        }}
                                    >
                                        {r.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: C.textFaint }}>
                                        {r.userCount}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Users in the selected role */}
                <Box sx={{ ...panelSx, width: { xs: "100%", md: 320 }, flexShrink: 0, gap: 2 }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                        Users in {role?.name} Role
                    </Typography>

                    <TextField
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search users..."
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon sx={{ fontSize: "14px", color: C.textFaint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                                bgcolor: "#F4F6FA",
                                borderRadius: "9px",
                                fontSize: "13px",
                                "& fieldset": { borderColor: C.border },
                                "&:hover fieldset": { borderColor: C.border },
                                "&.Mui-focused fieldset": { borderColor: accent },
                            },
                            "& .MuiOutlinedInput-input::placeholder": {
                                color: "rgba(30, 41, 59, 0.50)",
                                opacity: 1,
                            },
                        }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <CheckBox checked={allVisibleSelected} onChange={toggleSelectAll} accent={accent} />
                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.text }}>
                            Select All
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {visibleUsers.map((u) => (
                            <Box key={u.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <CheckBox
                                    checked={selectedUsers.includes(u.id)}
                                    onChange={() => toggleUser(u.id)}
                                    accent={accent}
                                />
                                <UserAvatar initials={u.initials} accent={accent} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                        {u.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textFaint }}>
                                        {u.title}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {visibleUsers.length === 0 && (
                            <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                No users match that search.
                            </Typography>
                        )}
                    </Box>

                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textFaint }}>
                        {selectedUsers.length} user{selectedUsers.length === 1 ? "" : "s"} selected
                    </Typography>
                </Box>

                {/* Permissions for the selected role */}
                <Box sx={{ ...panelSx, flex: 1, minWidth: { xs: "100%", lg: 380 }, gap: 2.5 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                                Complaint Permissions - {role?.name}
                            </Typography>
                            {role?.badge && (
                                <Box
                                    sx={{
                                        px: "8px",
                                        py: "2px",
                                        bgcolor: TINT.blue,
                                        borderRadius: "4px",
                                        boxSizing: "border-box",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        sx={{ fontSize: "10px", fontWeight: 700, color: C.blue, whiteSpace: "nowrap" }}
                                    >
                                        {role.badge}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: C.textMuted }}>
                                Permissions
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                {COMPLAINT_PERMISSIONS.map((p) => (
                                    <Box
                                        key={p.key}
                                        sx={{
                                            px: "12px",
                                            py: "10px",
                                            borderBottom: `1px solid ${C.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <CheckBox
                                            checked={!!rolePerms[p.key]}
                                            onChange={() => togglePermission(p.key)}
                                            accent={accent}
                                        />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                                            {p.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                onClick={resetPermissions}
                                sx={{
                                    px: 2,
                                    py: "10px",
                                    borderRadius: "6px",
                                    border: `1px solid ${C.border}`,
                                    color: C.textMuted,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxSizing: "border-box",
                                    "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                                }}
                            >
                                Reset
                            </Button>
                            <Button onClick={savePermissions} sx={primaryBtnSx}>
                                Save Permissions
                            </Button>
                            <Button onClick={savePermissionsForAll} sx={primaryBtnSx}>
                                Save Permissions for All Users
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
