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
import { useSelector } from "react-redux";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    MOCK_MY_SCHEDULE, MOCK_MY_ACTIONS, MOCK_MARKS_ENTRY,
} from "./dashboardMockData";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { useCommonDashboard } from "./dashboardApi";

/* commonDashboard serves headline, attendanceLeave, work and forMe. Today's
   Schedule, My Pending Actions and Marks Entry have no endpoint - the collection
   notes there is no honest data source for them yet - so those three keep the
   placeholder data and are marked "Sample" on screen. */
const EMPTY_ATTENDANCE = { month: "", workingDays: 0, present: 0, absent: 0, late: 0, halfDay: 0, percent: 0 };
const EMPTY_HOMEWORK = { assignedToday: 0, thisWeek: 0, dueTomorrow: 0, classesCovered: 0 };
const EMPTY_PAYSLIP = { month: "", net: "", status: "", creditedOn: "" };

const SampleChip = () => (
    <Box
        component="span"
        sx={{
            display: "inline-block", ml: 1, px: 0.7, borderRadius: "20px",
            bgcolor: DASH.lineSoft, color: DASH.faint,
            fontSize: "9px", fontWeight: 800, lineHeight: "15px", verticalAlign: "middle",
        }}
    >
        Sample
    </Box>
);

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
    const auth = useSelector((state) => state.auth);
    const academicYear = useSelector(selectAcademicYear);

    // Four self-service sections, fired together. Each keeps its own error.
    const { data: common, errors: commonErrors, loading: commonLoading, reload: reloadCommon } = useCommonDashboard({
        rollNumber: auth.rollNumber,
        academicYear,
    });

    const headline = common?.headline || null;
    const myAttendance = common?.attendanceLeave?.attendance || EMPTY_ATTENDANCE;
    const leaveBalance = common?.attendanceLeave?.leaveBalance || [];
    const leaveRequests = common?.attendanceLeave?.leaveRequests || [];
    const myHomework = common?.work?.homework || EMPTY_HOMEWORK;
    const submissions = common?.work?.submissions || [];
    const news = common?.forMe?.news || [];
    const events = common?.forMe?.events || [];
    const birthdays = common?.forMe?.birthdays || [];
    const payslip = common?.forMe?.payslip || EMPTY_PAYSLIP;

    const failedSections = Object.keys(commonErrors || {}).filter((k) => commonErrors[k]);

    const toMark = MOCK_MY_SCHEDULE.filter((s) => !s.attendanceMarked);

    // The headline endpoint carries these directly; the leave section is the
    // fallback so the cards still read correctly if headline is the one that fails.
    const leaveTaken = leaveBalance.reduce((sum, l) => sum + l.used, 0);
    const leaveTotalFromList = leaveBalance.reduce((sum, l) => sum + l.total, 0);
    const leaveTotal = headline?.leaveTotal || leaveTotalFromList;
    const leaveLeft = headline?.leaveLeft || (leaveTotalFromList - leaveTaken);
    const pendingRequests = headline?.pendingRequests
        || leaveRequests.filter((r) => String(r.status).toLowerCase() === "pending").length;
    const attendancePercent = headline?.attendancePercent || myAttendance.percent;
    const presentDays = headline?.presentDays || myAttendance.present;
    const workingDays = headline?.workingDays || myAttendance.workingDays;

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

            {/* Live-data strip: refresh plus whichever sections failed to load */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <Button
                    onClick={reloadCommon}
                    disabled={commonLoading}
                    startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                    sx={{
                        textTransform: "none", fontSize: "12px", fontWeight: 600, color: DASH.text,
                        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.4, py: 0.3,
                        "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                    }}
                >
                    {commonLoading ? "Refreshing..." : "Refresh"}
                </Button>
                {failedSections.length > 0 && (
                    <Typography sx={{ fontSize: "11.5px", color: DASH.red }}>
                        Could not load: {failedSections.join(", ")}
                    </Typography>
                )}
            </Box>

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
                        value={`${attendancePercent}%`}
                        note={`${presentDays}/${workingDays} days this month`}
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

            <SectionTitle icon={ScheduleOutlinedIcon}>My Day <SampleChip /></SectionTitle>
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
                    <Panel title="My Pending Actions" subtitle="Assigned to you" accent={DASH.primary} right={<SampleChip />} sx={{ height: "100%" }}>
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
                    <Panel title="My Attendance" subtitle={myAttendance.month} accent={DASH.cyan} sx={{ height: "100%" }}>
                        <MeterRow
                            label="Present"
                            value={myAttendance.present}
                            max={myAttendance.workingDays}
                            right={`${myAttendance.present}/${myAttendance.workingDays}`}
                            color={DASH.green}
                        />
                        <MeterRow
                            label="Late arrivals"
                            value={myAttendance.late}
                            max={myAttendance.workingDays}
                            right={`${myAttendance.late}`}
                            color={DASH.amber}
                        />
                        <MeterRow
                            label="Half day"
                            value={myAttendance.halfDay}
                            max={myAttendance.workingDays}
                            right={`${myAttendance.halfDay}`}
                            color={DASH.blue}
                        />
                        <MeterRow
                            label="Absent"
                            value={myAttendance.absent}
                            max={myAttendance.workingDays}
                            right={`${myAttendance.absent}`}
                            color={DASH.red}
                        />
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <Panel title="Leave Balance" subtitle="This academic year" accent={DASH.cyan} sx={{ height: "100%" }}>
                        {leaveBalance.length === 0 && (<EmptyNote text={commonErrors.attendanceLeave || (commonLoading ? "Loading..." : "No leave types configured.")} />)}
                        {leaveBalance.map((l) => (
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
                        {leaveRequests.length === 0 && <EmptyNote text="You have not applied for leave yet." />}
                        {leaveRequests.map((r) => (
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
                            ["Assigned today", myHomework.assignedToday],
                            ["This week", myHomework.thisWeek],
                            ["Due tomorrow", myHomework.dueTomorrow],
                            ["Classes covered", myHomework.classesCovered],
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
                    <Panel title="Marks Entry" subtitle="My subjects" accent={DASH.violet} right={<SampleChip />} sx={{ height: "100%" }}>
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
                        {submissions.length === 0 && <EmptyNote text="You have not submitted anything yet." />}
                        {submissions.map((s) => (
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
                        {news.length === 0 && (<EmptyNote text={commonErrors.forMe || (commonLoading ? "Loading..." : "Nothing posted yet.")} />)}
                        {news.slice(0, 4).map((n) => (
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
                        {events.length === 0 && (<EmptyNote text={commonErrors.forMe || (commonLoading ? "Loading..." : "No events coming up.")} />)}
                        {events.map((e) => (
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
                        {birthdays.length === 0 && <EmptyNote text="No birthdays today." />}
                        {birthdays.map((b) => (
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
                    <Panel title="My Last Payslip" subtitle={payslip.month} accent={DASH.green} sx={{ height: "100%" }}>
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
                                    ₹{payslip.net}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: DASH.faint }}>Net pay</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.8, borderTop: `1px solid ${DASH.lineSoft}` }}>
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Status</Typography>
                            <StatusChip status={payslip.status} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.8, borderTop: `1px solid ${DASH.lineSoft}` }}>
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Credited on</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>{payslip.creditedOn}</Typography>
                        </Box>
                    </Panel>
                </Grid>
            </Grid>
        </Box>
    );
}
