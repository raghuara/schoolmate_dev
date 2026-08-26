import { Avatar, Box, Button, Chip, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
    DASH, RADIUS, KPI_TONES, SOFT, Panel, SolidStatCard, MeterRow, EmptyNote,
} from "./dashboardTheme";
import {
    MOCK_MY_SCHEDULE, MOCK_MY_ATTENDANCE, MOCK_MY_LEAVE_BALANCE, MOCK_MY_LEAVE_REQUESTS,
    MOCK_MY_SUBMISSIONS, MOCK_MY_HOMEWORK, MOCK_MY_PAYSLIP, MOCK_MY_ACTIONS,
    MOCK_MARKS_ENTRY, MOCK_NEWS, MOCK_EVENTS, MOCK_BIRTHDAYS,
} from "./dashboardMockData";

const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.4, mt: 1 }}>
        {Icon && <Icon sx={{ fontSize: 16, color: DASH.primary }} />}
        <Typography
            sx={{
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: DASH.muted,
                flexShrink: 0,
            }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
    </Box>
);

const STATUS_TONE = {
    Approved: { bg: DASH.greenLight, color: DASH.green },
    Credited: { bg: DASH.greenLight, color: DASH.green },
    Pending: { bg: DASH.amberLight, color: DASH.amber },
    Rejected: { bg: DASH.redLight, color: DASH.red },
};

const StatusChip = ({ status }) => {
    const tone = STATUS_TONE[status] || { bg: DASH.lineSoft, color: DASH.muted };
    return (
        <Chip
            label={status}
            size="small"
            sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: tone.bg, color: tone.color }}
        />
    );
};

const severityIcon = (severity) =>
    severity === "critical" ? ErrorOutlineRoundedIcon : severity === "info" ? InfoOutlinedIcon : WarningAmberRoundedIcon;

