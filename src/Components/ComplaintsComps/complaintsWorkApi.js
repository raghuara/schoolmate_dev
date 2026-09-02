import axios from "axios";

import {
    GetComplaintsManagementAll,
    GetComplaintsStatusCounts,
    GetComplaintsManagementDashboard,
    GetStaffMyWork,
} from "../../Api/Api";
import { MODULE } from "./complaintsConfigApi";

/**
 * The complaint work lists: the management workspace, the staff My Work queue, the status
 * pill counts and the management dashboard (modules 06 and 07).
 *
 * ONE ROW SHAPE, THREE ENDPOINTS
 * /management/all, /staff/my-work and /parent/my-complaints all return the identical row —
 * complaintToken, subject, categoryName, ownerName, slaState and so on — so they share one
 * adapter. Keep it that way: if one of them starts to differ, adapt at the call site rather
 * than letting the shared shape drift.
 *
 * STATUS VALUES ARE PASCAL CASE, WITHOUT SPACES
 * `status=ActionRequired` filters; `status=Action Required` returns a 400 with an HTML-ish
 * body rather than the usual JSON envelope. The pill labels are therefore derived FROM the
 * status-counts response rather than written out by hand, so a label can never drift from
 * the value that has to be sent back.
 */

const API_TOKEN = "123";
const REQUEST_TIMEOUT_MS = 45000;

const client = axios.create({
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    timeout: REQUEST_TIMEOUT_MS,
});

/* redux-persist keeps each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Guarded — a private window throws on access. */
export const actorRollNumber = () => {
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
    /* ASP.NET model-validation problems arrive as { errors: { field: [msg] } }, not as the
       API's own envelope — without this they would surface as a bare "Request failed". */
    if (data?.errors && typeof data.errors === "object") {
        const first = Object.values(data.errors).flat()[0];
        if (first) return String(first);
    }
    return error?.message || fallback;
};

const get = async (url, params, fallback) => {
    try {
        const res = await client.get(url, { params: { actorRollNumber: actorRollNumber(), ...params } });
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, body: res?.data ?? {} };
    } catch (error) {
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

/* ─────────────── The shared row ─────────────── */

/* The tab chips and the type filter speak in these words, not in the API's moduleType. */
export const TYPE_LABEL = {
    ParentComplaint: "Parent Complaint",
    StaffConcern: "Internal Excellence",
};

/* Only the two SLA states the API has actually returned are mapped; anything else stays
   neutral rather than being guessed at. */
const SLA_STATE_TONE = {
    WithinSLA: "ok",
    Overdue: "overdue",
};

/* "12 Aug 2026" — an em dash rather than "Invalid Date" when the field is absent. */
const shortDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* The SLA cell reads as a state plus its deadline: "Overdue · 31 Aug 2026". */
const slaTextFor = (row) => {
    const state = row.slaState || "";
    const due = row.currentDueOnUtc ? shortDate(row.currentDueOnUtc) : "";
    if (!state && !due) return "—";
    if (state && due) return `${state} · ${due}`;
    return state || due;
};

export const workRowFromApi = (row = {}) => ({
    /* The token is the id: it is what every detail route and every action endpoint keys on. */
    id: row.complaintToken || "",
    ref: row.complaintToken || "",
    complaintId: row.complaintId,
    moduleType: row.moduleType || "",
    type: TYPE_LABEL[row.moduleType] || row.moduleType || "",
    category: row.categoryName || "",
    title: row.subject || "",
    student: row.studentName || "",
    studentRollNumber: row.studentRollNumber || "",
    /* Unassigned comes back as null on both name and roll number. */
    owner: row.ownerName || "",
    ownerRollNumber: row.ownerRollNumber || "",
    priority: row.priority || "",
    /* `status` drives the filters, `displayStatus` is what the reader sees. */
    status: row.status || "",
    displayStatus: row.displayStatus || row.status || "",
    slaState: row.slaState || "",
    dueOn: row.currentDueOnUtc || null,
    isEscalated: row.isEscalated === true,
    isConfidential: row.isConfidential === true,
    parentActionType: row.parentActionType ?? null,
    createdOn: row.createdOnUtc || null,

    /* The two cells the workspace row renders directly. `slaTone` keys SLA_TONES, whose
       vocabulary is overdue / due / ok / neutral — not the server's slaState. */
    sla: slaTextFor(row),
    slaTone: SLA_STATE_TONE[row.slaState] || "neutral",
    date: shortDate(row.createdOnUtc),
});

/* Every list endpoint answers with the same envelope. */
const listResult = (body, page, pageSize) => {
    const rows = Array.isArray(body.items) ? body.items : [];
    return {
        ok: true,
        rows: rows.map(workRowFromApi),
        page: body.page ?? page,
        pageSize: body.pageSize ?? pageSize,
        totalCount: body.totalItems ?? rows.length,
        totalPages: body.totalPages ?? 1,
    };
};

/* The filters both list endpoints accept. Empty strings are sent through deliberately —
   the API treats an absent and an empty filter alike, and sending them keeps the query
   shape identical to the collection's. */
const listParams = ({
    moduleType = "",
    status = "All",
    priority = "",
    categoryId = "",
    search = "",
    ownerRollNumber = "",
    studentRollNumber = "",
    slaState = "",
    isEscalated = "",
    isConfidential = "",
    fromDate = "",
    toDate = "",
    page = 1,
    pageSize = 20,
}) => ({
    moduleType,
    status,
    priority,
    categoryId,
    search,
    ownerRollNumber,
    studentRollNumber,
    slaState,
    isEscalated,
    isConfidential,
    fromDate,
    toDate,
    page,
    pageSize,
});

/**
 * The Complaints Management workspace list.
 * `moduleType: ""` is the All tab — both streams in one list.
 */
export const fetchManagementList = async (options = {}) => {
    const params = listParams(options);
    const result = await get(GetComplaintsManagementAll, params, "Could not load complaints");
    if (!result.ok) return result;
    return listResult(result.body, params.page, params.pageSize);
};

/** The signed-in staff member's own queue. Requires a moduleType. */
export const fetchStaffMyWork = async (options = {}) => {
    const params = listParams({ moduleType: MODULE.parent, ...options });
    const result = await get(GetStaffMyWork, params, "Could not load your work queue");
    if (!result.ok) return result;
    return listResult(result.body, params.page, params.pageSize);
};

/* ─────────────── Status pill counts ─────────────── */

/* camelCase count key → the label shown, and the value the API filters on. "all" is the
   only key whose filter value is not simply its PascalCase form. */
const COUNT_LABELS = {
    all: "All",
    registered: "Registered",
    underReview: "Under Review",
    actionRequired: "Action Required",
    resolved: "Resolved",
    closed: "Closed",
    withdrawn: "Withdrawn",
};

const statusValueFor = (key) => (key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1));

