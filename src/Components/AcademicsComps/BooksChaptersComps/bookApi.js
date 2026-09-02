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

/* This API answers a rejected request with HTTP 200 and { error: true, message }
   in the body, so a 2xx is not on its own a success. Returns the message when
   the call failed, an empty string when it went through. */
export const apiFailed = (payload) => {
    const root = payload?.data ?? payload;
    if (!root || typeof root !== "object") return "";
    const rejected =
        root.error === true ||
        String(root.error).toLowerCase() === "true" ||
        root.success === false ||
        String(root.success).toLowerCase() === "false";
    if (!rejected) return "";
    return String(root.message || root.error || "The request was rejected").trim();
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

/* The API's four states are Processing | NeedsReview | Confirmed | Failed.
   "Confirmed" is what the screens call "Ready" - the split has been reviewed and
   the book can be used to generate a paper. */
const STATUS_MAP = {
    confirmed: "Ready",
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

/* startPage/endPage are real PDF page indices - they drive the viewer and are
   what confirmChapters expects back. printedStartPage/printedEndPage are the
   book's own printed numbers and are display-only; they can be null when there
   was no reliable table of contents to read them from. */
export const normalizeChapter = (row, index, bookStatus = "") => ({
    id: val(row, ["chapterId", "chapterID", "id"], `ch-${index + 1}`),
    // Nothing on the wire carries a chapter number - the order is the number.
    number: Number(val(row, ["chapterNumber", "number", "sequence"], 0))
        || Number(val(row, ["displayOrder"], -1)) + 1
        || index + 1,
    displayOrder: Number(val(row, ["displayOrder"], index)) || index,
    title: val(row, ["chapterName", "chapterTitle", "title", "name"], `Chapter ${index + 1}`),
    startPage: Number(val(row, ["startPage", "fromPage", "pageFrom"], 0)) || 0,
    endPage: Number(val(row, ["endPage", "toPage", "pageTo"], 0)) || 0,
    printedStartPage: Number(val(row, ["printedStartPage"], 0)) || null,
    printedEndPage: Number(val(row, ["printedEndPage"], 0)) || null,
    pageCount: Number(val(row, ["pageCount"], 0)) || 0,
    wordCount: Number(val(row, ["wordCount", "words", "totalWords"], 0)) || 0,
    topics: (() => {
        const raw = val(row, ["topics", "keyTopics", "concepts"], []);
        if (Array.isArray(raw)) return raw.map((t) => String(t)).filter(Boolean);
        return String(raw || "").split(",").map((t) => t.trim()).filter(Boolean);
    })(),
    // A short AI-written overview of the lesson, not raw OCR text.
    preview: val(row, ["extractedPreview", "preview", "summary", "content", "extractedText"], ""),
    /* Confirmation is a book-level state on the wire. A chapter in a confirmed
       book is confirmed; in one still under review, none of them are. */
    confirmed: row?.confirmed !== undefined || row?.isConfirmed !== undefined
        ? String(val(row, ["confirmed", "isConfirmed", "verified"], "N")).toUpperCase() === "Y"
        : bookStatusLabel(bookStatus) === "Ready",
});

export const normalizeBook = (row, grades) => {
    const gradeId = val(row, ["gradeId", "gradeID"], null);
    const status = bookStatusLabel(val(row, ["status", "parseStatus", "bookStatus"], ""));
    const chapters = pickArray(val(row, ["chapters", "chapterList", "bookChapters"], []) || [])
        .map((c, i) => normalizeChapter(c, i, status));

    /* The list sends bytes, the detail screen may send MB. Read whichever
       arrived rather than guessing a unit. */
    const bytes = Number(val(row, ["fileSizeBytes"], 0)) || 0;
    const fileSizeMB = bytes
        ? Math.round((bytes / (1024 * 1024)) * 10) / 10
        : Math.round((Number(val(row, ["fileSizeMB", "fileSize", "size"], 0)) || 0) * 10) / 10;

    return {
        id: val(row, ["bookId", "bookID", "id"], null),
        title: val(row, ["bookTitle", "title", "name", "bookName"], "Untitled book"),
        gradeId,
        // The API answers with the class sign ("VIII"), not an id.
        grade: val(row, ["grade", "gradeSign", "className"], "") || gradeLabel(grades, gradeId),
        subject: val(row, ["subject", "subjectName"], "General"),
        academicYear: val(row, ["academicYear", "year"], ""),
        medium: val(row, ["medium", "language"], "English"),
        board: val(row, ["boardOrPublisher", "board", "publisher", "syllabus"], ""),
        edition: val(row, ["editionYear", "edition"], ""),
        fileName: val(row, ["fileName", "originalFileName", "documentName"], ""),
        fileType: val(row, ["fileType"], ""),
        fileUrl: val(row, ["filePath", "fileUrl", "documentUrl", "url"], ""),
        fileSizeMB,
        pages: Number(val(row, ["totalPages", "pages", "pageCount"], 0)) || 0,
        totalWords: Number(val(row, ["totalWords"], 0)) || 0,
        chapterCount: Number(val(row, ["chapterCount", "totalChapters"], chapters.length)) || chapters.length,
        chapters,
        status,
        failureReason: val(row, ["failureReason", "errorMessage", "error"], ""),
        // Kept even after an admin corrects the metadata, as an audit trail.
        detectedGrade: val(row, ["detectedGrade"], ""),
        detectedSubject: val(row, ["detectedSubject"], ""),
        detectionMethod: val(row, ["detectionMethod"], ""),
        uploadedBy: val(row, ["uploadedByName", "createdByName", "uploadedBy", "uploadedByRollNumber", "createdBy"], "-"),
        uploadedDate: val(row, ["uploadedOn", "createdOn", "postedDateAndTime", "createdDate"], null),
        usedInPapers: Number(val(row, ["usedInPapers", "paperCount"], 0)) || 0,
    };
};

export const normalizeBookList = (payload, grades) =>
    pickArray(payload?.data ?? payload).map((row) => normalizeBook(row, grades));

/* listBooks returns the badge counts alongside the rows, so the library never
   has to add them up from a page of results. */
export const normalizeBookCounts = (payload) => {
    const root = unwrap(payload);
    const num = (keys) => Number(val(root, keys, 0)) || 0;
    return {
        total: num(["totalCount"]),
        needsReview: num(["needsReviewCount"]),
        confirmed: num(["confirmedCount"]),
        failed: num(["failedCount"]),
        needsAttention: num(["needsAttentionCount"]),
        chaptersIndexed: num(["totalChaptersIndexed"]),
    };
};

/* Everything the upload screen needs while a book is being read. There is no
   ETA - only whether the worker has picked it up, how many are ahead of it, and
   how long it has been going. */
export const normalizeProcessing = (payload) => {
    const root = unwrap(payload);
    const active = val(root, ["isActivelyProcessing"], null);
    return {
        isActivelyProcessing: String(active).toLowerCase() === "true" || active === true,
        queuePosition: Number(val(root, ["queuePosition"], 0)) || 0,
        elapsedSeconds: Number(val(root, ["elapsedSeconds"], 0)) || 0,
        startedOn: val(root, ["processingStartedOn"], null),
        pollSeconds: Number(val(root, ["recommendedPollIntervalSeconds"], 0)) || 15,
    };
};

/* The upload response and the status response carry the same book fields, so
   both go through normalizeBook and pick up the processing block. */
export const normalizeBookResponse = (payload, grades) => {
    const root = unwrap(payload);
    return { ...normalizeBook(root, grades), processing: normalizeProcessing(payload) };
};

/* confirmChapters is validated all-or-nothing: one bad range and nothing at all
   is saved. The server answers with a page number ("overlap around page 214"),
   which does not say which chapters disagree - so the same rule is checked here
   first, where both titles are known and the offending rows can be pointed at.
   Returns { ids, message } for the first problem found, or null. */
export const findChapterRangeIssue = (chapters = [], maxPage = 0) => {
    const num = (value) => Number(value) || 0;
    const brief = (chapter) => ({
        id: chapter.id,
        title: chapter.title,
        startPage: num(chapter.startPage),
        endPage: num(chapter.endPage),
    });

    for (const chapter of chapters) {
        const start = num(chapter.startPage);
        const end = num(chapter.endPage);
        if (start <= 0 || end <= 0) {
            return {
                kind: "missing",
                ids: [chapter.id],
                items: [brief(chapter)],
                title: "A chapter has no page range",
                message: `"${chapter.title}" is missing a start or end page.`,
                hint: "Every chapter needs the page it starts on and the page it ends on.",
            };
        }
        if (end < start) {
            return {
                kind: "reversed",
                ids: [chapter.id],
                items: [brief(chapter)],
                title: "A chapter ends before it starts",
                message: `"${chapter.title}" runs from page ${start} to page ${end}.`,
                hint: "The end page has to be the same as, or after, the start page.",
            };
        }
        if (maxPage > 0 && end > maxPage) {
            return {
                kind: "beyond",
                ids: [chapter.id],
                items: [brief(chapter)],
                title: "A chapter runs past the end of the book",
                message: `"${chapter.title}" ends on page ${end}, but the book has ${maxPage} pages.`,
                hint: `No chapter can end after page ${maxPage}.`,
            };
        }
    }

    // Sorted by start page, any chapter beginning on or before the previous one
    // ended is an overlap, whatever order the list happens to be in.
    const ordered = [...chapters].sort((a, b) => num(a.startPage) - num(b.startPage));
    for (let i = 1; i < ordered.length; i += 1) {
        const prev = ordered[i - 1];
        const current = ordered[i];
        if (num(current.startPage) <= num(prev.endPage)) {
            const page = num(current.startPage);
            return {
                kind: "overlap",
                ids: [prev.id, current.id],
                items: [brief(prev), brief(current)],
                page,
                title: "Two chapters claim the same page",
                message: `"${prev.title}" and "${current.title}" both include page ${page}.`,
                hint: "A page can only belong to one chapter. Move one range so they do not meet.",
            };
        }
    }

    return null;
};

/* What confirmChapters expects: the full edited list, page ranges as real PDF
   indices, chapterId null for a chapter the admin added by hand, and the ones
   removed sent back flagged rather than dropped. */
export const confirmChaptersPayload = (bookId, chapters, removed, rollNumber) => ({
    bookId,
    confirmedByRollNumber: rollNumber,
    chapters: [
        ...chapters.map((chapter, index) => ({
            chapterId: typeof chapter.id === "number" ? chapter.id : null,
            chapterName: chapter.title,
            startPage: Number(chapter.startPage) || 0,
            endPage: Number(chapter.endPage) || 0,
            displayOrder: index,
            isDeleted: false,
        })),
        ...(removed || [])
            .filter((chapter) => typeof chapter.id === "number")
            .map((chapter, index) => ({
                chapterId: chapter.id,
                chapterName: chapter.title,
                startPage: Number(chapter.startPage) || 0,
                endPage: Number(chapter.endPage) || 0,
                displayOrder: chapters.length + index,
                isDeleted: true,
            })),
    ],
});

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
