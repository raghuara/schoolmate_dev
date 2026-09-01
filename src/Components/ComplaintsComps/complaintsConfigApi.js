import axios from "axios";

import {
    GetComplaintCategories,
    CreateComplaintCategory,
    UpdateComplaintCategory,
    SetComplaintCategoryStatus,
    GetComplaintAssignmentMappings,
    CreateComplaintAssignmentMapping,
    UpdateComplaintAssignmentMapping,
    GetComplaintPermissions,
    SaveComplaintPermissions,
    GetComplaintSla,
    SaveComplaintSla,
    GetComplaintEscalation,
    SaveComplaintEscalation,
    GetComplaintNotificationTemplates,
    SaveComplaintNotificationTemplate,
    GetComplaintDashboardWidgets,
    SaveComplaintDashboardWidgets,
    GetComplaintConfigAuditLog,
    GetAllUserTypes,
} from "../../Api/Api";

/**
 * Complaints Configuration Hub — the 18 body-only routes behind the eight config screens.
 *
 * THREE THINGS THAT DIFFER FROM THE REST OF THE APP
 *
 * 1. Reads are POSTs. `categories/get` takes a JSON body and no query string; calling it
 *    as a GET answers 405. Every function here posts.
 *
 * 2. One endpoint set serves both streams. Parent Complaints and Staff Concerns are told
 *    apart by `moduleType`, so the paired screens share these calls rather than each
 *    having its own route — pass MODULE.parent or MODULE.staff.
 *
 * 3. The actor is `actorRollNumber`. The global withActor interceptor adds
 *    requestedByRollNumber / creatorRollNumber to every request, but this controller reads
 *    neither, so the field is set explicitly on every call. Forgetting it is the easiest
 *    way to get a permission failure that looks like a bug in the screen.
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

/* The two streams. The API spells them without a space. */
export const MODULE = {
    parent: "ParentComplaint",
    staff: "StaffConcern",
};

/* redux-persist keeps each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Guarded — a private window throws on access, and a call without the
   actor fails cleanly rather than taking the screen down. */
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

/* Every call carries the actor, so it is added once here rather than at 18 call sites.
   Two envelopes are in play: categories/get answers flat ({ items, page, totalItems… }),
   every other read nests its payload under `data`. Each reader below unwraps its own
   rather than guessing at both. */