const labelFor = (key) =>
    COUNT_LABELS[key] ||
    /* An unrecognised bucket still renders, spaced out from its camelCase name, rather
       than being dropped — a hidden filter is worse than an awkward label. */
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const pillsFrom = (counts) =>
    Object.entries(counts).map(([key, count]) => ({
        key,
        label: labelFor(key),
        status: statusValueFor(key),
        count: Number(count) || 0,
    }));

/**
 * The status pills for one tab.
 *
 * status-counts REQUIRES a moduleType — it 400s without one — so the All tab asks for both
 * streams and adds them together rather than showing nothing.
 */
export const fetchStatusCounts = async ({ moduleType = "" } = {}) => {
    const read = async (type) =>
        get(GetComplaintsStatusCounts, { moduleType: type }, "Could not load the status counts");

    if (moduleType) {
        const result = await read(moduleType);
        if (!result.ok) return result;
        return { ok: true, pills: pillsFrom(result.body?.data ?? {}) };
    }

    const [parent, staff] = await Promise.all([read(MODULE.parent), read(MODULE.staff)]);
    if (!parent.ok && !staff.ok) return parent;

    const merged = {};
    [parent, staff].forEach((result) => {
        if (!result.ok) return;
        Object.entries(result.body?.data ?? {}).forEach(([key, value]) => {
            merged[key] = (merged[key] || 0) + (Number(value) || 0);
        });
    });
    return { ok: true, pills: pillsFrom(merged) };
};

/* ─────────────── Dashboard metrics ─────────────── */

const namedCounts = (rows) =>
    (Array.isArray(rows) ? rows : []).map((row) => ({
        label: row.name || row.subject || "",
        value: Number(row.count) || 0,
    }));

/**
 * The management dashboard for one stream.
 *
 * The averages and the compliance percentage are returned as 0 while nothing has been
 * resolved yet — that is a real zero from the server, not a missing value, so it is passed
 * through as a number and left to the screen to present.
 */
export const fetchManagementDashboard = async ({ moduleType, fromDate = "", toDate = "" }) => {
    const result = await get(
        GetComplaintsManagementDashboard,
        { moduleType, fromDate, toDate },
        "Could not load the dashboard",
    );
    if (!result.ok) return result;
    const data = result.body?.data ?? {};
    const counts = data.counts ?? {};
    return {
        ok: true,
        counts,
        averages: {
            acknowledgementHours: data.averageAcknowledgementHours ?? 0,
            resolutionHours: data.averageResolutionHours ?? 0,
            slaCompliancePercent: data.slaCompliancePercent ?? 0,
        },
        byCategory: namedCounts(data.byCategory),
        byPriority: namedCounts(data.byPriority),
        byStatus: namedCounts(data.byStatus),
        byOwner: namedCounts(data.byOwner),
        repeatedIssues: namedCounts(data.repeatedIssues),
        parentSatisfaction: namedCounts(data.parentSatisfaction),
        range: { from: data.fromDate || null, to: data.toDateExclusive || null },
    };
};
