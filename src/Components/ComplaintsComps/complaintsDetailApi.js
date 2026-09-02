import axios from "axios";

import {
    GetComplaintLookupCategories,
    SearchComplaintStudents,
    GetComplaintDetail,
    GetComplaintTimeline,
    DownloadComplaintAttachment,
    GetComplaintNotifications,
} from "../../Api/Api";

/**
 * Shared lookups and complaint detail.
 *
 * A DIFFERENT CONVENTION FROM THE CONFIGURATION HUB
 * These are conventional GETs with a query string; the Configuration Hub next door is
 * body-only POSTs, even for its reads. Both are correct for their own controller — do not
 * "fix" one to match the other. What they share is the actor field name: `actorRollNumber`,
 * here as a query parameter.
 */

const API_TOKEN = "123";

/* An explicit ceiling. Without one a hung request leaves the screen on "Loading…"
   forever; this API has answered in 16s after a redeploy, so the limit is generous
   but finite, and a request that exceeds it reports a timeout the reader can act on
   rather than stalling silently. */
const REQUEST_TIMEOUT_MS = 45000;

const client = axios.create({
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    timeout: REQUEST_TIMEOUT_MS,
});

/* redux-persist keeps each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Guarded — a private window throws on access. */
const actorRollNumber = () => {
    try {
        const raw = localStorage.getItem("persist:auth");
        if (!raw) return "";
        const stored = JSON.parse(raw).rollNumber;
        if (!stored) return "";
        const value = typeof stored === "string" && stored.startsWith('"') ? JSON.parse(stored) : stored;
        return String(value || "");
    } catch {
        return "";
    }
};

const messageOf = (error, fallback) => {
    /* No response at all: distinguish "took too long" from "could not connect", because
       they send the reader to different places — wait and retry, versus check the service. */
    if (!error?.response) {
        if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
            return "The server took too long to respond. It may still be starting up — try again in a moment.";
        }
        if (error?.code === "ERR_NETWORK") {
            return "Could not reach the server. Check the connection and try again.";
        }
    }
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    return error?.message || fallback;
};

