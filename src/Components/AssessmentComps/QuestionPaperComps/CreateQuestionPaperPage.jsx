import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, IconButton, LinearProgress } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import html2pdf from "html2pdf.js";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
} from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    analyseDuplicates, patternFromApi, patternTotal, sectionMarks, withSectionDefaults,
} from "./questionPaperApi";
import {
    normalizePaperDetail, normalizeEligibleBooks, normalizeEligiblePatterns,
    normalizeGeneratedPaper, questionToApi, generationHint, isGenerating,
    GENERATION_POLL_MS,
} from "./paperWizardApi";
import PaperDocument, { printPaperNode, padToWholePages, paperColorHex, DEFAULT_PAPER_COLOR } from "./paperTemplates";
import { WizardHeader, WizardFooter, Pill, outlineBtnSx, primaryBtnSx, Banner } from "./questionPaperTheme";

import BasicDetailsStep from "./WizardSteps/BasicDetailsStep";
import ChaptersStep from "./WizardSteps/ChaptersStep";
import PatternStep from "./WizardSteps/PatternStep";
import QuestionsStep from "./WizardSteps/QuestionsStep";
import TemplateStep from "./WizardSteps/TemplateStep";
import PublishStep from "./WizardSteps/PublishStep";

const token = "123";

const WIZARD_STEPS = [
    { label: "Basic Details", icon: TuneOutlinedIcon },
    { label: "Chapters", icon: MenuBookOutlinedIcon },
    { label: "Pattern", icon: DashboardCustomizeOutlinedIcon },
    { label: "Questions", icon: FactCheckOutlinedIcon },
    { label: "Template", icon: PaletteOutlinedIcon },
    { label: "Approve & Publish", icon: RocketLaunchOutlinedIcon },
];

const APPROVERS = ["Principal", "Vice Principal", "Academic Coordinator", "HOD - Science", "HOD - Languages", "HOD - Mathematics"];

/* The Question Bank is not part of this flow yet - the endpoints behind it do
   not exist - so every entry point to it is off rather than half-wired. */
const SHOW_QUESTION_BANK = false;

/* Every mandatory-field check is behind this one flag while the API is being
   wired end to end. The rules themselves are untouched; set it to true to turn
   them back on. Server-side validation still applies either way - a rejected
   save shows the API's own message. */
const ENFORCE_REQUIRED = false;

const emptyForm = {
    name: "",
    gradeId: "",
    sections: [],
    subject: "",
    academicYear: "",
    examName: "",
    examDate: "",
    durationMinutes: 90,
    totalMarks: 50,
    medium: "English",
    paperCode: "",
    notes: "",
};

/* What the paper is waiting on while the background job writes it. There is no
   ETA to give - the job takes one pattern part per run - so the screen reports
   the parts that are actually finished instead of guessing. */
