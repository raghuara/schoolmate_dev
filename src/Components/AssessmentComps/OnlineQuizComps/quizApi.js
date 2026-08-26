// Shared readers for the qtest endpoints. The quiz APIs have no saved sample
// responses, so every field is looked up through a list of likely key names and
// the whole payload is walked to find the row array. Once the real shapes are
// confirmed these can be tightened to the exact keys.

export const val = (row, keys, fallback = null) => {
    for (const key of keys) {
        const found = row?.[key];
        if (found !== undefined && found !== null && found !== "") return found;
    }
    return fallback;
};

// Returns the first array of objects found anywhere in the response.
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

// Unwraps { error, message, data: {...} } style envelopes.
export const unwrap = (root) => {
    if (!root || typeof root !== "object") return {};
    if (Array.isArray(root)) return root[0] || {};
    return root.data || root.result || root;
};

// "15-08-2026 18:10" and ISO strings both land here.
export const parseApiDate = (value) => {
    if (!value) return null;
    const text = String(value).trim();
    const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}))?/);
    if (dmy) {
        return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +(dmy[4] || 0), +(dmy[5] || 0));
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const fmtDate = (value) => {
    const date = parseApiDate(value);
    return date
        ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
};

// "00:30" -> 30 minutes, "01:15" -> 75.
export const timingToMinutes = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    const text = String(value).trim();
    const hhmm = text.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) return Number(hhmm[1]) * 60 + Number(hhmm[2]);
    const num = Number(text);
    return Number.isFinite(num) ? num : 0;
};

// Two different lifecycles arrive in the same field: the approval stage
// (requested / accepted / rejected) and the publish stage (post / schedule).
const STATUS_MAP = {
    requested: "Pending",
    request: "Pending",
    pending: "Pending",
    accepted: "Approved",
    accept: "Approved",
    approved: "Approved",
    rejected: "Rejected",
    reject: "Rejected",
    declined: "Rejected",
    post: "Published",
    posted: "Published",
    publish: "Published",
    published: "Published",
    live: "Published",
    schedule: "Scheduled",
    scheduled: "Scheduled",
    complete: "Completed",
    completed: "Completed",
    closed: "Completed",
};

// Lifecycle order: waiting -> cleared -> queued -> live -> finished, with the
// dead end last. Tabs and filters follow this so the list reads left to right.
export const QUIZ_STATUSES = ["Pending", "Approved", "Scheduled", "Published", "Completed", "Rejected"];

export const statusLabel = (raw) => {
    const key = String(raw || "").trim().toLowerCase();
    if (STATUS_MAP[key]) return STATUS_MAP[key];
    if (!key) return "Pending";
    return key.charAt(0).toUpperCase() + key.slice(1);
};

export const gradeLabel = (grades, gradeId) => {
    const match = (grades || []).find((g) => String(g.id) === String(gradeId));
    return match?.sign || (gradeId ? `Grade ${gradeId}` : "");
};

const toSectionList = (value) => {
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
    return String(value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
};

// Every gradeId + sections pair a quiz was assigned to. Handles both the nested
// gradeSections array and a flat gradeId / grade / sections on the row itself.
export const readGradeSections = (row, grades) => {
    const raw =
        val(row, ["gradeSections", "quzeGradeSections", "gradeSection", "assignedGradeSections"], null) || [];

    if (Array.isArray(raw) && raw.length) {
        const nested = raw
            .filter((entry) => entry && typeof entry === "object")
            .map((entry) => {
                const gradeId = val(entry, ["gradeId", "gradeID", "id"], null);
                return {
                    gradeId,
                    grade: gradeLabel(grades, gradeId) ||
                        val(entry, ["grade", "gradeName", "gradeSign"], ""),
                    sections: toSectionList(val(entry, ["sections", "Sections", "sectionNames"], [])),
                };
            })
            .filter((entry) => entry.gradeId !== null);
        if (nested.length) return nested;
    }

    const gradeId = val(row, ["gradeId", "gradeID"], null);
    const gradeName = val(row, ["grade", "gradeName", "gradeSign", "className"], "");
    if (gradeId === null && !gradeName) return [];

    const known = (grades || []).find((g) => String(g.id) === String(gradeId));
    return [{
        gradeId,
        grade: known?.sign || gradeName || (gradeId ? `Grade ${gradeId}` : ""),
        sections: toSectionList(val(row, ["sections", "section", "sectionNames"], null)),
    }];
};

// One quiz row, in the shape the cards / table / analysis header all read.
export const normalizeQuiz = (row, grades) => {
    const gradeSections = readGradeSections(row, grades);
    const first = gradeSections[0] || {};
    const attempts = Number(val(row, ["attemptedCount", "attempted", "attempts", "totalAttempted"], 0)) || 0;
    const totalStudents =
        Number(val(row, ["totalStudents", "assignedStudents", "totalAssigned", "assignedCount", "studentsCount"], 0)) || 0;
    const rawScore = val(row, ["averageScore", "avgScore", "average"], null);
    const subject = val(row, ["subject", "subjectName"], "");

    return {
        id: val(row, ["quzeId", "quizId", "quzeID", "id"], null),
        name: val(row, ["title", "quizName", "quzeName", "name", "headLine"], "") || `${subject || "Quiz"}`,
        subject: subject || "General",
        gradeId: val(row, ["gradeId", "gradeID"], first.gradeId ?? null),
        grade: first.grade || gradeLabel(grades, val(row, ["gradeId", "gradeID"], null)),
        gradeSections,
        sections: (first.sections || []).join(", "),
        questions: Number(val(row, ["totalNumberOfQuestions", "totalQuestions", "questions", "questionCount"], 0)) || 0,
        duration: timingToMinutes(val(row, ["timing", "duration", "durationMinutes"], 0)),
        // How many app exits a student was allowed before auto-submit.
        warningCount: Number(val(row, ["warningCount"], 0)) || 0,
        attendanceMode: String(val(row, ["attendanceMode"], "fixedend")).toLowerCase(),
        attempts,
        totalStudents,
        avgScore: rawScore === null ? null : Math.round(Number(rawScore) * 10) / 10,
        status: statusLabel(val(row, ["status", "quzeStatus", "publishStatus"], "")),
        createdBy: val(row, ["createdByName", "createdBy", "createdByRollNumber", "teacherName"], "-"),
        createdDate: val(
            row,
            ["postedDateAndTime", "scheduledDateAndTime", "createdOn", "createdDate", "postedOn"],
            null
        ),
    };
};

export const normalizeQuizList = (payload, grades) =>
    pickArray(payload?.data ?? payload).map((row) => normalizeQuiz(row, grades));