const send = async (method, url, body, fallback) => {
    try {
        const res = await client({
            method,
            url,
            data: { actorRollNumber: actorRollNumber(), ...body },
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, data: res?.data ?? {} };
    } catch (error) {
        return { ok: false, message: messageOf(error, fallback) };
    }
};

/* ─────────────── 01 · Categories ─────────────── */

/* One row → the shape the categories table renders. `version` is the server's optimistic
   concurrency stamp; it is carried through so an update can send back what it was edited
   from. */
export const categoryFromApi = (row = {}) => ({
    categoryId: row.categoryId ?? null,
    moduleType: row.moduleType || "",
    code: row.categoryCode || "",
    name: row.categoryName || "",
    description: row.description || "",
    department: row.departmentName || "",
    priority: row.defaultPriority || "Normal",
    ownerRole: row.defaultOwnerRole || "",
    ownerRollNumber: row.defaultOwnerRollNumber || "",
    allowConfidential: row.allowConfidential !== false,
    requiresCriticalApproval: row.requiresCriticalApproval === true,
    isActive: row.isActive !== false,
    version: row.version ?? null,
});

/**
 * Categories, paginated and filtered server-side.
 * `status` is "All" | "Active" | "Inactive"; `priority` "" means any.
 */
export const fetchCategories = async ({
    moduleType,
    search = "",
    status = "All",
    priority = "",
    page = 1,
    pageSize = 20,
} = {}) => {
    const result = await send(
        "post",
        GetComplaintCategories,
        { moduleType, search, status, priority, page, pageSize },
        "Could not load categories",
    );
    if (!result.ok) return result;
    const body = result.data;
    return {
        ok: true,
        rows: (body.items || []).map(categoryFromApi),
        /* Paging totals come from the response — the table must not count its own rows,
           which are only the current page. */
        page: body.page ?? page,
        pageSize: body.pageSize ?? pageSize,
        totalItems: body.totalItems ?? 0,
        totalPages: body.totalPages ?? 1,
    };
};

/* API row → the shape the categories TABLE renders.
   The screens speak in upper case ("ACTIVE", "NORMAL") because that is how the comps
   label their chips and filters, while the API uses "Active" / "Normal". Converting here
   keeps the vocabulary difference in one place instead of at every chip. */
export const categoryRowForTable = (row = {}) => ({
    id: row.categoryId,
    categoryId: row.categoryId,
    code: row.code,
    name: row.name,
    description: row.description,
    priority: String(row.priority || "Normal").toUpperCase(),
    owner: row.ownerRole || row.department || "",
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    allowConfidential: row.allowConfidential,
    requiresCriticalApproval: row.requiresCriticalApproval,
    version: row.version,
});

/* Toolbar values → the query the API expects.
   "All Status" / "Priority" are the comps' resting labels, not real filters, so they map
   to the API's "no filter" values rather than being sent through. */
export const categoryQueryFrom = ({ search, status, priority }) => ({
    search: (search || "").trim(),
    status: !status || status.startsWith("All") ? "All" : status.charAt(0) + status.slice(1).toLowerCase(),
    priority: !priority || priority === "Priority" ? "" : priority.charAt(0) + priority.slice(1).toLowerCase(),
});

/* Draft → request body. Shared by create and update, which take the same fields apart
   from the id. */
const categoryToApi = (draft = {}) => ({
    moduleType: draft.moduleType,
    categoryCode: draft.code,
    categoryName: draft.name,
    description: draft.description || "",
    departmentName: draft.department || "",
    defaultPriority: draft.priority || "Normal",
    defaultOwnerRole: draft.ownerRole || "",
    defaultOwnerRollNumber: draft.ownerRollNumber || "",
    allowConfidential: draft.allowConfidential !== false,
    requiresCriticalApproval: draft.requiresCriticalApproval === true,
    isActive: draft.isActive !== false,
});

export const createCategory = (draft) =>
    send("post", CreateComplaintCategory, categoryToApi(draft), "Could not create the category");

export const updateCategory = (draft) =>
    send(
        "put",
        UpdateComplaintCategory,
        { categoryId: draft.categoryId ?? null, ...categoryToApi(draft) },
        "Could not update the category",
    );

/* Enable / disable from the row action. Takes only the id and the flag. */
export const setCategoryStatus = ({ categoryId, isActive }) =>
    send(
        "put",
        SetComplaintCategoryStatus,
        { categoryId, isActive },
        "Could not change the category status",
    );

/* ─────────────── 02 · Staff assignment ─────────────── */

export const assignmentFromApi = (row = {}) => ({
    assignmentMappingId: row.assignmentMappingId ?? null,
    categoryId: row.categoryId ?? null,
    categoryName: row.categoryName || "",
    mode: row.assignmentMode || "Manual",
    role: row.defaultRole || "",
    assignToRollNumber: row.assignToRollNumber || "",
    grade: row.scopeGrade || "",
    section: row.scopeSection || "",
    department: row.departmentName || "",
    priorityOverride: row.priorityOverride || "",
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive !== false,
});

/* The API says "Auto" / "Manual"; the comps say "Auto Assign" / "Manual Assignment",
   which is what MODE_STYLES and the drawer's dropdown are keyed on. */
export const MODE_LABEL = { Auto: "Auto Assign", Manual: "Manual Assignment" };
export const MODE_VALUE = { "Auto Assign": "Auto", "Manual Assignment": "Manual" };

/* API row → the shape the mapping table renders. `categoryId` rides along invisibly
   because create/update address the category by id while the table shows its name. */
export const assignmentRowForTable = (row = {}) => ({
    id: row.assignmentMappingId,
    assignmentMappingId: row.assignmentMappingId,
    categoryId: row.categoryId,
    category: row.categoryName,
    role: row.role || "",
    // An auto-assigned row has no named owner — the table shows the mode in that column
    owner: row.mode === "Auto" ? "Auto Assign" : row.assignToRollNumber || "",
    mode: MODE_LABEL[row.mode] || row.mode || "Manual Assignment",
    status: row.isActive ? "Active" : "Inactive",
    grade: row.grade,
    section: row.section,
    department: row.department,
    priorityOverride: row.priorityOverride,
    sortOrder: row.sortOrder,
});

export const fetchAssignmentMappings = async ({ moduleType } = {}) => {
    const result = await send(
        "post",
        GetComplaintAssignmentMappings,
        { moduleType },
        "Could not load assignment mappings",
    );
    if (!result.ok) return result;
    const body = result.data;
    return { ok: true, rows: (Array.isArray(body.data) ? body.data : []).map(assignmentFromApi) };
};

const assignmentToApi = (draft = {}) => ({
    categoryId: draft.categoryId,
    assignmentMode: draft.mode || "Manual",
    defaultRole: draft.role || "",
    assignToRollNumber: draft.assignToRollNumber || "",
    scopeGrade: draft.grade || "",
    scopeSection: draft.section || "",
    departmentName: draft.department || "",
    priorityOverride: draft.priorityOverride || "",
    sortOrder: draft.sortOrder ?? 0,
    isActive: draft.isActive !== false,
});

export const createAssignmentMapping = (draft) =>
    send(
        "post",
        CreateComplaintAssignmentMapping,
        assignmentToApi(draft),
        "Could not create the mapping",
    );

export const updateAssignmentMapping = (draft) =>
    send(
        "put",
        UpdateComplaintAssignmentMapping,
        { assignmentMappingId: draft.assignmentMappingId, ...assignmentToApi(draft) },
        "Could not update the mapping",
    );

/* ─────────────── 03 · Permissions ─────────────── */

/* Permissions are addressed per subject: a role ("Super Admin") or an individual user
   (their roll number), decided by subjectType. */
export const SUBJECT = { role: "Role", user: "User" };

/* Human labels for the 16 codes the API defines. The screens used to hold their own
   lists — 11 keys on the parent side, 19 on the internal one — which no longer line up:
   the five "Manage Categories / Assignment / SLA / Escalation / Notifications" toggles are
   one MANAGE_CONFIGURATION code server-side, and two others had no code at all. Rather
   than invent a mapping, the matrix is now driven by availablePermissionCodes and labelled
   here, so a code added by the backend appears without a frontend change. */
export const PERMISSION_LABELS = {
    VIEW: "View",
    CREATE: "Create / register",
    ASSIGN: "Assign",
    REASSIGN: "Reassign",
    UPDATE_STATUS: "Update status",
    ADD_INTERNAL_NOTES: "Add internal notes",
    REQUEST_INFORMATION: "Request information",
    RESOLVE: "Resolve",
    REVIEW: "Review",
    CLOSE: "Close",
    REOPEN: "Reopen",
    ESCALATE: "Escalate",
    VIEW_CONFIDENTIAL: "View confidential",
    MANAGE_CONFIGURATION: "Manage configuration",
    VIEW_AUDIT: "View audit log",
    VIEW_DASHBOARD: "View dashboard",
};

export const permissionLabel = (code) =>
    PERMISSION_LABELS[code] ||
    String(code || "")
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/^./, (c) => c.toUpperCase());