const GeneratingView = ({ status, sectionsDone, sectionsTotal, failure, onRetry }) => {
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
                {failed
                    ? (failure || "No reason was given. Try generating them again.")
                    : generationHint(status, sectionsDone, sectionsTotal)}
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

            {failed && (
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

    /* questionpapergeneration > paper. Only an explicit "N" refuses, so a session
       whose stored payload predates the submenu is not locked out. */
    const paperPerms = findSubMenuPermissions(user?.permissions, "questionpapergeneration", "paper");
    const mayPaper = (key) => !paperPerms || paperPerms[key] === "Y";
    const canRegenerate = mayPaper("allowregeneratequestion");

    const resumeId = params.paperId || location.state?.paperId || null;

    const [paperId, setPaperId] = useState(resumeId);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [resuming, setResuming] = useState(Boolean(resumeId));

    const [form, setForm] = useState(() => ({ ...emptyForm, academicYear: academicYear || "" }));
    const [errors, setErrors] = useState({});
    const [school, setSchool] = useState({ name: websiteSettings?.title || "", logo: "", address: "" });

    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksMessage, setBooksMessage] = useState("");
    const [bookId, setBookId] = useState("");
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

    const [templateId, setTemplateId] = useState("cbse");
    const [showAnswers, setShowAnswers] = useState(false);
    const [zoom, setZoom] = useState(0.8);

    const [approver, setApprover] = useState(APPROVERS[0]);
    const [approvalNote, setApprovalNote] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const printRef = useRef(null);
    const pollRef = useRef(null);
    const saveTimers = useRef({});
    const timers = useRef([]);

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    useEffect(() => () => {
        timers.current.forEach(clearTimeout);
        Object.values(saveTimers.current).forEach(clearTimeout);
        clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        if (academicYear && !form.academicYear) setForm((p) => ({ ...p, academicYear }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const gradeIdOf = useCallback(
        (sign) => grades.find((g) => String(g.sign) === String(sign))?.id || "",
        [grades]
    );

    /* Reopening a saved paper. currentStep says where it was left, so the wizard
       lands there instead of at the beginning. */
    useEffect(() => {
        if (!resumeId) return;
        setResuming(true);
        axios
            .get(GetQuestionPaper, {
                params: { questionPaperId: resumeId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { notify("That paper could not be opened"); return; }
                const paper = normalizePaperDetail(res.data);
                setPaperId(paper.id);
                setForm((prev) => ({
                    ...prev,
                    name: paper.paperName,
                    gradeId: gradeIdOf(paper.grade) || prev.gradeId,
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
                setStep(Math.min(Math.max((paper.currentStep || 1) - 1, 0), WIZARD_STEPS.length - 1));
            })
            .catch(() => notify("That paper could not be opened"))
            .finally(() => setResuming(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeId, rollNumber, gradeIdOf]);

    /* Only Confirmed books whose class and subject match the paper come back,
       and each chapter says whether it is already chosen - so the same call
       serves the first visit and every trip back. */
    const loadBooks = useCallback(() => {
        if (!paperId) return;
        setBooksLoading(true);
        setBooksMessage("");
        axios
            .get(GetEligibleBooksForPaper, {
                params: { questionPaperId: paperId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
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
                    const owner = list.find((b) => b.chapters.some((c) => already.includes(c.id)));
                    if (owner) setBookId(owner.id);
                }
            })
            .catch((error) => {
                setBooks([]);
                setBooksMessage(
                    error?.response?.data?.message
                    || "No confirmed book matches this class and subject yet. Upload one in Books & Chapters first."
                );
            })
            .finally(() => setBooksLoading(false));
    }, [paperId, rollNumber]);

    useEffect(() => { if (step === 1) loadBooks(); }, [step, loadBooks]);

    useEffect(() => {
        if (bookId && books.some((b) => String(b.id) === String(bookId))) return;
        setBookId(books[0]?.id || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [books]);

    const activeBook = useMemo(
        () => books.find((b) => String(b.id) === String(bookId)) || books[0] || null,
        [books, bookId]
    );

    const selectedChapters = useMemo(() => {
        const all = books.flatMap((b) => b.chapters);
        return all.filter((c) => selectedChapterIds.includes(c.id));
    }, [books, selectedChapterIds]);

    /* Patterns are scoped to this paper's class and subject - there is no way to
       browse another class's. The list carries counts only, so each one is read
       in full to draw its sections on the card. */
    const loadPatterns = useCallback(() => {
        if (!paperId) return;
        setPatternsLoading(true);
        setPatternsMessage("");
        axios
            .get(GetEligiblePatternsForPaper, {
                params: { questionPaperId: paperId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { setPatterns([]); setPatternsMessage(rejected); return null; }

                const rows = normalizeEligiblePatterns(res.data);
                if (!rows.length) { setPatterns([]); return null; }

                return Promise.all(rows.map((row) => axios
                    .get(GetPattern, {
                        params: { patternId: row.id, requestedByRollNumber: rollNumber },
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((detail) => (apiFailed(detail.data)
                        ? { ...row, gradeIds: [], sections: [] }
                        : patternFromApi(detail.data, { gradeIdOf })))
                    .catch(() => ({ ...row, gradeIds: [], sections: [] }))))
                    .then((full) => setPatterns(full));
            })
            .catch((error) => {
                setPatterns([]);
                setPatternsMessage(
                    error?.response?.data?.message
                    || "No pattern exists for this class and subject yet. Build one first."
                );
            })
            .finally(() => setPatternsLoading(false));
    }, [paperId, rollNumber, gradeIdOf]);

    useEffect(() => { if (step === 2) loadPatterns(); }, [step, loadPatterns]);

    /* Step 4 polls. The job writes one pattern part per run, so the sections
       arrive gradually rather than all at once. */
    const loadQuestions = useCallback((quiet = false) => {
        if (!paperId) return;
        axios
            .get(GetGeneratedQuestions, {
                params: { questionPaperId: paperId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) return;
                const parsed = normalizeGeneratedPaper(res.data);
                setGenStatus(parsed.status);
                setGenFailure(parsed.failureReason);
                setGenPattern({
                    id: paperId,
                    name: form.name,
                    subject: form.subject,
                    durationMinutes: form.durationMinutes,
                    sections: parsed.sections.map(withSectionDefaults),
                });
                setQuestions(parsed.questions);
            })
            .catch(() => { if (!quiet) notify("The questions could not be loaded"); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paperId, rollNumber, form.name, form.subject, form.durationMinutes]);

    useEffect(() => { if (step === 3) loadQuestions(); }, [step, loadQuestions]);

    useEffect(() => {
        if (step !== 3 || !isGenerating(genStatus)) return undefined;
        pollRef.current = setInterval(() => loadQuestions(true), GENERATION_POLL_MS);
        return () => clearInterval(pollRef.current);
    }, [step, genStatus, loadQuestions]);

    const sectionsWithQuestions = useMemo(() => {
        const filled = new Set(questions.map((q) => q.sectionId));
        return (genPattern?.sections || []).filter((s) => filled.has(s.id)).length;
    }, [questions, genPattern]);

    const duplicates = useMemo(() => analyseDuplicates(questions), [questions]);

    const paperMeta = useMemo(() => ({
        ...form,
        grade: gradeSign(grades, form.gradeId),
        academicYear: form.academicYear,
        questionCount: questions.length,
    }), [form, grades, questions.length]);

    const balanceWeightage = (ids = selectedChapterIds) => {
        if (!ids.length) return;
        const each = Math.floor(100 / ids.length);
        const next = {};
        ids.forEach((id, i) => {
            next[id] = i === ids.length - 1 ? 100 - each * (ids.length - 1) : each;
        });
        setWeightage(next);
    };

    /* The shares hand out one paper between chapters, so they always total 100 -
       the server rejects anything else. Pushing one up therefore pulls the rest
       down in the proportions they already had, and the last one takes the
       rounding remainder so the total lands on exactly 100. */
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
        setSelectedChapterIds((prev) => {
            const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
            balanceWeightage(next);
            return next;
        });
    };

    const selectAllChapters = () => {
        const ids = (activeBook?.chapters || []).map((c) => c.id);
        setSelectedChapterIds(ids);
        balanceWeightage(ids);
    };

    const clearChapters = () => { setSelectedChapterIds([]); setWeightage({}); };

    const basicsBody = () => ({
        grade: gradeSign(grades, form.gradeId) || "",
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
        if (ENFORCE_REQUIRED && !validateBasics()) { notify("Fill the highlighted fields"); return; }

        setSaving(true);
        const request = paperId
            ? axios.put(
                UpdateQuestionPaperBasicDetails,
                { questionPaperId: paperId, ...basicsBody(), updatedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            : axios.post(
                CreateQuestionPaper,
                { ...basicsBody(), createdByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

        request
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                const id = res.data?.questionPaperId || res.data?.QuestionPaperId || paperId;
                setPaperId(id);
                setStep(1);
            })
            .catch((error) => notify(error?.response?.data?.message || "The details could not be saved"))
            .finally(() => setSaving(false));
    };

    const saveChapters = () => {
        if (!selectedChapterIds.length) { notify("Pick at least one chapter"); return; }

        const shares = selectedChapterIds.map((id) => Number(weightage[id]) || 0);
        if (shares.some((w) => w <= 0)) {
            notify("Every chosen chapter needs a share above 0 - use Balance to split them evenly");
            return;
        }
        const total = shares.reduce((sum, w) => sum + w, 0);
        if (Math.abs(total - 100) > 0.01) {
            notify(`The shares add up to ${total}%, not 100% - use Balance to fix them`);
            return;
        }

        setSaving(true);
        axios
            .put(
                UpdateQuestionPaperChapters,
                {
                    questionPaperId: paperId,
                    chapters: selectedChapterIds.map((id) => ({ chapterId: id, weightage: Number(weightage[id]) })),
                    updatedByRollNumber: rollNumber,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setStep(2);
            })
            .catch((error) => notify(error?.response?.data?.message || "The chapters could not be saved"))
            .finally(() => setSaving(false));
    };

    /* Picking the pattern and starting the job are one action for the teacher,
       so the two calls are chained rather than split across two buttons. */
    const savePatternAndGenerate = () => {
        if (!pattern) { notify("Pick a pattern to continue"); return; }

        setSaving(true);
        axios
            .put(
                SelectQuestionPaperPattern,
                { questionPaperId: paperId, patternId: pattern.id, updatedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return null; }

                setForm((prev) => ({
                    ...prev,
                    totalMarks: res.data?.totalMarks || patternTotal(pattern) || prev.totalMarks,
                    durationMinutes: res.data?.durationMinutes || pattern.durationMinutes || prev.durationMinutes,
                }));

                return axios.post(
                    StartQuestionGeneration,
                    { questionPaperId: paperId, startedByRollNumber: rollNumber },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            })
            .then((res) => {
                if (!res) return;
                /* Already running or already written is not a failure - the
                   review screen is where the teacher wants to be either way. */
                const rejected = apiFailed(res.data);
                if (rejected) notify(rejected);
                setGenStatus(res.data?.questionGenerationStatus || "Pending");
                setStep(3);
            })
            .catch((error) => {
                const detail = error?.response?.data?.message || "";
                if (/already/i.test(detail)) { setStep(3); return; }
                notify(detail || "The questions could not be started");
            })
            .finally(() => setSaving(false));
    };

    const restartGeneration = () => {
        setSaving(true);
        axios
            .post(
                StartQuestionGeneration,
                { questionPaperId: paperId, startedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setGenStatus(res.data?.questionGenerationStatus || "Pending");
                setGenFailure("");
            })
            .catch((error) => notify(error?.response?.data?.message || "That could not be started"))
            .finally(() => setSaving(false));
    };

    const confirmAndContinue = () => {
        if (ENFORCE_REQUIRED && duplicates.duplicateCount > 0) {
            notify("Remove the duplicate questions before continuing");
            return;
        }
        setSaving(true);
        axios
            .put(
                ConfirmQuestions,
                { questionPaperId: paperId, confirmedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setGenStatus(res.data?.questionGenerationStatus || "Ready");
                setStep(4);
            })
            .catch((error) => notify(error?.response?.data?.message || "The questions could not be confirmed"))
            .finally(() => setSaving(false));
    };

    /* Typing edits the question on screen straight away and writes it back once
       the teacher stops - a PUT per keystroke would be dozens of calls a
       sentence. One timer per question, so two open edits never cancel each
       other out. */
    const changeQuestion = (next) => {
        setQuestions((prev) => prev.map((q) => (q.id === next.id ? next : q)));
        if (!next.serverId) return;

        clearTimeout(saveTimers.current[next.id]);
        saveTimers.current[next.id] = setTimeout(() => {
            axios
                .put(UpdateGeneratedQuestion, questionToApi(next, rollNumber), {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    const rejected = apiFailed(res.data);
                    if (rejected) notify(rejected);
                })
                .catch((error) => notify(error?.response?.data?.message || "That edit could not be saved"));
        }, 900);
    };

    const regenerateOne = (question) => {
        if (!canRegenerate) {
            notify("You do not have access to rewrite a question with AI - edit it by hand instead");
            return;
        }
        if (question.needsAuthoring) {
            notify("This one has to be written by hand - there is nothing for the AI to work from");
            return;
        }
        setSaving(true);
        axios
            .post(
                RegenerateQuestion,
                { questionId: question.serverId, regeneratedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify("Question rewritten", true);
                loadQuestions(true);
            })
            .catch((error) => notify(error?.response?.data?.message || "That question could not be rewritten"))
            .finally(() => setSaving(false));
    };

    const notSupported = () => notify(
        "The paper follows the pattern - questions cannot be added, removed or moved between parts. Rewrite one instead."
    );

    const goNext = () => {
        if (saving) return;
        if (step === 0) { saveBasics(); return; }
        if (step === 1) { saveChapters(); return; }
        if (step === 2) { savePatternAndGenerate(); return; }
        if (step === 3) { confirmAndContinue(); return; }
        if (step === 4) { setStep(5); return; }
    };

    const goBack = () => {
        if (step === 0) { navigate("/dashboardmenu/assessment/question-paper"); return; }
        setStep(step - 1);
    };

    const downloadPdf = () => {
        if (!printRef.current) return;
        const undoPad = padToWholePages(printRef.current);
        html2pdf()
            .set({
                margin: 0,
                filename: `${form.name || "question-paper"}${showAnswers ? "-answer-key" : ""}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: paperColorHex(DEFAULT_PAPER_COLOR) },
                jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] },
            })
            .from(printRef.current)
            .save()
            .then(undoPad, undoPad);
        notify("Preparing the PDF", true);
    };

    const printPaper = () => {
        if (!printPaperNode(printRef.current, form.name)) notify("Allow pop-ups to print the paper");
    };

    const checks = useMemo(() => {
        const sections = genPattern?.sections || [];
        const shortSections = sections.filter(
            (s) => questions.filter((q) => q.sectionId === s.id).length < s.questionsToPrint
        );
        const manual = questions.filter((q) => q.needsAuthoring && !String(q.text || "").trim());
        const failedQuestions = questions.filter((q) => q.status === "Failed");
        const missingAnswers = questions.filter((q) => !String(q.answerKey || "").trim());
        const sectionsTotal = sections.reduce((sum, s) => sum + sectionMarks(s), 0);

        return [
            {
                ok: sectionsTotal === Number(form.totalMarks),
                text: `Section marks add up to ${sectionsTotal} against a ${form.totalMarks} mark paper.`,
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
                ok: shortSections.length === 0,
                text: shortSections.length === 0
                    ? "Every part has as many questions as the pattern asks for."
                    : `${shortSections.map((s) => s.label).join(", ")} ${shortSections.length === 1 ? "is" : "are"} short of questions.`,
            },
            {
                ok: duplicates.duplicateCount === 0,
                text: duplicates.duplicateCount === 0
                    ? "No question is repeated in this paper."
                    : `${duplicates.duplicateCount} duplicate question(s) still in the paper.`,
            },
            {
                ok: duplicates.similarCount === 0,
                warn: duplicates.similarCount > 0,
                text: duplicates.similarCount === 0
                    ? "No two questions read alike."
                    : `${duplicates.similarCount} question(s) are very similar - worth a second look.`,
            },
            {
                ok: missingAnswers.length === 0,
                warn: missingAnswers.length > 0,
                text: missingAnswers.length === 0
                    ? "Every question has an answer recorded for the key."
                    : `${missingAnswers.length} question(s) have no answer recorded.`,
            },
            {
                ok: selectedChapters.length > 0,
                text: `${selectedChapters.length} chapter(s) from ${activeBook?.title || "the textbook"} are covered.`,
            },
        ];
    }, [genPattern, questions, form.totalMarks, duplicates, selectedChapters, activeBook]);

    const blocking = checks.filter((c) => !c.ok && !c.warn);

    /* Steps 5 and 6 have no endpoint yet - confirmQuestions is the end of the
       line on the server - so the paper is not sent anywhere from here. */
    const savePaper = (nextStatus) => {
        if (blocking.length) { notify(blocking[0].text); return; }
        notify(
            nextStatus === "Pending"
                ? `Approval routing is not built on the server yet - nothing was sent to ${approver}.`
                : "Publishing is not built on the server yet - the paper stays as a draft."
        );
    };

    const footerLeft = (() => {
        if (step === 0) return <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Step 1 of 6 - the paper header</Typography>;
        if (step === 1) return (
            <>
                <Pill label={`${selectedChapterIds.length} chapters`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>{activeBook?.title || ""}</Typography>
            </>
        );
        if (step === 2) return (
            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                {pattern ? `${pattern.name} - ${patternTotal(pattern)} marks` : "No pattern picked yet"}
            </Typography>
        );
        if (step === 3) return (
            <>
                <Pill label={`${questions.length} questions`} color={DASH.ink} bg={DASH.lineSoft} />
                {duplicates.duplicateCount > 0 && (
                    <Pill label={`${duplicates.duplicateCount} duplicates`} color={DASH.red} bg={DASH.redLight} border="#FECACA" />
                )}
            </>
        );
        if (step === 4) return <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Pick a layout, then check the preview</Typography>;
        return (
            <Typography sx={{ fontSize: "12px", color: blocking.length ? DASH.red : DASH.green, fontWeight: 600 }}>
                {blocking.length ? blocking[0].text : "All checks passed"}
            </Typography>
        );
    })();

    const nextLabel = (() => {
        if (saving) return "Saving...";
        if (step === 2) return "Generate Questions";
        if (step === 3) return "Confirm Questions";
        return "Next";
    })();

    const waiting = step === 3 && (isGenerating(genStatus) || genStatus === "Failed" || (!genStatus && !questions.length));

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                <IconButton onClick={() => navigate("/dashboardmenu/assessment/question-paper")} sx={{ mt: -0.5 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                        Create Question Paper
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                        Six steps - details, chapters, pattern, questions, template, approval.
                        {paperId ? ` Saved as you go, so you can leave and come back.` : ""}
                    </Typography>
                </Box>
            </Box>

            {resuming && (
                <LinearProgress
                    sx={{
                        mb: 2, height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                        "& .MuiLinearProgress-bar": { bgcolor: DASH.primary },
                    }}
                />
            )}

            <WizardHeader
                steps={WIZARD_STEPS}
                step={step}
                onJump={(next) => {
                    // Nothing exists to jump into until the paper has been created.
                    if (!paperId && next > 0) { notify("Save the details first"); return; }
                    setStep(next);
                }}
            />

            {step === 0 && (
                <BasicDetailsStep
                    form={form}
                    setField={setField}
                    errors={errors}
                    grades={grades}
                    subjectsForGrade={subjectsForGrade}
                    sectionsForGrade={sectionsForGrade}
                    yearOptions={yearOptions.length ? yearOptions : [academicYear].filter(Boolean)}
                />
            )}

            {step === 1 && (
                <>
                    {booksMessage && (
                        <Banner tone="warn" icon={ErrorOutlineIcon} title="No book to build from">
                            {booksMessage}
                        </Banner>
                    )}
                    <ChaptersStep
                        books={books}
                        loading={booksLoading}
                        chaptersLoading={false}
                        pendingBooks={[]}
                        gradeLabel={gradeSign(grades, form.gradeId)}
                        subject={form.subject}
                        bookId={activeBook?.id}
                        onBookChange={(id) => setBookId(id)}
                        selectedChapterIds={selectedChapterIds}
                        onToggleChapter={toggleChapter}
                        onSelectAll={selectAllChapters}
                        onClearAll={clearChapters}
                        weightage={weightage}
                        onWeightageChange={setChapterWeight}
                        onBalanceWeightage={() => balanceWeightage()}
                    />
                </>
            )}

            {step === 2 && (
                <>
                    {patternsMessage && (
                        <Banner tone="warn" icon={ErrorOutlineIcon} title="No pattern for this class and subject">
                            {patternsMessage}
                        </Banner>
                    )}
                    <PatternStep
                        patterns={patterns}
                        loading={patternsLoading}
                        gradeId={form.gradeId}
                        subject={form.subject}
                        durationMinutes={form.durationMinutes}
                        onDurationChange={(v) => setField("durationMinutes", v)}
                        selectedPattern={pattern}
                        onPick={(picked) => {
                            setPattern(picked);
                            setForm((prev) => ({
                                ...prev,
                                totalMarks: patternTotal(picked) || prev.totalMarks,
                                durationMinutes: picked.durationMinutes || prev.durationMinutes,
                            }));
                        }}
                    />
                </>
            )}

            {step === 3 && (
                waiting ? (
                    <GeneratingView
                        status={genStatus}
                        sectionsDone={sectionsWithQuestions}
                        sectionsTotal={genPattern?.sections?.length || pattern?.sections?.length || 0}
                        failure={genFailure}
                        onRetry={restartGeneration}
                    />
                ) : (
                    <>
                        {questions.some((q) => q.needsAuthoring) && (
                            <Banner tone="warn" icon={ErrorOutlineIcon} title="Some questions need you">
                                A part asking for a diagram, a map or anything else with a picture cannot be written by
                                AI. Those are left blank on purpose - type them in and they count as done.
                            </Banner>
                        )}
                        <QuestionsStep
                            pattern={genPattern}
                            questions={questions}
                            chapters={selectedChapters}
                            duplicates={duplicates}
                            onChangeQuestion={changeQuestion}
                            onRemoveQuestion={notSupported}
                            onMoveQuestion={notSupported}
                            onMoveToSection={notSupported}
                            onAddQuestion={notSupported}
                            onPickFromBank={notSupported}
                            onRegenerateOne={regenerateOne}
                            onSwapFromBank={notSupported}
                            onRegenerateAll={canRegenerate ? restartGeneration : () => notify("You do not have access to rewrite questions with AI")}
                            showBank={SHOW_QUESTION_BANK}
                            allowStructure={false}
                            busy={saving}
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
                />
            )}

            {step === 5 && (
                <>
                    <Banner tone="info" icon={ErrorOutlineIcon} title="Approval is not wired up yet">
                        The server has no approval or publish endpoint for question papers yet - confirming the
                        questions is the last step it supports. Everything below is the screen those endpoints will
                        drive; nothing is sent anywhere until they exist.
                    </Banner>
                    <PublishStep
                        form={{ ...form, gradeSign: gradeSign(grades, form.gradeId) }}
                        pattern={genPattern}
                        questions={questions}
                        chapters={selectedChapters}
                        duplicates={duplicates}
                        templateId={templateId}
                        approver={approver}
                        onApproverChange={setApprover}
                        approvers={APPROVERS}
                        note={approvalNote}
                        onNoteChange={setApprovalNote}
                        checks={checks}
                    />
                </>
            )}

            <WizardFooter
                left={footerLeft}
                right={
                    step < WIZARD_STEPS.length - 1 ? (
                        <>
                            <Button onClick={goBack} sx={outlineBtnSx}>
                                {step === 0 ? "Cancel" : "Back"}
                            </Button>
                            <Button
                                onClick={goNext}
                                disabled={saving || (step === 3 && waiting)}
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                            >
                                {nextLabel}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={goBack} sx={outlineBtnSx}>Back</Button>
                            <Button
                                onClick={() => savePaper("Pending")}
                                startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                                disabled={blocking.length > 0}
                                sx={primaryBtnSx}
                            >
                                Request Approval
                            </Button>
                            <Button
                                onClick={() => savePaper("Published")}
                                startIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />}
                                disabled={blocking.length > 0}
                                sx={{ ...primaryBtnSx, bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                            >
                                Publish
                            </Button>
                        </>
                    )
                }
            />

            <Box sx={{ position: "fixed", left: -10000, top: 0, width: 794 }} aria-hidden>
                <PaperDocument
                    ref={printRef}
                    paper={paperMeta}
                    pattern={genPattern}
                    questions={questions}
                    templateId={templateId}
                    school={school}
                    showAnswers={showAnswers}
                />
            </Box>
        </Box>
    );
}
