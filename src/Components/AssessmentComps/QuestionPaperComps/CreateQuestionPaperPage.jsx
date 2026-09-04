import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, IconButton, LinearProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear, selectAcademicYearOptions } from "../../../Redux/Slices/academicYearSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import axios from "axios";
import { useGradeSubjects, gradeSign } from "../../AcademicsComps/academicMeta";
import { ListBooks, GetBookStatus, ListPatterns } from "../../../Api/Api";
import {
    apiFailed, normalizeBookList, normalizeBookResponse,
} from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    MOCK_QUESTION_BANK, analyseDuplicates, blankQuestion, buildMockQuestions, normalizePatternList,
    patternTotal, sectionMarks, typeMeta, withSectionDefaults,
} from "./questionPaperApi";
import PaperDocument, { printPaperNode, padToWholePages, paperColorHex, DEFAULT_PAPER_COLOR } from "./paperTemplates";
import QuestionBankDialog from "./QuestionBankDialog";
import { WizardHeader, WizardFooter, Pill, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

import BasicDetailsStep from "./WizardSteps/BasicDetailsStep";
import ChaptersStep from "./WizardSteps/ChaptersStep";
import PatternStep from "./WizardSteps/PatternStep";
import QuestionsStep from "./WizardSteps/QuestionsStep";
import TemplateStep from "./WizardSteps/TemplateStep";
import PublishStep from "./WizardSteps/PublishStep";

const WIZARD_STEPS = [
    { label: "Basic Details", icon: TuneOutlinedIcon },
    { label: "Chapters", icon: MenuBookOutlinedIcon },
    { label: "Pattern", icon: DashboardCustomizeOutlinedIcon },
    { label: "Questions", icon: FactCheckOutlinedIcon },
    { label: "Template", icon: PaletteOutlinedIcon },
    { label: "Approve & Publish", icon: RocketLaunchOutlinedIcon },
];

const APPROVERS = ["Principal", "Vice Principal", "Academic Coordinator", "HOD - Science", "HOD - Languages", "HOD - Mathematics"];

const GENERATE_STEPS = [
    "Reading the selected chapters",
    "Matching them to the pattern sections",
    "Drafting questions and answers",
    "Checking for repeated questions",
];

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
    paperCode: "01",
    notes: "",
};

