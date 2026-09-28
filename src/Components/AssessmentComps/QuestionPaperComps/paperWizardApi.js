import { val, pickArray, typeMeta } from "./questionPaperApi";

export const GENERATION_POLL_MS = 10000;

export const GEN_BUSY = ["Pending", "Generating"];

export const isGenerating = (status) => GEN_BUSY.includes(status);

export const MEDIUMS = [
    "English", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Hindi", "Marathi", "Gujarati", "Bengali", "Punjabi",
];

export const CANONICAL_TYPES = {
    MCQ: "mcq",
    FillBlank: "fillblank",
    TrueFalse: "truefalse",
    Match: "match",
    ShortAnswer: "short",
    LongAnswer: "long",
};

export const typeFromCanonical = (canonical, questionType) => {
    const hit = CANONICAL_TYPES[canonical];
    if (hit) return { type: hit, customLabel: "", baseType: "long" };
    return { type: "custom", customLabel: questionType || "Manual question", baseType: "long" };
};

export const APPROVAL_STATUSES = ["Pending", "Approved", "SentBack", "Rejected"];

export const approvalLabel = (raw) => {
    const key = String(raw || "").trim().toLowerCase().replace(/[\s_-]/g, "");
    if (key === "pending" || key === "submitted") return "Pending";
    if (key === "approved") return "Approved";
    if (key === "sentback" || key === "returned") return "Sent Back";
    if (key === "rejected") return "Rejected";
    return "";
};

export const approvalKey = (raw) => {
    const label = approvalLabel(raw);
    return label === "Sent Back" ? "SentBack" : label;
};

export const normalizePaperDetail = (payload = {}) => {
    const rawSections = val(payload, ["sections", "Sections"], []);
    const sections = Array.isArray(rawSections)
        ? rawSections
        : String(rawSections || "").split(",").map((s) => s.trim()).filter(Boolean);

    return {
        id: val(payload, ["questionPaperId", "QuestionPaperId"]),
        status: val(payload, ["status", "Status"], "Draft") || "Draft",
        currentStep: Number(val(payload, ["currentStep", "CurrentStep"], 1)) || 1,
        grade: val(payload, ["grade", "Grade"], "") || "",
        sections,
        subject: val(payload, ["subject", "Subject"], "") || "",
        academicYear: val(payload, ["academicYear", "AcademicYear"], "") || "",
        paperName: val(payload, ["paperName", "PaperName"], "") || "",
        examDate: val(payload, ["examDate", "ExamDate"], "") || "",
        medium: val(payload, ["medium", "Medium"], "") || "",
        qpCode: val(payload, ["qpCode", "QpCode"], "") || "",
        notes: val(payload, ["notes", "Notes"], "") || "",
        schoolName: val(payload, ["schoolName", "SchoolName"], "") || "",
        schoolLogo: val(payload, ["schoolLogo", "SchoolLogo"], "") || "",
        patternId: val(payload, ["patternId", "PatternId"], "") || "",
        patternName: val(payload, ["patternName", "PatternName"], "") || "",
        totalMarks: Number(val(payload, ["totalMarks", "TotalMarks"], 0)) || 0,
        durationMinutes: Number(val(payload, ["durationMinutes", "DurationMinutes"], 0)) || 0,
        questionGenerationStatus: val(payload, ["questionGenerationStatus", "QuestionGenerationStatus"], "") || "",
        approvalStatus: approvalKey(val(payload, ["approvalStatus", "ApprovalStatus"], "")),
        sentBackCount: Number(val(payload, ["sentBackCount", "SentBackCount"], 0)) || 0,
        submittedOn: val(payload, ["submittedOn", "SubmittedOn"], "") || "",
        submittedByRollNumber: val(payload, ["submittedByRollNumber", "SubmittedByRollNumber"], "") || "",
        createdByRollNumber: val(payload, ["createdByRollNumber", "CreatedByRollNumber"], "") || "",
        createdByName: val(payload, ["createdByName", "CreatedByName", "createdBy"], "") || "",
        createdOn: val(payload, ["createdOn", "CreatedOn"], "") || "",
        updatedOn: val(payload, ["updatedOn", "UpdatedOn"], "") || "",
    };
};

