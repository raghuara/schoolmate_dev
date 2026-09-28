import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, IconButton, LinearProgress } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear, selectAcademicYearOptions } from "../../../Redux/Slices/academicYearSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { useGradeSubjects, gradeSign } from "../../AcademicsComps/academicMeta";
import {
    CreateQuestionPaper, UpdateQuestionPaperBasicDetails, GetQuestionPaper,
    GetEligibleBooksForPaper, UpdateQuestionPaperChapters,
    GetEligiblePatternsForPaper, SelectQuestionPaperPattern, GetPattern,
    StartQuestionGeneration, GetGeneratedQuestions, UpdateGeneratedQuestion,
    RegenerateQuestion, ConfirmQuestions,
    SubmitQuestionPaperForApproval, GetQuestionPaperApprovalHistory, GetQuestionPaperApprovalSettings,
} from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import { analyseDuplicates, patternFromApi, patternTotal, sectionMarks, withSectionDefaults } from "./questionPaperApi";
import {
    normalizePaperDetail, normalizeEligibleBooks, normalizeEligiblePatterns,
    normalizeGeneratedPaper, questionToApi, generationHint, isGenerating,
    normalizeApprovalHistory, normalizeApprovalSettings, statusFromHistory, GENERATION_POLL_MS,
} from "./paperWizardApi";
import PaperDocument, { printPaperNode, exportPaperPdf, printedSheetHex, paperSizeOf, DEFAULT_PAPER_COLOR, DEFAULT_PAPER_SIZE } from "./paperTemplates";
import { WizardHeader, WizardFooter, Pill, outlineBtnSx, primaryBtnSx, Banner } from "./questionPaperTheme";

import BasicDetailsStep from "./WizardSteps/BasicDetailsStep";
import ChaptersStep from "./WizardSteps/ChaptersStep";
import PatternStep from "./WizardSteps/PatternStep";
import QuestionsStep from "./WizardSteps/QuestionsStep";
import TemplateStep from "./WizardSteps/TemplateStep";
import ApprovalStep, { approvalMeta } from "./WizardSteps/ApprovalStep";

const token = "123";
const auth = { headers: { Authorization: `Bearer ${token}` } };

const WIZARD_STEPS = [
    { label: "Basic Details", icon: TuneOutlinedIcon },
    { label: "Chapters", icon: MenuBookOutlinedIcon },
    { label: "Pattern", icon: DashboardCustomizeOutlinedIcon },
    { label: "Questions", icon: FactCheckOutlinedIcon },
    { label: "Template", icon: PaletteOutlinedIcon },
    { label: "Approval", icon: VerifiedOutlinedIcon },
];

const LOCKED_STATUSES = ["Pending", "Approved", "Rejected"];

const emptyForm = {
    name: "",
    gradeId: "",
    grade: "",
    sections: [],
    subject: "",
    academicYear: "",
    examName: "",
    examDate: "",
    durationMinutes: 0,
    totalMarks: 0,
    medium: "English",
    paperCode: "",
    notes: "",
};

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;


