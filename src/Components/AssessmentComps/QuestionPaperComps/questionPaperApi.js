export const val = (row, keys, fallback = null) => {
    for (const key of keys) {
        const found = row?.[key];
        if (found !== undefined && found !== null && found !== "") return found;
    }
    return fallback;
};

export const pickArray = (root) => {
    if (Array.isArray(root)) return root.filter((r) => r && typeof r === "object");
    if (!root || typeof root !== "object") return [];
    for (const value of Object.values(root)) {
        if (Array.isArray(value) && value.some((r) => r && typeof r === "object")) {
            return value.filter((r) => r && typeof r === "object");
        }
    }
    for (const value of Object.values(root)) {
        if (value && typeof value === "object") {
            const nested = pickArray(value);
            if (nested.length) return nested;
        }
    }
    return [];
};

export const unwrap = (root) => {
    if (!root || typeof root !== "object") return {};
    if (Array.isArray(root)) return root[0] || {};
    return root.data || root.result || root;
};

export const parseApiDate = (value) => {
    if (!value) return null;
    const text = String(value).trim();
    const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}))?/);
    if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +(dmy[4] || 0), +(dmy[5] || 0));
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const fmtDate = (value) => {
    const date = parseApiDate(value);
    return date
        ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
};

export const gradeLabel = (grades, gradeId) => {
    const match = (grades || []).find((g) => String(g.id) === String(gradeId));
    return match?.sign || (gradeId ? `Grade ${gradeId}` : "");
};

export const QUESTION_TYPES = [
    { key: "mcq", label: "Choose the Best Answer", short: "MCQ", color: "#7C3AED", bg: "#F5F3FF", hasOptions: true, defaultMarks: 1 },
    { key: "fillblank", label: "Fill in the Blanks", short: "Blanks", color: "#EC4899", bg: "#FDF2F8", hasOptions: false, defaultMarks: 1 },
    { key: "truefalse", label: "True or False", short: "True / False", color: "#06B6D4", bg: "#ECFEFF", hasOptions: true, defaultMarks: 1 },
    { key: "match", label: "Match the Columns", short: "Match", color: "#F59E0B", bg: "#FFFBEB", hasOptions: false, defaultMarks: 1, hasPairs: true },
    { key: "oneword", label: "Answer in One Word", short: "One Word", color: "#10B981", bg: "#ECFDF5", hasOptions: false, defaultMarks: 1 },
    { key: "short", label: "Short Answer (VSA / SA)", short: "Short", color: "#3B82F6", bg: "#EFF6FF", hasOptions: false, defaultMarks: 2 },
    { key: "long", label: "Long Answer / Essay", short: "Long", color: "#EF4444", bg: "#FEF2F2", hasOptions: false, defaultMarks: 5 },
    { key: "assertion", label: "Assertion and Reason", short: "Assertion", color: "#8B5CF6", bg: "#F5F3FF", hasOptions: true, defaultMarks: 1 },
    { key: "casestudy", label: "Case Study / Passage Based", short: "Case Study", color: "#0EA5E9", bg: "#F0F9FF", hasOptions: false, defaultMarks: 4, hasPassage: true },
    { key: "writing", label: "Writing Activity (Letter / Blog / Appeal)", short: "Writing", color: "#D946EF", bg: "#FDF4FF", hasOptions: false, defaultMarks: 4, hasBullets: true },
    { key: "mapwork", label: "Map / Diagram Work", short: "Map Work", color: "#059669", bg: "#ECFDF5", hasOptions: false, defaultMarks: 2, needsSpace: true },
    { key: "graph", label: "Graph / Chart Based", short: "Graph", color: "#EA580C", bg: "#FFF7ED", hasOptions: false, defaultMarks: 2, needsSpace: true },
    { key: "picture", label: "Look at the Picture and Write", short: "Picture", color: "#F97316", bg: "#FFF7ED", hasOptions: false, defaultMarks: 1, needsSpace: true },
    { key: "handwriting", label: "Writing Practice (Ruled Lines)", short: "Handwriting", color: "#14B8A6", bg: "#F0FDFA", hasOptions: false, defaultMarks: 1, ruled: true },
    { key: "custom", label: "Other - name it yourself", short: "Custom", color: "#64748B", bg: "#F1F5F9", hasOptions: false, defaultMarks: 1, isCustom: true },
];

/* How the marks are printed next to a section heading.
   equation -> (5 x 1 = 5)   bracket -> [3]   total -> 16 marks   none -> hidden */
export const MARK_DISPLAYS = [
    { key: "equation", label: "5 x 1 = 5", hint: "CBSE and most board papers" },
    { key: "bracket", label: "[3]", hint: "State board format sheets" },
    { key: "total", label: "(4) [16]", hint: "Activity based papers" },
    { key: "none", label: "Hidden", hint: "Marks printed per question only" },
];

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export const numberWord = (n) => NUMBER_WORDS[Number(n)] || String(n);

// "(Any two out of three)" - the wording state board format sheets use.
export const choiceHint = (section) => {
    const print = Number(section?.questionsToPrint) || 0;
    const answer = Number(section?.questionsToAnswer) || 0;
    if (section?.choiceMode !== "any" || answer >= print) return "";
    return `(Any ${numberWord(answer)} out of ${numberWord(print)})`;
};

export const typeMeta = (key) =>
    QUESTION_TYPES.find((t) => t.key === key) || QUESTION_TYPES[0];

export const CHOICE_MODES = [
    { key: "none", label: "Answer all questions", hint: "Every printed question must be answered" },
    { key: "any", label: "Answer any N questions", hint: "Prints more questions than the student answers" },
    { key: "internal", label: "Internal choice - (a) or (b)", hint: "Each question carries an alternative" },
];

export const EXAM_CATEGORIES = ["Unit Test", "Monthly Test", "Quarterly", "Half Yearly", "Term Exam", "Model Exam", "Annual Exam", "Revision Test"];

export const DIFFICULTY_LEVELS = [
    { key: "easy", label: "Easy", color: "#10B981", bg: "#ECFDF5" },
    { key: "medium", label: "Medium", color: "#F59E0B", bg: "#FFFBEB" },
    { key: "hard", label: "Hard", color: "#EF4444", bg: "#FEF2F2" },
];

export const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyse", "Evaluate", "Create"];

/* No draft state - a paper is either waiting on an approver or past them.
   An approver has two ways to say no: "Sent Back" hands it to the teacher to fix
   and resubmit, "Rejected" closes it for good. */
export const PAPER_STATUSES = ["Pending", "Approved", "Published", "Sent Back", "Rejected"];

// The reviewer's note is stored on the paper for both outcomes.
export const REVIEW_OUTCOMES = {
    sendBack: {
        status: "Sent Back",
        title: "Send this paper back",
        blurb: "goes back to be corrected and submitted again.",
        field: "What needs to change",
        confirm: "Send back",
    },
    reject: {
        status: "Rejected",
        title: "Reject this paper",
        blurb: "is closed. It cannot be submitted again - a new paper has to be built.",
        field: "Why it is being rejected",
        confirm: "Reject paper",
    },
};

const STATUS_MAP = {
    // Legacy rows that still say draft land in the queue rather than nowhere.
    draft: "Pending",
    saved: "Pending",
    pending: "Pending",
    waiting: "Pending",
    submitted: "Pending",
    approved: "Approved",
    published: "Published",
    live: "Published",
    sentback: "Sent Back",
    returned: "Sent Back",
    reverted: "Sent Back",
    rejected: "Rejected",
    declined: "Rejected",
};

export const paperStatusLabel = (raw) => {
    const key = String(raw || "").trim().toLowerCase().replace(/[\s_-]/g, "");
    if (STATUS_MAP[key]) return STATUS_MAP[key];
    if (!key) return "Pending";
    return key.charAt(0).toUpperCase() + key.slice(1);
};

// Half marks are real - the LKG paper prints 0.5 x 26 = 13 - so the totals are
// rounded to two places instead of being forced to whole numbers.
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const sectionMarks = (section) =>
    round2((Number(section?.questionsToAnswer) || 0) * (Number(section?.marksPerQuestion) || 0));

export const sectionEquation = (section) => {
    const count = Number(section?.questionsToAnswer) || 0;
    const each = round2(section?.marksPerQuestion);
    return section?.equationOrder === "marks"
        ? `${each} x ${count} = ${sectionMarks(section)}`
        : `${count} x ${each} = ${sectionMarks(section)}`;
};

