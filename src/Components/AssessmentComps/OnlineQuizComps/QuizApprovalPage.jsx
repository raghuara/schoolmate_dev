import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, Chip, InputAdornment, Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, Panel, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { GetQuizApprovalRequests, GetQuizById, UpdateQuizApproval } from "../../../Api/Api";

const STATUS_TABS = [
    { key: "requested", label: "Pending", tone: DASH.primary, bg: DASH.primaryLight },
    { key: "accepted", label: "Approved", tone: DASH.green, bg: DASH.greenLight },
    { key: "rejected", label: "Rejected", tone: DASH.red, bg: DASH.redLight },
];

const TYPE_META = {
    mcq: { label: "Choose the Best Answer", color: DASH.violet, bg: DASH.violetLight },
    truefalse: { label: "True / False", color: DASH.cyan, bg: DASH.cyanLight },
    fillblank: { label: "Fill in the Blanks", color: DASH.pink, bg: DASH.pinkLight },
};

const pickArray = (root) => {
    if (Array.isArray(root)) return root;
    if (!root || typeof root !== "object") return [];
    const direct = Object.values(root).find(
        (v) => Array.isArray(v) && v.length > 0 && v.every((x) => x && typeof x === "object")
    );
    if (direct) return direct;
    for (const value of Object.values(root)) {
        if (value && typeof value === "object") {
            const nested = pickArray(value);
            if (nested.length) return nested;
        }
    }
    return [];
};

const unwrap = (root) => {
    if (Array.isArray(root)) return root[0] || null;
    if (!root || typeof root !== "object") return null;
    if (root.quzeId || root.subject || root.totalNumberOfQuestions) return root;
    const inner = root.data ?? root.result ?? root.quze ?? root.quiz;
    if (inner) return unwrap(inner);
    return root;
};

const val = (obj, keys, fallback = "") => {
    for (const key of keys) {
        const found = obj?.[key];
        if (found !== undefined && found !== null && found !== "") return found;
    }
    return fallback;
};

const quizIdOf = (item) => val(item, ["quzeId", "quizId", "quzeID", "id", "Id"], null);

const arrayByKey = (obj, matches) => {
    if (!obj || typeof obj !== "object") return [];
    for (const [rawKey, value] of Object.entries(obj)) {
        if (!Array.isArray(value)) continue;
        const key = rawKey.toLowerCase().replace(/[^a-z]/g, "");
        if (matches.some((m) => key.includes(m))) return value;
    }
    return [];
};

const questionText = (q) => val(q, ["question", "questionText", "text", "title"], "");

const CorrectTag = () => (
    <Box
        sx={{
            display: "inline-flex", alignItems: "center", gap: 0.4, flexShrink: 0,
            px: 0.7, py: 0.2, borderRadius: RADIUS, bgcolor: DASH.greenLight, whiteSpace: "nowrap",
        }}
    >
        <CheckCircleIcon sx={{ fontSize: 12, color: DASH.green }} />
        <Typography sx={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.03em", color: DASH.green }}>
            CORRECT ANSWER
        </Typography>
    </Box>
);

const SectionTitle = ({ icon: Icon, children, right }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, mt: 0.3 }}>
        <Icon sx={{ fontSize: 15, color: DASH.primary }} />
        <Typography
            sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: DASH.muted }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.lineSoft }} />
        {right}
    </Box>
);

const MetaTile = ({ icon: Icon, label, value, tone = DASH.ink }) => (
    <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.3, py: 1.05 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}>
            <Icon sx={{ fontSize: 13, color: DASH.faint }} />
            <Typography
                sx={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: DASH.faint }}
            >
                {label}
            </Typography>
        </Box>
        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: tone, wordBreak: "break-word" }}>
            {value || "-"}
        </Typography>
    </Box>
);

