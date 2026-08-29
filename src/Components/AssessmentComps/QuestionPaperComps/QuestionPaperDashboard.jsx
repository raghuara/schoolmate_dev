import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Tooltip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell,
    PieChart, Pie, Legend,
} from "recharts";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

import Loader from "../../Loader";
import {
    DASH, RADIUS, KPI_TONES, SolidStatCard, Panel, ChartTooltip, EmptyNote, ModuleCard,
} from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { MOCK_PAPERS, MOCK_PATTERNS, MOCK_QUESTION_BANK, fmtDate, parseApiDate } from "./questionPaperApi";
import { StatusPill, Pill, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

const SUBJECT_COLORS = [DASH.primary, DASH.blue, DASH.violet, DASH.cyan, DASH.green, DASH.pink, DASH.red];

const STATUS_COLORS = {
    Pending: DASH.primary,
    Approved: DASH.cyan,
    Published: DASH.green,
    Rejected: DASH.red,
};

export default function QuestionPaperDashboard() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);

    // Mock count until qbank/getAll is live.
    const bankSize = MOCK_QUESTION_BANK.length;

    const [papers, setPapers] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    /* Mock source. Replace with axios.get(GetQuestionPaperDashboard) and
       axios.get(GetQuestionPaperPatterns). */
    const load = useCallback(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPapers(MOCK_PAPERS);
            setPatterns(MOCK_PATTERNS);
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => ({
        total: papers.length,
        pending: papers.filter((p) => p.status === "Pending").length,
        published: papers.filter((p) => p.status === "Published").length,
        patterns: patterns.length,
    }), [papers, patterns]);

    const bySubject = useMemo(() => {
        const map = {};
        papers.forEach((p) => { map[p.subject] = (map[p.subject] || 0) + 1; });
        return Object.entries(map)
            .map(([subject, count]) => ({ subject, count }))
            .sort((a, b) => b.count - a.count);
    }, [papers]);

    const byStatus = useMemo(() => {
        const map = {};
        papers.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [papers]);

    const recent = useMemo(() => {
        const time = (row) => parseApiDate(row.createdDate)?.getTime() ?? 0;
        return [...papers].sort((a, b) => time(b) - time(a)).slice(0, 6);
    }, [papers]);

    /* Five cards, one row, in the order the work actually happens:
       source material -> blueprint -> reusable questions -> papers -> sign-off.
       "Create Paper" is not a card - it is the primary button in the header, and
       having it in both places just cost a row. Titles are kept short because a
       fifth-width card ellipsis-truncates anything longer. */
    const modules = [
        {
            accent: DASH.cyan,
            icon: MenuBookOutlinedIcon,
            title: "Books & Chapters",
            desc: "Class books, split into chapters automatically.",
            to: "/dashboardmenu/books",
            links: [
                { label: "Upload book", path: "/dashboardmenu/books/upload" },
            ],
        },
        {
            accent: DASH.violet,
            icon: DashboardCustomizeOutlinedIcon,
            title: "Patterns",
            desc: "Reusable blueprints - sections, marks and choice.",
            to: "/dashboardmenu/assessment/question-paper/patterns",
            badge: stats.patterns,
            links: [
                { label: "New pattern", path: "/dashboardmenu/assessment/question-paper/patterns/create" },
            ],
        },
        {
            accent: DASH.pink,
            icon: InventoryOutlinedIcon,
            title: "Question Bank",
            desc: "Approved questions, by class, subject and chapter.",
            to: "/dashboardmenu/assessment/question-paper/bank",
            badge: bankSize,
            links: [
                // Lands on the bank already filtered, so the chip earns its place.
                {
                    label: "Never used",
                    path: "/dashboardmenu/assessment/question-paper/bank",
                    state: { usage: "unused" },
                },
            ],
        },
        {
            accent: DASH.blue,
            icon: DescriptionOutlinedIcon,
            title: "All Papers",
            desc: "Every paper this year, with its approval status.",
            to: "/dashboardmenu/assessment/question-paper/all",
            badge: stats.total,
            links: [
                {
                    label: "Published",
                    path: "/dashboardmenu/assessment/question-paper/all",
                    state: { status: "Published" },
                },
            ],
        },
        {
            accent: DASH.green,
            icon: FactCheckOutlinedIcon,
            title: "Approvals",
            desc: "Papers waiting for your sign-off.",
            to: "/dashboardmenu/approvals/question-paper",
            badge: stats.pending,
            dot: stats.pending > 0,
            links: [
                { label: "Open queue", path: "/dashboardmenu/approvals/question-paper" },
            ],
        },
    ];

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            {isLoading && <Loader />}

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
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Question Paper Generation
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Build exam papers from your books using saved patterns.
                            {academicYear ? ` Academic year ${academicYear}.` : ""}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload" arrow>
                        <IconButton
                            onClick={load}
                            sx={{
                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff",
                                "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Paper
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={DescriptionOutlinedIcon}
                        label="Question Papers"
                        value={stats.total}
                        note="This academic year"
                        tone={KPI_TONES.orange}
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/all")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={PendingActionsOutlinedIcon}
                        label="Pending Approval"
                        value={stats.pending}
                        note="Waiting for sign-off"
                        tone={KPI_TONES.pink}
                        onClick={() => navigate("/dashboardmenu/approvals/question-paper")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={RocketLaunchOutlinedIcon}
                        label="Published"
                        value={stats.published}
                        note="Ready to print"
                        tone={KPI_TONES.green}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={DashboardCustomizeOutlinedIcon}
                        label="Saved Patterns"
                        value={stats.patterns}
                        note="Reusable blueprints"
                        tone={KPI_TONES.violet}
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns")}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {modules.map((module) => (
                    <Grid key={module.title} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                        <ModuleCard {...module} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={1.8} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <Panel title="Papers by Subject" subtitle="How many papers each subject has this year" accent={DASH.blue}>
                        {bySubject.length === 0 ? (
                            <EmptyNote text="No papers created yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={bySubject} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                    <XAxis
                                        dataKey="subject"
                                        tick={{ fontSize: 11, fill: DASH.muted }}
                                        axisLine={{ stroke: DASH.line }}
                                        tickLine={false}
                                        interval={0}
                                        angle={-12}
                                        textAnchor="end"
                                        height={54}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11, fill: DASH.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ChartTooltip />
                                    <Bar dataKey="count" name="Papers" radius={[4, 4, 0, 0]} maxBarSize={44}>
                                        {bySubject.map((entry, i) => (
                                            <Cell key={entry.subject} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <Panel title="Approval Status" subtitle="Where every paper stands" accent={DASH.violet}>
                        {byStatus.length === 0 ? (
                            <EmptyNote text="Nothing to show yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={byStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={52}
                                        outerRadius={82}
                                        paddingAngle={2}
                                    >
                                        {byStatus.map((entry) => (
                                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || DASH.faint} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => (
                                            <span style={{ fontSize: 11.5, color: DASH.muted }}>{value}</span>
                                        )}
                                    />
                                    <ChartTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            <Panel
                title="Recent Papers"
                subtitle="Latest six, newest first"
                accent={DASH.primary}
                right={
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/all")}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                        sx={outlineBtnSx}
                    >
                        View all
                    </Button>
                }
                bodySx={{ p: 0 }}
            >
                {recent.length === 0 ? (
                    <EmptyNote text="No papers yet - create the first one." />
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#FCFCFD" }}>
                                    {["Paper", "Class", "Subject", "Exam", "Marks", "Status", "Created", ""].map((head) => (
                                        <TableCell
                                            key={head}
                                            sx={{
                                                fontSize: "11px", fontWeight: 700, color: DASH.muted,
                                                textTransform: "uppercase", letterSpacing: "0.05em",
                                                borderBottom: `1px solid ${DASH.line}`, py: 1.2,
                                            }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recent.map((paper) => (
                                    <TableRow
                                        key={paper.id}
                                        hover
                                        sx={{ cursor: "pointer", "&:last-child td": { borderBottom: "none" } }}
                                        onClick={() => navigate(`/dashboardmenu/assessment/question-paper/${paper.id}`, { state: { paper } })}
                                    >
                                        <TableCell sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, py: 1.3 }}>
                                            {paper.name}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.3 }}>
                                            <Pill label={paper.grade} color={DASH.text} bg={DASH.lineSoft} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "12px", color: DASH.text, py: 1.3 }}>{paper.subject}</TableCell>
                                        <TableCell sx={{ fontSize: "12px", color: DASH.muted, py: 1.3 }}>{paper.examName}</TableCell>
                                        <TableCell sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink, py: 1.3 }}>
                                            {paper.totalMarks}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.3 }}>
                                            <StatusPill status={paper.status} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "11.5px", color: DASH.faint, py: 1.3 }}>
                                            {fmtDate(paper.createdDate)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 1.3 }}>
                                            <Tooltip title="Open" arrow>
                                                <IconButton size="small" sx={{ width: 26, height: 26 }}>
                                                    <VisibilityOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Duplicate into a new paper" arrow>
                                                <IconButton
                                                    size="small"
                                                    sx={{ width: 26, height: 26 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("/dashboardmenu/assessment/question-paper/create", { state: { clonePaper: paper } });
                                                    }}
                                                >
                                                    <ContentCopyOutlinedIcon sx={{ fontSize: 14, color: DASH.muted }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Panel>
        </Box>
    );
}