export const normalizeEligibleBooks = (payload = {}) => {
    const books = val(payload, ["books", "Books"], []) || [];

    return (Array.isArray(books) ? books : []).map((book) => {
        const chapters = (val(book, ["chapters", "Chapters"], []) || []).map((chapter, i) => ({
            id: val(chapter, ["chapterId", "ChapterId"]),
            bookId: val(book, ["bookId", "BookId"]),
            number: Number(val(chapter, ["chapterNumber", "ChapterNumber"], i + 1)) || i + 1,
            title: val(chapter, ["chapterName", "ChapterName"], "") || `Chapter ${i + 1}`,
            startPage: Number(val(chapter, ["startPage", "StartPage"], 0)) || 0,
            endPage: Number(val(chapter, ["endPage", "EndPage"], 0)) || 0,
            wordCount: Number(val(chapter, ["wordCount", "WordCount"], 0)) || 0,
            selected: Boolean(val(chapter, ["selected", "Selected"], false)),
            weightage: Number(val(chapter, ["weightage", "Weightage"], 0)) || 0,
        }));

        return {
            id: val(book, ["bookId", "BookId"]),
            title: val(book, ["bookTitle", "BookTitle"], "") || "Untitled book",
            medium: val(book, ["medium", "Medium"], "") || "",
            term: val(book, ["term", "Term"], "") || "",
            publisher: val(book, ["boardOrPublisher", "BoardOrPublisher"], "") || "",
            editionYear: val(book, ["editionYear", "EditionYear"], "") || "",
            chapterCount: chapters.length,
            chapters,
        };
    });
};

export const normalizeEligiblePatterns = (payload = {}) => {
    const rows = val(payload, ["patterns", "Patterns"], null) || pickArray(payload);
    return (Array.isArray(rows) ? rows : []).map((row) => ({
        id: val(row, ["patternId", "PatternId"]),
        name: val(row, ["patternName", "PatternName"], "") || "",
        grade: val(row, ["grade", "Grade"], "") || "",
        subject: val(row, ["subject", "Subject"], "") || "",
        totalMarks: Number(val(row, ["totalMarks", "TotalMarks"], 0)) || 0,
        durationMinutes: Number(val(row, ["durationMinutes", "DurationMinutes"], 0)) || 0,
        sectionCount: Number(val(row, ["sectionCount", "SectionCount"], 0)) || 0,
    }));
};

const optionId = (index) => String.fromCharCode(97 + index);

const seedOptions = (section) => {
    if (section.type === "truefalse") {
        return [{ id: "a", text: "True", isCorrect: false }, { id: "b", text: "False", isCorrect: false }];
    }
    const count = Math.max(2, Number(section.optionCount) || 4);
    return Array.from({ length: count }, (_, i) => ({ id: optionId(i), text: "", isCorrect: false }));
};

const normalizeQuestion = (row = {}, section) => {
    const rawOptions = val(row, ["options", "Options"], null);
    const rawPairs = val(row, ["matchPairs", "MatchPairs"], null);
    const meta = typeMeta(section.type);

    let options = Array.isArray(rawOptions)
        ? rawOptions.map((opt, i) => ({
            id: optionId(i),
            text: val(opt, ["optionText", "OptionText", "text"], "") || "",
            isCorrect: Boolean(val(opt, ["isCorrect", "IsCorrect"], false)),
        }))
        : [];
    if (meta.hasOptions && options.length === 0) options = seedOptions(section);

    const pairs = Array.isArray(rawPairs)
        ? rawPairs.map((pair) => ({
            left: val(pair, ["left", "Left", "columnA", "ColumnA"], "") || "",
            right: val(pair, ["right", "Right", "columnB", "ColumnB"], "") || "",
        }))
        : [];

    const correct = options.find((o) => o.isCorrect);
    const status = val(row, ["status", "Status"], "Generated") || "Generated";

    return {
        id: `q-${val(row, ["questionId", "QuestionId"], Math.random())}`,
        serverId: val(row, ["questionId", "QuestionId"]),
        sectionId: section.id,
        type: section.type,
        text: val(row, ["questionText", "QuestionText"], "") || "",
        marks: Number(val(row, ["marks", "Marks"], section.marksPerQuestion)) || section.marksPerQuestion,
        options,
        pairs: meta.hasPairs && pairs.length === 0 ? [{ left: "", right: "" }] : pairs,
        bullets: [],
        passage: "",
        alternative: null,
        answerKey: correct ? correct.id : (val(row, ["correctAnswer", "CorrectAnswer"], "") || ""),
        difficulty: "medium",
        bloom: "Understand",
        chapterId: null,
        chapterName: "",
        source: "ai",
        usedInPapers: 0,
        status,
        failureReason: val(row, ["failureReason", "FailureReason"], "") || "",
        regeneratedOn: val(row, ["regeneratedOn", "RegeneratedOn"], "") || "",
        needsAuthoring: status === "NeedsManualAuthoring",
        dirty: false,
    };
};