export const fetchPermissions = async ({ moduleType, subjectType = SUBJECT.role, subjectKey }) => {
    const result = await send(
        "post",
        GetComplaintPermissions,
        { moduleType, subjectType, subjectKey },
        "Could not load permissions",
    );
    if (!result.ok) return result;
    const payload = result.data.data || {};
    const items = payload.assignments || [];
    return {
        ok: true,
        /* The codes that exist, in the server's order — this is what the matrix renders,
           so a subject with no rows yet still shows the full list, all off. */
        codes: payload.availablePermissionCodes || [],
        /* Flattened to { PERMISSION_CODE: boolean } — the toggles are keyed by code and
           the array order is not meaningful. */
        allowed: items.reduce(
            (acc, item) => ({ ...acc, [item.permissionCode]: item.isAllowed === true }),
            {},
        ),
        items,
    };
};

export const savePermissions = ({ moduleType, subjectType = SUBJECT.role, subjectKey, allowed }) =>
    send(
        "put",
        SaveComplaintPermissions,
        {
            moduleType,
            subjectType,
            subjectKey,
            permissions: Object.entries(allowed).map(([permissionCode, isAllowed]) => ({
                permissionCode,
                isAllowed: Boolean(isAllowed),
            })),
        },
        "Could not save permissions",
    );