const get = async (url, params, fallback) => {
    try {
        const res = await client.get(url, {
            params: { actorRollNumber: actorRollNumber(), ...params },
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, body: res?.data ?? {} };
    } catch (error) {
        /* A 404 here is ambiguous and the two causes need different people, so say which.
           The API answers a real "no such record" with a JSON envelope carrying a message;
           an EMPTY 404 body means the route itself is not there — the whole complaints
           controller has gone missing more than once mid-session. */
        if (error?.response?.status === 404) {
            const body = error.response.data;
            const hasMessage = body && typeof body === "object" && body.message;
            return {
                ok: false,
                notFound: true,
                routeMissing: !hasMessage,
                message: hasMessage ? body.message : "",
            };
        }
        return { ok: false, message: messageOf(error, fallback) };
    }
};

/* ─────────────── Category lookup ───────────────
   The list the intake forms offer. This replaces complaintCategorySeed.js: the seed was
   right while no endpoint existed, but a hardcoded copy of the school's categories drifts
   the moment anyone edits one in the Configuration Hub. */

export const lookupCategoryFromApi = (row = {}) => ({
    categoryId: row.categoryId,
    code: row.categoryCode || "",
    name: row.categoryName || "",
    description: row.description || "",
    priority: row.defaultPriority || "Normal",
    allowConfidential: row.allowConfidential !== false,
    requiresCriticalApproval: row.requiresCriticalApproval === true,
});

/** Active categories for one stream, in the order the server returns them. */
export const fetchLookupCategories = async ({ moduleType, activeOnly = true }) => {
    const result = await get(
        GetComplaintLookupCategories,
        { moduleType, activeOnly },
        "Could not load categories",
    );
    if (!result.ok) return result;
    const rows = Array.isArray(result.body.data) ? result.body.data : [];
    return { ok: true, rows: rows.map(lookupCategoryFromApi) };
};

/* ─────────────── Student search ─────────────── */

export const studentFromApi = (row = {}) => ({
    id: row.rollNumber,
    rollNumber: String(row.rollNumber ?? ""),
    name: row.studentName || row.name || "",
    admissionNo: row.admissionNumber || "",
    grade: row.grade || "",
    section: row.section || "",
    parentName: row.parentName || "",
    parentMobile: row.parentMobile || "",
});

/**
 * Students the complaint can be registered against.
 * Paginated server-side; `search` matches name or roll number.
 */
export const searchStudents = async ({ search = "", grade = "", section = "", page = 1, pageSize = 20 } = {}) => {
    const result = await get(
        SearchComplaintStudents,
        { search, grade, section, page, pageSize },
        "Could not search students",
    );
    if (!result.ok) return result;
    const body = result.body;
    return {
        ok: true,
        rows: (body.items || []).map(studentFromApi),
        page: body.page ?? page,
        pageSize: body.pageSize ?? pageSize,
        totalItems: body.totalItems ?? 0,
        totalPages: body.totalPages ?? 0,
    };
};

/* ─────────────── Complaint detail ───────────────

   One call returns the whole record: summary, the parties, SLA, attachments, the timeline
   and `allowedActions` — the list of things THIS user may do to THIS complaint, decided
   server-side. The control panel is driven from that rather than inferred from permission
   codes, so a screen cannot offer an action the server will refuse. */

export const ACTION = {
    viewTimeline: "ViewTimeline",
    downloadAttachment: "DownloadAttachment",
    requestParentInformation: "RequestParentInformation",
    assign: "Assign",
    escalate: "Escalate",
    manageParticipants: "ManageParticipants",
    markDuplicate: "MarkDuplicate",
};

export const timelineEventFromApi = (row = {}) => ({
    id: row.timelineId,
    eventType: row.eventType || "",
    fromStatus: row.fromStatus || null,
    toStatus: row.toStatus || null,
    message: row.message || "",
    actorName: row.actorName || "",
    parentVisible: row.parentVisible === true,
    at: row.createdOnUtc || null,
});

export const attachmentFromApi = (row = {}) => ({
    id: row.attachmentId ?? row.id,
    name: row.fileName || row.name || "",
    sizeBytes: row.fileSizeBytes ?? row.sizeBytes ?? null,
    contentType: row.contentType || "",
    uploadedOn: row.createdOnUtc || null,
});

/** The whole record for one complaint, addressed by its token. */
export const fetchComplaintDetail = async ({ complaintToken }) => {
    const result = await get(GetComplaintDetail(complaintToken), {}, "Could not load the complaint");
    if (!result.ok) return result;
    const d = result.body.data || {};
    const summary = d.summary || {};
    return {
        ok: true,
        summary,
        token: summary.complaintToken || complaintToken,
        moduleType: summary.moduleType || "",
        description: d.description || "",
        parentStatement: d.parentStatement || "",
        internalStaffNotes: d.internalStaffNotes || "",
        immediateResponse: d.immediateResponse || "",
        location: d.location || "",
        incidentDate: d.incidentDate || null,
        personOrRoleInvolved: d.personOrRoleInvolved || "",
        preferredContactMethod: d.preferredContactMethod || "",
        student: d.student || null,
        parent: d.parent || null,
        owner: d.owner || null,
        sla: d.sla || null,
        attachments: (d.attachments || []).map(attachmentFromApi),
        timeline: (d.timeline || []).map(timelineEventFromApi),
        informationRequests: d.informationRequests || [],
        resolutions: d.resolutions || [],
        feedback: d.feedback || [],
        participants: d.participants || [],
        /* What this user may do — never a superset of what the server will accept. */
        allowedActions: d.allowedActions || [],
    };
};

/* API detail → the shape ComplaintDetailPage's JSX already renders.

   Two deliberate differences from the mock it replaces:

   - The timeline is the events that ACTUALLY HAPPENED, in order, all complete. The mock
     drew a fixed eight-step ladder with one step "active" and the rest "pending", which
     was a guess about a process the server does not model. Inventing pending steps the
     API never mentions would be inventing a workflow.
   - Internal notes arrive as one string, not a list of authored notes. It is shown as a
     single entry attributed to nobody rather than fabricating an author and a timestamp. */
export const detailForScreen = (d) => {
    const s = d.summary || {};
    const dateTime = (iso) =>
        iso ? new Date(iso).toLocaleString(undefined, {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        }) : "";

    const pairs = (obj, fields) =>
        fields
            .filter(([, key]) => obj && obj[key] !== null && obj[key] !== undefined && obj[key] !== "")
            .map(([label, key]) => ({ label, value: String(obj[key]) }));

    return {
        ref: d.token,
        stream: s.moduleType === "StaffConcern" ? "Staff Concerns" : "Parent Complaints",
        category: s.categoryName || "",
        // The tone maps are keyed "High Priority", the API says "High"
        priority: s.priority ? `${s.priority} Priority` : "Normal Priority",
        status: s.displayStatus || s.status || "",
        title: s.subject || "",
        registeredAt: dateTime(s.createdOnUtc),
        slaDue: s.currentDueOnUtc ? dateTime(s.currentDueOnUtc) : "",
        slaState: s.slaState || "",
        isEscalated: s.isEscalated === true,
        isConfidential: s.isConfidential === true,

        student: pairs(d.student, [
            ["Student Name", "studentName"],
            ["Class & Section", "grade"],
            ["Admission No", "admissionNumber"],
        ]),
        parent: pairs(d.parent, [
            ["Parent Name", "parentName"],
            ["Contact Number", "parentMobile"],
            ["Relation", "relation"],
        ]),
        assignment: d.owner?.isUnassigned
            ? [{ label: "Assigned To", value: "Unassigned" }]
            : pairs(d.owner, [
                  ["Assigned To", "ownerName"],
                  ["Role", "ownerRole"],
                  ["Mode", "assignmentMode"],
              ]),

        description: d.description || d.parentStatement || "",
        attachments: d.attachments,
        internalNotes: d.internalStaffNotes
            ? [{ id: "notes", text: d.internalStaffNotes, author: "", at: "" }]
            : [],
        resolution: (d.resolutions || [])[0] || null,

        /* Every event is something that happened, so every step is complete. */
        timeline: d.timeline.map((event) => ({
            label: event.eventType,
            at: `${dateTime(event.at)}${event.actorName ? ` · ${event.actorName}` : ""}`,
            note: event.message,
            state: "done",
        })),

        allowedActions: d.allowedActions,
    };
};

/* The same record, shaped for ActionDetailPage — the staff-concern twin. One endpoint
   serves both streams, so only the presentation differs: an action shows an assignee card
   and an "Action Information" grid where a complaint shows student and parent blocks. */
export const actionDetailForScreen = (d) => {
    const s = d.summary || {};
    const dateTime = (iso) =>
        iso ? new Date(iso).toLocaleString(undefined, {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        }) : "";
    const initialsOf = (name = "") =>
        name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    const owner = d.owner || {};
    const pair = (label, value) => (value ? [{ label, value: String(value) }] : []);

    return {
        ref: d.token,
        stream: "Manage Actions",
        category: s.categoryName || "",
        priority: s.priority || "Normal",
        status: s.displayStatus || s.status || "",
        title: s.subject || "",
        owner: owner.ownerName || "Unassigned",
        createdAt: dateTime(s.createdOnUtc),
        slaDue: s.currentDueOnUtc ? dateTime(s.currentDueOnUtc) : "",
        slaRemaining: s.slaState ? `(${s.slaState})` : "",

        infoPrimary: [
            ...pair("Action Type", s.categoryName),
            ...pair("Created By", (d.timeline[0] || {}).actorName),
            ...pair("Category", s.categoryName),
            ...pair("Owner", owner.ownerName),
            ...pair("Location", d.location),
        ],
        infoSecondary: pair("Incident Date", d.incidentDate ? dateTime(d.incidentDate) : ""),

        description: d.description || "",
        attachments: d.attachments,
        internalNotes: d.internalStaffNotes
            ? [{ id: "notes", text: d.internalStaffNotes, author: "", at: "" }]
            : [],
        resolution: (d.resolutions || [])[0] || null,

        /* The card wants a person. An unassigned action has none, so it says so rather
           than rendering an empty avatar. */
        assignee: owner.isUnassigned
            ? { name: "Unassigned", initials: "—", role: "" }
            : {
                  name: owner.ownerName || "",
                  initials: initialsOf(owner.ownerName || ""),
                  role: owner.ownerRole || "",
              },
        assignmentMeta: [
            ...pair("Assignment Mode", owner.assignmentMode),
            ...pair("Owner Roll No", owner.ownerRollNumber),
        ],

        /* Real events, all complete — see the note on detailForScreen. */
        timeline: d.timeline.map((event) => ({
            label: event.eventType,
            at: `${dateTime(event.at)}${event.actorName ? ` · ${event.actorName}` : ""}`,
            note: event.message,
            state: "done",
        })),

        allowedActions: d.allowedActions,
    };
};

/** The timeline on its own, for refreshing without re-reading the whole record. */
export const fetchComplaintTimeline = async ({ complaintToken }) => {
    const result = await get(GetComplaintTimeline(complaintToken), {}, "Could not load the timeline");
    if (!result.ok) return result;
    const rows = result.body.data || result.body.items || [];
    return { ok: true, events: (Array.isArray(rows) ? rows : []).map(timelineEventFromApi) };
};

/* The download answers with the file itself, so the browser is handed the URL rather than
   the bytes being pulled through axios and re-wrapped. */
export const attachmentDownloadUrl = ({ complaintToken, attachmentId }) =>
    `${DownloadComplaintAttachment}?actorRollNumber=${encodeURIComponent(
        actorRollNumber(),
    )}&complaintToken=${encodeURIComponent(complaintToken)}&attachmentId=${encodeURIComponent(attachmentId)}`;

/* ─────────────── Notifications ─────────────── */

/* One alert → the shape the header bell renders.

   UNVERIFIED FIELD NAMES. The endpoint answers 200 but has returned an empty list every
   time it has been called, so the item shape has never been seen. Each field is read
   across the plausible spellings and anything unmapped is kept in `raw`, so a row renders
   something sensible rather than blank if the server's naming differs. Tighten this to the
   real names once a notification exists to look at. */
export const notificationFromApi = (row = {}, index = 0) => {
    const pick = (...keys) => keys.map((k) => row[k]).find((v) => v !== undefined && v !== null && v !== "");
    return {
        id: pick("notificationId", "id", "complaintNotificationId") ?? index,
        title: pick("title", "subject", "subjectLine", "eventCode", "templateName") || "Complaint update",
        body: pick("message", "body", "messageBody", "description") || "",
        complaintToken: pick("complaintToken", "token") || null,
        at: pick("createdOnUtc", "sentOnUtc", "createdOn") || null,
        unread: row.isRead === false || row.isRead === undefined ? row.isRead !== true : false,
        raw: row,
    };
};

export const fetchComplaintNotifications = async ({ status = "", page = 1, pageSize = 50 } = {}) => {
    const result = await get(
        GetComplaintNotifications,
        { status, page, pageSize },
        "Could not load notifications",
    );
    if (!result.ok) return result;
    const body = result.body;
    return {
        ok: true,
        rows: (body.items || body.data || []).map(notificationFromApi),
        page: body.page ?? page,
        totalItems: body.totalItems ?? 0,
        totalPages: body.totalPages ?? 0,
    };
};