export const normalizeGeneratedPaper = (payload = {}) => {
    const rawSections = val(payload, ["sections", "Sections"], []) || [];

    const sections = (Array.isArray(rawSections) ? rawSections : []).map((row, i) => {
        const canonical = val(row, ["canonicalType", "CanonicalType"], "") || "";
        const questionType = val(row, ["questionType", "QuestionType"], "") || "";
        const kind = typeFromCanonical(canonical, questionType);
        const printed = Number(val(row, ["questionsPrinted", "QuestionsPrinted"], 0)) || 0;
        const answered = Number(val(row, ["toBeAnswered", "ToBeAnswered"], printed)) || printed;
        const choice = String(val(row, ["choice", "Choice"], "All") || "All").toLowerCase();

        return {
            id: String(val(row, ["patternSectionId", "PatternSectionId"], `sec-${i}`)),
            label: val(row, ["questionLabel", "QuestionLabel"], "") || `PART - ${i + 1}`,
            subLabel: val(row, ["sub", "Sub"], "") || "",
            groupName: "",
            title: "",
            type: kind.type,
            customLabel: kind.customLabel,
            baseType: kind.baseType,
            canonicalType: canonical,
            questionType,
            marksPerQuestion: Number(val(row, ["marksPerQuestion", "MarksPerQuestion"], 1)) || 1,
            questionsToPrint: printed,
            questionsToAnswer: answered,
            choiceMode: choice === "choice" && answered < printed ? "any" : "none",
            internalChoiceCount: 0,
            optionCount: Number(val(row, ["options", "Options"], 4)) || 4,
            instruction: val(row, ["extraInstruction", "ExtraInstruction"], "") || "",
            marksDisplay: "equation",
            equationOrder: "count",
            answerLines: 0,
            difficulty: { easy: 40, medium: 40, hard: 20 },
            unsupported: canonical === "Unsupported",
            displayOrder: Number(val(row, ["displayOrder", "DisplayOrder"], i)) || i,
        };
    });

    const questions = [];
    sections.forEach((section, i) => {
        const raw = val(rawSections[i], ["questions", "Questions"], []) || [];
        (Array.isArray(raw) ? raw : []).forEach((row) => {
            questions.push(normalizeQuestion(row, section));
        });
    });

    return {
        status: val(payload, ["questionGenerationStatus", "QuestionGenerationStatus"], "") || "",
        failureReason: val(payload, ["failureReason", "FailureReason"], "") || "",
        sections,
        questions,
    };
};

export const questionToApi = (question, rollNumber) => {
    const body = {
        questionId: question.serverId,
        questionText: question.text || "",
        options: null,
        matchPairs: null,
        correctAnswer: null,
        marks: Number(question.marks) || 1,
        updatedByRollNumber: rollNumber,
    };

    if (question.type === "mcq" || question.type === "truefalse") {
        body.options = (question.options || []).map((option) => ({
            optionText: option.text || "",
            isCorrect: option.id === question.answerKey,
        }));
        return body;
    }

    if (question.type === "match") {
        body.matchPairs = (question.pairs || [])
            .filter((pair) => String(pair.left || "").trim() || String(pair.right || "").trim())
            .map((pair) => ({ left: pair.left || "", right: pair.right || "" }));
        return body;
    }

    body.correctAnswer = question.answerKey || null;
    return body;
};

export const generationHint = (status, sectionsDone, sectionsTotal) => {
    if (status === "Pending") return "Queued. The first section starts on the next run.";
    if (status === "Generating") {
        return sectionsTotal
            ? `Writing the questions - ${sectionsDone} of ${sectionsTotal} parts done so far.`
            : "Writing the questions.";
    }
    if (status === "NeedsReview") return "Every part is written. Read them through and change what you need to.";
    if (status === "Ready") return "These questions are confirmed.";
    if (status === "Failed") return "The questions could not be written.";
    return "";
};

const personLabel = (row, nameKeys, rollKeys) => {
    const name = val(row, nameKeys, "");
    const roll = val(row, rollKeys, "");
    if (name && roll) return `${name} (${roll})`;
    return name || roll || "";
};

