import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Typography, IconButton, Button, Avatar, Chip, Tooltip, Divider, Select, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, TextareaAutosize,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { GetOverallLeaveDetails, StudentsOnLeaveToday, LeaveApproval } from "../../../Api/Api";

const ACCENT = "#3457D5";
const TOKEN = "123";

const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

// ── Date helpers ────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const currentMonth = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const todayDMY = () => { const d = new Date(); return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`; };
// YYYY-MM → { from: "01-MM-YYYY", to: "<lastDay>-MM-YYYY" } (API expects DD-MM-YYYY)
const monthRange = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    return { from: `01-${pad(m)}-${y}`, to: `${pad(last)}-${pad(m)}-${y}` };
};
// Last 12 months (current first) for the dropdown.
const buildMonths = () => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        opts.push({ value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleString("en-US", { month: "long", year: "numeric" }) });
    }
    return opts;
};
const daysLabel = (row) => {
    if (row.isHalfDay) return "Half day";
    const n = Number(row.totalDays) || 0;
    return `${n % 1 === 0 ? n : n.toFixed(1)} ${n > 1 ? "days" : "day"}`;
};

const STATUS_META = {
    pending: { label: "Pending", color: "#EA580C", bg: "#FFF7ED", icon: PendingActionsIcon },
    approved: { label: "Approved", color: "#16A34A", bg: "#DCFCE7", icon: CheckCircleIcon },
    rejected: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2", icon: CancelIcon },
};

const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

