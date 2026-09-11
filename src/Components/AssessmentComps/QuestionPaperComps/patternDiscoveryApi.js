import { DASH } from "../../DashBoardComps/dashboardTheme";
import { val, pickArray, parseApiDate, fmtDate } from "./questionPaperApi";

export { val, pickArray, parseApiDate, fmtDate };

/* The whole pipeline runs on a background tick, so nothing here is instant.
   Fifteen seconds matches the book screens and is slow enough that a long batch
   does not hammer the API for an hour. */
export const POLL_MS = 15000;

export const MAX_ZIP_MB = 200;

/* The batch's own lifecycle. "hint" is what the screen says while it sits here -
   written for a teacher, not for the person who wrote the pipeline. */
export const BATCH_STAGES = [
    {
        key: "Uploaded",
        label: "Uploaded",
        hint: "The file is stored and waiting for its turn.",
        tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line },
    },
    {
        key: "ExtractingZip",
        label: "Opening the ZIP",
        hint: "Reading the folders inside and picking out the question papers.",
        tone: { color: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE" },
    },
    {
        key: "ProcessingDocuments",
        label: "Reading the papers",
        hint: "Each paper is read, its class and subject identified, and its questions pulled out.",
        tone: { color: DASH.primary, bg: DASH.primaryLight, border: DASH.primaryBorder },
    },
    {
        key: "DiscoveringPatterns",
        label: "Finding the patterns",
        hint: "Grouping questions that ask for the same thing across all the papers.",
        tone: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" },
    },
    {
        key: "LabelingPatterns",
        label: "Naming the patterns",
        hint: "Giving each group a name and a description.",
        tone: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" },
    },
    {
        key: "ReadyForReview",
        label: "Ready for review",
        hint: "The patterns are found. Open the review queue and decide on them.",
        tone: { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0" },
    },
    {
        key: "Completed",
        label: "Completed",
        hint: "Everything in this batch has been reviewed.",
        tone: { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0" },
    },
    {
        key: "Failed",
        label: "Failed",
        hint: "The batch could not be processed. The reason is shown below.",
        tone: { color: DASH.red, bg: DASH.redLight, border: "#FECACA" },
    },
];

const BATCH_BY_KEY = BATCH_STAGES.reduce((map, s) => ({ ...map, [s.key]: s }), {});

export const batchStage = (status) => BATCH_BY_KEY[status] || {
    key: status || "Unknown",
    label: status || "Unknown",
    hint: "",
    tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line },
};

/* The five steps drawn on the progress panel. Completed is not a step of its
   own - it reads as the same finish line as ReadyForReview - and Failed is
   drawn separately, so neither belongs in the track. */
export const BATCH_TRACK = ["ExtractingZip", "ProcessingDocuments", "DiscoveringPatterns", "LabelingPatterns", "ReadyForReview"];

export const batchTrackIndex = (status) => {
    if (status === "Uploaded") return 0;
    if (status === "Completed") return BATCH_TRACK.length;
    const at = BATCH_TRACK.indexOf(status);
    return at === -1 ? 0 : at;
};

export const BATCH_DONE = ["ReadyForReview", "Completed", "Failed"];

export const isBatchBusy = (status) => Boolean(status) && !BATCH_DONE.includes(status);

/* Per-document outcome. needsAdmin marks the two dead ends a person has to
   clear before the pipeline can move that file on. */
export const DOCUMENT_STATES = {
    Pending: { label: "Waiting", tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line }, busy: true },
    Identifying: { label: "Identifying", tone: { color: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE" }, busy: true },
    ExtractingQuestions: { label: "Reading questions", tone: { color: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE" }, busy: true },
    AnalyzingTasks: { label: "Analysing", tone: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" }, busy: true },
    GeneratingEmbeddings: { label: "Indexing", tone: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" }, busy: true },
    Ready: { label: "Ready", tone: { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0" } },
    Failed: {
        label: "Failed",
        tone: { color: DASH.red, bg: DASH.redLight, border: "#FECACA" },
        needsAdmin: true,
        advice: "Retry it. If it keeps failing, the file is probably not readable.",
    },
    NotAQuestionPaper: {
        label: "Not a question paper",
        tone: { color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder },
        needsAdmin: true,
        advice: "The file did not look like a question paper. Retry it if that reading is wrong.",
    },
    NeedsManualIdentification: {
        label: "Needs class and subject",
        tone: { color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder },
        needsAdmin: true,
        advice: "Type in the class and subject and it carries on from there - the file is not read again.",
    },
    Skipped: {
        label: "Skipped",
        tone: { color: DASH.faint, bg: DASH.lineSoft, border: DASH.line },
        advice: "This file type is not supported, so it was left out of the batch.",
    },
};

export const documentState = (status) => DOCUMENT_STATES[status] || {
    label: status || "Unknown",
    tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line },
};

export const documentNeedsAdmin = (status) => Boolean(documentState(status).needsAdmin);

/* A retry is offered for the three dead ends and, separately, for a Ready
   document whose indexing partly failed. */
export const RETRYABLE = ["Failed", "NotAQuestionPaper", "NeedsManualIdentification", "Ready"];

/* Nothing here is canonical until a person says so. Candidate means the AI has
   seen it but not enough times to be worth anyone's attention yet. */
export const DISCOVERED_STATES = {
    Candidate: {
        label: "Candidate",
        blurb: "Seen too few times to be called a pattern yet.",
        tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line },
    },
    NeedsReview: {
        label: "Needs review",
        blurb: "Found often enough to matter. Waiting for your decision.",
        tone: { color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder },
    },
    Confirmed: {
        label: "Confirmed",
        blurb: "Accepted as a real question type.",
        tone: { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0" },
    },
    Rejected: {
        label: "Rejected",
        blurb: "Set aside. The evidence is kept but it is not used.",
        tone: { color: DASH.red, bg: DASH.redLight, border: "#FECACA" },
    },
    Merged: {
        label: "Merged",
        blurb: "Folded into another pattern.",
        tone: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" },
    },
};

export const discoveredState = (status) => DISCOVERED_STATES[status] || {
    label: status || "Unknown",
    blurb: "",
    tone: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line },
};

export const DISCOVERED_FILTERS = ["NeedsReview", "Confirmed", "Candidate", "Rejected", "Merged"];

export const normalizeBatch = (row = {}) => ({
    id: val(row, ["batchId", "BatchId", "batchID"]),
    fileName: val(row, ["zipFileName", "ZipFileName", "fileName"], "") || "",
    status: val(row, ["status", "Status"], "") || "",
    failureReason: val(row, ["failureReason", "FailureReason"], "") || "",
    totalDocuments: Number(val(row, ["totalDocuments", "TotalDocuments"], 0)) || 0,
    processedDocuments: Number(val(row, ["processedDocuments", "ProcessedDocuments"], 0)) || 0,
    failedDocuments: Number(val(row, ["failedDocuments", "FailedDocuments"], 0)) || 0,
    uploadedBy: val(row, ["uploadedByRollNumber", "UploadedByRollNumber"], "") || "",
    uploadedOn: val(row, ["uploadedOn", "UploadedOn"], null),
    startedOn: val(row, ["processingStartedOn", "ProcessingStartedOn"], null),
    completedOn: val(row, ["processingCompletedOn", "ProcessingCompletedOn"], null),
});

export const normalizeBatchList = (payload) => pickArray(payload).map(normalizeBatch);

export const normalizeDocument = (row = {}) => ({
    id: val(row, ["documentId", "DocumentId", "documentID"]),
    fileName: val(row, ["originalFileName", "OriginalFileName", "fileName"], "") || "",
    fileType: val(row, ["fileType", "FileType"], "") || "",
    status: val(row, ["status", "Status"], "") || "",
    failureReason: val(row, ["failureReason", "FailureReason"], "") || "",
    detectedGrade: val(row, ["detectedGrade", "DetectedGrade"], "") || "",
    detectedSubject: val(row, ["detectedSubject", "DetectedSubject"], "") || "",
    detectedBoard: val(row, ["detectedBoard", "DetectedBoard"], "") || "",
    detectedExamType: val(row, ["detectedExamType", "DetectedExamType"], "") || "",
    detectedMedium: val(row, ["detectedMedium", "DetectedMedium"], "") || "",
    confidence: Number(val(row, ["identificationConfidence", "IdentificationConfidence"], 0)) || 0,
    grade: val(row, ["grade", "Grade"], "") || "",
    subject: val(row, ["subject", "Subject"], "") || "",
    board: val(row, ["board", "Board"], "") || "",
    examType: val(row, ["examType", "ExamType"], "") || "",
    medium: val(row, ["medium", "Medium"], "") || "",
    totalPages: Number(val(row, ["totalPages", "TotalPages"], 0)) || 0,
    questionCount: Number(val(row, ["questionCount", "QuestionCount"], 0)) || 0,
});

export const normalizeDocumentList = (payload) => {
    const rows = payload?.documents || payload?.Documents || pickArray(payload);
    return (Array.isArray(rows) ? rows : []).map(normalizeDocument);
};

export const normalizeDocumentQuestion = (row = {}) => ({
    id: val(row, ["questionId", "QuestionId"]),
    number: val(row, ["questionNumber", "QuestionNumber"], "") || "",
    text: val(row, ["questionText", "QuestionText"], "") || "",
    page: Number(val(row, ["pageNumber", "PageNumber"], 0)) || 0,
    sectionLabel: val(row, ["sectionLabel", "SectionLabel"], "") || "",
    marks: Number(val(row, ["marks", "Marks"], 0)) || 0,
    hasVisual: Boolean(val(row, ["hasVisualAsset", "HasVisualAsset"], false)),
    visualDescription: val(row, ["visualAssetDescription", "VisualAssetDescription"], "") || "",
    taskStatus: val(row, ["taskAbstractionStatus", "TaskAbstractionStatus"], "") || "",
    taskDescription: val(row, ["taskDescription", "TaskDescription"], "") || "",
    primaryAction: val(row, ["primaryAction", "PrimaryAction"], "") || "",
    embeddingStatus: val(row, ["embeddingStatus", "EmbeddingStatus"], "") || "",
});

export const normalizeDocumentQuestions = (payload) => {
    const rows = payload?.questions || payload?.Questions || [];
    return (Array.isArray(rows) ? rows : []).map(normalizeDocumentQuestion);
};

export const normalizeDiscovered = (row = {}) => ({
    id: val(row, ["patternId", "PatternId", "patternID"]),
    name: val(row, ["patternName", "PatternName"], "") || "",
    description: val(row, ["description", "Description"], "") || "",
    capability: val(row, ["inferredCapability", "InferredCapability"], "") || "",
    grade: val(row, ["grade", "Grade"], "") || "",
    subject: val(row, ["subject", "Subject"], "") || "",
    board: val(row, ["board", "Board"], "") || "",
    status: val(row, ["status", "Status"], "") || "",
    questionCount: Number(val(row, ["questionCount", "QuestionCount"], 0)) || 0,
    documentCount: Number(val(row, ["documentCount", "DocumentCount"], 0)) || 0,
    cohesion: Number(val(row, ["clusterCohesion", "ClusterCohesion"], 0)) || 0,
    createdOn: val(row, ["createdOn", "CreatedOn"], null),
});

export const normalizeDiscoveredList = (payload) => pickArray(payload).map(normalizeDiscovered);

export const normalizeEvidence = (payload = {}) => ({
    id: val(payload, ["patternId", "PatternId"]),
    name: val(payload, ["patternName", "PatternName"], "") || "",
    description: val(payload, ["description", "Description"], "") || "",
    status: val(payload, ["status", "Status"], "") || "",
    clusterIds: (payload.clusterIds || payload.ClusterIds || []).map((x) => x),
    items: (payload.evidence || payload.Evidence || []).map((row) => ({
        questionId: val(row, ["questionId", "QuestionId"]),
        number: val(row, ["questionNumber", "QuestionNumber"], "") || "",
        text: val(row, ["questionText", "QuestionText"], "") || "",
        taskDescription: val(row, ["taskDescription", "TaskDescription"], "") || "",
        documentId: val(row, ["documentId", "DocumentId"]),
        documentName: val(row, ["documentFileName", "DocumentFileName"], "") || "",
        batchId: val(row, ["batchId", "BatchId"]),
        batchName: val(row, ["zipFileName", "ZipFileName"], "") || "",
        similarity: Number(val(row, ["similarityToCentroid", "SimilarityToCentroid"], 0)) || 0,
    })),
});

export const batchProgress = (batch) => {
    const total = Number(batch?.totalDocuments) || 0;
    if (!total) return 0;
    return Math.min(100, Math.round(((Number(batch.processedDocuments) || 0) / total) * 100));
};

export const elapsedLabel = (from, to) => {
    const start = parseApiDate(from);
    if (!start) return "";
    const end = parseApiDate(to) || new Date();
    const secs = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${String(secs % 60).padStart(2, "0")}s`;
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
};

export const isZipFile = (file) => {
    if (!file) return false;
    return /\.zip$/i.test(file.name || "");
};

export const fileSizeLabel = (bytes) => {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