/* What prints on the right of a section heading. The images show three
   conventions, so the pattern decides which one this section uses. */
export const sectionMarksLabel = (section) => {
    const style = section?.marksDisplay || "equation";
    if (style === "none") return "";
    if (style === "bracket") return `[${sectionMarks(section)}]`;
    if (style === "total") return `(${round2(section?.marksPerQuestion)}) [${sectionMarks(section)}]`;
    return `(${sectionEquation(section)})`;
};

// "Q.1 (A)" when a sub label is set, otherwise just the section label.
export const sectionHeading = (section) =>
    [section?.label, section?.subLabel].filter(Boolean).join(" ");

/* Sections that share a groupName print that heading once, above the first of
   them - GEOGRAPHY / ECONOMICS in one paper, or SECTION - I ... SECTION - IV. */
export const groupSections = (sections = []) => {
    const groups = [];
    sections.forEach((section) => {
        const name = (section.groupName || "").trim();
        const last = groups[groups.length - 1];
        if (last && last.name === name) last.sections.push(section);
        else groups.push({ name, sections: [section] });
    });
    return groups;
};

export const groupMarks = (group) =>
    (group?.sections || []).reduce((sum, s) => sum + sectionMarks(s), 0);

export const patternTotal = (pattern) =>
    round2((pattern?.sections || []).reduce((sum, s) => sum + sectionMarks(s), 0));

export const patternQuestionCount = (pattern) =>
    (pattern?.sections || []).reduce((sum, s) => sum + (Number(s.questionsToPrint) || 0), 0);

export const patternBalanced = (pattern) =>
    Number(pattern?.totalMarks) === patternTotal(pattern);

// "SECTION A" -> "A", "PART - B" -> "B". Keeps anything it does not recognise.
export const shortSectionLabel = (text = "") => {
    const trimmed = String(text).trim();
    const stripped = trimmed.replace(/^(SECTION|PART|SEC)\s*[-.]?\s*/i, "").trim();
    return stripped || trimmed;
};