const GeneratingView = ({ stepIndex }) => (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: { xs: 3, md: 6 }, textAlign: "center" }}>
        <Box
            sx={{
                width: 62, height: 62, borderRadius: "50%", mx: "auto",
                bgcolor: DASH.violetLight, border: `1px solid #DDD6FE`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 28, color: DASH.violet }} />
        </Box>
        <Typography sx={{ fontSize: "17px", fontWeight: 700, color: DASH.ink, mt: 1.6 }}>
            Building your question paper
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.4 }}>
            You can edit, reorder or replace every question on the next step.
        </Typography>

        <Box sx={{ maxWidth: 420, mx: "auto", mt: 3, textAlign: "left" }}>
            {GENERATE_STEPS.map((label, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                    <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.6 }}>
                        <Box
                            sx={{
                                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: done ? DASH.green : active ? DASH.violet : "#fff",
                                border: `2px solid ${done ? DASH.green : active ? DASH.violet : DASH.line}`,
                            }}
                        >
                            {done
                                ? <CheckCircleIcon sx={{ fontSize: 13, color: "#fff" }} />
                                : <Typography sx={{ fontSize: "10px", fontWeight: 800, color: active ? "#fff" : DASH.faint }}>{i + 1}</Typography>}
                        </Box>
                        <Typography sx={{ fontSize: "12.5px", fontWeight: active || done ? 700 : 500, color: active || done ? DASH.ink : DASH.faint }}>
                            {label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>

        <LinearProgress
            sx={{
                mt: 2, height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft, maxWidth: 420, mx: "auto",
                "& .MuiLinearProgress-bar": { bgcolor: DASH.violet },
            }}
        />
    </Box>
);

const token = "123";

/* Every mandatory-field check in the wizard is behind this one flag. It is off
   while the API is being wired: the flow has to be walkable end to end so the
   backend side can reach Approve & Publish and mint the key. Set it to true to
   turn the checks back on - the rules themselves are untouched. */
const ENFORCE_REQUIRED = false;

export default function CreateQuestionPaperPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const academicYear = useSelector(selectAcademicYear);
    const yearOptions = useSelector(selectAcademicYearOptions) || [];
    const websiteSettings = useSelector(selectWebsiteSettings);
    const { grades, subjectsForGrade, sectionsForGrade } = useGradeSubjects();

    const presetBook = location.state?.presetBook;
    const presetPattern = location.state?.presetPattern;
    const clonePaper = location.state?.clonePaper;

    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    const [libraryBooks, setLibraryBooks] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [patternsLoading, setPatternsLoading] = useState(false);
    const [booksLoading, setBooksLoading] = useState(false);
    const [chaptersLoading, setChaptersLoading] = useState(false);

    const [step, setStep] = useState(0);
    const [form, setForm] = useState(() => ({
        ...emptyForm,
        academicYear: academicYear || "",
        gradeId: presetBook?.gradeId || clonePaper?.gradeId || "",
        subject: presetBook?.subject || clonePaper?.subject || "",
        name: clonePaper ? `${clonePaper.name} (Copy)` : "",
        examName: clonePaper?.examName || "",
        totalMarks: clonePaper?.totalMarks || presetPattern?.totalMarks || 50,
        durationMinutes: clonePaper?.durationMinutes || presetPattern?.durationMinutes || 90,
    }));
    const [errors, setErrors] = useState({});

    const [bookId, setBookId] = useState(presetBook?.id || "");
    const [selectedChapterIds, setSelectedChapterIds] = useState([]);
    const [weightage, setWeightage] = useState({});

    // Older saved patterns are topped up with the fields added since.
    const hydratePattern = (source) => (source
        ? { ...source, sections: (source.sections || []).map(withSectionDefaults) }
        : null);
    const [pattern, setPattern] = useState(() => hydratePattern(presetPattern));
    const [questions, setQuestions] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [generateStep, setGenerateStep] = useState(0);

    const [templateId, setTemplateId] = useState(clonePaper?.templateId || "cbse");
    const [showAnswers, setShowAnswers] = useState(false);
    const [zoom, setZoom] = useState(0.8);

    // Section the bank dialog is adding into; null keeps it closed.
    const [bankSection, setBankSection] = useState(null);
    /* The question a bank pick should overwrite. Set from the row's bank button;
       null means the dialog is in its normal "append to the section" mode. */
    const [bankTarget, setBankTarget] = useState(null);

    const [approver, setApprover] = useState(APPROVERS[0]);
    const [approvalNote, setApprovalNote] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const printRef = useRef(null);
    const timers = useRef([]);

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    useEffect(() => {
        if (academicYear && !form.academicYear) setForm((p) => ({ ...p, academicYear }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    /* Books come from Books & Chapters. Everything the library holds for this
       class and subject, whatever state it is in. */
    const matchingBooks = useMemo(() => {
        const pool = presetBook
            ? [presetBook, ...libraryBooks.filter((b) => String(b.id) !== String(presetBook.id))]
            : libraryBooks;
        /* Matched on the class SIGN, not gradeId: listBooks answers with
           grade: "V" and carries no gradeId, so comparing ids dropped every
           real book. */
        const wantSign = String(gradeSign(grades, form.gradeId) || "").trim().toLowerCase();
        const wantSubject = String(form.subject || "").trim().toLowerCase();

        return pool.filter((b) => {
            const gradeOk = !wantSign
                || String(b.grade || "").trim().toLowerCase() === wantSign
                || String(b.gradeId || "") === String(form.gradeId);

            /* Compared against the book's stored subject, which is now always one
               of the school's own subject names - the upload screen refuses to
               store anything else. A book saved before that rule (subject read off
               the cover as "கணக்கு") will not match; correcting its subject in
               Books & Chapters is what brings it back. */
            const subjectOk = !wantSubject
                || String(b.subject || "").trim().toLowerCase() === wantSubject;

            return gradeOk && subjectOk;
        });
    }, [presetBook, libraryBooks, grades, form.gradeId, form.subject]);

    /* A book is usable here once it has a detected chapter split. Confirming is
       the rule - an unreviewed split can be wrong - but it is held behind the
       same flag as the rest while the API is being wired, so an unconfirmed book
       can still be picked from and the step is not a dead end. Duplicates and
       books still being read never qualify: they have no chapters at all. */
    const books = useMemo(() => matchingBooks.filter((b) => (
        ENFORCE_REQUIRED
            ? b.status === "Ready"
            : (b.status === "Ready" || b.status === "Needs Review")
    )), [matchingBooks]);

    /* The rest are still shown on the step. A book that is in the library but
       not confirmed is a different problem from no book at all, and the teacher
       can fix it in one click instead of being sent to upload a duplicate. */
    /* Everything the class has, whatever its subject or state. The step lists
       these when nothing is usable, so "no book" is never claimed while the
       library plainly holds one - it is normally a subject that was stored in
       the book's own language and never mapped. */
    const classBooks = useMemo(() => {
        const wantSign = String(gradeSign(grades, form.gradeId) || "").trim().toLowerCase();
        if (!wantSign) return libraryBooks;
        return libraryBooks.filter((b) => (
            String(b.grade || "").trim().toLowerCase() === wantSign
            || String(b.gradeId || "") === String(form.gradeId)
        ));
    }, [libraryBooks, grades, form.gradeId]);

    const pendingBooks = useMemo(
        () => classBooks.filter((b) => !books.some((u) => String(u.id) === String(b.id))),
        [classBooks, books]
    );

    const activeBook = useMemo(
        () => books.find((b) => String(b.id) === String(bookId)) || books[0] || null,
        [books, bookId]
    );

    const selectedChapters = useMemo(
        () => (activeBook?.chapters || []).filter((c) => selectedChapterIds.includes(c.id)),
        [activeBook, selectedChapterIds]
    );


    /* Books come from the library itself, not from a local list: the wizard can
       only build on a confirmed chapter split, and that lives on the server. */
    useEffect(() => {
        if (!form.academicYear) { setLibraryBooks([]); return undefined; }

        let cancelled = false;
        setBooksLoading(true);
        axios
            .get(ListBooks, {
                params: {
                    academicYear: form.academicYear,
                    grade: gradeSign(grades, form.gradeId) || undefined,
                    requestedByRollNumber: rollNumber,
                },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (cancelled || apiFailed(res.data)) return;
                setLibraryBooks(normalizeBookList(res.data, grades));
            })
            .catch(() => { if (!cancelled) setLibraryBooks([]); })
            .finally(() => { if (!cancelled) setBooksLoading(false); });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.academicYear, form.gradeId, rollNumber]);

    // The first usable book is chosen for the teacher rather than left blank.
    useEffect(() => {
        if (bookId && books.some((b) => String(b.id) === String(bookId))) return;
        setBookId(books[0]?.id || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [books]);

    /* listBooks carries no chapters, so the chosen book is read once in full.
       Fetched per book and kept, so switching back and forth is instant. */
    useEffect(() => {
        if (!bookId) return undefined;
        const current = libraryBooks.find((b) => String(b.id) === String(bookId));
        if (!current || current.chapters?.length) return undefined;

        let cancelled = false;
        setChaptersLoading(true);
        axios
            .get(GetBookStatus, {
                params: { bookId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (cancelled || apiFailed(res.data)) return;
                const full = normalizeBookResponse(res.data, grades);
                setLibraryBooks((prev) => prev.map((b) => (
                    String(b.id) === String(bookId) ? { ...b, chapters: full.chapters } : b
                )));
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setChaptersLoading(false); });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId, libraryBooks.length, rollNumber]);

    // A different book means a different chapter list; the old picks cannot stand.
    useEffect(() => { setSelectedChapterIds([]); setWeightage({}); }, [bookId]);


    /* Patterns are scoped to grade + subject and reused every year, so the step
       reads whatever the school has for this class rather than a fixed list. */
    useEffect(() => {
        setPatternsLoading(true);
        axios
            .get(ListPatterns, {
                params: {
                    grade: gradeSign(grades, form.gradeId) || undefined,
                    requestedByRollNumber: rollNumber,
                },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setPatterns([]); return; }
                setPatterns(normalizePatternList(res.data, {
                    gradeIdOf: (sign) => grades.find((g) => String(g.sign) === String(sign))?.id || "",
                }));
            })
            .catch(() => setPatterns([]))
            .finally(() => setPatternsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.gradeId, grades, rollNumber]);
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

    /* The sliders hand out shares of one paper, so the shares have to total 100.
       Setting one to 64% therefore leaves 36% for everyone else, split in the
       proportions they already had - dragging a chapter up visibly pulls the
       others down instead of letting the total climb to 160%.

       The last chapter takes the rounding remainder, so the total lands on exactly
       100 rather than 99 or 101 after the floors. */
    const setChapterWeight = (id, value) => {
        const target = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
        const others = selectedChapterIds.filter((x) => x !== id);
        if (!others.length) { setWeightage({ [id]: 100 }); return; }

        setWeightage((prev) => {
            const rest = 100 - target;
            const othersTotal = others.reduce((sum, x) => sum + (Number(prev[x]) || 0), 0);
            const next = { [id]: target };
            let handed = 0;
            others.forEach((x, i) => {
                if (i === others.length - 1) {
                    next[x] = Math.max(0, rest - handed);
                    return;
                }
                // keep their relative sizes; fall back to an even split when the
                // others are all on zero and there is no ratio to preserve
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

    /* Replace with POST qpaper/generateQuestions { chapters, pattern, weightage }. */
    const generateQuestions = (chosenPattern) => {
        setGenerating(true);
        setGenerateStep(0);
        GENERATE_STEPS.forEach((_, i) => {
            timers.current.push(setTimeout(() => setGenerateStep(i), i * 750));
        });
        timers.current.push(setTimeout(() => {
            setQuestions(buildMockQuestions(chosenPattern, selectedChapters));
            setGenerating(false);
            setStep(3);
        }, GENERATE_STEPS.length * 750 + 500));
    };

    const validateBasics = () => {
        const next = {};
        if (!form.gradeId) next.gradeId = "Pick a class";
        if (!form.subject) next.subject = "Pick a subject";
        if (!form.academicYear) next.academicYear = "Pick an academic year";
        if (!form.name.trim()) next.name = "Name the paper";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const goNext = () => {
        if (step === 0) {
            if (ENFORCE_REQUIRED && !validateBasics()) { notify("Fill the highlighted fields"); return; }
            setStep(1);
            return;
        }
        if (step === 1) {
            if (ENFORCE_REQUIRED && !selectedChapterIds.length) { notify("Pick at least one chapter"); return; }
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!pattern) {
                /* Not a validation rule - there is literally nothing to generate
                   from without a pattern, so this one stays on. */
                notify("Pick a pattern to continue");
                return;
            }
            generateQuestions(pattern);
            return;
        }
        if (step === 3) {
            if (ENFORCE_REQUIRED) {
                if (duplicates.duplicateCount > 0) {
                    notify("Remove the duplicate questions before continuing");
                    return;
                }
                const empty = questions.find((q) => !q.text.trim());
                if (empty) { notify("One question is still empty"); return; }
            }
            setStep(4);
            return;
        }
        if (step === 4) { setStep(5); return; }
    };

    const goBack = () => {
        if (step === 0) { navigate("/dashboardmenu/assessment/question-paper"); return; }
        setStep(step - 1);
    };

    const changeQuestion = (next) =>
        setQuestions((prev) => prev.map((q) => (q.id === next.id ? next : q)));

    const removeQuestion = (question) => {
        setQuestions((prev) => prev.filter((q) => q.id !== question.id));
        notify("Question removed", true);
    };

    const moveQuestion = (question, delta) => {
        setQuestions((prev) => {
            const sectionItems = prev.filter((q) => q.sectionId === question.sectionId);
            const index = sectionItems.findIndex((q) => q.id === question.id);
            const target = index + delta;
            if (target < 0 || target >= sectionItems.length) return prev;

            const reordered = [...sectionItems];
            [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

            let cursor = 0;
            return prev.map((q) => (q.sectionId === question.sectionId ? reordered[cursor++] : q));
        });
    };

    const moveToSection = (question, section) => {
        const meta = typeMeta(section.type);
        setQuestions((prev) => prev.map((q) => (
            q.id === question.id
                ? {
                    ...q,
                    sectionId: section.id,
                    type: section.type,
                    marks: Number(section.marksPerQuestion) || meta.defaultMarks,
                    options: meta.hasOptions ? (q.options.length ? q.options : blankQuestion(section).options) : [],
                }
                : q
        )));
        notify(`Moved to ${section.label}`, true);
    };

    /* A bank entry becomes a normal question in the section it was picked for.
       The section decides the marks - a 2-mark section prints 2 marks even if
       the question last appeared in a 3-mark part. */
    const addFromBank = (entries) => {
        const section = bankSection;
        if (!section || !entries.length) return;

        const created = entries.map((entry, i) => ({
            ...blankQuestion(section, i),
            id: `bank-${Date.now()}-${i}`,
            type: section.type,
            text: entry.text,
            options: entry.options || [],
            pairs: entry.pairs || [],
            bullets: entry.bullets || [],
            passage: entry.passage || "",
            answerKey: entry.answerKey,
            difficulty: entry.difficulty,
            bloom: entry.bloom,
            chapterId: entry.chapterId,
            chapterName: entry.chapterName,
            marks: Number(section.marksPerQuestion) || entry.marks,
            source: "bank",
            usedInPapers: (entry.usedIn || []).length,
        }));

        setQuestions((prev) => {
            const lastIndex = prev.map((q) => q.sectionId).lastIndexOf(section.id);
            const next = [...prev];
            next.splice(lastIndex === -1 ? next.length : lastIndex + 1, 0, ...created);
            return next;
        });
        notify(`${created.length} question${created.length === 1 ? "" : "s"} added to ${section.label || "the section"}`, true);
    };

    const addQuestion = (section) => {
        const created = blankQuestion(section, questions.length);
        const chapter = selectedChapters[0];
        if (chapter) { created.chapterId = chapter.id; created.chapterName = chapter.title; }

        setQuestions((prev) => {
            const lastIndex = prev.map((q) => q.sectionId).lastIndexOf(section.id);
            if (lastIndex === -1) return [...prev, created];
            const next = [...prev];
            next.splice(lastIndex + 1, 0, created);
            return next;
        });
    };

    /* Replace with a single-question call to qpaper/generateQuestions. */
    const regenerateOne = (question) => {
        const section = pattern.sections.find((s) => s.id === question.sectionId);
        const fresh = buildMockQuestions({ sections: [{ ...section, questionsToPrint: 3 }] }, selectedChapters);
        const replacement = fresh.find((q) => q.text !== question.text) || fresh[0];
        if (!replacement) return;
        setQuestions((prev) => prev.map((q) => (
            q.id === question.id ? { ...replacement, id: q.id, sectionId: q.sectionId } : q
        )));
        notify("Question regenerated", true);
    };

    /* The dialog is always scoped to a section: the one being appended to, or the
       one the question being replaced already sits in - so its filters open on the
       right question type either way. */
    const bankDialogSection = bankSection
        || (bankTarget ? (pattern?.sections || []).find((sec) => sec.id === bankTarget.sectionId) : null);

    /* A bank pick overwrites the target in place: it keeps the question's id, its
       section and its marks - the pattern decides those, not the bank - and takes
       everything else from the chosen entry. Position in the paper is unchanged,
       which is the point of replacing rather than removing and adding. */
    const replaceFromBank = (entries) => {
        const entry = entries?.[0];
        if (!entry || !bankTarget) return;

        setQuestions((prev) => prev.map((q) => (
            q.id !== bankTarget.id ? q : {
                ...q,
                text: entry.text,
                options: entry.options || [],
                pairs: entry.pairs || [],
                bullets: entry.bullets || [],
                passage: entry.passage || "",
                answerKey: entry.answerKey,
                difficulty: entry.difficulty,
                bloom: entry.bloom,
                chapterId: entry.chapterId,
                chapterName: entry.chapterName,
                source: "bank",
                usedInPapers: (entry.usedIn || []).length,
            }
        )));
        setBankTarget(null);
        notify("Question replaced from the bank", true);
    };

    const regenerateAll = () => generateQuestions(pattern);

    const downloadPdf = () => {
        if (!printRef.current) return;
        // Same reason as printing - without this the sheet colour stops where
        // the questions stop and the rest of the last page comes out white.
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
        if (!printPaperNode(printRef.current, form.name)) {
            notify("Allow pop-ups to print the paper");
        }
    };

    const checks = useMemo(() => {
        const sections = pattern?.sections || [];
        const shortSections = sections.filter(
            (s) => questions.filter((q) => q.sectionId === s.id).length < s.questionsToPrint
        );
        const missingAnswers = questions.filter((q) => !String(q.answerKey || "").trim());
        const sectionsTotal = sections.reduce((sum, s) => sum + sectionMarks(s), 0);

        return [
            {
                ok: sectionsTotal === Number(form.totalMarks),
                text: `Section marks add up to ${sectionsTotal} against a ${form.totalMarks} mark paper.`,
            },
            {
                ok: shortSections.length === 0,
                text: shortSections.length === 0
                    ? "Every section has as many questions as the pattern asks for."
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
    }, [pattern, questions, form.totalMarks, duplicates, selectedChapters, activeBook]);

    const blocking = checks.filter((c) => !c.ok && !c.warn);

    /* Replace with POST qpaper/save, then qpaper/approvalRequests or qpaper/publish. */
    const savePaper = (nextStatus) => {
        // Every save now goes out to someone, so the checks always apply.
        if (blocking.length) {
            notify(blocking[0].text);
            return;
        }
        const label = nextStatus === "Pending"
            ? `Sent to ${approver} for approval`
            : "Question paper published";
        notify(label, true);
        timers.current.push(setTimeout(() => navigate("/dashboardmenu/assessment/question-paper/all"), 900));
    };

    const school = { name: websiteSettings?.title, address: "" };

    const footerLeft = (() => {
        if (step === 0) return <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Step 1 of 6 - the paper header</Typography>;
        if (step === 1) return (
            <>
                <Pill label={`${selectedChapterIds.length} chapters`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>{activeBook?.title}</Typography>
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
                {blocking.length ? blocking[0].text : "All checks passed - ready to send"}
            </Typography>
        );
    })();

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
                    </Typography>
                </Box>
            </Box>

            <WizardHeader steps={WIZARD_STEPS} step={step} onJump={setStep} />

            {generating ? (
                <GeneratingView stepIndex={generateStep} />
            ) : (
                <>
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
                        <ChaptersStep
                            books={books}
                            loading={booksLoading}
                            chaptersLoading={chaptersLoading}
                            pendingBooks={pendingBooks}
                            gradeLabel={gradeSign(grades, form.gradeId)}
                            subject={form.subject}
                            bookId={activeBook?.id}
                            onBookChange={(id) => { setBookId(id); clearChapters(); }}
                            selectedChapterIds={selectedChapterIds}
                            onToggleChapter={toggleChapter}
                            onSelectAll={selectAllChapters}
                            onClearAll={clearChapters}
                            weightage={weightage}
                            onWeightageChange={setChapterWeight}
                            onBalanceWeightage={() => balanceWeightage()}
                        />
                    )}

                    {step === 2 && (
                        <PatternStep
                            patterns={patterns}
                            loading={patternsLoading}
                            gradeId={form.gradeId}
                            subject={form.subject}
                            durationMinutes={form.durationMinutes}
                            onDurationChange={(v) => setField("durationMinutes", v)}
                            selectedPattern={pattern}
                            onPick={(picked) => {
                                const next = hydratePattern(picked);
                                setPattern(next);
                                setForm((prev) => ({
                                    ...prev,
                                    totalMarks: patternTotal(next),
                                    durationMinutes: next.durationMinutes || prev.durationMinutes,
                                }));
                            }}
                        />
                    )}

                    {step === 3 && pattern && (
                        <QuestionsStep
                            pattern={pattern}
                            questions={questions}
                            chapters={selectedChapters}
                            duplicates={duplicates}
                            onChangeQuestion={changeQuestion}
                            onRemoveQuestion={removeQuestion}
                            onMoveQuestion={moveQuestion}
                            onMoveToSection={moveToSection}
                            onAddQuestion={addQuestion}
                            onPickFromBank={setBankSection}
                            onRegenerateOne={regenerateOne}
                            onSwapFromBank={setBankTarget}
                            onRegenerateAll={regenerateAll}
                        />
                    )}

                    {step === 4 && (
                        <TemplateStep
                            templateId={templateId}
                            onPick={setTemplateId}
                            paper={paperMeta}
                            pattern={pattern}
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
                        <PublishStep
                            form={{ ...form, gradeSign: gradeSign(grades, form.gradeId) }}
                            pattern={pattern}
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
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                        sx={primaryBtnSx}
                                    >
                                        {step === 2 ? "Generate Questions" : "Next"}
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
                </>
            )}

            <QuestionBankDialog
                open={Boolean(bankSection) || Boolean(bankTarget)}
                onClose={() => { setBankSection(null); setBankTarget(null); }}
                mode={bankTarget ? "replace" : "add"}
                bank={MOCK_QUESTION_BANK}
                section={bankDialogSection}
                gradeId={form.gradeId}
                gradeLabel={gradeSign(grades, form.gradeId)}
                subject={form.subject}
                chapters={selectedChapters}
                existingText={questions.map((q) => q.text)}
                onAdd={bankTarget ? replaceFromBank : addFromBank}
            />

            <Box sx={{ position: "fixed", left: -10000, top: 0, width: 794 }} aria-hidden>
                <PaperDocument
                    ref={printRef}
                    paper={paperMeta}
                    pattern={pattern}
                    questions={questions}
                    templateId={templateId}
                    school={school}
                    showAnswers={showAnswers}
                />
            </Box>
        </Box>
    );
}