export default function CommonDashboard({ header }) {
    const navigate = useNavigate();

    const toMark = MOCK_MY_SCHEDULE.filter((s) => !s.attendanceMarked);
    const leaveTaken = MOCK_MY_LEAVE_BALANCE.reduce((sum, l) => sum + l.used, 0);
    const leaveTotal = MOCK_MY_LEAVE_BALANCE.reduce((sum, l) => sum + l.total, 0);
    const leaveLeft = leaveTotal - leaveTaken;
    const pendingRequests = MOCK_MY_LEAVE_REQUESTS.filter((r) => r.status === "Pending").length;

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 2 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            {header}

            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={ScheduleOutlinedIcon}
                        label="My Classes Today"
                        value={MOCK_MY_SCHEDULE.length}
                        note={`${MOCK_MY_SCHEDULE.length - toMark.length} done`}
                        tone={KPI_TONES.violet}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={HowToRegOutlinedIcon}
                        label="Attendance To Mark"
                        value={toMark.length}
                        note={toMark.length ? "Pending for today" : "All marked"}
                        tone={KPI_TONES.pink}
                        onClick={() => navigate("/dashboardmenu/attendance")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={EventAvailableOutlinedIcon}
                        label="My Attendance"
                        value={`${MOCK_MY_ATTENDANCE.percent}%`}
                        note={`${MOCK_MY_ATTENDANCE.present}/${MOCK_MY_ATTENDANCE.workingDays} days this month`}
                        tone={KPI_TONES.cyan}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={EventBusyOutlinedIcon}
                        label="Leave Balance"
                        value={leaveLeft}
                        note={`${leaveTaken} of ${leaveTotal} used`}
                        tone={KPI_TONES.orange}
                    />
                </Grid>
            </Grid>

            <SectionTitle icon={ScheduleOutlinedIcon}>My Day</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
                    <Panel
                        title="Today's Schedule"
                        subtitle={`${MOCK_MY_SCHEDULE.length} periods`}
                        accent={DASH.violet}
                        sx={{ height: "100%" }}
                        right={
                            <Button
                                onClick={() => navigate("/dashboardmenu/timetable")}
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700, color: DASH.blue }}
                            >
                                Full Timetable
                            </Button>
                        }
                    >
                        {MOCK_MY_SCHEDULE.length === 0 && <EmptyNote text="No classes scheduled for today." />}
                        {MOCK_MY_SCHEDULE.map((s) => (
                            <Box
                                key={s.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.4,
                                    py: 1,
                                    px: s.current ? 1.2 : 0,
                                    mx: s.current ? -1.2 : 0,
                                    borderRadius: RADIUS,
                                    bgcolor: s.current ? DASH.violetLight : "transparent",
                                    borderBottom: `1px solid ${DASH.lineSoft}`,
                                    "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: RADIUS,
                                        bgcolor: s.current ? DASH.violet : DASH.lineSoft,
                                        color: s.current ? "#fff" : DASH.muted,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 800 }}>{s.period}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink }} noWrap>
                                        {s.grade} · {s.subject}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>
                                        {s.time} • {s.room}
                                    </Typography>
                                </Box>
                                {s.attendanceMarked ? (
                                    <Chip label="Marked" size="small" sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.greenLight, color: DASH.green }} />
                                ) : (
                                    <Button
                                        onClick={() => navigate("/dashboardmenu/attendance")}
                                        sx={{
                                            textTransform: "none",
                                            fontSize: "11.5px",
                                            fontWeight: 700,
                                            height: 26,
                                            px: 1.2,
                                            borderRadius: RADIUS,
                                            color: SOFT.pink.color,
                                            bgcolor: SOFT.pink.bg,
                                            border: `1px solid ${SOFT.pink.border}`,
                                            "&:hover": { bgcolor: SOFT.pink.hover },
                                        }}
                                    >
                                        Mark
                                    </Button>
                                )}
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                    <Panel title="My Pending Actions" subtitle="Assigned to you" accent={DASH.primary} sx={{ height: "100%" }}>
                        {MOCK_MY_ACTIONS.length === 0 && <EmptyNote text="Nothing pending. You are all caught up." />}
                        {MOCK_MY_ACTIONS.map((a) => {
                            const Icon = severityIcon(a.severity);
                            return (
                                <Box
                                    key={a.id}
                                    onClick={() => navigate(a.path)}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.2, p: 1.2, mb: 1,
                                        border: `1px solid ${DASH.lineSoft}`, borderRadius: RADIUS, cursor: "pointer",
                                        "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                                    }}
                                >
                                    <Icon sx={{ fontSize: 18, color: a.severity === "critical" ? DASH.red : a.severity === "info" ? DASH.blue : DASH.amber, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "13px", color: DASH.ink, flex: 1, minWidth: 0 }}>{a.label}</Typography>
                                    <Chip label={a.due} size="small" sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.lineSoft, color: DASH.muted }} />
                                </Box>
                            );
                        })}
                    </Panel>
                </Grid>
            </Grid>

            <SectionTitle icon={EventBusyOutlinedIcon}>My Attendance &amp; Leave</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Panel title="My Attendance" subtitle={MOCK_MY_ATTENDANCE.month} accent={DASH.cyan} sx={{ height: "100%" }}>
                        <MeterRow
                            label="Present"
                            value={MOCK_MY_ATTENDANCE.present}
                            max={MOCK_MY_ATTENDANCE.workingDays}
                            right={`${MOCK_MY_ATTENDANCE.present}/${MOCK_MY_ATTENDANCE.workingDays}`}
                            color={DASH.green}
                        />
                        <MeterRow
                            label="Late arrivals"
                            value={MOCK_MY_ATTENDANCE.late}
                            max={MOCK_MY_ATTENDANCE.workingDays}
                            right={`${MOCK_MY_ATTENDANCE.late}`}
                            color={DASH.amber}
                        />
                        <MeterRow
                            label="Half day"
                            value={MOCK_MY_ATTENDANCE.halfDay}
                            max={MOCK_MY_ATTENDANCE.workingDays}
                            right={`${MOCK_MY_ATTENDANCE.halfDay}`}
                            color={DASH.blue}
                        />
                        <MeterRow
                            label="Absent"
                            value={MOCK_MY_ATTENDANCE.absent}
                            max={MOCK_MY_ATTENDANCE.workingDays}
                            right={`${MOCK_MY_ATTENDANCE.absent}`}
                            color={DASH.red}
                        />
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Panel title="Leave Balance" subtitle="This academic year" accent={DASH.cyan} sx={{ height: "100%" }}>
                        {MOCK_MY_LEAVE_BALANCE.map((l) => (
                            <MeterRow
                                key={l.type}
                                label={l.type}
                                value={l.total - l.used}
                                max={l.total}
                                right={`${l.total - l.used} left`}
                                color={l.total - l.used > 0 ? DASH.green : DASH.red}
                            />
                        ))}
                        <Divider sx={{ my: 1.2 }} />
                        <Button
                            onClick={() => navigate("/dashboardmenu/Leave/leave-attendance")}
                            startIcon={<EventBusyOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{ textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.blue, p: 0 }}
                        >
                            Apply for Leave
                        </Button>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                    <Panel
                        title="My Leave Requests"
                        subtitle={pendingRequests ? `${pendingRequests} awaiting approval` : "Nothing awaiting approval"}
                        accent={DASH.cyan}
                        sx={{ height: "100%" }}
                    >
                        {MOCK_MY_LEAVE_REQUESTS.length === 0 && <EmptyNote text="You have not applied for leave yet." />}
                        {MOCK_MY_LEAVE_REQUESTS.map((r) => (
                            <Box
                                key={r.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2, py: 1,
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }} noWrap>
                                        {r.type}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>
                                        {r.from} - {r.to} • {r.days}d • {r.applied}
                                    </Typography>
                                </Box>
                                <StatusChip status={r.status} />
                            </Box>
                        ))}
                    </Panel>
                </Grid>
            </Grid>

            <SectionTitle icon={AutoStoriesOutlinedIcon}>My Work</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Panel title="My Homework" accent={DASH.violet} sx={{ height: "100%" }}>
                        {[
                            ["Assigned today", MOCK_MY_HOMEWORK.assignedToday],
                            ["This week", MOCK_MY_HOMEWORK.thisWeek],
                            ["Due tomorrow", MOCK_MY_HOMEWORK.dueTomorrow],
                            ["Classes covered", MOCK_MY_HOMEWORK.classesCovered],
                        ].map(([k, v]) => (
                            <Box
                                key={k}
                                sx={{
                                    display: "flex", justifyContent: "space-between", gap: 1, py: 0.8,
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>{k}</Typography>
                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>{v}</Typography>
                            </Box>
                        ))}
                        <Divider sx={{ my: 1.2 }} />
                        <Button
                            onClick={() => navigate("/dashboardmenu/homework/create")}
                            startIcon={<AutoStoriesOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{ textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.blue, p: 0 }}
                        >
                            Add Homework
                        </Button>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Panel title="Marks Entry" subtitle="My subjects" accent={DASH.violet} sx={{ height: "100%" }}>
                        {MOCK_MARKS_ENTRY.length === 0 && <EmptyNote text="No marks entry pending." />}
                        {MOCK_MARKS_ENTRY.map((m) => (
                            <MeterRow
                                key={m.exam}
                                label={m.exam}
                                value={m.entered}
                                max={m.total}
                                right={`${m.entered}/${m.total}`}
                                color={m.entered === m.total ? DASH.green : DASH.amber}
                            />
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                    <Panel title="My Submissions" subtitle="Sent for approval" accent={DASH.violet} sx={{ height: "100%" }}>
                        {MOCK_MY_SUBMISSIONS.length === 0 && <EmptyNote text="You have not submitted anything yet." />}
                        {MOCK_MY_SUBMISSIONS.map((s) => (
                            <Box
                                key={s.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2, py: 1,
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <FactCheckOutlinedIcon sx={{ fontSize: 17, color: DASH.violet, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }} noWrap>
                                        {s.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{s.kind} • {s.when}</Typography>
                                </Box>
                                <StatusChip status={s.status} />
                            </Box>
                        ))}
                    </Panel>
                </Grid>
            </Grid>

            <SectionTitle icon={CampaignOutlinedIcon}>For Me</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="News &amp; Circulars" accent={DASH.blue} sx={{ height: "100%" }}>
                        {MOCK_NEWS.slice(0, 4).map((n) => (
                            <Box
                                key={n.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2, py: 1,
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <CampaignOutlinedIcon sx={{ fontSize: 17, color: DASH.primary, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.ink }} noWrap>{n.title}</Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{n.kind} • {n.posted}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="Upcoming Events" accent={DASH.blue} sx={{ height: "100%" }}>
                        {MOCK_EVENTS.map((e) => (
                            <Box
                                key={e.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2, py: 1,
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: DASH.blue, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, flex: 1, minWidth: 0 }} noWrap>{e.name}</Typography>
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted }}>{e.date}</Typography>
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="Today's Birthdays" accent={DASH.pink} sx={{ height: "100%" }}>
                        {MOCK_BIRTHDAYS.length === 0 && <EmptyNote text="No birthdays today." />}
                        {MOCK_BIRTHDAYS.map((b) => (
                            <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.9 }}>
                                <Avatar sx={{ width: 30, height: 30, bgcolor: DASH.pinkLight, color: DASH.pink }}>
                                    <CakeOutlinedIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }} noWrap>{b.name}</Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{b.detail}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="My Last Payslip" subtitle={MOCK_MY_PAYSLIP.month} accent={DASH.green} sx={{ height: "100%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 36, height: 36, borderRadius: RADIUS, bgcolor: DASH.greenLight,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}
                            >
                                <PaymentsOutlinedIcon sx={{ fontSize: 19, color: DASH.green }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "18px", fontWeight: 800, color: DASH.ink, lineHeight: 1.2 }}>
                                    ₹{MOCK_MY_PAYSLIP.net}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: DASH.faint }}>Net pay</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.8, borderTop: `1px solid ${DASH.lineSoft}` }}>
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Status</Typography>
                            <StatusChip status={MOCK_MY_PAYSLIP.status} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.8, borderTop: `1px solid ${DASH.lineSoft}` }}>
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Credited on</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>{MOCK_MY_PAYSLIP.creditedOn}</Typography>
                        </Box>
                    </Panel>
                </Grid>
            </Grid>
        </Box>
    );
}