const QuestionBlock = ({ index, type, question }) => {
    const meta = TYPE_META[type];
    const options = question?.options || question?.choices || [];
    const answer = String(val(question, ["answer", "correctAnswer"], "")).trim().toUpperCase();

    return (
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${meta.color}`,
                borderRadius: RADIUS,
                p: 1.5,
                mb: 1.1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.faint }}>Q{index}</Typography>
                <Chip
                    label={meta.label}
                    size="small"
                    sx={{ height: 19, fontSize: "10px", fontWeight: 700, bgcolor: meta.bg, color: meta.color }}
                />
            </Box>

            <Typography sx={{ fontSize: "13px", color: DASH.ink, lineHeight: 1.65, mb: options.length || type !== "mcq" ? 1.1 : 0 }}>
                {questionText(question)}
            </Typography>

            {type === "mcq" && (
                <Grid container spacing={1}>
                    {options.map((opt, i) => {
                        const text = typeof opt === "string" ? opt : val(opt, ["optionText", "text", "option", "value"], "");
                        const correct = String(val(opt, ["isCorrect", "correct", "isAnswer"], "N")).trim().toUpperCase() === "Y";
                        return (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Box
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 0.9,
                                        border: `1px solid ${correct ? "#BBF7D0" : DASH.line}`,
                                        bgcolor: correct ? DASH.greenLight : "#fff",
                                        borderRadius: RADIUS, px: 1.1, py: 0.8, height: "100%",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.faint, flexShrink: 0 }}>
                                        {String.fromCharCode(65 + i)}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.text, flex: 1, minWidth: 0 }}>
                                        {text}
                                    </Typography>
                                    {correct && <CorrectTag />}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {type === "truefalse" && (
                <Box sx={{ display: "flex", gap: 1 }}>
                    {[
                        { label: "True", on: answer === "Y" || answer === "TRUE" },
                        { label: "False", on: answer === "N" || answer === "FALSE" },
                    ].map((opt) => (
                        <Box
                            key={opt.label}
                            sx={{
                                display: "flex", alignItems: "center", gap: 0.8,
                                border: `1px solid ${opt.on ? "#BBF7D0" : DASH.line}`,
                                bgcolor: opt.on ? DASH.greenLight : "#fff",
                                borderRadius: RADIUS, px: 1.3, py: 0.7,
                            }}
                        >
                            <Typography sx={{ fontSize: "12.5px", fontWeight: opt.on ? 700 : 500, color: DASH.text }}>
                                {opt.label}
                            </Typography>
                            {opt.on && <CorrectTag />}
                        </Box>
                    ))}
                </Box>
            )}

            {type === "fillblank" && (
                <Box
                    sx={{
                        display: "inline-flex", alignItems: "center", gap: 1,
                        border: "1px solid #BBF7D0", bgcolor: DASH.greenLight,
                        borderRadius: RADIUS, px: 1.3, py: 0.7, maxWidth: "100%",
                    }}
                >
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, wordBreak: "break-word" }}>
                        {val(question, ["answer", "correctAnswer"], "-")}
                    </Typography>
                    <CorrectTag />
                </Box>
            )}
        </Box>
    );
};

export default function QuizApprovalPage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;
    const token = "123";

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const [statusKey, setStatusKey] = useState(STATUS_TABS[0].key);
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [reason, setReason] = useState("");

    const gradeLabel = useCallback(
        (entry) => {
            const gradeId = val(entry, ["gradeId", "GradeId", "gradeID"], "");
            const match = (grades || []).find((g) => String(g.id) === String(gradeId));
            const name = match?.sign || `Grade ${gradeId}`;
            const sections = entry?.sections || entry?.Sections || [];
            return sections.length ? `${name} · ${sections.join(", ")}` : name;
        },
        [grades]
    );

    const fetchRequests = useCallback(async (key) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${GetQuizApprovalRequests}?status=${key}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = pickArray(res?.data);
            setRequests(list);
            if (!list.length) { setSelectedId(null); setDetail(null); }
        } catch (error) {
            console.error(error);
            setRequests([]);
            notify(error?.response?.data?.message || "Could not load approval requests");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setSelectedId(null);
        setDetail(null);
        setReason("");
        fetchRequests(statusKey);
    }, [statusKey, fetchRequests]);

    const openDetail = async (id) => {
        if (!id) { notify("This request has no quiz id"); return; }
        setSelectedId(id);
        setReason("");
        setDetailLoading(true);
        try {
            const res = await axios.get(`${GetQuizById}?quzeId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = unwrap(res?.data);
            if (!data) { notify("Could not read this quiz"); setDetail(null); return; }
            setDetail(data);
        } catch (error) {
            console.error(error);
            setDetail(null);
            notify(error?.response?.data?.message || "Could not load the quiz details");
        } finally {
            setDetailLoading(false);
        }
    };

    const submitAction = async (action) => {
        if (!selectedId) return;
        if (action === "reject" && !reason.trim()) {
            notify("Add a reason before rejecting this quiz");
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.put(
                UpdateQuizApproval,
                { quzeId: selectedId, action, rollNumber, reason: reason.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res?.data?.error) {
                notify(res.data.message || "Could not update this request");
                return;
            }
            notify(action === "accept" ? "Quiz approved successfully" : "Quiz rejected", action === "accept");
            setSelectedId(null);
            setDetail(null);
            setReason("");
            fetchRequests(statusKey);
        } catch (error) {
            console.error(error);
            notify(error?.response?.data?.message || "Could not update this request. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return requests;
        return requests.filter((item) => {
            const haystack = [
                val(item, ["subject"], ""),
                val(item, ["createdByRollNumber", "rollNumber"], ""),
                String(quizIdOf(item) ?? ""),
                val(item, ["academicYear"], ""),
            ].join(" ").toLowerCase();
            return haystack.includes(term);
        });
    }, [requests, search]);

    const blanks = arrayByKey(detail, ["blank", "fill"]);
    const mcqs = arrayByKey(detail, ["choose", "best", "mcq"]);
    const trueFalse = arrayByKey(detail, ["trueorfalse", "truefalse"]);
    const gradeSections = detail
        ? (arrayByKey(detail, ["gradesection"]) || []).filter((g) => g && typeof g === "object")
        : [];

    // The API sends a different date field per attendance mode, so the tile has to
    // read the one this quiz actually owns.
    const attendanceMode = String(val(detail, ["attendanceMode"], "fixedend")).toLowerCase();
    const attendance = attendanceMode === "fulltime"
        ? {
            label: "Last start time",
            value: val(detail, ["lastStartDateAndTime"], "-"),
            note: "Each student still gets the full time limit from their own start.",
        }
        : attendanceMode === "anytime"
            ? {
                label: "Attempt date",
                value: val(detail, ["attemptDate"], "-"),
                note: "Open all day - students choose when to sit it.",
            }
            : {
                label: "Must finish before",
                value: val(detail, ["shouldCompleteBefore"], "-"),
                note: "Everyone stops at this time, even if they started late.",
            };

    const activeTab = STATUS_TABS.find((t) => t.key === statusKey) || STATUS_TABS[0];
    const canAct = statusKey === STATUS_TABS[0].key;

    return (
        <Box sx={{ px: { xs: 1.25, md: 1.75 }, pt: { xs: 1.25, md: 1.5 }, pb: 3, bgcolor: DASH.canvas, minHeight: "calc(100vh - 60px)" }}>
            {isLoading && <Loader />}

            <Box
                sx={{
                    display: "flex", alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 1.6,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.4, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} size="small" sx={{ mt: 0.1 }}>
                        <ArrowBackIcon sx={{ fontSize: 19, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "19px", fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                            Quiz Approvals
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.1 }}>
                            Review every quiz sent for approval, check the questions and answers, then approve or send it back.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <TextField
                        size="small"
                        placeholder="Search subject, id or creator"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            minWidth: { xs: "100%", md: 250 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: RADIUS, bgcolor: "#fff", fontSize: "12.5px",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.primaryBorder },
                                "&.Mui-focused fieldset": { borderColor: DASH.primary },
                            },
                        }}
                    />
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => fetchRequests(statusKey)}
                            sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff" }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: DASH.muted }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.6 }}>
                {STATUS_TABS.map((tab) => {
                    const on = tab.key === statusKey;
                    return (
                        <Button
                            key={tab.key}
                            onClick={() => setStatusKey(tab.key)}
                            sx={{
                                textTransform: "none", fontSize: "12.5px", fontWeight: on ? 700 : 600,
                                color: on ? "#fff" : DASH.text,
                                bgcolor: on ? tab.tone : "#fff",
                                border: `1px solid ${on ? tab.tone : DASH.line}`,
                                borderRadius: RADIUS, px: 1.8, minWidth: 0,
                                "&:hover": { bgcolor: on ? tab.tone : tab.bg, borderColor: tab.tone },
                            }}
                        >
                            {tab.label}
                            {on && requests.length > 0 && (
                                <Box
                                    component="span"
                                    sx={{
                                        ml: 0.8, px: 0.7, borderRadius: RADIUS, fontSize: "11px",
                                        bgcolor: "rgba(255,255,255,0.25)", fontWeight: 700,
                                    }}
                                >
                                    {requests.length}
                                </Box>
                            )}
                        </Button>
                    );
                })}
            </Box>

            <Grid container spacing={1.5} sx={{ alignItems: "stretch" }}>
                <Grid size={{ xs: 12, sm: 12, md: 5, lg: 4 }}>
                    <Panel title="Requests" subtitle={`${filtered.length} in ${activeTab.label.toLowerCase()}`} bodySx={{ p: 1.4 }}>
                        <Box sx={{ maxHeight: "62vh", overflowY: "auto", pr: 0.4 }}>
                            {filtered.length === 0 && <EmptyNote text="No quizzes in this list right now." />}

                            {filtered.map((item) => {
                                const id = quizIdOf(item);
                                const on = String(id) === String(selectedId);
                                const subject = val(item, ["subject"], "Quiz");
                                const total = val(item, ["totalNumberOfQuestions", "totalQuestions"], "-");
                                const creator = val(item, ["createdByRollNumber", "rollNumber"], "-");
                                const when = val(item, ["scheduledDateAndTime", "postedDateAndTime", "createdOn"], "");
                                return (
                                    <Box
                                        key={id ?? subject}
                                        onClick={() => openDetail(id)}
                                        sx={{
                                            border: `1px solid ${on ? DASH.primary : DASH.line}`,
                                            borderLeft: `3px solid ${on ? DASH.primary : DASH.lineSoft}`,
                                            bgcolor: on ? DASH.primaryLight : "#fff",
                                            borderRadius: RADIUS, p: 1.3, mb: 1, cursor: "pointer",
                                            transition: "0.2s",
                                            "&:hover": { borderColor: DASH.primaryBorder, transform: "translateY(-1px)" },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, flex: 1, minWidth: 0 }}>
                                                {subject}
                                            </Typography>
                                            <Chip
                                                label={`#${id ?? "-"}`}
                                                size="small"
                                                sx={{ height: 18, fontSize: "10px", fontWeight: 700, bgcolor: DASH.surface, color: DASH.muted }}
                                            />
                                        </Box>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                            {total} questions · by {creator}
                                        </Typography>
                                        {when && (
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                                                {when}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8 }}>
                    <Panel
                        title={detail ? val(detail, ["subject"], "Quiz") : "Quiz details"}
                        subtitle={detail ? `Request #${selectedId}` : "Pick a request on the left to review it"}
                        bodySx={{ p: 1.6 }}
                        right={
                            detail && canAct ? (
                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                    <Button
                                        onClick={() => submitAction("reject")}
                                        startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                                        sx={{
                                            textTransform: "none", fontSize: "12.5px", fontWeight: 600, color: DASH.red,
                                            bgcolor: "#fff", border: "1px solid #FECACA", borderRadius: RADIUS, px: 1.6,
                                            "&:hover": { bgcolor: DASH.redLight },
                                        }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => submitAction("accept")}
                                        startIcon={<CheckIcon sx={{ fontSize: 15 }} />}
                                        sx={{
                                            textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: "#fff",
                                            bgcolor: DASH.green, borderRadius: RADIUS, px: 2, boxShadow: "none",
                                            "&:hover": { bgcolor: "#0E9F6E" },
                                        }}
                                    >
                                        Approve
                                    </Button>
                                </Box>
                            ) : null
                        }
                    >
                        {!selectedId && (
                            <Box sx={{ textAlign: "center", py: 7 }}>
                                <FactCheckOutlinedIcon sx={{ fontSize: 40, color: DASH.line }} />
                                <Typography sx={{ fontSize: "13px", color: DASH.muted, mt: 1, fontWeight: 600 }}>
                                    Nothing selected
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: DASH.faint, mt: 0.3 }}>
                                    Choose a quiz from the list to see its questions and answers.
                                </Typography>
                            </Box>
                        )}

                        {selectedId && detailLoading && <EmptyNote text="Loading the quiz..." />}

                        {selectedId && !detailLoading && detail && (
                            <>
                                <Grid container spacing={1.2} sx={{ mb: 1.6 }}>
                                    <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                                        <MetaTile icon={QuizOutlinedIcon} label="Questions" value={val(detail, ["totalNumberOfQuestions"], "-")} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                                        <MetaTile icon={TimerOutlinedIcon} label="Time limit" value={val(detail, ["timing"], "-")} tone={DASH.primary} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                                        <MetaTile icon={MenuBookOutlinedIcon} label="Subject" value={val(detail, ["subject"], "-")} tone={DASH.violet} />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                                        <MetaTile icon={PersonOutlineOutlinedIcon} label="Created by" value={val(detail, ["createdByRollNumber"], "-")} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8, md: 8, lg: 6 }}>
                                        <MetaTile
                                            icon={EventAvailableOutlinedIcon}
                                            label="Starts"
                                            value={val(detail, ["scheduledDateAndTime", "postedDateAndTime"], "Immediately")}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 6 }}>
                                        <Tooltip title={attendance.note} placement="top">
                                            <Box>
                                                <MetaTile
                                                    icon={EventAvailableOutlinedIcon}
                                                    label={attendance.label}
                                                    value={attendance.value}
                                                />
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                                        <MetaTile
                                            icon={ShieldOutlinedIcon}
                                            label="Exit warnings"
                                            value={val(detail, ["warningCount"], "-")}
                                            tone={DASH.red}
                                        />
                                    </Grid>
                                </Grid>

                                {gradeSections.length > 0 && (
                                    <>
                                        <SectionTitle icon={GroupsOutlinedIcon}>Assigned to</SectionTitle>
                                        <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 1.6 }}>
                                            {gradeSections.map((entry, i) => (
                                                <Chip
                                                    key={i}
                                                    label={gradeLabel(entry)}
                                                    size="small"
                                                    sx={{
                                                        height: 22, fontSize: "11px", fontWeight: 600,
                                                        bgcolor: DASH.blueLight, color: DASH.blue,
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </>
                                )}

                                <SectionTitle icon={FactCheckOutlinedIcon}>
                                    Questions &amp; answers
                                </SectionTitle>

                                <Box
                                    sx={{
                                        display: "flex", alignItems: "flex-start", gap: 1.2,
                                        bgcolor: DASH.greenLight, border: "1px solid #BBF7D0",
                                        borderRadius: RADIUS, px: 1.4, py: 1, mb: 1.5,
                                    }}
                                >
                                    <CheckCircleIcon sx={{ fontSize: 16, color: DASH.green, mt: 0.15, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "11.5px", color: DASH.text, lineHeight: 1.6 }}>
                                        Every highlighted option is the answer the creator marked as correct. Check them before approving —
                                        students will be scored against exactly these answers.
                                    </Typography>
                                </Box>

                                <Box sx={{ maxHeight: "52vh", overflowY: "auto", pr: 0.4 }}>
                                    {mcqs.map((q, i) => (
                                        <QuestionBlock key={`m${i}`} index={i + 1} type="mcq" question={q} />
                                    ))}
                                    {trueFalse.map((q, i) => (
                                        <QuestionBlock key={`t${i}`} index={mcqs.length + i + 1} type="truefalse" question={q} />
                                    ))}
                                    {blanks.map((q, i) => (
                                        <QuestionBlock key={`b${i}`} index={mcqs.length + trueFalse.length + i + 1} type="fillblank" question={q} />
                                    ))}

                                    {mcqs.length + trueFalse.length + blanks.length === 0 && (
                                        <EmptyNote text="This quiz came back without any readable questions." />
                                    )}
                                </Box>

                                {canAct && (
                                    <Box sx={{ mt: 1.6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            minRows={2}
                                            label="Reason (required when rejecting)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: RADIUS, bgcolor: "#fff", fontSize: "13px",
                                                    "& fieldset": { borderColor: DASH.line },
                                                    "&:hover fieldset": { borderColor: DASH.primaryBorder },
                                                    "&.Mui-focused fieldset": { borderColor: DASH.primary },
                                                },
                                                "& .MuiInputLabel-root": { fontSize: "13px", color: DASH.muted },
                                                "& .MuiInputLabel-root.Mui-focused": { color: DASH.primary },
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            <SnackBar open={open} message={message} setOpen={setOpen} status={status} color={color} />
        </Box>
    );
}