/* ─────────────── 04 · SLA ─────────────── */

/* The API works in MINUTES throughout; the screen shows "30 min" / "24 hrs". Converting
   in one place keeps every screen honest about what is stored. */
/* ── Durations ──────────────────────────────────────────────────────────────
   The API stores every SLA deadline in MINUTES. The screens edit a number plus a unit,
   so nothing is typed that could be misspelled and nothing has to be parsed back. State
   holds minutes throughout; the amount and unit exist only for display. */

export const DURATION_UNITS = [
    { key: "min", label: "min", minutes: 1 },
    { key: "hrs", label: "hrs", minutes: 60 },
    { key: "days", label: "days", minutes: 1440 },
];

const UNIT_MINUTES = DURATION_UNITS.reduce((acc, u) => ({ ...acc, [u.key]: u.minutes }), {});

/* Minutes → the largest unit that divides exactly, so 1440 shows as 1 day and 90 stays
   90 min rather than becoming a lossy 1.5 hrs. */
export const minutesToParts = (minutes) => {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) return { amount: 0, unit: "min" };
    if (value % UNIT_MINUTES.days === 0) return { amount: value / UNIT_MINUTES.days, unit: "days" };
    if (value % UNIT_MINUTES.hrs === 0) return { amount: value / UNIT_MINUTES.hrs, unit: "hrs" };
    return { amount: value, unit: "min" };
};

export const partsToMinutes = (amount, unit) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n * (UNIT_MINUTES[unit] || 1));
};

/* Read-only display, for anywhere a deadline is shown rather than edited. */
export const formatMinutes = (minutes) => {
    const { amount, unit } = minutesToParts(minutes);
    if (unit === "days") return `${amount} ${amount === 1 ? "day" : "days"}`;
    if (unit === "hrs") return `${amount} ${amount === 1 ? "hr" : "hrs"}`;
    return `${amount} min`;
};

/* The five deadlines each priority carries, in the order the comps draw them. */
export const SLA_MINUTE_FIELDS = [
    ["acknowledgement", "acknowledgementMinutes"],
    ["assignment", "assignmentMinutes"],
    ["initialResponse", "initialResponseMinutes"],
    ["resolution", "resolutionMinutes"],
    ["closure", "closureGraceMinutes"],
];

/* API policy → { acknowledgement: 15, … } in MINUTES, which is what the cards now hold. */
export const slaPolicyToValues = (policy = {}) =>
    SLA_MINUTE_FIELDS.reduce(
        (acc, [key, apiKey]) => ({ ...acc, [key]: Number(policy[apiKey]) || 0 }),
        {},
    );

/* …and back. No parsing and no failure case — the values were never text. */
export const valuesToSlaPolicy = (priority, values = {}) =>
    SLA_MINUTE_FIELDS.reduce(
        (acc, [key, apiKey]) => ({ ...acc, [apiKey]: Number(values[key]) || 0 }),
        { priority },
    );

export const fetchSla = async ({ moduleType }) => {
    const result = await send("post", GetComplaintSla, { moduleType }, "Could not load the SLA settings");
    if (!result.ok) return result;
    /* `settings` (the working calendar) and `policies` (one row per priority) are
       siblings under data, not one flat object. */
    const d = result.data.data || {};
    const settings = d.settings || {};
    return {
        ok: true,
        workingDays: settings.workingDays || "Mon-Fri",
        workingDayStart: settings.workingDayStart || "08:00:00",
        workingDayEnd: settings.workingDayEnd || "17:00:00",
        pauseOnWeekends: settings.pauseOnWeekends !== false,
        pauseOnSchoolHolidays: settings.pauseOnSchoolHolidays !== false,
        pauseOutsideWorkingHours: settings.pauseOutsideWorkingHours !== false,
        timeZoneId: settings.timeZoneId || "Asia/Kolkata",
        policies: d.policies || [],
    };
};