const GeneratingView = ({ status, sectionsDone, sectionsTotal, failure, onRetry, canRetry }) => {
    const failed = status === "Failed";

    return (
        <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: { xs: 3, md: 6 }, textAlign: "center" }}>
            <Box
                sx={{
                    width: 62, height: 62, borderRadius: "50%", mx: "auto",
                    bgcolor: failed ? DASH.redLight : DASH.violetLight,
                    border: `1px solid ${failed ? "#FECACA" : "#DDD6FE"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >
                {failed
                    ? <ErrorOutlineIcon sx={{ fontSize: 28, color: DASH.red }} />
                    : <AutoAwesomeOutlinedIcon sx={{ fontSize: 28, color: DASH.violet }} />}
            </Box>

            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: DASH.ink, mt: 1.6 }}>
                {failed ? "The questions could not be written" : "Writing your question paper"}
            </Typography>
            <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, maxWidth: 460, mx: "auto", lineHeight: 1.8 }}>
                {failed ? (failure || "No reason was given. Try generating them again.") : generationHint(status, sectionsDone, sectionsTotal)}
            </Typography>

            {!failed && (
                <>
                    {sectionsTotal > 0 && (
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.violet, mt: 2 }}>
                            {sectionsDone} of {sectionsTotal} parts done
                        </Typography>
                    )}
                    <LinearProgress
                        variant={sectionsTotal > 0 ? "determinate" : "indeterminate"}
                        value={sectionsTotal > 0 ? Math.round((sectionsDone / sectionsTotal) * 100) : 0}
                        sx={{
                            mt: 1.4, height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft, maxWidth: 420, mx: "auto",
                            "& .MuiLinearProgress-bar": { bgcolor: DASH.violet },
                        }}
                    />
                    <Typography sx={{ fontSize: "11.5px", color: DASH.faint, mt: 1.6, maxWidth: 460, mx: "auto", lineHeight: 1.8 }}>
                        One part is written at a time and each run is a couple of minutes apart, so a long paper takes a
                        while. You can leave this page - the paper keeps building and picks up where it left off.
                    </Typography>
                </>
            )}

            {failed && canRetry && (
                <Button onClick={onRetry} sx={{ ...primaryBtnSx, mt: 2.4 }}>Try again</Button>
            )}
        </Box>
    );
};

export default function CreateQuestionPaperPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const academicYear = useSelector(selectAcademicYear);
    const yearOptions = useSelector(selectAcademicYearOptions) || [];
    const websiteSettings = useSelector(selectWebsiteSettings);
    const { grades, subjectsForGrade, sectionsForGrade } = useGradeSubjects();

    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    const paperPerms = findSubMenuPermissions(user?.permissions, "questionpapergeneration", "paper");
    const mayPaper = (key) => paperPerms?.[key] !== "N";
    const canRegenerate = mayPaper("allowregeneratequestion");

    const resumeId = params.paperId || location.state?.paperId || null;

    const [paperId, setPaperId] = useState(null);
    const [step, setStep] = useState(0);
    const [maxStep, setMaxStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [resuming, setResuming] = useState(Boolean(resumeId));

    const [form, setForm] = useState(() => ({ ...emptyForm, academicYear: academicYear || "" }));
    const [errors, setErrors] = useState({});
    const [school, setSchool] = useState({ name: websiteSettings?.title || "", logo: "", address: "" });
    const [patternName, setPatternName] = useState("");
    const [savedPatternId, setSavedPatternId] = useState("");

    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksMessage, setBooksMessage] = useState("");
    const [selectedChapterIds, setSelectedChapterIds] = useState([]);
    const [weightage, setWeightage] = useState({});

    const [patterns, setPatterns] = useState([]);
    const [patternsLoading, setPatternsLoading] = useState(false);
    const [patternsMessage, setPatternsMessage] = useState("");
    const [pattern, setPattern] = useState(null);

    const [genStatus, setGenStatus] = useState("");
    const [genFailure, setGenFailure] = useState("");
    const [genPattern, setGenPattern] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [savingIds, setSavingIds] = useState([]);

    const [templateId, setTemplateId] = useState("cbse");
    const [showAnswers, setShowAnswers] = useState(false);
    const [zoom, setZoom] = useState(0.8);

    const [approval, setApproval] = useState({ status: "", sentBackCount: 0, submittedOn: "" });
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [approvers, setApprovers] = useState(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const printRef = useRef(null);
    const [paperSize, setPaperSize] = useState(DEFAULT_PAPER_SIZE);
    const [paperColor, setPaperColor] = useState(DEFAULT_PAPER_COLOR);
    const [printColor, setPrintColor] = useState(false);
    const pollRef = useRef(null);

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const locked = LOCKED_STATUSES.includes(approval.status);
    const gradeLabel = gradeSign(grades, form.gradeId) || form.grade || "";

    useEffect(() => () => clearInterval(pollRef.current), []);

    useEffect(() => {
        if (academicYear && !form.academicYear) setForm((p) => ({ ...p, academicYear }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    const gradeIdOf = useCallback(
        (sign) => grades.find((g) => String(g.sign).toLowerCase() === String(sign).toLowerCase())?.id || "",
        [grades]
    );

    useEffect(() => {
        if (form.gradeId || !form.grade || !grades.length) return;
        const id = gradeIdOf(form.grade);
        if (id) setForm((p) => ({ ...p, gradeId: String(id) }));
    }, [form.gradeId, form.grade, grades, gradeIdOf]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const goTo = (next) => {
        setStep(next);
        setMaxStep((prev) => Math.max(prev, next));
    };

    const applyPaper = useCallback((paper) => {
        setPaperId(paper.id);
        setForm((prev) => ({
            ...prev,
            name: paper.paperName,
            gradeId: String(gradeIdOf(paper.grade) || prev.gradeId || ""),
            grade: paper.grade,
            sections: paper.sections,
            subject: paper.subject,
            academicYear: paper.academicYear || prev.academicYear,
            examDate: (paper.examDate || "").slice(0, 10),
            medium: paper.medium || prev.medium,
            paperCode: paper.qpCode,
            notes: paper.notes,
            totalMarks: paper.totalMarks || prev.totalMarks,
            durationMinutes: paper.durationMinutes || prev.durationMinutes,
        }));
        if (paper.schoolName) setSchool({ name: paper.schoolName, logo: paper.schoolLogo, address: "" });
        setPatternName(paper.patternName || "");
        setSavedPatternId(paper.patternId || "");
        if (paper.questionGenerationStatus) setGenStatus(paper.questionGenerationStatus);
        setApproval({
            status: paper.approvalStatus || "",
            sentBackCount: paper.sentBackCount || 0,
            submittedOn: paper.submittedOn || "",
        });
        const landing = Math.min(Math.max((paper.currentStep || 1) - 1, 0), WIZARD_STEPS.length - 1);
        setMaxStep((prev) => Math.max(prev, landing));
        return landing;
    }, [gradeIdOf]);

    const loadPaper = useCallback((id, { land = true } = {}) => {
        if (!id) return Promise.resolve(null);
        return axios
            .get(GetQuestionPaper, { params: { questionPaperId: id, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                if (apiFailed(res.data)) return null;
                const paper = normalizePaperDetail(res.data);
                const landing = applyPaper(paper);
                if (land) setStep(landing);
                return paper;
            });
    }, [rollNumber, applyPaper]);

    useEffect(() => {
        if (!resumeId) return;
        if (String(paperId) === String(resumeId)) return;
        setResuming(true);
        loadPaper(resumeId)
            .then((paper) => { if (!paper) notify("That paper could not be opened"); })
            .catch(() => notify("That paper could not be opened"))
            .finally(() => setResuming(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeId, paperId, loadPaper]);

    const loadBooks = useCallback(() => {
        if (!paperId) return;
        setBooksLoading(true);
        setBooksMessage("");
        axios
            .get(GetEligibleBooksForPaper, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { setBooks([]); setBooksMessage(rejected); return; }
                const list = normalizeEligibleBooks(res.data);
                setBooks(list);

                const already = [];
                const shares = {};
                list.forEach((book) => book.chapters.forEach((chapter) => {
                    if (!chapter.selected) return;
                    already.push(chapter.id);
                    shares[chapter.id] = chapter.weightage;
                }));
                if (already.length) {
                    setSelectedChapterIds(already);
                    setWeightage(shares);
                }
            })
            .catch((error) => {
                setBooks([]);
                setBooksMessage(errorMessage(error, ""));
                if (error?.response?.status !== 404) notify(errorMessage(error, "The books could not be loaded"));
            })
            .finally(() => setBooksLoading(false));
    }, [paperId, rollNumber]);

    useEffect(() => { if (paperId && step === 1) loadBooks(); }, [paperId, step, loadBooks]);
    useEffect(() => { if (paperId && step >= 2 && !books.length) loadBooks(); }, [paperId, step, books.length, loadBooks]);

    const selectedChapters = useMemo(
        () => books.flatMap((b) => b.chapters).filter((c) => selectedChapterIds.includes(c.id)),
        [books, selectedChapterIds]
    );

    const loadPatterns = useCallback(() => {
        if (!paperId) return;
        setPatternsLoading(true);
        setPatternsMessage("");
        axios
            .get(GetEligiblePatternsForPaper, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { setPatterns([]); setPatternsMessage(rejected); return null; }

                const rows = normalizeEligiblePatterns(res.data);
                if (!rows.length) { setPatterns([]); return null; }

                return Promise.all(rows.map((row) => axios
                    .get(GetPattern, { params: { patternId: row.id, requestedByRollNumber: rollNumber }, ...auth })
                    .then((detail) => {
                        if (apiFailed(detail.data)) return { ...row, gradeIds: [], sections: [] };
                        const full = patternFromApi(detail.data, { gradeIdOf });
                        return { ...row, ...full, id: row.id, name: row.name || full.name, durationMinutes: full.durationMinutes || row.durationMinutes };
                    })
                    .catch(() => ({ ...row, gradeIds: [], sections: [] }))))
                    .then((full) => {
                        setPatterns(full);
                        if (savedPatternId) {
                            const current = full.find((p) => String(p.id) === String(savedPatternId));
                            if (current) setPattern((prev) => prev || current);
                        }
                    });
            })
            .catch((error) => {
                setPatterns([]);
                setPatternsMessage(errorMessage(error, ""));
                if (error?.response?.status !== 404) notify(errorMessage(error, "The patterns could not be loaded"));
            })
            .finally(() => setPatternsLoading(false));
    }, [paperId, rollNumber, gradeIdOf, savedPatternId]);

    useEffect(() => { if (step === 2) loadPatterns(); }, [step, loadPatterns]);

    const loadQuestions = useCallback((quiet = false) => {
        if (!paperId) return;
        axios
            .get(GetGeneratedQuestions, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                if (apiFailed(res.data)) return;
                const parsed = normalizeGeneratedPaper(res.data);
                setGenStatus(parsed.status);
                setGenFailure(parsed.failureReason);
                setGenPattern({
                    id: paperId,
                    name: patternName || pattern?.name || "",
                    subject: form.subject,
                    totalMarks: form.totalMarks,
                    durationMinutes: form.durationMinutes,
                    sections: parsed.sections.map(withSectionDefaults),
                });
                setQuestions(parsed.questions);
            })
            .catch((error) => { if (!quiet && error?.response?.status !== 404) notify("The questions could not be loaded"); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paperId, rollNumber, form.subject, form.totalMarks, form.durationMinutes, patternName, pattern?.name]);

    useEffect(() => { if (paperId && step >= 3) loadQuestions(); }, [paperId, step, loadQuestions]);

    useEffect(() => {
        if (step !== 3 || !isGenerating(genStatus)) return undefined;
        pollRef.current = setInterval(() => loadQuestions(true), GENERATION_POLL_MS);
        return () => clearInterval(pollRef.current);
    }, [step, genStatus, loadQuestions]);

    const loadHistory = useCallback(() => {
        if (!paperId) return;
        setHistoryLoading(true);
        axios
            .get(GetQuestionPaperApprovalHistory, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                if (apiFailed(res.data)) return;
                const rows = normalizeApprovalHistory(res.data);
                setHistory(rows);
                setApproval((prev) => (prev.status ? prev : { ...prev, status: statusFromHistory(rows) }));
            })
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    }, [paperId, rollNumber]);

    useEffect(() => { if (paperId) loadHistory(); }, [paperId, loadHistory]);

    const loadApprovers = useCallback(() => {
        axios
            .get(GetQuestionPaperApprovalSettings, { params: { requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => setApprovers(apiFailed(res.data) ? { hasApprover: true, userTypes: [], unknown: true } : normalizeApprovalSettings(res.data)))
            .catch(() => setApprovers({ hasApprover: true, userTypes: [], unknown: true }));
    }, [rollNumber]);

    useEffect(() => {
        if (step !== 5 || !paperId) return;
        loadHistory();
        loadApprovers();
    }, [step, paperId, loadHistory, loadApprovers]);

    const sectionsWithQuestions = useMemo(() => {
        const filled = new Set(questions.map((q) => q.sectionId));
        return (genPattern?.sections || []).filter((s) => filled.has(s.id)).length;
    }, [questions, genPattern]);

    const duplicates = useMemo(() => analyseDuplicates(questions), [questions]);

    const paperMeta = useMemo(() => ({
        ...form,
        grade: gradeLabel,
        questionCount: questions.length,
    }), [form, gradeLabel, questions.length]);

    const balanceWeightage = (ids = selectedChapterIds) => {
        if (!ids.length) return;
        const each = Math.floor(100 / ids.length);
        const next = {};
        ids.forEach((id, i) => {
            next[id] = i === ids.length - 1 ? 100 - each * (ids.length - 1) : each;
        });
        setWeightage(next);
    };

    const setChapterWeight = (id, value) => {
        const target = Math.max(1, Math.min(100, Math.round(Number(value) || 0)));
        const others = selectedChapterIds.filter((x) => x !== id);
        if (!others.length) { setWeightage({ [id]: 100 }); return; }

        setWeightage((prev) => {
            const rest = 100 - target;
            const othersTotal = others.reduce((sum, x) => sum + (Number(prev[x]) || 0), 0);
            const next = { [id]: target };
            let handed = 0;
            others.forEach((x, i) => {
                if (i === others.length - 1) { next[x] = Math.max(0, rest - handed); return; }
                const share = othersTotal > 0
                    ? Math.floor(rest * ((Number(prev[x]) || 0) / othersTotal))
                    : Math.floor(rest / others.length);
                next[x] = Math.max(0, share);
                handed += next[x];
            });
            return next;
        });
    };

    const toggleChapter = (id) => {
        if (locked) return;
        setSelectedChapterIds((prev) => {
            const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
            balanceWeightage(next);
            return next;
        });
    };

    const selectBook = (book) => {
        if (locked) return;
        const ids = book.chapters.map((c) => c.id);
        const allOn = ids.every((id) => selectedChapterIds.includes(id));
        const next = allOn
            ? selectedChapterIds.filter((id) => !ids.includes(id))
            : Array.from(new Set([...selectedChapterIds, ...ids]));
        setSelectedChapterIds(next);
        balanceWeightage(next);
    };

    const clearChapters = () => { if (!locked) { setSelectedChapterIds([]); setWeightage({}); } };

    const basicsBody = () => ({
        grade: gradeLabel || "",
        sections: form.sections || [],
        subject: form.subject || "",
        academicYear: form.academicYear || undefined,
        paperName: form.name || "",
        examDate: form.examDate || null,
        medium: form.medium || "English",
        qpCode: (form.paperCode || "").slice(0, 6),
        notes: form.notes || "",
    });

    const validateBasics = () => {
        const next = {};
        if (!form.gradeId) next.gradeId = "Pick a class";
        if (!form.subject) next.subject = "Pick a subject";
        if (!form.academicYear) next.academicYear = "Pick an academic year";
        if (!form.name.trim()) next.name = "Name the paper";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const saveBasics = () => {
        if (!validateBasics()) { notify("Fill the highlighted fields"); return; }

        setSaving(true);
        const request = paperId
            ? axios.put(UpdateQuestionPaperBasicDetails, { questionPaperId: paperId, ...basicsBody(), updatedByRollNumber: rollNumber }, auth)
            : axios.post(CreateQuestionPaper, { ...basicsBody(), createdByRollNumber: rollNumber }, auth);

        request
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                const id = res.data?.questionPaperId || res.data?.QuestionPaperId || paperId;
                setPaperId(id);
                goTo(1);
                if (id && String(params.paperId) !== String(id) && mayPaper("edit")) {
                    navigate(`/dashboardmenu/assessment/question-paper/create/${id}`, { replace: true });
                }
            })
            .catch((error) => notify(errorMessage(error, "The details could not be saved")))
            .finally(() => setSaving(false));
    };

    const saveChapters = () => {
        if (!selectedChapterIds.length) { notify("Pick at least one chapter"); return; }

        const shares = selectedChapterIds.map((id) => Number(weightage[id]) || 0);
        if (shares.some((w) => w <= 0)) {
            notify("Every chosen chapter needs a share above 0 - use Split evenly");
            return;
        }
        const total = shares.reduce((sum, w) => sum + w, 0);
        if (Math.abs(total - 100) > 0.01) {
            notify(`The shares add up to ${total}%, not 100% - use Split evenly to fix them`);
            return;
        }

        setSaving(true);
        axios
            .put(UpdateQuestionPaperChapters, {
                questionPaperId: paperId,
                chapters: selectedChapterIds.map((id) => ({ chapterId: id, weightage: Number(weightage[id]) })),
                updatedByRollNumber: rollNumber,
            }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                goTo(2);
            })
            .catch((error) => notify(errorMessage(error, "The chapters could not be saved")))
            .finally(() => setSaving(false));
    };

    const startGeneration = () => axios.post(StartQuestionGeneration, { questionPaperId: paperId, startedByRollNumber: rollNumber }, auth);

    const savePatternAndGenerate = () => {
        if (!pattern) { notify("Pick a pattern to continue"); return; }

        if (String(pattern.id) === String(savedPatternId) && (questions.length || isGenerating(genStatus))) {
            goTo(3);
            return;
        }

        setSaving(true);
        axios
            .put(SelectQuestionPaperPattern, { questionPaperId: paperId, patternId: pattern.id, updatedByRollNumber: rollNumber }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return null; }

                setSavedPatternId(pattern.id);
                setPatternName(pattern.name);
                setForm((prev) => ({
                    ...prev,
                    totalMarks: res.data?.totalMarks || patternTotal(pattern) || pattern.totalMarks || prev.totalMarks,
                    durationMinutes: res.data?.durationMinutes || pattern.durationMinutes || prev.durationMinutes,
                }));
                return startGeneration();
            })
            .then((res) => {
                if (!res) return;
                const rejected = apiFailed(res.data);
                if (rejected) notify(rejected);
                setGenStatus(res.data?.questionGenerationStatus || "Pending");
                setQuestions([]);
                goTo(3);
            })
            .catch((error) => {
                const detail = errorMessage(error, "");
                if (/already/i.test(detail)) { goTo(3); return; }
                notify(detail || "The questions could not be started");
            })
            .finally(() => setSaving(false));
    };

    const restartGeneration = () => {
        setSaving(true);
        startGeneration()
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setGenStatus(res.data?.questionGenerationStatus || "Pending");
                setGenFailure("");
            })
            .catch((error) => notify(errorMessage(error, "That could not be started")))
            .finally(() => setSaving(false));
    };

    const confirmAndContinue = () => {
        if (genStatus === "Ready") { goTo(4); return; }
        setSaving(true);
        axios
            .put(ConfirmQuestions, { questionPaperId: paperId, confirmedByRollNumber: rollNumber }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setGenStatus(res.data?.questionGenerationStatus || "Ready");
                notify("Questions confirmed", true);
                goTo(4);
            })
            .catch((error) => notify(errorMessage(error, "The questions could not be confirmed")))
            .finally(() => setSaving(false));
    };

    const saveQuestion = (draft) => {
        if (!draft.serverId) { notify("This question has not been saved on the server yet"); return Promise.resolve(false); }
        const cleaned = { ...draft, marks: Number(draft.marks) || 1 };
        setSavingIds((prev) => [...prev, draft.id]);
        return axios
            .put(UpdateGeneratedQuestion, questionToApi(cleaned, rollNumber), auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return false; }
                const nextStatus = String(cleaned.text || "").trim() && (cleaned.status === "NeedsManualAuthoring" || cleaned.status === "Failed")
                    ? "Generated"
                    : cleaned.status;
                setQuestions((prev) => prev.map((q) => (q.id === draft.id
                    ? { ...cleaned, status: nextStatus, needsAuthoring: nextStatus === "NeedsManualAuthoring", failureReason: "" }
                    : q)));
                notify("Question saved", true);
                return true;
            })
            .catch((error) => { notify(errorMessage(error, "That edit could not be saved")); return false; })
            .finally(() => setSavingIds((prev) => prev.filter((id) => id !== draft.id)));
    };

    const regenerateOne = (question) => {
        if (!canRegenerate) { notify("You do not have access to rewrite a question with AI - edit it by hand instead"); return; }
        if (question.needsAuthoring) { notify("This one has to be written by hand - there is nothing for the AI to work from"); return; }
        setSavingIds((prev) => [...prev, question.id]);
        axios
            .post(RegenerateQuestion, { questionId: question.serverId, regeneratedByRollNumber: rollNumber }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify("Question rewritten", true);
                loadQuestions(true);
            })
            .catch((error) => notify(errorMessage(error, "That question could not be rewritten")))
            .finally(() => setSavingIds((prev) => prev.filter((id) => id !== question.id)));
    };

    const submitForApproval = () => {
        setSaving(true);
        axios
            .post(SubmitQuestionPaperForApproval, { questionPaperId: paperId, submittedByRollNumber: rollNumber }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setApproval((prev) => ({ ...prev, status: "Pending", submittedOn: new Date().toISOString() }));
                setMaxStep(5);
                notify(approval.status === "SentBack" ? "Resubmitted for approval" : "Sent for approval", true);
                loadHistory();
            })
            .catch((error) => notify(errorMessage(error, "The paper could not be sent for approval")))
            .finally(() => setSaving(false));
    };

    const goNext = () => {
        if (saving) return;
        if (locked) { goTo(Math.min(step + 1, WIZARD_STEPS.length - 1)); return; }
        if (step === 0) { saveBasics(); return; }
        if (step === 1) { saveChapters(); return; }
        if (step === 2) { savePatternAndGenerate(); return; }
        if (step === 3) { confirmAndContinue(); return; }
        if (step === 4) { goTo(5); }
    };

    const goBack = () => {
        if (step === 0) { navigate("/dashboardmenu/assessment/question-paper"); return; }
        setStep(step - 1);
    };

    const printHex = printedSheetHex(paperColor, printColor);

    const downloadPdf = () => {
        if (!printRef.current) return;
        exportPaperPdf(printRef.current, {
            filename: `${form.name || "question-paper"}${showAnswers ? "-answer-key" : ""}.pdf`,
            sizeKey: paperSize,
            sheetHex: printHex,
        });
        notify("Preparing the PDF", true);
    };

    const printPaper = () => {
        if (!printPaperNode(printRef.current, form.name, { sheetHex: printHex, sizeKey: paperSize })) {
            notify("Allow pop-ups to print the paper");
        }
    };

    const checks = useMemo(() => {
        const sections = genPattern?.sections || [];
        const shortSections = sections.filter((s) => questions.filter((q) => q.sectionId === s.id).length < s.questionsToPrint);
        const manual = questions.filter((q) => q.needsAuthoring && !String(q.text || "").trim());
        const failedQuestions = questions.filter((q) => q.status === "Failed");
        const missingAnswers = questions.filter((q) => !String(q.answerKey || "").trim());
        const sectionsTotal = sections.reduce((sum, s) => sum + sectionMarks(s), 0);

        return [
            {
                ok: genStatus === "Ready",
                text: genStatus === "Ready" ? "The questions are confirmed." : "The questions have not been confirmed yet - go back to the Questions step and confirm them.",
            },
            {
                ok: failedQuestions.length === 0,
                text: failedQuestions.length === 0
                    ? "Every question was written successfully."
                    : `${failedQuestions.length} question(s) failed and have to be rewritten or typed in.`,
            },
            {
                ok: manual.length === 0,
                text: manual.length === 0
                    ? "Nothing is waiting to be written by hand."
                    : `${manual.length} question(s) still have to be written by hand.`,
            },
            {
                ok: !form.totalMarks || sectionsTotal === Number(form.totalMarks),
                warn: Boolean(form.totalMarks) && sectionsTotal !== Number(form.totalMarks),
                text: `Section marks add up to ${sectionsTotal} against a ${form.totalMarks || sectionsTotal} mark paper.`,
            },
            {
                ok: shortSections.length === 0,
                warn: shortSections.length > 0,
                text: shortSections.length === 0
                    ? "Every part has as many questions as the pattern asks for."
                    : `${shortSections.map((s) => s.label).join(", ")} ${shortSections.length === 1 ? "is" : "are"} short of questions.`,
            },
            {
                ok: duplicates.duplicateCount === 0,
                warn: duplicates.duplicateCount > 0,
                text: duplicates.duplicateCount === 0 ? "No question is repeated in this paper." : `${duplicates.duplicateCount} duplicate question(s) still in the paper.`,
            },
            {
                ok: missingAnswers.length === 0,
                warn: missingAnswers.length > 0,
                text: missingAnswers.length === 0 ? "Every question has an answer recorded for the key." : `${missingAnswers.length} question(s) have no answer recorded.`,
            },
            {
                ok: selectedChapters.length > 0,
                warn: selectedChapters.length === 0,
                text: `${selectedChapters.length} chapter(s) are covered.`,
            },
        ];
    }, [genPattern, questions, form.totalMarks, duplicates, selectedChapters, genStatus]);

    const blocking = checks.filter((c) => !c.ok && !c.warn);
    const noApprover = approvers !== null && !approvers.unknown && !(approvers.userTypes || []).some((u) => u.isSelected);
    const canSubmit = !blocking.length && !noApprover && (approval.status === "" || approval.status === "SentBack");

    const footerLeft = (() => {
        if (step === 0) return <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Step 1 of 6 - the paper header</Typography>;
        if (step === 1) return (
            <>
                <Pill label={`${selectedChapterIds.length} chapters`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>{[gradeLabel, form.subject].filter(Boolean).join(" - ")}</Typography>
            </>
        );
        if (step === 2) return (
            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                {pattern ? `${pattern.name} - ${patternTotal(pattern) || pattern.totalMarks} marks` : patternName ? `${patternName} (saved)` : "No pattern picked yet"}
            </Typography>
        );
        if (step === 3) return (
            <>
                <Pill label={`${questions.length} questions`} color={DASH.ink} bg={DASH.lineSoft} />
                {genStatus === "Ready" && <Pill label="Confirmed" color={DASH.green} bg={DASH.greenLight} border="#BBF7D0" />}
                {duplicates.duplicateCount > 0 && (
                    <Pill label={`${duplicates.duplicateCount} duplicates`} color={DASH.red} bg={DASH.redLight} border="#FECACA" />
                )}
            </>
        );
        if (step === 4) return <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Pick a layout, then check the preview</Typography>;
        const meta = approvalMeta(approval.status);
        return (
            <Typography sx={{ fontSize: "12px", color: blocking.length && !approval.status ? DASH.red : meta.color, fontWeight: 600 }}>
                {approval.status ? meta.label : blocking.length ? blocking[0].text : noApprover ? "No approver configured yet" : "All checks passed"}
            </Typography>
        );
    })();

    const nextLabel = (() => {
        if (saving) return "Saving...";
        if (locked) return "Next";
        if (step === 2) return String(pattern?.id) === String(savedPatternId) && questions.length ? "Next" : "Generate Questions";
        if (step === 3) return genStatus === "Ready" ? "Next" : "Confirm Questions";
        return "Next";
    })();

    const waiting = step === 3 && (isGenerating(genStatus) || genStatus === "Failed" || (!genStatus && !questions.length));

    const submitLabel = (() => {
        if (saving) return "Sending...";
        if (approval.status === "Pending") return "Waiting for approval";
        if (approval.status === "Approved") return "Approved";
        if (approval.status === "Rejected") return "Rejected";
        if (approval.status === "SentBack") return "Resubmit for Approval";
        return "Send for Approval";
    })();

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                    <IconButton onClick={() => navigate("/dashboardmenu/assessment/question-paper")} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                                {paperId ? form.name || "Question Paper" : "Create Question Paper"}
                            </Typography>
                            {approval.status && (
                                <Pill label={approvalMeta(approval.status).label} color={approvalMeta(approval.status).color} bg={approvalMeta(approval.status).bg} border={approvalMeta(approval.status).border} />
                            )}
                        </Box>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Six steps - details, chapters, pattern, questions, template, approval.
                            {paperId ? " Saved as you go, so you can leave and come back." : ""}
                        </Typography>
                    </Box>
                </Box>
                {paperId && step >= 4 && (
                    <Button
                        onClick={() => navigate(`/dashboardmenu/assessment/question-paper/${paperId}`)}
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ ...outlineBtnSx, ml: { xs: 5, md: 0 } }}
                    >
                        Open full preview
                    </Button>
                )}
            </Box>

            {resuming && (
                <LinearProgress sx={{ mb: 2, height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft, "& .MuiLinearProgress-bar": { bgcolor: DASH.primary } }} />
            )}

            <WizardHeader
                steps={WIZARD_STEPS}
                step={step}
                onJump={(next) => {
                    if (!paperId && next > 0) { notify("Save the details first"); return; }
                    if (next > maxStep) { notify("Finish the current step first"); return; }
                    setStep(next);
                }}
            />

            {locked && step < 5 && (
                <Banner tone={approval.status === "Approved" ? "ok" : approval.status === "Rejected" ? "error" : "warn"} icon={LockOutlinedIcon} title={approvalMeta(approval.status).title}>
                    {approvalMeta(approval.status).body} Everything here is read-only.
                </Banner>
            )}

            {step === 0 && (
                <Box sx={locked ? { pointerEvents: "none", opacity: 0.75 } : undefined}>
                    <BasicDetailsStep
                        form={form}
                        setField={setField}
                        errors={errors}
                        grades={grades}
                        subjectsForGrade={subjectsForGrade}
                        sectionsForGrade={sectionsForGrade}
                        yearOptions={yearOptions.length ? yearOptions : [academicYear].filter(Boolean)}
                    />
                </Box>
            )}

            {step === 1 && (
                <Box sx={locked ? { pointerEvents: "none", opacity: 0.75 } : undefined}>
                    <ChaptersStep
                        books={books}
                        loading={booksLoading}
                        emptyMessage={booksMessage}
                        gradeLabel={gradeLabel}
                        subject={form.subject}
                        selectedChapterIds={selectedChapterIds}
                        onToggleChapter={toggleChapter}
                        onSelectBook={selectBook}
                        onClearAll={clearChapters}
                        weightage={weightage}
                        onWeightageChange={setChapterWeight}
                        onBalanceWeightage={() => balanceWeightage()}
                        onReload={loadBooks}
                    />
                </Box>
            )}

            {step === 2 && (
                <Box sx={locked ? { pointerEvents: "none", opacity: 0.75 } : undefined}>
                    <PatternStep
                        patterns={patterns}
                        loading={patternsLoading}
                        emptyMessage={patternsMessage}
                        gradeLabel={gradeLabel}
                        subject={form.subject}
                        selectedPattern={pattern}
                        onReload={loadPatterns}
                        onPick={(picked) => {
                            setPattern(picked);
                            setForm((prev) => ({
                                ...prev,
                                totalMarks: patternTotal(picked) || picked.totalMarks || prev.totalMarks,
                                durationMinutes: picked.durationMinutes || prev.durationMinutes,
                            }));
                        }}
                    />
                </Box>
            )}

            {step === 3 && (
                waiting ? (
                    <GeneratingView
                        status={genStatus}
                        sectionsDone={sectionsWithQuestions}
                        sectionsTotal={genPattern?.sections?.length || pattern?.sections?.length || 0}
                        failure={genFailure}
                        onRetry={restartGeneration}
                        canRetry={!locked}
                    />
                ) : (
                    <>
                        {questions.some((q) => q.needsAuthoring && !String(q.text || "").trim()) && (
                            <Banner tone="warn" icon={ErrorOutlineIcon} title="Some questions need you">
                                A part asking for a diagram, a map or anything else with a picture cannot be written by
                                AI. Those are left blank on purpose - open them, type them in and save.
                            </Banner>
                        )}
                        {approval.status === "SentBack" && (
                            <Banner tone="warn" icon={ErrorOutlineIcon} title="The approver sent this paper back">
                                Fix what they asked for here, then go to the Approval step and resubmit.
                            </Banner>
                        )}
                        <QuestionsStep
                            pattern={genPattern}
                            questions={questions}
                            duplicates={duplicates}
                            savingIds={savingIds}
                            onSaveQuestion={saveQuestion}
                            onRegenerateOne={regenerateOne}
                            canRegenerate={canRegenerate && !locked}
                            busy={saving || locked}
                        />
                    </>
                )
            )}

            {step === 4 && (
                <TemplateStep
                    templateId={templateId}
                    onPick={setTemplateId}
                    paper={paperMeta}
                    pattern={genPattern}
                    questions={questions}
                    school={school}
                    showAnswers={showAnswers}
                    onToggleAnswers={setShowAnswers}
                    zoom={zoom}
                    onZoom={setZoom}
                    onDownload={downloadPdf}
                    onPrint={printPaper}
                    paperSize={paperSize}
                    onPaperSize={setPaperSize}
                    paperColor={paperColor}
                    onPaperColor={setPaperColor}
                    printColor={printColor}
                    onPrintColor={setPrintColor}
                />
            )}

            {step === 5 && (
                <ApprovalStep
                    form={{ ...form, gradeSign: gradeLabel }}
                    pattern={genPattern || (patternName ? { name: patternName, sections: [] } : null)}
                    questions={questions}
                    chapters={selectedChapters}
                    templateId={templateId}
                    checks={checks}
                    approval={approval}
                    history={history}
                    historyLoading={historyLoading}
                    approvers={approvers}
                />
            )}

            <WizardFooter
                left={footerLeft}
                right={
                    step < WIZARD_STEPS.length - 1 ? (
                        <>
                            <Button onClick={goBack} sx={outlineBtnSx}>{step === 0 ? "Cancel" : "Back"}</Button>
                            <Button
                                onClick={goNext}
                                disabled={saving || (step === 3 && waiting && !locked)}
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                            >
                                {nextLabel}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={goBack} sx={outlineBtnSx}>Back</Button>
                            {approval.status === "Approved" ? (
                                <Button
                                    onClick={() => navigate(`/dashboardmenu/assessment/question-paper/${paperId}`)}
                                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={{ ...primaryBtnSx, bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                                >
                                    Open the approved paper
                                </Button>
                            ) : (
                                <Button
                                    onClick={submitForApproval}
                                    startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                                    disabled={saving || !canSubmit}
                                    sx={primaryBtnSx}
                                >
                                    {submitLabel}
                                </Button>
                            )}
                        </>
                    )
                }
            />

            <Box sx={{ position: "fixed", left: -10000, top: 0, width: paperSizeOf(paperSize).width }} aria-hidden>
                <PaperDocument
                    ref={printRef}
                    paper={paperMeta}
                    pattern={genPattern}
                    questions={questions}
                    templateId={templateId}
                    school={school}
                    showAnswers={showAnswers}
                    paperColor={printColor ? paperColor : "white"}
                    paperSize={paperSize}
                    answerSpace
                />
            </Box>
        </Box>
    );
}