export const normalizeApprovalRow = (row = {}) => ({
    id: val(row, ["questionPaperId", "QuestionPaperId", "id"]),
    name: val(row, ["paperName", "PaperName", "name"], "") || "Untitled paper",
    grade: val(row, ["grade", "Grade"], "") || "",
    subject: val(row, ["subject", "Subject"], "") || "",
    sections: val(row, ["sections", "Sections"], []) || [],
    academicYear: val(row, ["academicYear", "AcademicYear"], "") || "",
    medium: val(row, ["medium", "Medium"], "") || "",
    examDate: val(row, ["examDate", "ExamDate"], "") || "",
    qpCode: val(row, ["qpCode", "QpCode"], "") || "",
    totalMarks: Number(val(row, ["totalMarks", "TotalMarks"], 0)) || 0,
    durationMinutes: Number(val(row, ["durationMinutes", "DurationMinutes"], 0)) || 0,
    patternName: val(row, ["patternName", "PatternName"], "") || "",
    questionCount: Number(val(row, ["questionCount", "QuestionCount", "totalQuestions"], 0)) || 0,
    approvalStatus: approvalKey(val(row, ["approvalStatus", "ApprovalStatus", "status", "Status"], "")),
    submittedBy: personLabel(row, ["submittedByName", "SubmittedByName", "createdByName", "CreatedByName"], ["submittedByRollNumber", "SubmittedByRollNumber", "createdByRollNumber", "CreatedByRollNumber"]),
    submittedByRollNumber: val(row, ["submittedByRollNumber", "SubmittedByRollNumber", "createdByRollNumber", "CreatedByRollNumber"], "") || "",
    submittedOn: val(row, ["submittedOn", "SubmittedOn", "submittedForApprovalOn"], "") || "",
    decidedBy: personLabel(row, ["decidedByName", "DecidedByName", "approvedByName", "reviewedByName"], ["decidedByRollNumber", "DecidedByRollNumber", "approvedByRollNumber", "reviewedByRollNumber"]),
    decidedOn: val(row, ["decidedOn", "DecidedOn", "approvedOn", "reviewedOn"], "") || "",
    note: val(row, ["note", "Note", "approvalNote"], "") || "",
    reason: val(row, ["reason", "Reason", "sentBackReason", "rejectReason"], "") || "",
    sentBackCount: Number(val(row, ["sentBackCount", "SentBackCount"], 0)) || 0,
    createdBy: personLabel(row, ["createdByName", "CreatedByName"], ["createdByRollNumber", "CreatedByRollNumber"]),
    createdOn: val(row, ["createdOn", "CreatedOn"], "") || "",
});

export const normalizeApprovalDashboard = (payload = {}) => {
    const counts = val(payload, ["counts", "Counts"], {}) || {};
    const rows = val(payload, ["papers", "Papers", "data"], null) || pickArray(payload);
    return {
        counts: {
            Pending: Number(val(counts, ["pending", "Pending"], 0)) || 0,
            Approved: Number(val(counts, ["approved", "Approved"], 0)) || 0,
            SentBack: Number(val(counts, ["sentBack", "SentBack", "sentback"], 0)) || 0,
            Rejected: Number(val(counts, ["rejected", "Rejected"], 0)) || 0,
        },
        status: approvalKey(val(payload, ["status", "Status"], "Pending")) || "Pending",
        papers: (Array.isArray(rows) ? rows : []).map(normalizeApprovalRow),
    };
};

export const normalizeApprovalHistory = (payload = {}) => {
    const rows = val(payload, ["history", "History", "data"], null) || pickArray(payload);
    return (Array.isArray(rows) ? rows : []).map((row, i) => {
        const action = String(val(row, ["action", "Action", "decision", "status"], "") || "");
        const key = action.toLowerCase().replace(/[\s_-]/g, "");
        return {
            id: val(row, ["historyId", "HistoryId", "id", "approvalHistoryId"], `h-${i}`),
            action: key === "approve" || key === "approved" ? "Approved"
                : key === "sentback" || key === "sendback" ? "Sent Back"
                    : key === "reject" || key === "rejected" ? "Rejected"
                        : key === "submit" || key === "submitted" || key === "resubmitted" ? "Submitted"
                            : action || "Reviewed",
            by: personLabel(row, ["decidedByName", "DecidedByName", "actionByName", "byName", "userName"], ["decidedByRollNumber", "DecidedByRollNumber", "actionByRollNumber", "byRollNumber", "rollNumber"]),
            on: val(row, ["decidedOn", "DecidedOn", "actionOn", "on", "createdOn", "date"], "") || "",
            note: val(row, ["note", "Note", "reason", "Reason", "remarks"], "") || "",
            round: Number(val(row, ["round", "Round", "submissionRound"], 0)) || 0,
        };
    });
};

export const statusFromHistory = (rows = []) => {
    const last = rows[rows.length - 1];
    if (!last) return "";
    if (last.action === "Submitted") return "Pending";
    if (last.action === "Approved") return "Approved";
    if (last.action === "Sent Back") return "SentBack";
    if (last.action === "Rejected") return "Rejected";
    return "";
};

export const normalizeApprovalSettings = (payload = {}) => {
    const rows = val(payload, ["userTypes", "UserTypes"], []) || [];
    return {
        hasApprover: Boolean(val(payload, ["hasApprover", "HasApprover"], false)),
        userTypes: (Array.isArray(rows) ? rows : []).map((row) => ({
            userTypeID: val(row, ["userTypeID", "UserTypeID", "userTypeId"]),
            userType: val(row, ["userType", "UserType"], "") || "",
            isSelected: Boolean(val(row, ["isSelected", "IsSelected"], false)),
        })),
    };
};

export const fmtDateTime = (value) => {
    if (!value) return "-";
    const text = String(value).trim();
    const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}))?/);
    const date = dmy
        ? new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +(dmy[4] || 0), +(dmy[5] || 0))
        : new Date(text);
    if (Number.isNaN(date.getTime())) return text;
    return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