export const saveSla = ({ moduleType, settings }) =>
    send("put", SaveComplaintSla, { moduleType, ...settings }, "Could not save the SLA settings");

/* ─────────────── 05 · Escalation ─────────────── */

/* Readable names for the trigger codes the API defines. Anything unmapped falls back to
   splitting the PascalCase, so a trigger the backend adds still reads sensibly. */
export const TRIGGER_LABELS = {
    SlaBreached: "SLA breached",
    CriticalAction: "Critical action raised",
    ActionReopened: "Action reopened",
    NoAcknowledgement: "Not acknowledged in time",
    NoProgress: "No progress recorded",
};

export const triggerLabel = (triggerType) =>
    TRIGGER_LABELS[triggerType] ||
    String(triggerType || "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());

export const fetchEscalation = async ({ moduleType }) => {
    const result = await send(
        "post",
        GetComplaintEscalation,
        { moduleType },
        "Could not load the escalation settings",
    );
    if (!result.ok) return result;
    const esc = result.data.data || {};
    return { ok: true, levels: esc.levels || [], rules: esc.rules || [] };
};

export const saveEscalation = ({ moduleType, levels, rules }) =>
    send(
        "put",
        SaveComplaintEscalation,
        { moduleType, levels, rules },
        "Could not save the escalation settings",
    );

/* ─────────────── 06 · Notification templates ─────────────── */


/* API template → the shape the templates table renders. The screen shows channels as a
   chip list and status as ACTIVE/INACTIVE, so the three booleans are folded into an array
   here rather than at the row. `eventCode` is the save key — the endpoint is singular and
   addresses one template by its event. */
export const templateRowForTable = (row = {}) => ({
    id: row.eventCode,
    eventCode: row.eventCode,
    name: row.templateName || "",
    channels: [
        row.pushEnabled ? "PUSH" : null,
        row.smsEnabled ? "SMS" : null,
        row.emailEnabled ? "EMAIL" : null,
    ].filter(Boolean),
    status: row.isActive === false ? "INACTIVE" : "ACTIVE",
    subject: row.subjectLine || "",
    body: row.messageBody || "",
});

/* …and back, for the one template the dialog edited. */
export const templateRowToApi = (row = {}) => ({
    eventCode: row.eventCode,
    name: row.name,
    push: (row.channels || []).includes("PUSH"),
    sms: (row.channels || []).includes("SMS"),
    email: (row.channels || []).includes("EMAIL"),
    subject: row.subject,
    body: row.body,
    isActive: row.status !== "INACTIVE",
});

export const fetchNotificationTemplates = async ({ moduleType }) => {
    const result = await send(
        "post",
        GetComplaintNotificationTemplates,
        { moduleType },
        "Could not load the notification templates",
    );
    if (!result.ok) return result;
    return {
        ok: true,
        rows: (Array.isArray(result.data.data) ? result.data.data : []).map(templateRowForTable),
    };
};

/* Saves ONE template — the endpoint is singular, keyed by eventCode. */
export const saveNotificationTemplate = ({ moduleType, template }) =>
    send(
        "put",
        SaveComplaintNotificationTemplate,
        {
            moduleType,
            eventCode: template.eventCode,
            templateName: template.name,
            pushEnabled: template.push,
            smsEnabled: template.sms,
            emailEnabled: template.email,
            subjectLine: template.subject,
            messageBody: template.body,
            isActive: template.isActive !== false,
        },
        "Could not save the template",
    );

/* ─────────────── 07 · Dashboard widgets ─────────────── */

/* Readable names for the widget codes the API defines. Anything unmapped falls back to
   title-casing the code, so a widget the backend adds still renders with a sensible name
   rather than disappearing. */
export const WIDGET_LABELS = {
    OPEN_COMPLAINTS: { title: "Open Complaints", description: "Count and trend of complaints still open." },
    ACTION_REQUIRED: { title: "Action Required", description: "Complaints waiting on a coordinator response." },
    OVERDUE: { title: "Overdue", description: "Complaints past their configured SLA." },
    CRITICAL: { title: "Critical", description: "High-severity issues such as safety or child protection." },
    REOPENED: { title: "Reopened", description: "Complaints reopened after being resolved." },
    SLA_PERFORMANCE: { title: "SLA Performance", description: "How often deadlines are being met." },
    PARENT_SATISFACTION: { title: "Parent Satisfaction", description: "Feedback scores from closed complaints." },
    COMPLAINT_ACTIVITY: { title: "Complaint Activity", description: "Volume over time." },
    REPEATED_ISSUES: { title: "Repeated Issues", description: "Categories recurring most often." },
    DEPARTMENT_BREAKDOWN: { title: "Department Breakdown", description: "Where complaints are landing." },
    STAFF_PERFORMANCE: { title: "Staff Performance", description: "Resolution rates by owner." },
};

export const widgetLabel = (code) =>
    WIDGET_LABELS[code] || {
        title: String(code || "")
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/./g, (c) => c.toUpperCase()),
        description: "",
    };

