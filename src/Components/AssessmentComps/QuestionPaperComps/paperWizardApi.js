import { val, pickArray, typeMeta } from "./questionPaperApi";

/* Steps 5 and 6 are not built on the server yet - confirmQuestions is the end
   of the line and currentStep sits at 5 with nothing further to call. The
   template and approval steps therefore stay local for now. */
export const LAST_SERVER_STEP = 5;

export const GENERATION_POLL_MS = 10000;

export const GEN_BUSY = ["Pending", "Generating"];

export const isGenerating = (status) => GEN_BUSY.includes(status);

export const MEDIUMS = [
    "English", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Hindi", "Marathi", "Gujarati", "Bengali", "Punjabi",
];

/* The server names a section's kind in its own vocabulary. Everything the
   wizard, the preview and the print templates already do is keyed off the local
   question-type list, so the two are mapped here in one place. */
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
    // Unsupported covers Diagram, Map Work and anything else AI cannot write.
    return { type: "custom", customLabel: questionType || "Manual question", baseType: "long" };
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
    };
};

/* The picker answers with the books AND the chapters already chosen for this
   paper, so one call serves both the first visit and a return trip. Reshaped
   into what the Chapters step already draws - it does not need to know that a
   different endpoint fed it this time. */
export const normalizeEligibleBooks = (payload = {}) => {
    const books = val(payload, ["books", "Books"], []) || [];

    return (Array.isArray(books) ? books : []).map((book) => {
        const chapters = (val(book, ["chapters", "Chapters"], []) || []).map((chapter, i) => ({
            id: val(chapter, ["chapterId", "ChapterId"]),
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
            /* Only Confirmed books ever come back here, so the step's
               "not reviewed yet" branch can never fire on this data. */
            status: "Ready",
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

/* One generated question, turned into the shape every screen downstream already
   speaks. serverId is kept alongside so an edit knows which row to write back. */
const normalizeQuestion = (row = {}, section) => {
    const rawOptions = val(row, ["options", "Options"], null);
    const rawPairs = val(row, ["matchPairs", "MatchPairs"], null);
    const meta = typeMeta(section.type);

    const options = Array.isArray(rawOptions)
        ? rawOptions.map((opt, i) => ({
            id: optionId(i),
            text: val(opt, ["optionText", "OptionText"], "") || "",
            isCorrect: Boolean(val(opt, ["isCorrect", "IsCorrect"], false)),
        }))
        : [];

    const pairs = Array.isArray(rawPairs)
        ? rawPairs.map((pair) => ({
            left: val(pair, ["left", "Left", "columnA", "ColumnA"], "") || "",
            right: val(pair, ["right", "Right", "columnB", "ColumnB"], "") || "",
        }))
        : [];

    const correct = options.find((o) => o.isCorrect);

    return {
        id: `q-${val(row, ["questionId", "QuestionId"], Math.random())}`,
        serverId: val(row, ["questionId", "QuestionId"]),
        sectionId: section.id,
        type: section.type,
        text: val(row, ["questionText", "QuestionText"], "") || "",
        marks: Number(val(row, ["marks", "Marks"], section.marksPerQuestion)) || section.marksPerQuestion,
        options,
        pairs,
        bullets: meta.hasBullets ? [""] : [],
        passage: "",
        alternative: null,
        // MCQ keeps the option letter; every other type keeps the answer text.
        answerKey: correct ? correct.id : (val(row, ["correctAnswer", "CorrectAnswer"], "") || ""),
        difficulty: "medium",
        bloom: "Understand",
        chapterId: null,
        chapterName: "",
        source: "ai",
        usedInPapers: 0,
        status: val(row, ["status", "Status"], "Generated") || "Generated",
        failureReason: val(row, ["failureReason", "FailureReason"], "") || "",
        needsAuthoring: val(row, ["status", "Status"], "") === "NeedsManualAuthoring",
    };
};

/* The generated paper arrives grouped by pattern section. It is split back into
   a pattern (what the paper should look like) and a flat question list (what is
   actually in it) because that is the pair every later screen already takes. */
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

/* Only the field that belongs to this question's type is sent; the other two
   go as null, which is what the endpoint asks for. */
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
        body.matchPairs = (question.pairs || []).map((pair) => ({ left: pair.left, right: pair.right }));
        return body;
    }

    body.correctAnswer = question.answerKey || null;
    return body;
};

/* What the paper is waiting on, said plainly. Nothing here invents an ETA - the
   job runs one pattern section per tick and there is no honest estimate. */
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
