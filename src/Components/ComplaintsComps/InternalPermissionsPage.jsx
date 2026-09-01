import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import { CheckBox, UserAvatar } from "./ComplaintsCheckBox";
import {
    MODULE,
    SUBJECT,
    fetchPermissions,
    permissionLabel,
    savePermissions as savePermissionsApi,
} from "./complaintsConfigApi";
import { AMBER, USERS_PREVIEW_COUNT } from "./internalPermissionsData";
import { rolesFromUserTypes, usersForRole } from "./complaintsRoles";
import { selectUserTypes } from "../../Redux/Slices/userTypesSlice";

// Reached from the "Role & Permission Configuration" tile on the Internal
// Complaints tab. Same three-panel shape as the Parent permissions screen, but
// this comp runs larger throughout (32px page padding, 26px title, 14px radius)
// and uses amber accents where the Parent screen uses blue.

const panelSx = {
    p: 2.5,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "14px",
    border: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
};

export default function InternalPermissionsPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    /* Roles and their members come from the userTypes store — the live directory, not a
       fixed list. The selected role's NAME is the subjectKey the permissions API saves
       against, so this has to be the real set. */
    const userTypes = useSelector(selectUserTypes);
    const roles = useMemo(() => rolesFromUserTypes(userTypes), [userTypes]);

    const [roleId, setRoleId] = useState("");

    /* Settle on the first real role once the store lands, and recover if the selected
       role is deleted in Access Control while this screen is open. */
    useEffect(() => {
        if (!roles.length) return;
        if (!roles.some((r) => r.id === roleId)) setRoleId(roles[0].id);
    }, [roles, roleId]);

    const [userSearch, setUserSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const moduleType = MODULE.staff;

    /* Same 16 codes as the parent side — the API defines one set for both streams, so the
       19 hand-written toggles this screen used to carry are gone. Five of them
       ("Manage Categories / Assignment / SLA / Escalation / Notifications") were one
       MANAGE_CONFIGURATION code all along. */
    const [codes, setCodes] = useState([]);
    const [allowed, setAllowed] = useState({});
    const [baseline, setBaseline] = useState({});
    const [loadingPerms, setLoadingPerms] = useState(true);
    const [permError, setPermError] = useState("");

    const role = roles.find((r) => r.id === roleId);
    const users = useMemo(() => usersForRole(userTypes, roleId), [userTypes, roleId]);
    const subjectKey = role?.name || "";

    const loadPermissions = useCallback(async () => {
        if (!subjectKey) return;
        setLoadingPerms(true);
        const result = await fetchPermissions({ moduleType, subjectType: SUBJECT.role, subjectKey });
        if (!result.ok) {
            setPermError(result.message);
            setCodes([]);
            setAllowed({});
        } else {
            setPermError("");
            setCodes(result.codes);
            setAllowed(result.allowed);
            setBaseline(result.allowed);
        }
        setLoadingPerms(false);
    }, [moduleType, subjectKey]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const filteredUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) => u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q),
        );
    }, [users, userSearch]);

    // The comp lists four users and offers "+ view N more" for the rest.
    const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, USERS_PREVIEW_COUNT);
    const hiddenCount = filteredUsers.length - visibleUsers.length;

    const allVisibleSelected =
        visibleUsers.length > 0 && visibleUsers.every((u) => selectedUsers.includes(u.id));

    // Switching role resets the selection — the previous ids belong to the old role.
    const selectRole = (id) => {
        setRoleId(id);
        setSelectedUsers([]);
        setUserSearch("");
        setShowAllUsers(false);
    };

    const toggleUser = (id) =>
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
        );

    const toggleSelectAll = () =>
        setSelectedUsers((prev) => {
            const ids = visibleUsers.map((u) => u.id);
            return allVisibleSelected
                ? prev.filter((id) => !ids.includes(id))
                : [...new Set([...prev, ...ids])];
        });

    const togglePermission = (code) => setAllowed((prev) => ({ ...prev, [code]: !prev[code] }));

    // Back to what the server last returned, not to a hardcoded default
    const resetPermissions = () => setAllowed(baseline);

    const savePermissions = async () => {
        const result = await savePermissionsApi({
            moduleType,
            subjectType: SUBJECT.role,
            subjectKey,
            // Every code goes, not just the ticked ones — a cleared box is a real change
            allowed: codes.reduce((acc, code) => ({ ...acc, [code]: Boolean(allowed[code]) }), {}),
        });
        if (!result.ok) setPermError(result.message);
        else {
            setPermError("");
            setBaseline(allowed);
        }
    };

    /* Applying to every role means one save per role and overwrites them all, so it needs
       a confirmation step before it can be built. Saves this role for now. */
    const savePermissionsForAll = savePermissions;

    return (
        <Box sx={{ p: embedded ? 0 : "32px", display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Breadcrumb + title + blurb */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb
                        currentColor={AMBER.crumb}
                        fontSize="12px"
                        trail={[
                            {
                                label: "Settings",
                                onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                            },
                            { label: "Role & Permissions" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "26px", fontWeight: 700, color: C.text }}>
                        Internal Complaints Permissions
                    </Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 400, color: C.textMuted }}>
                        Configure admin roles and define school operations permission actions.
                    </Typography>
                </Box>
            )}

            {/* The two left panels are fixed width in the comp; they wrap onto their
                own line rather than squashing once the viewport gets narrow. */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
                {/* Roles rail */}
                <Box sx={{ ...panelSx, p: 0, py: "18px", width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
                    <Box sx={{ px: 2.5, pb: "14px", borderBottom: `1px solid ${C.border}` }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                            SchoolMate Roles
                        </Typography>
                    </Box>

                    <Box sx={{ pt: 1.25, display: "flex", flexDirection: "column", gap: "4px" }}>
                        {roles.map((r) => {
                            const active = r.id === roleId;
                            const count = r.userCount;
                            return (
                                <Box
                                    key={r.id}
                                    onClick={() => selectRole(r.id)}
                                    sx={{
                                        px: 2.5,
                                        py: 1.5,
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 1,
                                        borderTopRightRadius: "8px",
                                        borderBottomRightRadius: "8px",
                                        bgcolor: active ? AMBER.activeRow : "transparent",
                                        borderLeft: `3px solid ${active ? accent : "transparent"}`,
                                        "&:hover": { bgcolor: active ? AMBER.activeRow : "#F8FAFC" },
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
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: active ? AMBER.count : C.textFaint,
                                        }}
                                    >
                                        {count}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Users in the selected role */}
                <Box sx={{ ...panelSx, width: { xs: "100%", md: 320 }, flexShrink: 0, gap: 2 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                        Users in {role?.name} Role
                    </Typography>

                    <TextField
                        value={userSearch}
                        onChange={(e) => {
                            setUserSearch(e.target.value);
                            setShowAllUsers(false);
                        }}
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
                                boxSizing: "border-box",
                                bgcolor: "#F4F6FA",
                                borderRadius: "8px",
                                fontSize: "13px",
                                "& fieldset": { borderColor: C.border },
                                "&:hover fieldset": { borderColor: C.border },
                                "&.Mui-focused fieldset": { borderColor: accent },
                            },
                            "& .MuiOutlinedInput-input::placeholder": { color: C.textMuted, opacity: 1 },
                        }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <CheckBox checked={allVisibleSelected} onChange={toggleSelectAll} accent={accent} />
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                            Select All
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {visibleUsers.map((u) => (
                            <Box key={u.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <CheckBox
                                    checked={selectedUsers.includes(u.id)}
                                    onChange={() => toggleUser(u.id)}
                                    accent={accent}
                                />
                                <UserAvatar initials={u.initials} accent={accent} size={32} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                        {u.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                                        {u.title}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {filteredUsers.length === 0 && (
                            <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                No users match that search.
                            </Typography>
                        )}
                    </Box>

                    {(hiddenCount > 0 || showAllUsers) && (
                        <Box sx={{ pt: 0.5 }}>
                            <Typography
                                onClick={() => setShowAllUsers((v) => !v)}
                                sx={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: accent,
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                {showAllUsers ? "− show less" : `+ view ${hiddenCount} more`}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Operations permissions for the selected role */}
                <Box sx={{ ...panelSx, p: 3, flex: 1, minWidth: { xs: "100%", lg: 380 }, gap: 2.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                            Operations Permissions - {role?.name}
                        </Typography>
                        {role?.badge && (
                            <Box
                                sx={{
                                    px: "10px",
                                    py: "3px",
                                    bgcolor: AMBER.badgeBg,
                                    borderRadius: "6px",
                                    boxSizing: "border-box",
                                    flexShrink: 0,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: AMBER.badgeText,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {role.badge}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.textMuted }}>
                            Permissions
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {loadingPerms && (
                                <Typography sx={{ p: "12px", fontSize: "13px", color: C.textMuted }}>
                                    Loading permissions…
                                </Typography>
                            )}
                            {!loadingPerms && permError && (
                                <Typography sx={{ p: "12px", fontSize: "13px", color: C.red }}>
                                    {permError}
                                </Typography>
                            )}
                            {!loadingPerms && codes.map((code) => {
                                const granted = !!allowed[code];
                                return (
                                    <Box
                                        key={code}
                                        sx={{
                                            px: "12px",
                                            py: "11px",
                                            borderBottom: `1px solid ${C.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <CheckBox
                                            checked={granted}
                                            onChange={() => togglePermission(code)}
                                            accent={accent}
                                        />
                                        {/* Granted rows read heavier and darker than denied ones. */}
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: granted ? 700 : 500,
                                                color: granted ? C.text : C.textMuted,
                                            }}
                                        >
                                            {permissionLabel(code)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Footer — note the order differs from the Parent screen:
                        Reset, then "for All Users", then the primary Save. */}
                    <Box
                        sx={{
                            pt: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1.75,
                            flexWrap: "wrap",
                        }}
                    >
                        <Button
                            onClick={resetPermissions}
                            sx={{
                                p: 0,
                                minWidth: 0,
                                color: C.textMuted,
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={savePermissionsForAll}
                            sx={{
                                px: "18px",
                                py: 1.5,
                                boxSizing: "border-box",
                                bgcolor: AMBER.activeRow,
                                borderRadius: "8px",
                                border: `1px solid ${accent}`,
                                color: C.text,
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                "&:hover": { bgcolor: "#FFF7E5", border: `1px solid ${accent}` },
                            }}
                        >
                            Save Permissions for All Users
                        </Button>
                        <Button
                            onClick={savePermissions}
                            sx={{
                                px: 2.5,
                                py: 1.5,
                                boxSizing: "border-box",
                                bgcolor: accent,
                                borderRadius: "8px",
                                color: C.text,
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                "&:hover": { bgcolor: websiteSettings.darkColor },
                            }}
                        >
                            Save Permissions
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
