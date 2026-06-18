import React, { useMemo, useState } from "react";
import {
    Box, Typography, IconButton, Button, Avatar, Chip, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ACCENT = "#3457D5";

const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const daysBetween = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);

// ── Mock approved leaves (replace with API: /api/leave/on-leave?from=&to=) ───
const ON_LEAVE = [
    { id: 1, name: "Aditya Sharma", grade: "Grade 4 - B", roll: "SM-2025-452", type: "Sick Leave", from: "2026-06-18", to: "2026-06-20" },
    { id: 2, name: "Karthik Nair", grade: "Grade 8 - C", roll: "SM-2025-127", type: "Sick Leave", from: "2026-06-17", to: "2026-06-18" },
    { id: 3, name: "Meera Iyer", grade: "Grade 3 - A", roll: "SM-2025-061", type: "Sick Leave", from: "2026-06-18", to: "2026-06-21" },
    { id: 4, name: "Sara Khan", grade: "Grade 5 - A", roll: "SM-2025-289", type: "Medical Leave", from: "2026-06-16", to: "2026-06-16" },
    { id: 5, name: "Ishaan Mehta", grade: "Grade 7 - A", roll: "SM-2025-410", type: "Casual Leave", from: "2026-06-22", to: "2026-06-23" },
    { id: 6, name: "Ananya Rao", grade: "Grade 2 - B", roll: "SM-2025-077", type: "Sick Leave", from: "2026-06-19", to: "2026-06-25" },
];

export default function OnLeaveStudentsPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const userType = user.userType;

    const [fromDate, setFromDate] = useState(todayISO());
    const [toDate, setToDate] = useState(todayISO());
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    // Leaves overlapping the selected [from, to] range.
    const filtered = useMemo(() => {
        if (!fromDate || !toDate) return [];
        return ON_LEAVE
            .filter((l) => l.from <= toDate && l.to >= fromDate)
            .sort((a, b) => (a.from < b.from ? -1 : 1));
    }, [fromDate, toDate]);

    const setToday = () => { setFromDate(todayISO()); setToDate(todayISO()); };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    const rangeIsToday = fromDate === todayISO() && toDate === todayISO();

    return (
        <Box sx={{ width: "100%" }}>
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
                display:"flex", 
                py:1
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${ACCENT}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventBusyOutlinedIcon sx={{ fontSize: 22, color: ACCENT }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Students on Leave</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Approved student leaves for the selected date range</Typography>
                </Box>
            </Box>

            <Box sx={{ px: 2,pb:2, pt:"70px"  }}>
                {/* Date range filter */}
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, flexWrap: "wrap", p: 2, mb: 2, borderRadius: "12px", border: "1px solid #E5E7EB", bgcolor: "#fff" }}>
                    <Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.4 }}>From Date</Typography>
                        <TextField
                            type="date" size="small" value={fromDate}
                            onChange={(e) => { const v = e.target.value; setFromDate(v); if (toDate && v > toDate) setToDate(v); }}
                            sx={{ "& .MuiOutlinedInput-root": { height: 38, fontSize: 13, borderRadius: "10px" } }}
                        />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.4 }}>To Date</Typography>
                        <TextField
                            type="date" size="small" value={toDate}
                            slotProps={{ htmlInput: { min: fromDate } }}
                            onChange={(e) => setToDate(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { height: 38, fontSize: 13, borderRadius: "10px" } }}
                        />
                    </Box>
                    <Button
                        onClick={setToday}
                        startIcon={<TodayOutlinedIcon sx={{ fontSize: 17 }} />}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, height: 38, px: 2, borderRadius: "10px",
                            color: rangeIsToday ? "#fff" : ACCENT, bgcolor: rangeIsToday ? ACCENT : "#fff",
                            border: `1px solid ${ACCENT}${rangeIsToday ? "" : "40"}`, boxShadow: "none",
                            "&:hover": { bgcolor: rangeIsToday ? ACCENT : `${ACCENT}10`, borderColor: ACCENT } }}
                    >
                        Today
                    </Button>
                    <Box sx={{ ml: { sm: "auto" }, display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.9, borderRadius: "10px", bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}26` }}>
                        <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>On leave</Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{filtered.length}</Typography>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
                    <Table sx={{ minWidth: 720 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                                {["Student", "Leave Type", "From → To", "Days"].map((h) => (
                                    <TableCell key={h} sx={{ fontSize: 10.5, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #E5E7EB", py: 1.2 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: 13, fontWeight: 600 }}>
                                        No students on leave for this date range.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((row) => {
                                    const days = daysBetween(row.from, row.to);
                                    return (
                                        <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: "none" } }}>
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", py: 1.2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(row.name)}22`, color: colorFor(row.name) }}>{getInitials(row.name)}</Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{row.name}</Typography>
                                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{row.grade} · {row.roll}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{row.type}</TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
                                                {fmt(row.from)}{row.from !== row.to ? `  →  ${fmt(row.to)}` : ""}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #F1F3F5" }}>
                                                <Chip label={`${days} ${days > 1 ? "days" : "day"}`} size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: `${ACCENT}14`, color: ACCENT }} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
