import { Avatar, Box, Button, Grid, IconButton, InputAdornment, LinearProgress, Skeleton, TextField, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SnackBar from '../../../SnackBar';
import { teamManagementGet, moveToAccounts, moveToBilling } from '../../../../Api/Api';
import { DASH, RADIUS, BRAND, SOFT, PageHeader, SectionTitle, Panel, StatTile } from '../../../DashBoardComps/dashboardTheme';

const TEAM_TONES = {
    billing: { label: 'Billing', color: BRAND.pink.main, bg: BRAND.pink.icon, border: '#F7D6E2', soft: SOFT.pink },
    accounts: { label: 'Accounts', color: BRAND.cyan.main, bg: BRAND.cyan.icon, border: '#C7EDF3', soft: SOFT.cyan },
};

const getInitials = (name) =>
    String(name || '').split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export default function FinanceTeamsPage() {
    const navigate = useNavigate();
    const token = "123";

    const [staff, setStaff] = useState([]);
    const [staffSearch, setStaffSearch] = useState("");
    const [staffRoleFilter, setStaffRoleFilter] = useState("all");
    const [teamCounts, setTeamCounts] = useState({ billing: 0, accounts: 0, total: 0 });
    const [teamLoading, setTeamLoading] = useState(false);
    const [movingRoll, setMovingRoll] = useState(null);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, ok) => { setSnackMessage(msg); setSnackColor(ok); setSnackStatus(ok); setSnackOpen(true); };

    const billingCount = teamCounts.billing;
    const accountsCount = teamCounts.accounts;

    const filteredStaff = useMemo(() => {
        const q = staffSearch.trim().toLowerCase();
        if (!q) return staff;
        return staff.filter((s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
    }, [staff, staffSearch]);

    // ── fetch users by Filter (all | billing | accounts) ──
    const fetchTeam = async (filter) => {
        setTeamLoading(true);
        try {
            const res = await axios.get(teamManagementGet, {
                params: { filter: filter },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res?.data || {};
            const users = Array.isArray(data.users) ? data.users : [];
            setStaff(users.map((u) => ({
                id: u.id,
                name: u.name || '—',
                rollNumber: String(u.rollNumber || ''),
                role: u.financeUserType === 'accounts' ? 'accounts' : 'billing',
                designation: u.userType === 'admin' ? 'Admin' : 'Staff',
                initials: u.initials || getInitials(u.name),
            })));
            setTeamCounts({
                billing: Number(data.billingTeamCount) || 0,
                accounts: Number(data.accountsTeamCount) || 0,
                total: Number(data.totalAdminStaff) || 0,
            });
        } catch (err) {
            setStaff([]);
            showSnack('Failed to load team members.', false);
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam(staffRoleFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffRoleFilter]);

    // Move a staff member between Billing and Accounts, then refresh the list
    const handleMoveStaff = async (rollNumber, toAccounts) => {
        setMovingRoll(rollNumber);
        try {
            await axios.put(toAccounts ? moveToAccounts : moveToBilling, null, {
                params: { rollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            showSnack(toAccounts ? 'Moved to Accounts team.' : 'Moved to Billing team.', true);
            await fetchTeam(staffRoleFilter);
        } catch (err) {
            showSnack('Failed to move staff member.', false);
        } finally {
            setMovingRoll(null);
        }
    };

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
            }}
        >
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />

            <PageHeader
                title="Finance Teams"
                subtitle="Split admin staff between the Billing counter and the Accounts approvers"
                onBack={() => navigate(-1)}
            />

            <SectionTitle icon={GroupsIcon}>Team Split</SectionTitle>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={PaymentIcon}
                        label="Billing Team"
                        value={billingCount}
                        caption={staffRoleFilter === "billing" ? "Showing this team" : "Show this team"}
                        captionColor={staffRoleFilter === "billing" ? TEAM_TONES.billing.color : undefined}
                        captionBg={staffRoleFilter === "billing" ? TEAM_TONES.billing.bg : undefined}
                        accent={TEAM_TONES.billing.color}
                        accentBg={TEAM_TONES.billing.bg}
                        onClick={() => setStaffRoleFilter("billing")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={AccountBalanceIcon}
                        label="Accounts Team"
                        value={accountsCount}
                        caption={staffRoleFilter === "accounts" ? "Showing this team" : "Show this team"}
                        captionColor={staffRoleFilter === "accounts" ? TEAM_TONES.accounts.color : undefined}
                        captionBg={staffRoleFilter === "accounts" ? TEAM_TONES.accounts.bg : undefined}
                        accent={TEAM_TONES.accounts.color}
                        accentBg={TEAM_TONES.accounts.bg}
                        onClick={() => setStaffRoleFilter("accounts")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={GroupsIcon}
                        label="Total Admin Staff"
                        value={teamCounts.total}
                        caption={staffRoleFilter === "all" ? "Showing everyone" : "Show everyone"}
                        captionColor={staffRoleFilter === "all" ? BRAND.blue.main : undefined}
                        captionBg={staffRoleFilter === "all" ? BRAND.blue.icon : undefined}
                        accent={BRAND.blue.main}
                        accentBg={BRAND.blue.icon}
                        onClick={() => setStaffRoleFilter("all")}
                    />
                </Grid>
            </Grid>

            <Panel
                title="Team Members"
                subtitle="Move staff between the Billing and Accounts teams"
                bodySx={{ p: 0 }}
                right={(
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            placeholder="Search name or roll number"
                            sx={{
                                width: { xs: "100%", sm: 250 },
                                "& .MuiOutlinedInput-root": {
                                    height: 34,
                                    fontSize: 12.5,
                                    borderRadius: RADIUS,
                                    bgcolor: "#fff",
                                    "& fieldset": { borderColor: DASH.line },
                                    "&:hover fieldset": { borderColor: DASH.faint },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: staffSearch ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setStaffSearch("")} sx={{ width: 22, height: 22 }}>
                                                <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />
                        <Tooltip arrow title="Refresh team list">
                            <IconButton
                                onClick={() => fetchTeam(staffRoleFilter)}
                                disabled={teamLoading}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${DASH.line}`,
                                    bgcolor: "#fff",
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 17, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            >
                {teamLoading && filteredStaff.length > 0 && (
                    <LinearProgress
                        sx={{
                            height: 2,
                            bgcolor: "transparent",
                            "& .MuiLinearProgress-bar": { bgcolor: DASH.primary },
                        }}
                    />
                )}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexWrap: "wrap",
                        px: 2,
                        py: 1.4,
                    }}
                >
                    <Box
                        sx={{
                            display: "inline-flex",
                            p: 0.4,
                            gap: 0.4,
                            bgcolor: DASH.lineSoft,
                            border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS,
                        }}
                    >
                        {[
                            { key: "all", label: "All", count: teamCounts.total, color: DASH.ink },
                            { key: "billing", label: TEAM_TONES.billing.label, count: billingCount, color: TEAM_TONES.billing.color },
                            { key: "accounts", label: TEAM_TONES.accounts.label, count: accountsCount, color: TEAM_TONES.accounts.color },
                        ].map((sc) => {
                            const on = staffRoleFilter === sc.key;
                            return (
                                <Box
                                    key={sc.key}
                                    onClick={() => setStaffRoleFilter(sc.key)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.6,
                                        px: 1.3,
                                        py: 0.55,
                                        borderRadius: RADIUS,
                                        cursor: "pointer",
                                        bgcolor: on ? "#fff" : "transparent",
                                        border: on ? `1px solid ${DASH.line}` : "1px solid transparent",
                                        boxShadow: on ? "0 1px 2px rgba(17,24,39,0.08)" : "none",
                                        transition: "background-color 0.15s ease",
                                        "&:hover": { bgcolor: on ? "#fff" : "rgba(255,255,255,0.6)" },
                                    }}
                                >
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: on ? sc.color : DASH.muted }}>
                                        {sc.label}
                                    </Typography>
                                    <Box
                                        sx={{
                                            px: 0.6,
                                            borderRadius: "20px",
                                            bgcolor: on ? `${sc.color}14` : DASH.line,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: on ? sc.color : DASH.muted, lineHeight: "15px" }}>
                                            {sc.count}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    <Typography sx={{ fontSize: 11.5, color: DASH.muted, fontWeight: 600 }}>
                        {staffSearch
                            ? `Showing ${filteredStaff.length} of ${staff.length}`
                            : `${staff.length} member${staff.length === 1 ? "" : "s"}`}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: { xs: "none", md: "grid" },
                        gridTemplateColumns: "minmax(0, 2.2fr) 1fr 1fr 110px 150px",
                        gap: 1.5,
                        px: 2,
                        pb: 0.8,
                        borderBottom: `1px solid ${DASH.line}`,
                    }}
                >
                    {["Member", "Roll Number", "Designation", "Team", ""].map((h, i) => (
                        <Typography
                            key={h || i}
                            sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: DASH.faint,
                                textAlign: i === 4 ? "right" : "left",
                            }}
                        >
                            {h}
                        </Typography>
                    ))}
                </Box>

                {teamLoading && filteredStaff.length === 0 && [0, 1, 2, 3].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                            px: 2,
                            py: 1.2,
                            borderBottom: `1px solid ${DASH.lineSoft}`,
                        }}
                    >
                        <Skeleton variant="circular" width={34} height={34} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Skeleton variant="text" width="26%" height={14} />
                            <Skeleton variant="text" width="14%" height={12} />
                        </Box>
                        <Skeleton variant="rounded" width={110} height={26} />
                    </Box>
                ))}

                {!teamLoading && filteredStaff.length === 0 && (
                    <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                bgcolor: DASH.lineSoft,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 1,
                            }}
                        >
                            <GroupsIcon sx={{ fontSize: 22, color: DASH.faint }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                            {staffSearch ? "No members match your search" : "No members in this view"}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.3 }}>
                            {staffSearch
                                ? "Try a different name or roll number."
                                : "Pick another team above, or move a staff member into this one."}
                        </Typography>
                        {staffSearch && (
                            <Button
                                onClick={() => setStaffSearch("")}
                                startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                    mt: 1.4,
                                    textTransform: "none",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    height: 30,
                                    px: 1.6,
                                    borderRadius: RADIUS,
                                    color: DASH.text,
                                    border: `1px solid ${DASH.line}`,
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                Clear search
                            </Button>
                        )}
                    </Box>
                )}

                {filteredStaff.map((s) => {
                    const isAccounts = s.role === "accounts";
                    const tone = isAccounts ? TEAM_TONES.accounts : TEAM_TONES.billing;
                    const target = isAccounts ? TEAM_TONES.billing : TEAM_TONES.accounts;
                    const busy = movingRoll === s.rollNumber;
                    return (
                        <Box
                            key={s.id}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2.2fr) 1fr 1fr 110px 150px" },
                                alignItems: "center",
                                gap: { xs: 1, md: 1.5 },
                                px: 2,
                                py: 1.1,
                                borderBottom: `1px solid ${DASH.lineSoft}`,
                                transition: "background-color 0.15s ease",
                                "&:hover": { bgcolor: DASH.lineSoft },
                                "&:last-of-type": { borderBottom: "none" },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: tone.color,
                                        bgcolor: tone.bg,
                                        border: `1px solid ${tone.border}`,
                                    }}
                                >
                                    {s.initials || getInitials(s.name)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                                        {s.name}
                                    </Typography>
                                    <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.5, mt: 0.2 }}>
                                        <BadgeOutlinedIcon sx={{ fontSize: 12, color: DASH.faint }} />
                                        <Typography sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>{s.rollNumber}</Typography>
                                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: DASH.line, mx: 0.3 }} />
                                        <WorkOutlineIcon sx={{ fontSize: 12, color: DASH.faint }} />
                                        <Typography noWrap sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>{s.designation}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.6, minWidth: 0 }}>
                                <BadgeOutlinedIcon sx={{ fontSize: 13, color: DASH.faint }} />
                                <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: DASH.text, fontFamily: "monospace" }}>
                                    {s.rollNumber}
                                </Typography>
                            </Box>

                            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.6, minWidth: 0 }}>
                                <WorkOutlineIcon sx={{ fontSize: 13, color: DASH.faint }} />
                                <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: DASH.text }}>
                                    {s.designation}
                                </Typography>
                            </Box>

                            <Box>
                                <Box
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        px: 0.9,
                                        py: 0.3,
                                        borderRadius: "20px",
                                        bgcolor: tone.bg,
                                        border: `1px solid ${tone.border}`,
                                    }}
                                >
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tone.color }} />
                                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: tone.color }}>
                                        {tone.label}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                                <Tooltip arrow title={`Move ${s.name} to the ${target.label} team`}>
                                    <Box component="span">
                                        <Button
                                            onClick={() => handleMoveStaff(s.rollNumber, !isAccounts)}
                                            disabled={busy}
                                            startIcon={<SwapHorizIcon sx={{ fontSize: 15 }} />}
                                            sx={{
                                                textTransform: "none",
                                                fontSize: 11.5,
                                                fontWeight: 700,
                                                height: 28,
                                                px: 1.2,
                                                borderRadius: RADIUS,
                                                whiteSpace: "nowrap",
                                                color: target.soft.color,
                                                bgcolor: target.soft.bg,
                                                border: `1px solid ${target.soft.border}`,
                                                "&:hover": { bgcolor: target.soft.hover, borderColor: target.color },
                                                "&.Mui-disabled": { color: DASH.faint, bgcolor: DASH.lineSoft, borderColor: DASH.line },
                                            }}
                                        >
                                            {busy ? "Moving…" : `To ${target.label}`}
                                        </Button>
                                    </Box>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                })}
            </Panel>
        </Box>
    );
}