export const durationLabel = (minutes) => {
    const total = Number(minutes) || 0;
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

/* One entry per printed group with its share of the total, so a pattern can be
   drawn as a single bar. This is what makes the shape of a paper readable at a
   glance - where the marks sit, not just how many there are. */
export const patternSpread = (pattern) => {
    const total = patternTotal(pattern) || 1;
    const bands = [];
    groupSections(pattern?.sections || []).forEach((group, gi) => {
        /* A named group prints one heading over its sections, so it is one band.
           Sections with no group name each carry their own label and become a
           band of their own - otherwise a PART A / PART B paper collapses into a
           single bar. */
        const items = group.name
            ? [group]
            : group.sections.map((section) => ({ name: "", sections: [section] }));

        items.forEach((item, ii) => {
            const first = item.sections[0] || {};
            const marks = groupMarks(item);
            const label = shortSectionLabel(item.name || sectionHeading(first) || `${bands.length + 1}`);
            bands.push({
                key: `${item.name || first.id || `${gi}-${ii}`}`,
                label,
                // Drops a trailing "(LANGUAGE STUDY)" so the label fits a legend.
                short: label.split(" (")[0].trim() || label,
                marks,
                share: (marks / total) * 100,
                color: typeMeta(first.type).color,
                questions: item.sections.reduce((sum, s) => sum + (Number(s.questionsToPrint) || 0), 0),
                types: Array.from(new Set(item.sections.map((s) => typeMeta(s.type).short))),
            });
        });
    });
    return bands;
};

// The same total split by question type instead of by section.
export const patternTypeSpread = (pattern) => {
    const byType = new Map();
    (pattern?.sections || []).forEach((section) => {
        const meta = typeMeta(section.type);
        const entry = byType.get(meta.key)
            || { key: meta.key, label: meta.short, color: meta.color, bg: meta.bg, marks: 0, questions: 0 };
        entry.marks += sectionMarks(section);
        entry.questions += Number(section.questionsToPrint) || 0;
        byType.set(meta.key, entry);
    });
    return Array.from(byType.values()).sort((a, b) => b.marks - a.marks);
};

export const sectionInstruction = (section) => {
    if (section?.instruction?.trim()) return section.instruction.trim();
    const print = Number(section?.questionsToPrint) || 0;
    const answer = Number(section?.questionsToAnswer) || 0;
    const choices = Number(section?.internalChoiceCount) || 0;
    if (section?.choiceMode === "internal") {
        return choices > 0 && choices < print
            ? `Answer all questions. An internal choice is provided in ${choices} question${choices > 1 ? "s" : ""}.`
            : "Answer all questions. Each question carries an internal choice.";
    }
    if (section?.choiceMode === "any" && answer < print) {
        return `Answer any ${answer} of the following ${print} questions.`;
    }
    return "Answer all the questions.";
};

export const newSection = (index = 0) => {
    const labels = ["PART - A", "PART - B", "PART - C", "PART - D", "PART - E", "PART - F"];
    return {
        id: `sec-${Date.now()}-${index}`,
        label: labels[index] || `PART - ${index + 1}`,
        subLabel: "",
        groupName: "",
        title: "",
        type: "mcq",
        marksPerQuestion: 1,
        questionsToPrint: 5,
        questionsToAnswer: 5,
        choiceMode: "none",
        internalChoiceCount: 0,
        optionCount: 4,
        customLabel: "",
        baseType: "long",
        instruction: "",
        marksDisplay: "equation",
        equationOrder: "count",
        answerLines: 0,
        difficulty: { easy: 50, medium: 30, hard: 20 },
    };
};

// Fills in fields added after a pattern was first saved.
export const withSectionDefaults = (section, index = 0) => ({
    ...newSection(index),
    ...section,
    id: section?.id || `sec-${index}`,
});

export const emptyPattern = () => ({
    id: null,
    name: "",
    exam: "",
    gradeIds: [],
    subject: "",
    totalMarks: 50,
    durationMinutes: 90,
    readingTimeMinutes: 0,
    showPaperCode: false,
    instructions: "All questions are compulsory unless stated otherwise.\nWrite legibly and number the answers correctly.",
    sections: [newSection(0)],
});

const HOUR = (h) => h * 60;

// Keeps the blueprints below readable - only what differs from a plain section
// is written out.
const sec = (over) => ({
    subLabel: "",
    groupName: "",
    title: "",
    choiceMode: "none",
    internalChoiceCount: 0,
    optionCount: 4,
    instruction: "",
    marksDisplay: "equation",
    equationOrder: "count",
    answerLines: 0,
    difficulty: { easy: 40, medium: 40, hard: 20 },
    ...over,
});

/* Starter blueprints modelled on real board papers so a teacher never lands on
   an empty pattern screen. Replace with GET qpaper/patterns once it is live. */
export const MOCK_PATTERNS = [
    {
        id: 1,
        name: "CBSE Sample Paper - 80 Marks",
        exam: "Model Examination",
        gradeIds: ["9", "10", "11", "12"],
        subject: "Any",
        totalMarks: 80,
        durationMinutes: HOUR(3),
        readingTimeMinutes: 15,
        showPaperCode: true,
        instructions: [
            "This question paper contains 38 questions. All questions are compulsory.",
            "This question paper is divided into five Sections - A, B, C, D and E.",
            "In Section A, Questions no. 1 to 18 are multiple choice questions (MCQs) and questions number 19 and 20 are Assertion-Reason based questions of 1 mark each.",
            "In Section B, Questions no. 21 to 25 are very short answer (VSA) type questions, carrying 2 marks each.",
            "In Section C, Questions no. 26 to 31 are short answer (SA) type questions, carrying 3 marks each.",
            "In Section D, Questions no. 32 to 35 are long answer (LA) type questions, carrying 5 marks each.",
            "In Section E, Questions no. 36 to 38 are case study based questions carrying 4 marks each.",
            "There is no overall choice. However, an internal choice has been provided in 2 questions in Section B, 3 questions in Section C, 2 questions in Section D and 2 questions in Section E.",
            "Use of calculator is NOT allowed.",
        ].join("\n"),
        createdBy: "Academic Office",
        createdDate: "02-06-2026 09:00",
        usedCount: 14,
        sections: [
            sec({ id: "cb1", groupName: "SECTION A", label: "", title: "Multiple Choice Questions", type: "mcq", marksPerQuestion: 1, questionsToPrint: 18, questionsToAnswer: 18, difficulty: { easy: 55, medium: 35, hard: 10 } }),
            sec({ id: "cb2", groupName: "SECTION A", label: "", title: "Assertion - Reason Based Questions", type: "assertion", marksPerQuestion: 1, questionsToPrint: 2, questionsToAnswer: 2, instruction: "A statement of Assertion (A) is followed by a statement of Reason (R). Choose the correct option." }),
            sec({ id: "cb3", groupName: "SECTION B", label: "", title: "Very Short Answer (VSA) Type Questions", type: "short", marksPerQuestion: 2, questionsToPrint: 5, questionsToAnswer: 5, choiceMode: "internal", internalChoiceCount: 2 }),
            sec({ id: "cb4", groupName: "SECTION C", label: "", title: "Short Answer (SA) Type Questions", type: "short", marksPerQuestion: 3, questionsToPrint: 6, questionsToAnswer: 6, choiceMode: "internal", internalChoiceCount: 3, difficulty: { easy: 30, medium: 50, hard: 20 } }),
            sec({ id: "cb5", groupName: "SECTION D", label: "", title: "Long Answer (LA) Type Questions", type: "long", marksPerQuestion: 5, questionsToPrint: 4, questionsToAnswer: 4, choiceMode: "internal", internalChoiceCount: 2, difficulty: { easy: 20, medium: 45, hard: 35 } }),
            sec({ id: "cb6", groupName: "SECTION E", label: "", title: "Case Study Based Questions", type: "casestudy", marksPerQuestion: 4, questionsToPrint: 3, questionsToAnswer: 3, choiceMode: "internal", internalChoiceCount: 2, difficulty: { easy: 25, medium: 50, hard: 25 } }),
        ],
    },
    {
        id: 2,
        name: "State Board Std X - Two Subject Paper (40 Marks)",
        exam: "Annual Examination",
        gradeIds: ["9", "10"],
        subject: "Social Science",
        totalMarks: 40,
        durationMinutes: HOUR(2),
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: [
            "All questions are compulsory.",
            "Figures to the right indicate full marks.",
            "Use the outline map of India for Q.3 (C).",
            "The use of stencil is allowed for drawing maps.",
            "Use graph paper for Q.3 (A).",
        ].join("\n"),
        createdBy: "Ravi Kumar",
        createdDate: "28-05-2026 11:20",
        usedCount: 7,
        sections: [
            sec({ id: "sb1", groupName: "GEOGRAPHY", label: "Q.1", subLabel: "(A)", title: "Choose the correct alternatives from the brackets and rewrite the statements.", type: "mcq", marksPerQuestion: 1, questionsToPrint: 3, questionsToAnswer: 3, marksDisplay: "bracket" }),
            sec({ id: "sb2", groupName: "GEOGRAPHY", label: "Q.1", subLabel: "(B)", title: "Match the columns.", type: "match", marksPerQuestion: 1, questionsToPrint: 3, questionsToAnswer: 3, marksDisplay: "bracket" }),
            sec({ id: "sb3", groupName: "GEOGRAPHY", label: "Q.2", subLabel: "(A)", title: "Give geographical reasons for the following statements.", type: "short", marksPerQuestion: 2, questionsToPrint: 3, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb4", groupName: "GEOGRAPHY", label: "Q.2", subLabel: "(B)", title: "Write short notes on:", type: "short", marksPerQuestion: 2, questionsToPrint: 3, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb5", groupName: "GEOGRAPHY", label: "Q.3", subLabel: "(A)", title: "Graph question with the help of the given information.", type: "graph", marksPerQuestion: 2, questionsToPrint: 1, questionsToAnswer: 1, marksDisplay: "bracket" }),
            sec({ id: "sb6", groupName: "GEOGRAPHY", label: "Q.3", subLabel: "(B)", title: "Questions based on diagram observation.", type: "short", marksPerQuestion: 1, questionsToPrint: 4, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb7", groupName: "GEOGRAPHY", label: "Q.3", subLabel: "(C)", title: "Map question. To mark, name and give index.", type: "mapwork", marksPerQuestion: 1, questionsToPrint: 4, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb8", groupName: "GEOGRAPHY", label: "Q.4", title: "Answer the questions in detail.", type: "long", marksPerQuestion: 4, questionsToPrint: 3, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "bracket", difficulty: { easy: 20, medium: 50, hard: 30 } }),
            sec({ id: "sb9", groupName: "ECONOMICS", label: "Q.5", title: "Fill in the blanks by choosing the appropriate alternatives.", type: "fillblank", marksPerQuestion: 2, questionsToPrint: 2, questionsToAnswer: 1, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb10", groupName: "ECONOMICS", label: "Q.6", title: "Answer the questions in one or two sentences.", type: "short", marksPerQuestion: 2, questionsToPrint: 5, questionsToAnswer: 3, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "sb11", groupName: "ECONOMICS", label: "Q.7", title: "Answer the questions in five or six sentences.", type: "long", marksPerQuestion: 4, questionsToPrint: 2, questionsToAnswer: 1, choiceMode: "any", marksDisplay: "bracket" }),
        ],
    },
    {
        id: 3,
        name: "Activity Based English - 80 Marks",
        exam: "Annual Examination",
        gradeIds: ["8", "9", "10"],
        subject: "English",
        totalMarks: 80,
        durationMinutes: HOUR(3),
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: [
            "All questions are compulsory.",
            "Show your rough work and neatly cross it out.",
            "Answers to both the sections must be written in the same answer book.",
            "Figures to the right indicate full marks.",
        ].join("\n"),
        createdBy: "Meena D",
        createdDate: "20-05-2026 10:05",
        usedCount: 5,
        sections: [
            sec({ id: "ae1", groupName: "SECTION - I (LANGUAGE STUDY)", label: "Q.1", subLabel: "(A)", title: "Do as directed.", type: "short", marksPerQuestion: 2, questionsToPrint: 4, questionsToAnswer: 4, marksDisplay: "total" }),
            sec({ id: "ae2", groupName: "SECTION - I (LANGUAGE STUDY)", label: "Q.1", subLabel: "(B)", title: "Complete the activities given below as per the instructions.", type: "short", marksPerQuestion: 2, questionsToPrint: 4, questionsToAnswer: 4, marksDisplay: "total" }),
            sec({ id: "ae3", groupName: "SECTION - II (TEXTUAL PASSAGES)", label: "Q.2", subLabel: "(A)", title: "Read the extract and complete the activities given below.", type: "casestudy", marksPerQuestion: 1, questionsToPrint: 10, questionsToAnswer: 10, marksDisplay: "total" }),
            sec({ id: "ae4", groupName: "SECTION - II (TEXTUAL PASSAGES)", label: "Q.2", subLabel: "(B)", title: "Read the extract and complete the activities given below.", type: "casestudy", marksPerQuestion: 1, questionsToPrint: 10, questionsToAnswer: 10, marksDisplay: "total" }),
            sec({ id: "ae5", groupName: "SECTION - III (WRITING SKILLS)", label: "Q.3", subLabel: "(A)", title: "Letter Writing / E-mail.", type: "writing", marksPerQuestion: 4, questionsToPrint: 2, questionsToAnswer: 2, choiceMode: "internal", internalChoiceCount: 2, marksDisplay: "total" }),
            sec({ id: "ae6", groupName: "SECTION - III (WRITING SKILLS)", label: "Q.3", subLabel: "(B)", title: "Review / Blog / Appeal. Attempt any TWO of the following.", type: "writing", marksPerQuestion: 8, questionsToPrint: 3, questionsToAnswer: 2, choiceMode: "any", marksDisplay: "total", difficulty: { easy: 20, medium: 50, hard: 30 } }),
            sec({ id: "ae7", groupName: "SECTION - IV (LITERARY GENRE - NOVEL)", label: "Q.4", subLabel: "(A)", title: "Complete the activities given below as per the instructions.", type: "short", marksPerQuestion: 4, questionsToPrint: 1, questionsToAnswer: 1, marksDisplay: "total" }),
            sec({ id: "ae8", groupName: "SECTION - IV (LITERARY GENRE - NOVEL)", label: "Q.4", subLabel: "(B)", title: "Answer the following questions.", type: "short", marksPerQuestion: 8, questionsToPrint: 1, questionsToAnswer: 1, marksDisplay: "total" }),
            sec({ id: "ae9", groupName: "SECTION - IV (LITERARY GENRE - NOVEL)", label: "Q.5", title: "Answer in detail. Attempt any ONE of the following.", type: "long", marksPerQuestion: 8, questionsToPrint: 2, questionsToAnswer: 1, choiceMode: "any", marksDisplay: "total", difficulty: { easy: 15, medium: 45, hard: 40 } }),
        ],
    },
    {
        id: 4,
        name: "Primary Unit Test - 35 Marks (LKG to II)",
        exam: "Unit Test II",
        gradeIds: ["1", "2", "3"],
        subject: "English",
        totalMarks: 35,
        durationMinutes: HOUR(2),
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: [
            "Read every question with your teacher.",
            "Write neatly on the given lines.",
        ].join("\n"),
        createdBy: "Divya P",
        createdDate: "12-06-2026 10:05",
        usedCount: 11,
        sections: [
            sec({ id: "pr1", label: "Q1.", title: "Write the missing letter A - Z.", type: "fillblank", marksPerQuestion: 1, questionsToPrint: 10, questionsToAnswer: 10, equationOrder: "marks", difficulty: { easy: 90, medium: 10, hard: 0 } }),
            sec({ id: "pr2", label: "Q2.", title: "See the picture and write the correct letter.", type: "picture", marksPerQuestion: 1, questionsToPrint: 2, questionsToAnswer: 2, equationOrder: "marks", difficulty: { easy: 90, medium: 10, hard: 0 } }),
            sec({ id: "pr3", label: "Q3.", title: "Write cursive letters a - z.", type: "handwriting", marksPerQuestion: 0.5, questionsToPrint: 26, questionsToAnswer: 26, equationOrder: "marks", answerLines: 7, difficulty: { easy: 100, medium: 0, hard: 0 } }),
            sec({ id: "pr4", label: "Q4.", title: "Match the following.", type: "match", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, equationOrder: "marks", difficulty: { easy: 85, medium: 15, hard: 0 } }),
            sec({ id: "pr5", label: "Q5.", title: "Look at the picture and write its name.", type: "picture", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, equationOrder: "marks", difficulty: { easy: 80, medium: 20, hard: 0 } }),
        ],
    },
    {
        id: 5,
        name: "Comprehension Model Paper - 40 Marks",
        exam: "Model Examination",
        gradeIds: ["6", "7", "8", "9"],
        subject: "English",
        totalMarks: 40,
        durationMinutes: HOUR(2),
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: [
            "All questions are compulsory.",
            "Read the passage and the chart carefully before answering.",
            "Marks are indicated against each question.",
        ].join("\n"),
        createdBy: "Sangeetha M",
        createdDate: "08-06-2026 13:20",
        usedCount: 4,
        sections: [
            sec({ id: "cm1", label: "Q.1", subLabel: "(A)", title: "Read the passage and choose the correct answer.", type: "casestudy", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, marksDisplay: "bracket", equationOrder: "marks" }),
            sec({ id: "cm2", label: "Q.1", subLabel: "(B)", title: "Answer the following questions.", type: "short", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, marksDisplay: "bracket" }),
            sec({ id: "cm3", label: "Q.2", title: "Study the chart given below and answer the questions that follow.", type: "graph", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, marksDisplay: "bracket" }),
            sec({ id: "cm4", label: "Q.3", title: "Grammar - fill in the blanks with the correct form.", type: "fillblank", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, marksDisplay: "bracket" }),
            sec({ id: "cm5", label: "Q.4", title: "Write a letter / e-mail on the given topic.", type: "writing", marksPerQuestion: 5, questionsToPrint: 2, questionsToAnswer: 1, choiceMode: "any", marksDisplay: "bracket" }),
            sec({ id: "cm6", label: "Q.5", title: "Answer the following questions in detail.", type: "long", marksPerQuestion: 5, questionsToPrint: 4, questionsToAnswer: 3, choiceMode: "any", marksDisplay: "bracket", difficulty: { easy: 20, medium: 50, hard: 30 } }),
        ],
    },
    {
        id: 6,
        name: "Unit Test - 25 Marks",
        exam: "Unit Test I",
        gradeIds: ["3", "4", "5"],
        subject: "Any",
        totalMarks: 25,
        durationMinutes: 60,
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: "All questions are compulsory.\nWrite the answers neatly.",
        createdBy: "Anitha R",
        createdDate: "10-06-2026 09:00",
        usedCount: 12,
        sections: [
            sec({ id: "ut1", label: "PART - A", title: "Choose the best answer", type: "mcq", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, difficulty: { easy: 70, medium: 30, hard: 0 } }),
            sec({ id: "ut2", label: "PART - B", title: "Fill in the blanks", type: "fillblank", marksPerQuestion: 1, questionsToPrint: 5, questionsToAnswer: 5, difficulty: { easy: 60, medium: 40, hard: 0 } }),
            sec({ id: "ut3", label: "PART - C", title: "Answer briefly", type: "short", marksPerQuestion: 3, questionsToPrint: 6, questionsToAnswer: 5, choiceMode: "any", difficulty: { easy: 40, medium: 50, hard: 10 } }),
        ],
    },
    {
        id: 7,
        name: "Term Exam - 50 Marks",
        exam: "Term I",
        gradeIds: ["6", "7", "8"],
        subject: "Any",
        totalMarks: 50,
        durationMinutes: HOUR(2),
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: "Answer all the questions in the given order.\nDraw diagrams wherever necessary.",
        createdBy: "Karthik S",
        createdDate: "02-06-2026 11:20",
        usedCount: 8,
        sections: [
            sec({ id: "te1", label: "PART - A", title: "Choose the best answer", type: "mcq", marksPerQuestion: 1, questionsToPrint: 10, questionsToAnswer: 10, difficulty: { easy: 60, medium: 30, hard: 10 } }),
            sec({ id: "te2", label: "PART - B", title: "Answer any five", type: "short", marksPerQuestion: 2, questionsToPrint: 7, questionsToAnswer: 5, choiceMode: "any" }),
            sec({ id: "te3", label: "PART - C", title: "Answer in detail", type: "short", marksPerQuestion: 3, questionsToPrint: 6, questionsToAnswer: 5, choiceMode: "any", difficulty: { easy: 30, medium: 50, hard: 20 } }),
            sec({ id: "te4", label: "PART - D", title: "Essay type", type: "long", marksPerQuestion: 5, questionsToPrint: 3, questionsToAnswer: 3, choiceMode: "internal", internalChoiceCount: 3, difficulty: { easy: 20, medium: 50, hard: 30 } }),
        ],
    },
    {
        id: 8,
        name: "Higher Secondary Theory - 70 Marks",
        exam: "Annual Examination",
        gradeIds: ["11", "12"],
        subject: "Any",
        totalMarks: 70,
        durationMinutes: HOUR(3),
        readingTimeMinutes: 15,
        showPaperCode: true,
        instructions: "All questions are compulsory.\nAnswers should be brief and to the point.\nUse of calculator is NOT allowed.",
        createdBy: "Meena D",
        createdDate: "30-05-2026 13:10",
        usedCount: 3,
        sections: [
            sec({ id: "hs1", groupName: "SECTION A", label: "", title: "Choose the best answer", type: "mcq", marksPerQuestion: 1, questionsToPrint: 15, questionsToAnswer: 15, difficulty: { easy: 45, medium: 40, hard: 15 } }),
            sec({ id: "hs2", groupName: "SECTION B", label: "", title: "Answer any six questions", type: "short", marksPerQuestion: 2, questionsToPrint: 9, questionsToAnswer: 6, choiceMode: "any" }),
            sec({ id: "hs3", groupName: "SECTION C", label: "", title: "Answer any six questions", type: "short", marksPerQuestion: 3, questionsToPrint: 9, questionsToAnswer: 6, choiceMode: "any", difficulty: { easy: 25, medium: 50, hard: 25 } }),
            sec({ id: "hs4", groupName: "SECTION D", label: "", title: "Answer all the questions", type: "long", marksPerQuestion: 5, questionsToPrint: 5, questionsToAnswer: 5, choiceMode: "internal", internalChoiceCount: 5, difficulty: { easy: 15, medium: 45, hard: 40 } }),
        ],
    },
    {
        id: 9,
        name: "Quick Revision - 20 Marks",
        exam: "Revision Test",
        gradeIds: ["6", "7", "8", "9", "10"],
        subject: "Any",
        totalMarks: 20,
        durationMinutes: 40,
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: "Attempt every question. No choice is given.",
        createdBy: "Sangeetha M",
        createdDate: "05-07-2026 08:30",
        usedCount: 9,
        sections: [
            sec({ id: "qr1", label: "PART - A", title: "Choose the best answer", type: "mcq", marksPerQuestion: 1, questionsToPrint: 10, questionsToAnswer: 10, difficulty: { easy: 60, medium: 30, hard: 10 } }),
            sec({ id: "qr2", label: "PART - B", title: "Answer briefly", type: "short", marksPerQuestion: 2, questionsToPrint: 5, questionsToAnswer: 5 }),
        ],
    },
];

const STOPWORDS = new Set([
    "a", "an", "the", "is", "are", "was", "were", "of", "in", "on", "at", "to", "for", "and", "or",
    "what", "which", "who", "whom", "how", "why", "when", "where", "do", "does", "did", "be", "been",
    "by", "with", "from", "that", "this", "these", "those", "it", "its", "as", "into", "about",
]);

export const normalizeQuestionText = (text) =>
    String(text || "")
        .toLowerCase()
        .replace(/[_]{2,}/g, " blank ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export const questionTokens = (text) =>
    normalizeQuestionText(text)
        .split(" ")
        .filter((word) => word.length > 1 && !STOPWORDS.has(word));

export const diceSimilarity = (a, b) => {
    const left = new Set(questionTokens(a));
    const right = new Set(questionTokens(b));
    if (!left.size || !right.size) return 0;
    let shared = 0;
    left.forEach((token) => { if (right.has(token)) shared += 1; });
    return (2 * shared) / (left.size + right.size);
};

export const SIMILAR_THRESHOLD = 0.8;

/* Flags repeats inside the paper and, when the backend sends usedInPapers on a
   question, repeats against papers already published for the same class and
   subject. Exact matches block the wizard; similar ones only warn. */
export const analyseDuplicates = (questions) => {
    const map = {};
    const normalized = questions.map((q) => normalizeQuestionText(q.text));

    for (let i = 0; i < questions.length; i += 1) {
        if (!normalized[i]) continue;
        for (let j = i + 1; j < questions.length; j += 1) {
            if (!normalized[j]) continue;

            if (normalized[i] === normalized[j]) {
                map[questions[j].id] = { level: "duplicate", matchId: questions[i].id, matchIndex: i, score: 1 };
                if (!map[questions[i].id]) {
                    map[questions[i].id] = { level: "duplicate", matchId: questions[j].id, matchIndex: j, score: 1 };
                }
                continue;
            }

            const score = diceSimilarity(questions[i].text, questions[j].text);
            if (score >= SIMILAR_THRESHOLD) {
                if (!map[questions[j].id]) {
                    map[questions[j].id] = { level: "similar", matchId: questions[i].id, matchIndex: i, score };
                }
                if (!map[questions[i].id]) {
                    map[questions[i].id] = { level: "similar", matchId: questions[j].id, matchIndex: j, score };
                }
            }
        }
    }

    questions.forEach((q) => {
        if (!map[q.id] && Number(q.usedInPapers) > 0) {
            map[q.id] = { level: "reused", matchId: null, matchIndex: -1, score: 0, papers: Number(q.usedInPapers) };
        }
    });

    const levels = Object.values(map);
    return {
        map,
        duplicateCount: levels.filter((d) => d.level === "duplicate").length,
        similarCount: levels.filter((d) => d.level === "similar").length,
        reusedCount: levels.filter((d) => d.level === "reused").length,
    };
};

export const blankQuestion = (section, index = 0) => {
    const meta = typeMeta(section?.type);
    return {
        id: `q-${Date.now()}-${index}`,
        sectionId: section?.id || null,
        type: section?.type || "mcq",
        text: "",
        marks: Number(section?.marksPerQuestion) || meta.defaultMarks,
        options: meta.hasOptions
            ? (section?.type === "truefalse"
                ? [{ id: "a", text: "True" }, { id: "b", text: "False" }]
                : Array.from({ length: Number(section?.optionCount) || 4 }, (_, i) => ({
                    id: String.fromCharCode(97 + i), text: "",
                })))
            : [],
        // Match the Columns prints as two lettered columns.
        pairs: meta.hasPairs ? [{ left: "", right: "" }, { left: "", right: "" }] : [],
        // Writing activities print their points as a bulleted brief.
        bullets: meta.hasBullets ? [""] : [],
        // Case study and comprehension questions carry the extract above them.
        passage: meta.hasPassage ? "" : "",
        // Filled when the section gives this question an internal (a) / (b) choice.
        alternative: null,
        answerKey: "",
        difficulty: "medium",
        bloom: "Understand",
        chapterId: null,
        chapterName: "",
        source: "manual",
        usedInPapers: 0,
    };
};

const SAMPLE_STEMS = {
    mcq: [
        "Which of the following best describes {topic}?",
        "The main idea behind {topic} is",
        "{topic} is closely related to",
        "Identify the correct statement about {topic}.",
        "What is the result of applying {topic}?",
    ],
    fillblank: [
        "The process of {topic} is called ________.",
        "________ is the basic unit discussed under {topic}.",
        "In {topic}, the value of the constant is ________.",
        "{topic} was first explained by ________.",
    ],
    truefalse: [
        "{topic} always produces the same result.",
        "Every example of {topic} follows the same rule.",
        "{topic} was introduced in the previous chapter.",
    ],
    match: ["Match the terms in Column A with their correct meaning in Column B."],
    oneword: [
        "Name the process described under {topic}.",
        "Write the term used for {topic}.",
    ],
    short: [
        "Explain {topic} with a suitable example.",
        "Write any two features of {topic}.",
        "How does {topic} help in daily life?",
        "Differentiate between the two forms of {topic}.",
    ],
    long: [
        "Describe {topic} in detail with a neat diagram.",
        "Explain the importance of {topic} and list its applications.",
        "Discuss {topic} under suitable headings with examples.",
    ],
    assertion: [
        "Assertion (A): {topic} follows a fixed rule.\nReason (R): The rule was derived from repeated observation.",
        "Assertion (A): {topic} is widely used in practice.\nReason (R): It gives the same result under every condition.",
    ],
    casestudy: [
        "Read the extract on {topic} given above and answer the questions that follow.",
        "Study the passage on {topic} and complete the activities given below.",
    ],
    writing: [
        "Write a letter to the Headmaster on {topic} using the points given below.",
        "Prepare a blog on {topic} with the help of the following points. (100 / 150 words)",
        "Draft an appeal on {topic} using the points given below. (100 / 150 words)",
    ],
    mapwork: [
        "On the outline map provided, mark, name and give the index for {topic}.",
        "Locate and label {topic} on the given outline map.",
    ],
    graph: [
        "Draw a suitable graph for the data on {topic} given above.",
        "Study the chart on {topic} and answer the questions that follow.",
    ],
    picture: [
        "Look at the picture and write the correct letter.",
        "See the picture and write its name.",
    ],
    handwriting: [
        "Write the letters neatly on the lines given below.",
        "Copy the given words in cursive writing.",
    ],
};

const OPTION_TAILS = ["the first property", "the second property", "the derived form", "none of these"];

const ASSERTION_OPTIONS = [
    { id: "a", text: "Both (A) and (R) are true and (R) is the correct explanation of (A)." },
    { id: "b", text: "Both (A) and (R) are true but (R) is not the correct explanation of (A)." },
    { id: "c", text: "(A) is true but (R) is false." },
    { id: "d", text: "(A) is false but (R) is true." },
];

const WRITING_POINTS = [
    ["Why the topic matters", "Two supporting facts", "A real example", "Your own conclusion"],
    ["Renewable and clean", "Reduces pollution", "Lowers monthly bills", "Government subsidy"],
    ["Respect and awareness", "Safety measures", "Collective responsibility", "Government initiatives"],
];

const SAMPLE_PASSAGE = (topic) =>
    `The following extract is taken from the lesson on ${topic}. Read it carefully. ` +
    `It explains the idea in simple terms, gives an everyday example, and closes with a short summary ` +
    `that the questions below are based on.`;

/* Stand-in generator so every wizard step is reviewable before
   qpaper/generateQuestions exists. The shape matches what the API should send. */
export const buildMockQuestions = (pattern, chapters) => {
    const pool = chapters?.length ? chapters : [{ id: "ch-1", title: "General" }];
    const questions = [];
    let seed = 0;

    (pattern?.sections || []).forEach((section) => {
        const stems = SAMPLE_STEMS[section.type] || SAMPLE_STEMS.short;
        const meta = typeMeta(section.type);
        const choiceLimit = section.choiceMode === "internal"
            ? (Number(section.internalChoiceCount) || Number(section.questionsToPrint) || 0)
            : 0;

        for (let i = 0; i < (Number(section.questionsToPrint) || 0); i += 1) {
            const chapter = pool[seed % pool.length];
            const stem = stems[i % stems.length];
            const difficulty = i % 5 === 0 ? "hard" : i % 2 === 0 ? "easy" : "medium";
            const text = stem.replace("{topic}", chapter.title);

            const options = section.type === "assertion"
                ? ASSERTION_OPTIONS
                : meta.hasOptions
                    ? (section.type === "truefalse"
                        ? [{ id: "a", text: "True" }, { id: "b", text: "False" }]
                        : Array.from({ length: Number(section.optionCount) || 4 }, (_, oi) => ({
                            id: String.fromCharCode(97 + oi),
                            text: `${chapter.title} - ${OPTION_TAILS[oi % OPTION_TAILS.length]}`,
                        })))
                    : [];

            questions.push({
                id: `gen-${section.id}-${i}`,
                sectionId: section.id,
                type: section.type,
                text,
                marks: Number(section.marksPerQuestion) || meta.defaultMarks,
                options,
                pairs: meta.hasPairs
                    ? Array.from({ length: Math.max(2, Number(section.marksPerQuestion) * 2 || 4) }, (_, pi) => ({
                        left: `${chapter.title} term ${pi + 1}`,
                        right: `Meaning of term ${((pi + 2) % 4) + 1}`,
                    }))
                    : [],
                bullets: meta.hasBullets ? WRITING_POINTS[i % WRITING_POINTS.length] : [],
                passage: meta.hasPassage ? SAMPLE_PASSAGE(chapter.title) : "",
                alternative: i < choiceLimit
                    ? {
                        text: `${stems[(i + 1) % stems.length].replace("{topic}", chapter.title)}`,
                        options,
                    }
                    : null,
                answerKey: meta.hasOptions ? String.fromCharCode(97 + (i % 4)) : `${chapter.title} - model answer`,
                difficulty,
                bloom: BLOOM_LEVELS[i % BLOOM_LEVELS.length],
                chapterId: chapter.id,
                chapterName: chapter.title,
                source: "ai",
                usedInPapers: i === 3 ? 1 : 0,
            });
            seed += 1;
        }
    });

    return questions;
};

export const normalizePaper = (row, grades) => {
    const gradeId = val(row, ["gradeId", "gradeID"], null);
    return {
        id: val(row, ["paperId", "questionPaperId", "id"], null),
        name: val(row, ["paperName", "title", "name", "heading"], "Untitled paper"),
        gradeId,
        grade: gradeLabel(grades, gradeId) || val(row, ["grade", "gradeSign"], ""),
        subject: val(row, ["subject", "subjectName"], "General"),
        examName: val(row, ["examName", "exam"], ""),
        examDate: val(row, ["examDate", "scheduledDate"], null),
        academicYear: val(row, ["academicYear", "year"], ""),
        totalMarks: Number(val(row, ["totalMarks", "marks"], 0)) || 0,
        durationMinutes: Number(val(row, ["durationMinutes", "duration"], 0)) || 0,
        patternName: val(row, ["patternName", "pattern"], ""),
        templateId: val(row, ["templateId", "template"], "classic"),
        questionCount: Number(val(row, ["questionCount", "totalQuestions"], 0)) || 0,
        status: paperStatusLabel(val(row, ["status", "paperStatus"], "")),
        createdBy: val(row, ["createdByName", "createdBy", "teacherName"], "-"),
        createdDate: val(row, ["createdOn", "createdDate", "postedDateAndTime"], null),
        approver: val(row, ["approverName", "approver"], ""),
        rejectReason: val(row, ["rejectReason", "remarks"], ""),
    };
};

export const normalizePaperList = (payload, grades) =>
    pickArray(payload?.data ?? payload).map((row) => normalizePaper(row, grades));

/* Recent papers shown on the landing page and the All Papers list. Each one
   points at a real starter pattern so the preview renders a full paper. */
export const MOCK_PAPERS = [
    { id: 101, name: "Mathematics - Half Yearly", gradeId: "10", grade: "X", subject: "Mathematics", examName: "Half Yearly Examination", examDate: "18-09-2026", academicYear: "2026-2027", totalMarks: 80, durationMinutes: 180, patternName: "CBSE Sample Paper - 80 Marks", templateId: "cbse", paperCode: "01", questionCount: 38, status: "Published", createdBy: "Anitha R", createdDate: "12-08-2026 10:30", approver: "Principal", rejectReason: "" },
    { id: 102, name: "Science Unit Test II", gradeId: "9", grade: "IX", subject: "Science", examName: "Unit Test II", examDate: "02-09-2026", academicYear: "2026-2027", totalMarks: 25, durationMinutes: 60, patternName: "Unit Test - 25 Marks", templateId: "minimal", paperCode: "", questionCount: 16, status: "Pending", createdBy: "Karthik S", createdDate: "20-08-2026 14:05", approver: "HOD - Science", rejectReason: "" },
    { id: 103, name: "Geography and Economics - Annual", gradeId: "10", grade: "X", subject: "Social Science", examName: "Annual Examination", examDate: "22-09-2026", academicYear: "2026-2027", totalMarks: 40, durationMinutes: 120, patternName: "State Board Std X - Two Subject Paper (40 Marks)", templateId: "stateboard", paperCode: "", questionCount: 30, status: "Approved", createdBy: "Ravi Kumar", createdDate: "18-08-2026 09:15", approver: "HOD - Social Science", rejectReason: "" },
    { id: 104, name: "English - Annual Examination", gradeId: "10", grade: "X", subject: "English", examName: "Annual Examination", examDate: "26-09-2026", academicYear: "2026-2027", totalMarks: 80, durationMinutes: 180, patternName: "Activity Based English - 80 Marks", templateId: "activity", paperCode: "", questionCount: 36, status: "Pending", createdBy: "Meena D", createdDate: "24-08-2026 16:40", approver: "HOD - Languages", rejectReason: "" },
    { id: 105, name: "LKG Unit Test II - English", gradeId: "1", grade: "I", subject: "English", examName: "Unit Test II", examDate: "29-08-2026", academicYear: "2026-2027", totalMarks: 35, durationMinutes: 120, patternName: "Primary Unit Test - 35 Marks (LKG to II)", templateId: "primary", paperCode: "", questionCount: 48, status: "Sent Back", createdBy: "Divya P", createdDate: "21-08-2026 11:00", approver: "Coordinator", rejectReason: "Two picture questions repeat from last month's paper. Swap them and send it again." },
    { id: 106, name: "Mathematics Revision - Std VIII", gradeId: "8", grade: "VIII", subject: "Mathematics", examName: "Revision Test", examDate: "05-09-2026", academicYear: "2026-2027", totalMarks: 20, durationMinutes: 40, patternName: "Quick Revision - 20 Marks", templateId: "minimal", paperCode: "", questionCount: 12, status: "Rejected", createdBy: "Prakash V", createdDate: "22-08-2026 15:20", approver: "HOD - Mathematics", rejectReason: "The revision test was dropped from this term's calendar, so this paper is not needed." },
    { id: 106, name: "English Model Paper", gradeId: "8", grade: "VIII", subject: "English", examName: "Model Examination", examDate: "05-09-2026", academicYear: "2026-2027", totalMarks: 40, durationMinutes: 120, patternName: "Comprehension Model Paper - 40 Marks", templateId: "comprehension", paperCode: "", questionCount: 27, status: "Published", createdBy: "Sangeetha M", createdDate: "14-08-2026 13:20", approver: "Principal", rejectReason: "" },
    { id: 107, name: "Physics Model Exam", gradeId: "12", grade: "XII", subject: "Physics", examName: "Model Examination", examDate: "10-10-2026", academicYear: "2026-2027", totalMarks: 70, durationMinutes: 180, patternName: "Higher Secondary Theory - 70 Marks", templateId: "cbse", paperCode: "04", questionCount: 38, status: "Pending", createdBy: "Karthik S", createdDate: "25-08-2026 08:45", approver: "HOD - Science", rejectReason: "" },
];

/* ------------------------------------------------------------ question bank */

/* A question enters the bank when the paper it came from is approved, so the
   bank only ever holds questions a reviewer has already signed off. Entries are
   filtered by class, subject and chapter - never by exam. The exam only shows
   up as a usage hint, so a teacher can see "this was in last year's Half
   Yearly" while still browsing the whole chapter. */
export const bankEntryFromQuestion = (question, paper) => ({
    id: `bank-${paper.id}-${question.id}`,
    text: question.text,
    type: question.type,
    marks: question.marks,
    options: question.options || [],
    pairs: question.pairs || [],
    bullets: question.bullets || [],
    passage: question.passage || "",
    answerKey: question.answerKey,
    difficulty: question.difficulty,
    bloom: question.bloom,
    gradeId: paper.gradeId,
    grade: paper.grade,
    subject: paper.subject,
    chapterId: question.chapterId,
    chapterName: question.chapterName,
    usedIn: [{
        paperId: paper.id,
        paperName: paper.name,
        examName: paper.examName,
        academicYear: paper.academicYear,
        date: paper.examDate,
    }],
});

// Same question set twice is one entry with two usages, not two entries.
export const mergeIntoBank = (bank, entries) => {
    const byText = new Map(bank.map((e) => [normalizeQuestionText(e.text), e]));
    entries.forEach((entry) => {
        const key = normalizeQuestionText(entry.text);
        const existing = byText.get(key);
        if (existing) {
            const seen = new Set(existing.usedIn.map((u) => String(u.paperId)));
            entry.usedIn.forEach((u) => { if (!seen.has(String(u.paperId))) existing.usedIn.push(u); });
        } else {
            byText.set(key, { ...entry });
        }
    });
    return Array.from(byText.values());
};

export const timesUsed = (entry) => (entry?.usedIn || []).length;

// "Used in Half Yearly Examination (2026-2027)" / "Used 3 times, last in ..."
export const usageHint = (entry) => {
    const uses = entry?.usedIn || [];
    if (!uses.length) return "Not used in any paper yet";
    const last = uses[uses.length - 1];
    const where = [last.examName, last.academicYear].filter(Boolean).join(" - ");
    if (uses.length === 1) return `Used in ${where}`;
    return `Used ${uses.length} times, last in ${where}`;
};

export const BANK_USAGE_FILTERS = [
    { key: "all", label: "All questions" },
    { key: "unused", label: "Never used" },
    { key: "used", label: "Used before" },
    { key: "repeated", label: "Used more than once" },
];

export const filterBank = (bank, {
    gradeId, subject, chapterIds, type, difficulty, marks, search, usage = "all", excludeText = [],
} = {}) => {
    const skip = new Set((excludeText || []).map(normalizeQuestionText));

    return (bank || []).filter((entry) => {
        if (gradeId && String(entry.gradeId) !== String(gradeId)) return false;
        if (subject && entry.subject !== subject) return false;
        if (chapterIds?.length && !chapterIds.includes(entry.chapterId)) return false;
        if (type && type !== "all" && entry.type !== type) return false;
        if (difficulty && difficulty !== "all" && entry.difficulty !== difficulty) return false;
        if (marks && marks !== "all" && Number(entry.marks) !== Number(marks)) return false;

        const used = timesUsed(entry);
        if (usage === "unused" && used > 0) return false;
        if (usage === "used" && used === 0) return false;
        if (usage === "repeated" && used < 2) return false;

        // A question already sitting in the paper should not be offered again.
        if (skip.has(normalizeQuestionText(entry.text))) return false;

        if (search?.trim()) {
            const needle = search.trim().toLowerCase();
            const hay = `${entry.text} ${entry.chapterName} ${entry.answerKey}`.toLowerCase();
            if (!hay.includes(needle)) return false;
        }
        return true;
    });
};

/* Mock bank until qbank/getAll is live. Built the same way the real one will
   be - by harvesting the questions of papers that were approved. */
const bankSeed = () => {
    const sources = MOCK_PAPERS.filter((p) => ["Approved", "Published"].includes(p.status));
    let bank = [];

    sources.forEach((paper) => {
        const pattern = MOCK_PATTERNS.find((p) => p.name === paper.patternName) || MOCK_PATTERNS[0];
        const chapters = (MOCK_BOOK_CHAPTERS[paper.subject] || MOCK_BOOK_CHAPTERS.General)
            .map((title, i) => ({ id: `ch-${i + 1}`, title }));
        const questions = buildMockQuestions(pattern, chapters);
        bank = mergeIntoBank(bank, questions.map((q) => bankEntryFromQuestion(q, paper)));
    });

    return bank;
};

const MOCK_BOOK_CHAPTERS = {
    Mathematics: ["Relations and Functions", "Algebra", "Trigonometry", "Mensuration"],
    Science: ["Motion", "Force and Laws of Motion", "Gravitation", "Sound"],
    English: ["The Kind Elephant", "Grammar - Nouns", "Letter Writing", "A Rainy Day"],
    "Social Science": ["The Delhi Sultanate", "The Mughal Empire", "Towns and Trade"],
    Physics: ["Laws of Motion", "Thermodynamics", "Optics", "Electrostatics"],
    General: ["Chapter 1", "Chapter 2", "Chapter 3"],
};

export const MOCK_QUESTION_BANK = bankSeed();

/* ------------------------- Pattern wire conversion ------------------------ */

/* The screens carry more than the endpoint stores. What travels is exactly the
   documented body; what does not is listed in DROPPED_ON_SAVE below so the loss
   is visible rather than discovered later. */
export const PATTERN_FIELDS_NOT_STORED = [
    "exam", "readingTimeMinutes", "showPaperCode",
    "section title", "section group", "internal choice count",
    "answer lines", "difficulty mix",
];

// choice travels as a word, not our key.
const CHOICE_TO_API = { none: "All", any: "Any", internal: "Internal" };

const choiceFromApi = (raw) => {
    const value = String(raw || "").trim().toLowerCase();
    if (value.startsWith("any")) return "any";
    if (value.startsWith("internal")) return "internal";
    return "none";
};

// questionType travels as the printed label ("Choose the Best Answer").
const typeFromLabel = (label, options) => {
    const wanted = String(label || "").trim().toLowerCase();
    const hit = QUESTION_TYPES.find((t) => !t.isCustom && t.label.trim().toLowerCase() === wanted)
        || QUESTION_TYPES.find((t) => !t.isCustom && t.short.trim().toLowerCase() === wanted);

    if (hit) return { type: hit.key, customLabel: "", baseType: "long" };
    if (!wanted) return { type: "mcq", customLabel: "", baseType: "long" };

    return {
        type: "custom",
        customLabel: String(label).trim(),
        baseType: Number(options) > 0 ? "mcq" : "long",
    };
};

/* "5 x 1 = 5" - the endpoint stores the printed string rather than recomputing
   it, so it is built here from whatever the section currently says. */
export const marksShownAs = (section) => {
    const answered = Number(section.questionsToAnswer) || 0;
    const per = Number(section.marksPerQuestion) || 0;
    return `${answered} x ${per} = ${answered * per}`;
};

export const patternToApi = (pattern, { gradeSignOf, rollNumber, patternId }) => {
    const instructions = String(pattern.instructions || "")
        .split("\n").map((line) => line.trim()).filter(Boolean);

    const body = {
        patternName: (pattern.name || "").trim(),
        /* The endpoint takes ONE class; the builder lets several be ticked. The
           first is sent and the screen says so rather than silently dropping. */
        grade: gradeSignOf(pattern.gradeIds?.[0]),
        subject: pattern.subject === "Any" ? "" : pattern.subject,
        totalMarks: Number(pattern.totalMarks) || 0,
        durationMinutes: Number(pattern.durationMinutes) || 0,
        generalInstructions: instructions,
        sections: (pattern.sections || []).map((s, i) => ({
            displayOrder: i,
            questionLabel: s.label || "",
            sub: s.subLabel || null,
            questionType: s.type === "custom"
                ? ((s.customLabel || "").trim() || "Other")
                : typeMeta(s.type).label,
            choice: CHOICE_TO_API[s.choiceMode] || "All",
            marksPerQuestion: Number(s.marksPerQuestion) || 0,
            questionsPrinted: Number(s.questionsToPrint) || 0,
            toBeAnswered: Number(s.questionsToAnswer) || 0,
            options: typeMeta(effectiveTypeKey(s)).hasOptions ? Number(s.optionCount) || 0 : null,
            marksShownAs: marksShownAs(s),
            extraInstruction: s.instruction || null,
        })),
    };

    if (patternId) {
        body.patternId = patternId;
        body.updatedByRollNumber = rollNumber;
    } else {
        body.createdByRollNumber = rollNumber;
    }
    return body;
};

export const patternFromApi = (row, { gradeIdOf } = {}) => {
    if (!row) return null;
    const sections = (row.sections || row.patternSections || [])
        .slice()
        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0))
        .map((s, i) => ({
            ...newSection(i),
            id: s.sectionId ?? s.id ?? `sec-${i}`,
            label: s.questionLabel || "",
            subLabel: s.sub || "",
            ...typeFromLabel(s.questionType, s.options),
            choiceMode: choiceFromApi(s.choice),
            marksPerQuestion: Number(s.marksPerQuestion) || 0,
            questionsToPrint: Number(s.questionsPrinted) || 0,
            questionsToAnswer: Number(s.toBeAnswered) || 0,
            optionCount: Number(s.options) || 4,
            instruction: s.extraInstruction || "",
        }));

    const gradeSign = row.grade || "";
    const gradeId = gradeIdOf ? gradeIdOf(gradeSign) : "";

    return {
        id: row.patternId ?? row.id ?? null,
        name: row.patternName || row.name || "Untitled pattern",
        exam: "",
        grade: gradeSign,
        gradeIds: gradeId ? [String(gradeId)] : [],
        subject: row.subject || "Any",
        totalMarks: Number(row.totalMarks) || 0,
        durationMinutes: Number(row.durationMinutes) || 0,
        readingTimeMinutes: 0,
        showPaperCode: false,
        instructions: Array.isArray(row.generalInstructions)
            ? row.generalInstructions.join("\n")
            : String(row.generalInstructions || ""),
        sections: sections.length ? sections : [newSection(0)],
        // Shown on the list card; absent from a create/update response.
        sectionCount: Number(row.sectionCount) || sections.length,
        createdBy: row.createdByRollNumber || row.createdBy || "-",
        createdDate: row.createdOn || row.createdDate || null,
        usedCount: Number(row.usedCount) || 0,
    };
};

export const normalizePatternList = (payload, opts) => {
    const root = payload?.data ?? payload;
    const rows = Array.isArray(root) ? root : (root?.data ?? root?.patterns ?? []);
    return (Array.isArray(rows) ? rows : []).map((r) => patternFromApi(r, opts)).filter(Boolean);
};

export const PRINT_LANGUAGES = [
    { key: "en", label: "English" },
    { key: "ta", label: "தமிழ்" },
    { key: "hi", label: "हिन्दी" },
];

export const TYPE_PROMPTS = {
    mcq: { en: "Choose the best answer", ta: "சரியான விடையைத் தேர்ந்தெடுத்து எழுதுக", hi: "सही उत्तर चुनकर लिखिए" },
    fillblank: { en: "Fill in the blanks", ta: "கோடிட்ட இடங்களை நிரப்புக", hi: "रिक्त स्थानों की पूर्ति कीजिए" },
    truefalse: { en: "Write True or False", ta: "சரியா? தவறா? எனக் குறிப்பிடுக", hi: "सत्य या असत्य लिखिए" },
    match: { en: "Match the following", ta: "பொருத்துக", hi: "सुमेलित कीजिए" },
    oneword: { en: "Answer in one word", ta: "ஒரு சொல்லில் விடையளிக்கவும்", hi: "एक शब्द में उत्तर दीजिए" },
    short: { en: "Answer briefly", ta: "சுருக்கமாக விடையளிக்கவும்", hi: "संक्षेप में उत्तर दीजिए" },
    long: { en: "Answer in detail", ta: "விரிவாக விடையளிக்கவும்", hi: "विस्तार से उत्तर दीजिए" },
    assertion: { en: "Read the Assertion and Reason and choose the correct option", ta: "கூற்று மற்றும் காரணத்தைப் படித்து சரியான விடையைத் தேர்ந்தெடுக்க", hi: "अभिकथन और कारण पढ़कर सही विकल्प चुनिए" },
    casestudy: { en: "Read the passage and answer the questions", ta: "பத்தியைப் படித்து வினாக்களுக்கு விடையளிக்கவும்", hi: "गद्यांश पढ़कर प्रश्नों के उत्तर दीजिए" },
    writing: { en: "Write as directed", ta: "குறிப்புகளின் அடிப்படையில் எழுதுக", hi: "निर्देशानुसार लिखिए" },
    mapwork: { en: "Mark on the given map", ta: "தரப்பட்ட வரைபடத்தில் குறிக்கவும்", hi: "दिए गए मानचित्र पर अंकित कीजिए" },
    graph: { en: "Study the chart and answer", ta: "விளக்கப்படத்தைப் பார்த்து விடையளிக்கவும்", hi: "आलेख देखकर उत्तर दीजिए" },
    picture: { en: "Look at the picture and write", ta: "படத்தைப் பார்த்து எழுதுக", hi: "चित्र देखकर लिखिए" },
    handwriting: { en: "Copy the following neatly", ta: "கீழ்க்கண்டவற்றை அழகாக எழுதுக", hi: "निम्नलिखित को सुंदर अक्षरों में लिखिए" },
};

const CHOICE_PROMPTS = {
    en: {
        all: () => "Answer all the questions.",
        internal: (choices, print) => (choices > 0 && choices < print
            ? `Answer all questions. An internal choice is provided in ${choices} question${choices > 1 ? "s" : ""}.`
            : "Answer all questions. Each question carries an internal choice."),
        any: (answer, print) => (answer === 1
            ? "Answer any one of the following questions."
            : `Answer any ${answer} of the following ${print} questions.`),
    },
    ta: {
        all: () => "அனைத்து வினாக்களுக்கும் விடையளிக்கவும்.",
        internal: () => "அனைத்து வினாக்களுக்கும் விடையளிக்கவும். உள் தேர்வு வழங்கப்பட்டுள்ளது.",
        any: (answer, print) => (answer === 1
            ? "ஏதேனும் ஒன்றுக்கு மட்டும் விடை அளிக்கவும்."
            : `${print} வினாக்களில் ஏதேனும் ${answer} வினாக்களுக்கு விடையளிக்கவும்.`),
    },
    hi: {
        all: () => "सभी प्रश्नों के उत्तर दीजिए।",
        internal: () => "सभी प्रश्नों के उत्तर दीजिए। आंतरिक विकल्प दिया गया है।",
        any: (answer, print) => (answer === 1
            ? "किसी एक प्रश्न का उत्तर दीजिए।"
            : `निम्नलिखित ${print} प्रश्नों में से किन्हीं ${answer} प्रश्नों के उत्तर दीजिए।`),
    },
};

export const choicePrompt = (section, lang = "en") => {
    const set = CHOICE_PROMPTS[lang] || CHOICE_PROMPTS.en;
    const print = Number(section?.questionsToPrint) || 0;
    const answer = Number(section?.questionsToAnswer) || 0;
    const choices = Number(section?.internalChoiceCount) || 0;

    if (section?.choiceMode === "internal") return set.internal(choices, print);
    if (section?.choiceMode === "any" && answer < print) return set.any(answer, print);
    return set.all();
};

const SENTENCE_END = { en: ". ", ta: ". ", hi: "। " };

export const suggestedPrompt = (section, lang = "en") => {
    const key = section?.type === "custom" ? section?.baseType || "long" : section?.type;
    const typeLine = (TYPE_PROMPTS[key]?.[lang] || TYPE_PROMPTS[key]?.en || "").trim();
    const choiceLine = choicePrompt(section, lang).trim();
    if (!typeLine) return choiceLine;
    if (!choiceLine) return typeLine;
    return `${typeLine}${SENTENCE_END[lang] || ". "}${choiceLine}`;
};

export const effectiveTypeKey = (section) =>
    (section?.type === "custom" ? section?.baseType || "long" : section?.type) || "mcq";

export const sectionTypeLabel = (section) =>
    (section?.type === "custom"
        ? (section?.customLabel || "").trim() || "Other"
        : typeMeta(section?.type).label);
