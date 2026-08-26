import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Typography, IconButton, Button, Avatar, Chip, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import { useNavigate, Navigate } from "react-router-dom";
import { hasMainMenuAccess } from "../../../Redux/Slices/AuthSlice";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "../../Loader";
import { StudentsOnLeaveToday } from "../../../Api/Api";
import { DASH } from "../../DashBoardComps/dashboardTheme";

const ACCENT = "#3457D5";
const TOKEN = "123";

const getInitials = (n = "") => n.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const AVATAR_PALETTE = ["#0E7490", "#6D28D9", "#C2410C", "#047857", "#1D4ED8", "#BE185D", "#A16207", "#0F766E"];
const colorFor = (s = "") => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

const todayISO = () => new Date().toISOString().slice(0, 10);
const isoToDMY = (iso) => { const [y, m, d] = iso.split("-"); return `${d}-${m}-${y}`; }; // YYYY-MM-DD → DD-MM-YYYY (API format)
const daysLabel = (row) => {
    if (row.isHalfDay) return "Half day";
    const n = Number(row.totalDays) || 0;
    return `${n % 1 === 0 ? n : n.toFixed(1)} ${n > 1 ? "days" : "day"}`;
};

export default function OnLeaveStudentsPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    // Until the backend publishes an "approvals" main menu the module stays
    // open; once it arrives it decides on its own.
    const permissions = user.permissions;
    const rbacReady = Boolean((permissions?.mainMenus || []).find((mm) => mm.mainMenu === "approvals"));
    const hasApprovalsAccess = !rbacReady || hasMainMenuAccess(permissions, "approvals");
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const [fromDate, setFromDate] = useState(todayISO());
    const [toDate, setToDate] = useState(todayISO());
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── StudentsOnLeaveToday — approved leaves overlapping the date range ──────
    const fetchOnLeave = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setIsLoading(true);
        try {
            const res = await axios.get(StudentsOnLeaveToday, {
                params: { fromDate: isoToDMY(fromDate), toDate: isoToDMY(toDate) },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            setData(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err) {
            console.error("StudentsOnLeaveToday failed:", err);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => { fetchOnLeave(); }, [fetchOnLeave]);

    const setToday = () => { setFromDate(todayISO()); setToDate(todayISO()); };

    if (!hasApprovalsAccess) {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    const rangeIsToday = fromDate === todayISO() && toDate === todayISO();

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: { xs: 2, md: 3 },
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            {isLoading && <Loader />}
            {/* Header */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                </IconButton>
                <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${ACCENT}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventBusyOutlinedIcon sx={{ fontSize: 22, color: ACCENT }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Students on Leave</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Approved student leaves for the selected date range</Typography>
                </Box>
            </Box>

            <Box sx={{ pb: 1 }}>
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
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{data.length}</Typography>
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
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: 13, fontWeight: 600 }}>
                                        {isLoading ? "Loading…" : "No students on leave for this date range."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: "none" } }}>
                                        <TableCell sx={{ borderBottom: "1px solid #F1F3F5", py: 1.2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: `${colorFor(row.studentName)}22`, color: colorFor(row.studentName) }}>{getInitials(row.studentName)}</Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{row.studentName}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{row.grade}{row.section ? ` - ${row.section}` : ""} · {row.rollNumber}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{row.leaveType}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #F1F3F5", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
                                            {row.fromDate}{row.fromDate !== row.toDate ? `  →  ${row.toDate}` : ""}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #F1F3F5" }}>
                                            <Chip label={daysLabel(row)} size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: `${ACCENT}14`, color: ACCENT }} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
