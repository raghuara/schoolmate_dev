export const RADIUS = "5px";

export const BOOK_STATUSES = ["Ready", "Needs Review", "Processing", "Failed"];

export const MEDIUMS = ["English", "Tamil", "Hindi", "Malayalam", "Telugu", "Kannada", "French", "Sanskrit"];

export const BOARDS = ["State Board", "CBSE", "ICSE", "IGCSE", "Matriculation", "Other"];

export const ACCEPTED_TYPES = [".pdf", ".docx", ".doc"];

export const MAX_FILE_MB = 100;

export const PARSE_STEPS = [
    { title: "Uploading book", detail: "Sending the file securely to the server" },
    { title: "Reading pages", detail: "Extracting text page by page" },
    { title: "Detecting chapters", detail: "Finding chapter headings and page breaks" },
    { title: "Splitting content", detail: "Storing each chapter separately" },
    { title: "Indexing topics", detail: "Tagging key topics for question generation" },
];

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

const STATUS_MAP = {
    ready: "Ready",
    completed: "Ready",
    success: "Ready",
    review: "Needs Review",
    needsreview: "Needs Review",
    pending: "Needs Review",
    processing: "Processing",
    inprogress: "Processing",
    queued: "Processing",
    failed: "Failed",
    error: "Failed",
};

export const bookStatusLabel = (raw) => {
    const key = String(raw || "").trim().toLowerCase().replace(/[\s_-]/g, "");
    if (STATUS_MAP[key]) return STATUS_MAP[key];
    if (!key) return "Processing";
    return key.charAt(0).toUpperCase() + key.slice(1);
};

export const normalizeChapter = (row, index) => ({
    id: val(row, ["chapterId", "chapterID", "id"], `ch-${index + 1}`),
    number: Number(val(row, ["chapterNumber", "number", "sequence", "order"], index + 1)) || index + 1,
    title: val(row, ["chapterTitle", "title", "chapterName", "name"], `Chapter ${index + 1}`),
    startPage: Number(val(row, ["startPage", "fromPage", "pageFrom"], 0)) || 0,
    endPage: Number(val(row, ["endPage", "toPage", "pageTo"], 0)) || 0,
    wordCount: Number(val(row, ["wordCount", "words", "totalWords"], 0)) || 0,
    topics: (() => {
        const raw = val(row, ["topics", "keyTopics", "concepts"], []);
        if (Array.isArray(raw)) return raw.map((t) => String(t)).filter(Boolean);
        return String(raw || "").split(",").map((t) => t.trim()).filter(Boolean);
    })(),
    preview: val(row, ["preview", "content", "extractedText", "summary"], ""),
    confirmed: String(val(row, ["confirmed", "isConfirmed", "verified"], "N")).toUpperCase() === "Y",
});

export const normalizeBook = (row, grades) => {
    const gradeId = val(row, ["gradeId", "gradeID"], null);
    const chapters = pickArray(val(row, ["chapters", "chapterList", "bookChapters"], []) || []).map(normalizeChapter);

    return {
        id: val(row, ["bookId", "bookID", "id"], null),
        title: val(row, ["bookTitle", "title", "name", "bookName"], "Untitled book"),
        gradeId,
        grade: gradeLabel(grades, gradeId) || val(row, ["grade", "gradeSign", "className"], ""),
        subject: val(row, ["subject", "subjectName"], "General"),
        academicYear: val(row, ["academicYear", "year"], ""),
        medium: val(row, ["medium", "language"], "English"),
        board: val(row, ["board", "publisher", "syllabus"], ""),
        edition: val(row, ["edition", "editionYear"], ""),
        fileName: val(row, ["fileName", "originalFileName", "documentName"], ""),
        fileUrl: val(row, ["fileUrl", "documentUrl", "url", "filePath"], ""),
        fileSizeMB: Math.round((Number(val(row, ["fileSize", "fileSizeMB", "size"], 0)) || 0) * 10) / 10,
        pages: Number(val(row, ["totalPages", "pages", "pageCount"], 0)) || 0,
        chapterCount: Number(val(row, ["chapterCount", "totalChapters"], chapters.length)) || chapters.length,
        chapters,
        status: bookStatusLabel(val(row, ["status", "parseStatus", "bookStatus"], "")),
        uploadedBy: val(row, ["uploadedByName", "createdByName", "uploadedBy", "createdBy"], "-"),
        uploadedDate: val(row, ["uploadedOn", "createdOn", "postedDateAndTime", "createdDate"], null),
        usedInPapers: Number(val(row, ["usedInPapers", "paperCount"], 0)) || 0,
    };
};

export const normalizeBookList = (payload, grades) =>
    pickArray(payload?.data ?? payload).map((row) => normalizeBook(row, grades));

export const chapterPageCount = (chapter) => {
    if (!chapter?.startPage || !chapter?.endPage) return 0;
    return Math.max(0, chapter.endPage - chapter.startPage + 1);
};

export const bookReady = (book) => book?.status === "Ready" && (book?.chapters || []).length > 0;

/* Mock library used until book/getAll is live. Same shape normalizeBook returns,
   so swapping in the API is a one-line change in BooksLibraryPage. */
const mockChapters = (titles, startAt = 1) => {
    let page = startAt;
    return titles.map((title, i) => {
        const span = 8 + ((i * 5) % 11);
        const chapter = {
            id: `ch-${i + 1}`,
            number: i + 1,
            title,
            startPage: page,
            endPage: page + span,
            wordCount: 1200 + ((i * 337) % 2600),
            topics: [],
            preview: `${title} introduces the core ideas of the lesson, followed by worked examples, an exercise set and a short summary for revision.`,
            confirmed: true,
        };
        page += span + 1;
        return chapter;
    });
};