/* API widget → the shape the toggle list renders. `displayOrder` rides along so a save
   sends the order back untouched — this screen does not reorder. */
export const widgetRowForTable = (row = {}) => ({
    key: row.widgetCode,
    widgetCode: row.widgetCode,
    enabled: row.isEnabled !== false,
    displayOrder: row.displayOrder ?? 0,
    ...widgetLabel(row.widgetCode),
});

export const fetchDashboardWidgets = async ({ moduleType }) => {
    const result = await send(
        "post",
        GetComplaintDashboardWidgets,
        { moduleType },
        "Could not load the dashboard configuration",
    );
    if (!result.ok) return result;
    return {
        ok: true,
        widgets: (Array.isArray(result.data.data) ? result.data.data : []).map(widgetRowForTable),
    };
};

export const saveDashboardWidgets = ({ moduleType, widgets }) =>
    send(
        "put",
        SaveComplaintDashboardWidgets,
        { moduleType, widgets },
        "Could not save the dashboard configuration",
    );

/* ─────────────── 08 · Audit log ─────────────── */

/* ── Who did it ─────────────────────────────────────────────────────────────
   The audit endpoint records `actorRollNumber` and nothing else — no name, no role. Both
   are resolvable from GetAllUserTypes, which returns every user grouped by type, so the
   directory is read once and cached for the session rather than leaving two columns blank.
   Failure is silent on purpose: a missing name should not empty the audit table. */

let directoryCache = null;
let directoryInflight = null;

export const loadUserDirectory = async () => {
    if (directoryCache) return directoryCache;
    if (!directoryInflight) {
        directoryInflight = client
            .get(GetAllUserTypes)
            .then((res) => {
                const types = Array.isArray(res?.data?.data) ? res.data.data : [];
                const index = {};
                types.forEach((type) => {
                    (type.users || []).forEach((user) => {
                        index[String(user.rollNumber)] = {
                            name: user.name || "",
                            role: type.userType || "",
                        };
                    });
                });
                directoryCache = index;
                return index;
            })
            .catch(() => ({}))
            .finally(() => {
                directoryInflight = null;
            });
    }
    return directoryInflight;
};

/* ── What actually changed ──────────────────────────────────────────────────
   Each entry carries a full before/after of the saved configuration as two JSON strings.
   Showing them raw is unreadable, so they are walked to the changed leaves only.

   Two rules keep the result honest:
   - Bookkeeping fields are skipped (version stamps, row ids, timestamps, who saved it).
     They differ on every save and would bury the one line that matters.
   - Lists are matched by their natural key (Priority, EventCode, WidgetCode…) rather than
     by position, so a reordered array does not read as every row having changed. */

const AUDIT_NOISE = /^(version|createdonutc|updatedonutc|updatedbyrollnumber|actorrollnumber|isactive)$|id$/i;
const AUDIT_LIST_KEYS = ["priority", "eventcode", "widgetcode", "categorycode", "triggertype", "levelnumber"];