export default function StudentLeaveApprovalPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const userType = user.userType;
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const [filter, setFilter] = useState("all");
    const [month, setMonth] = useState(currentMonth);
    const months = useMemo(buildMonths, []);

    const [leaves, setLeaves] = useState([]);
    const [cards, setCards] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [todayList, setTodayList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });

    // Reject dialog
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ── GetOverallLeaveDetails — cards + table for the selected month & status ──
    const fetchLeaves = useCallback(async () => {
        setIsLoading(true);
        try {
            const { from, to } = monthRange(month);
            const res = await axios.get(GetOverallLeaveDetails, {
                params: { fromDate: from, toDate: to, status: filter },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const d = res.data || {};
            setCards(d.cards || { pending: 0, approved: 0, rejected: 0 });
            setLeaves(Array.isArray(d.leaves) ? d.leaves : []);
        } catch (err) {
            console.error("GetOverallLeaveDetails failed:", err);
            showSnack("Failed to load leave details.", false);
            setLeaves([]);
        } finally {
            setIsLoading(false);
        }
    }, [month, filter]);

    // ── StudentsOnLeaveToday — the "on leave today" panel ──────────────────────
    const fetchTodayOnLeave = useCallback(async () => {
        try {
            const t = todayDMY();
            const res = await axios.get(StudentsOnLeaveToday, {
                params: { fromDate: t, toDate: t },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            setTodayList(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err) {
            console.error("StudentsOnLeaveToday failed:", err);
        }
    }, []);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);
    useEffect(() => { fetchTodayOnLeave(); }, [fetchTodayOnLeave]);

    // ── LeaveApproval — approve / reject ───────────────────────────────────────
    const submitAction = async (row, action, reason = "") => {
        setSubmitting(true);
        setIsLoading(true);
        try {
            await axios.post(LeaveApproval, {
                leaveApplicationId: row.id,
                studentRollNumber: row.rollNumber,
                approverRollNumber: user.rollNumber,
                approverUserType: userType,
                action,                       // "approve" | "reject"
                rejectReason: reason || "",
            }, { headers: { Authorization: `Bearer ${TOKEN}` } });
            showSnack(
                action === "approve"
                    ? `Approved ${row.studentName}'s ${row.leaveType}.`
                    : `Rejected ${row.studentName}'s ${row.leaveType}.`,
                action === "approve"
            );
            await Promise.all([fetchLeaves(), fetchTodayOnLeave()]);
        } catch (err) {
            console.error("LeaveApproval failed:", err);
            showSnack("Action failed. Please try again.", false);
        } finally {
            setSubmitting(false);
            setIsLoading(false);
        }
    };

    const approve = (row) => submitAction(row, "approve");

    const openReject = (row) => { setRejectTarget(row); setRejectReason(""); };
    const closeReject = () => { setRejectTarget(null); setRejectReason(""); };
    const confirmReject = async () => {
        if (!rejectReason.trim()) { showSnack("Please enter a reason for rejection.", false); return; }
        await submitAction(rejectTarget, "reject", rejectReason.trim());
        closeReject();
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    const kpis = [
        { key: "pending", label: "Pending", value: cards.pending || 0, color: "#EA580C", bg: "#FFF7ED", icon: PendingActionsIcon },
        { key: "approved", label: "Approved", value: cards.approved || 0, color: "#16A34A", bg: "#DCFCE7", icon: CheckCircleIcon },
        { key: "rejected", label: "Rejected", value: cards.rejected || 0, color: "#DC2626", bg: "#FEE2E2", icon: CancelIcon },
        { key: "today", label: "Today on Leave", value: todayList.length, color: ACCENT, bg: "#EAF0FC", icon: EventBusyOutlinedIcon },
    ];

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
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
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
                display: "flex",
                py: 1,
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${ACCENT}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventBusyOutlinedIcon sx={{ fontSize: 22, color: ACCENT }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Student Leave Management</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Review, approve or reject student leave requests</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, alignSelf: "center" }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", display: { xs: "none", sm: "block" } }}>Month</Typography>
                    <Select
                        size="small" value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        sx={{ fontSize: 12.5, fontWeight: 700, height: 36, bgcolor: "#fff", borderRadius: "8px", minWidth: 160, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
                    >
                        {months.map((m) => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 13 }}>{m.label}</MenuItem>)}
                    </Select>
                </Box>
            </Box>

            <Box sx={{ px: 2, pb: 2, pt: "70px" }}>
                {/* KPI / status cards */}
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                    {kpis.map((k) => {
                        const Icon = k.icon;
                        return (
                            <Box key={k.key} sx={{ flex: "1 1 180px", display: "flex", alignItems: "center", gap: 1.4, p: 1.6, borderRadius: "12px", border: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: k.bg }}>
                                    <Icon sx={{ fontSize: 22, color: k.color }} />
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{k.value}</Typography>
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.3 }}>{k.label}</Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* Today on leave */}
                <Box sx={{ p: 1.6, mb: 2, borderRadius: "12px", border: `1px solid ${ACCENT}33`, bgcolor: `${ACCENT}08` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: todayList.length ? 1.2 : 0 }}>
                        <EventBusyOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1E3A8A" }}>Students on Leave Today</Typography>
                        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box sx={{ minWidth: 22, height: 20, px: 0.8, borderRadius: "10px", bgcolor: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                                {todayList.length}
                            </Box>
                            <Tooltip title="View all students on leave (with date filter)" arrow>
                                <IconButton size="small" onClick={() => navigate("/dashboardmenu/approvals/on-leave")} sx={{ width: 28, height: 28, bgcolor: "#fff", border: `1px solid ${ACCENT}40`, "&:hover": { bgcolor: `${ACCENT}10`, borderColor: ACCENT } }}>
                                    <ArrowForwardIcon sx={{ fontSize: 16, color: ACCENT }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                    {todayList.length === 0 ? (
                        <Typography sx={{ fontSize: 12, color: "#64748B" }}>No students are on approved leave today.</Typography>
                    ) : (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {todayList.map((s) => (
                                <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.7, borderRadius: "10px", bgcolor: "#fff", border: "1px solid #E5E7EB" }}>
                                    <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: `${colorFor(s.studentName)}22`, color: colorFor(s.studentName) }}>{getInitials(s.studentName)}</Avatar>
                                    <Box>
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{s.studentName}</Typography>
                                        <Typography sx={{ fontSize: 10.5, color: "#9CA3AF" }}>{s.grade}{s.section ? ` - ${s.section}` : ""} · {s.leaveType}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Filter chips */}
                <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                    {FILTERS.map((f) => {
                        const active = filter === f.key;
                        const c = f.key === "all" ? ACCENT : STATUS_META[f.key].color;
                        return (
                            <Chip
                                key={f.key}
                                label={`${f.label}${f.key === "all" ? "" : ` (${cards[f.key] ?? 0})`}`}
                                onClick={() => setFilter(f.key)}
                                sx={{
                                    height: 30, fontSize: 12, fontWeight: 700, borderRadius: "8px", cursor: "pointer",
                                    bgcolor: active ? c : "#fff", color: active ? "#fff" : "#374151",
                                    border: `1px solid ${active ? c : "#E5E7EB"}`,
                                    "&:hover": { bgcolor: active ? c : `${c}10` },
                                }}
                            />
                        );
                    })}
                </Box>

                {/* Leaves table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
                    <Table sx={{ minWidth: 820 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                                {["Student", "Leave Type", "Duration", "Days", "Reason", "Status", "Action"].map((h) => (
                                    <TableCell key={h} sx={{ fontSize: 10.5, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #E5E7EB", py: 1.2 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: 13, fontWeight: 600 }}>
                                        {isLoading ? "Loading…" : `No ${filter === "all" ? "" : filter} leave requests for this month.`}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((row) => {
                                    const statusKey = (row.status || "").toLowerCase();
                                    const meta = STATUS_META[statusKey] || STATUS_META.pending;
                                    const StatusIcon = meta.icon;
                                    return (
                                        <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: "none" } }}>
                                            {/* Student */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", py: 1.2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(row.studentName)}22`, color: colorFor(row.studentName) }}>{getInitials(row.studentName)}</Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{row.studentName}</Typography>
                                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{row.grade}{row.section ? ` - ${row.section}` : ""} · {row.rollNumber}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            {/* Leave type */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{row.leaveType}</TableCell>
                                            {/* Duration */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
                                                {row.fromDate}{row.fromDate !== row.toDate ? ` → ${row.toDate}` : ""}
                                            </TableCell>
                                            {/* Days */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5" }}>
                                                <Chip label={daysLabel(row)} size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: `${ACCENT}14`, color: ACCENT }} />
                                            </TableCell>
                                            {/* Reason */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12, color: "#6B7280", maxWidth: 220 }}>
                                                <Tooltip title={row.reason || ""} arrow>
                                                    <Typography sx={{ fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.reason}</Typography>
                                                </Tooltip>
                                                {statusKey === "rejected" && row.rejectReason && (
                                                    <Typography sx={{ fontSize: 10.5, color: "#DC2626", mt: 0.3 }}>Rejected: {row.rejectReason}</Typography>
                                                )}
                                                {statusKey === "approved" && row.approvedByName && (
                                                    <Typography sx={{ fontSize: 10.5, color: "#16A34A", mt: 0.3 }}>By {row.approvedByName}{row.approvedOnDate ? ` · ${row.approvedOnDate}` : ""}</Typography>
                                                )}
                                            </TableCell>
                                            {/* Status */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5" }}>
                                                <Chip icon={<StatusIcon sx={{ fontSize: "14px !important" }} />} label={meta.label} size="small"
                                                    sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: meta.bg, color: meta.color, "& .MuiChip-icon": { color: meta.color } }} />
                                            </TableCell>
                                            {/* Action */}
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5" }}>
                                                {statusKey === "pending" ? (
                                                    <Box sx={{ display: "flex", gap: 0.8 }}>
                                                        <Button onClick={() => approve(row)} disabled={submitting} startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, bgcolor: "#16A34A", color: "#fff", borderRadius: "8px", height: 30, px: 1.2, boxShadow: "none", "&:hover": { bgcolor: "#15803D", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#A7F3D0", color: "#fff" } }}>
                                                            Approve
                                                        </Button>
                                                        <Button onClick={() => openReject(row)} disabled={submitting} startIcon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
                                                            sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: "8px", height: 30, px: 1.2, "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" } }}>
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontStyle: "italic" }}>
                                                        {meta.label}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Reject reason dialog */}
            <Dialog open={Boolean(rejectTarget)} onClose={closeReject} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "14px" } } }}>
                <DialogTitle sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CancelIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>Reject Leave</Typography>
                            <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>{rejectTarget?.studentName} · {rejectTarget?.leaveType}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeReject}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.6 }}>Reason for Rejection *</Typography>
                    <TextareaAutosize
                        minRows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter the reason for rejecting this leave request…"
                        style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: "1px solid #E5E7EB", padding: 10, fontSize: 13, fontFamily: "inherit", resize: "vertical", overflowX: "hidden", outlineColor: ACCENT }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeReject} sx={{ textTransform: "none", fontWeight: 700, color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", px: 2, height: 36 }}>Cancel</Button>
                    <Button onClick={confirmReject} disabled={submitting} variant="contained" disableElevation sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#DC2626", color: "#fff", borderRadius: "8px", px: 2.4, height: 36, "&:hover": { bgcolor: "#B91C1C" } }}>Reject Leave</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