export const MOCK_BOOKS = [
    {
        id: 1,
        title: "Mathematics - Term I",
        gradeId: "10",
        grade: "X",
        subject: "Mathematics",
        academicYear: "2026-2027",
        medium: "English",
        board: "State Board",
        edition: "2026",
        fileName: "maths-x-term1.pdf",
        fileUrl: "",
        fileSizeMB: 18.4,
        pages: 214,
        chapterCount: 8,
        chapters: mockChapters([
            "Relations and Functions",
            "Numbers and Sequences",
            "Algebra",
            "Geometry",
            "Coordinate Geometry",
            "Trigonometry",
            "Mensuration",
            "Statistics and Probability",
        ]),
        status: "Ready",
        uploadedBy: "Anitha R",
        uploadedDate: "12-06-2026 10:24",
        usedInPapers: 4,
    },
    {
        id: 2,
        title: "Science - Physics Section",
        gradeId: "9",
        grade: "IX",
        subject: "Science",
        academicYear: "2026-2027",
        medium: "English",
        board: "CBSE",
        edition: "2025",
        fileName: "science-ix.pdf",
        fileUrl: "",
        fileSizeMB: 24.1,
        pages: 186,
        chapterCount: 6,
        chapters: mockChapters([
            "Motion",
            "Force and Laws of Motion",
            "Gravitation",
            "Work and Energy",
            "Sound",
            "Matter in Our Surroundings",
        ]),
        status: "Ready",
        uploadedBy: "Karthik S",
        uploadedDate: "04-06-2026 15:02",
        usedInPapers: 2,
    },
    {
        id: 3,
        title: "Tamil Ilakkiyam",
        gradeId: "8",
        grade: "VIII",
        subject: "Tamil",
        academicYear: "2026-2027",
        medium: "Tamil",
        board: "State Board",
        edition: "2026",
        fileName: "tamil-viii.pdf",
        fileUrl: "",
        fileSizeMB: 12.7,
        pages: 148,
        chapterCount: 5,
        chapters: mockChapters([
            "Iyal 1 - Kavithai Pezhai",
            "Iyal 2 - Urai Nadai",
            "Iyal 3 - Ilakkanam",
            "Iyal 4 - Thunai Paadam",
            "Iyal 5 - Mozhi Thiran",
        ]),
        status: "Needs Review",
        uploadedBy: "Meena D",
        uploadedDate: "28-05-2026 09:40",
        usedInPapers: 0,
    },
    {
        id: 4,
        title: "Environmental Studies",
        gradeId: "3",
        grade: "III",
        subject: "EVS",
        academicYear: "2026-2027",
        medium: "English",
        board: "Matriculation",
        edition: "2026",
        fileName: "evs-iii.pdf",
        fileUrl: "",
        fileSizeMB: 8.2,
        pages: 96,
        chapterCount: 4,
        chapters: mockChapters(["My Family", "Plants Around Us", "Water and Air", "Our Neighbourhood"]),
        status: "Processing",
        uploadedBy: "Divya P",
        uploadedDate: "22-08-2026 11:15",
        usedInPapers: 0,
    },
    {
        id: 5,
        title: "Social Science - History",
        gradeId: "7",
        grade: "VII",
        subject: "Social Science",
        academicYear: "2026-2027",
        medium: "English",
        board: "State Board",
        edition: "2025",
        fileName: "social-vii.pdf",
        fileUrl: "",
        fileSizeMB: 16.9,
        pages: 172,
        chapterCount: 6,
        chapters: mockChapters([
            "Sources of Medieval India",
            "Emergence of New Kingdoms",
            "The Delhi Sultanate",
            "The Mughal Empire",
            "Towns and Trade",
            "Devotional Paths",
        ]),
        status: "Ready",
        uploadedBy: "Ravi Kumar",
        uploadedDate: "18-06-2026 14:30",
        usedInPapers: 1,
    },
    {
        id: 6,
        title: "English Reader",
        gradeId: "5",
        grade: "V",
        subject: "English",
        academicYear: "2026-2027",
        medium: "English",
        board: "CBSE",
        edition: "2026",
        fileName: "english-v.docx",
        fileUrl: "",
        fileSizeMB: 5.4,
        pages: 118,
        chapterCount: 5,
        chapters: mockChapters(["The Kind Elephant", "A Rainy Day", "Grammar - Nouns", "The Lost Kite", "Letter Writing"]),
        status: "Failed",
        uploadedBy: "Sangeetha M",
        uploadedDate: "09-08-2026 16:48",
        usedInPapers: 0,
    },
];

/* ---------------------------------------------------------------- the file */

export const isPdf = (book) =>
    String(book?.fileName || book?.fileUrl || "").toLowerCase().endsWith(".pdf");

// A tidy name for the saved copy: "X - Mathematics - Term I.pdf".
export const downloadName = (book) => {
    const ext = String(book?.fileName || "").split(".").pop() || "pdf";
    const stem = [book?.grade, book?.subject, book?.title]
        .filter(Boolean)
        .join(" - ")
        .replace(/[\\/:*?"<>|]/g, "");
    return `${stem || "book"}.${ext}`;
};

/* Opens the book at a given page. The #page fragment is understood by every
   built-in PDF viewer, so picking a chapter can jump straight to it. */
export const bookPageUrl = (book, page) => {
    if (!book?.fileUrl) return "";
    const target = Number(page) > 0 ? `#page=${Number(page)}&view=FitH` : "";
    return `${book.fileUrl}${target}`;
};

/* Saves the book. A cross-origin file ignores the download attribute and opens
   in a new tab instead - still the file, just in the browser's viewer. */
export const downloadBook = (book) => {
    if (!book?.fileUrl) return false;
    const link = document.createElement("a");
    link.href = book.fileUrl;
    link.download = downloadName(book);
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
};