const listKeyOf = (item) =>
    Object.keys(item || {}).find((k) => AUDIT_LIST_KEYS.includes(k.toLowerCase()));

const walkChanges = (before, after, path, out) => {
    if (Array.isArray(before) && Array.isArray(after)) {
        const key = after.length ? listKeyOf(after[0]) : null;
        if (key) {
            after.forEach((item) => {
                const previous = before.find((x) => x && x[key] === item[key]);
                if (previous) walkChanges(previous, item, path.concat(String(item[key])), out);
            });
        }
        return;
    }
    if (before && after && typeof before === "object" && typeof after === "object") {
        Object.keys(after).forEach((key) => {
            if (AUDIT_NOISE.test(key)) return;
            // A key absent from `before` is the shape differing, not a change the user made
            if (!(key in before)) return;
            walkChanges(before[key], after[key], path.concat(key), out);
        });
        return;
    }
    if (before !== after) out.push({ path: path.join(" · "), before, after });
};

/* → [{ path, before, after }], or [] when the entry records no field-level difference. */
export const auditChanges = (entry = {}) => {
    try {
        const before = JSON.parse(entry.oldValuesJson || "{}");
        const after = JSON.parse(entry.newValuesJson || "{}");
        const out = [];
        walkChanges(before, after, [], out);
        return out;
    } catch {
        return [];
    }
};

/* Role names for the "Default Owner" pickers.

   The field stores a ROLE (defaultOwnerRole), not a person, so the options are the school's
   user types. Deriving them from the owners already on categories — which is what the
   screens used to do — yields an empty list the moment no category has an owner set, which
   is exactly the state a fresh install is in. Students are dropped: a complaint is never
   owned by one. */
export const fetchRoleNames = async () => {
    try {
        const res = await client.get(GetAllUserTypes);
        const types = Array.isArray(res?.data?.data) ? res.data.data : [];
        return types
            .map((t) => t.userType)
            .filter((name) => name && name !== "Student")
            .sort();
    } catch {
        return [];
    }
};

/* API entry → the shape the audit table renders.

   The response carries `actorRollNumber` but no name and no role, so the User column shows
   the roll number and Role is left blank rather than filled with a guess. `oldValuesJson`
   and `newValuesJson` are carried through unparsed — they are a full before/after of the
   saved configuration, which a detail view can diff once one exists. */
export const auditRowForTable = (row = {}) => ({
    id: row.configurationAuditLogId,
    dateTime: row.createdOnUtc
        ? new Date(row.createdOnUtc).toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "",
    rollNumber: row.actorRollNumber || "",
    user: row.actorRollNumber || "",
    role: "",
    action: row.action || "",
    module: row.configurationArea || "",
    reference: row.recordKey || "",
    oldValuesJson: row.oldValuesJson || null,
    newValuesJson: row.newValuesJson || null,
});

/* Fills User and Role from the directory, leaving the roll number in place for anyone it
   does not know — a departed staff member still has audit history. */
const withActorNames = async (rows) => {
    if (rows.length === 0) return rows;
    const directory = await loadUserDirectory();
    return rows.map((row) => {
        const person = directory[row.rollNumber];
        return person ? { ...row, user: person.name || row.rollNumber, role: person.role } : row;
    });
};

export const fetchConfigAuditLog = async ({
    moduleType,
    area = "",
    fromDateUtc = null,
    toDateUtc = null,
    page = 1,
    pageSize = 50,
} = {}) => {
    const result = await send(
        "post",
        GetComplaintConfigAuditLog,
        { moduleType, area, fromDateUtc, toDateUtc, page, pageSize },
        "Could not load the audit log",
    );
    if (!result.ok) return result;
    const body = result.data;
    return {
        ok: true,
        rows: await withActorNames((body.items || []).map(auditRowForTable)),
        page: body.page ?? page,
        pageSize: body.pageSize ?? pageSize,
        totalItems: body.totalItems ?? 0,
        totalPages: body.totalPages ?? 1,
    };
};
