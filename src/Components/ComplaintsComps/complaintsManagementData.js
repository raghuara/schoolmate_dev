// Complaints Management workspace — the unified list of parent complaints and
// internal actions. Mock rows mirror the dev-Figma comp 1:1; replace ITEMS with
// the combined workspace API response.

export const WORKSPACE_TABS = ["All", "Parent Complaints", "Internal Excellence"];

// `type` doubles as the tab filter and the chip label.
export const TYPE_TONES = {
    "Parent Complaint": { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    "Internal Excellence": { bg: "rgba(139, 92, 246, 0.10)", color: "#8B5CF6" },
};

// Which tab shows which type.
export const TAB_TYPE = {
    "Parent Complaints": "Parent Complaint",
    "Internal Excellence": "Internal Excellence",
};

// Category chips replace the type chip once a single tab is selected — the
// Parent tab comp labels each card by complaint category instead.
export const CATEGORY_TONES = {
    "Teacher-Related": { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    Transport: { bg: "rgba(139, 92, 246, 0.10)", color: "#8B5CF6" },
    Infrastructure: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    Academic: { bg: "rgba(20, 184, 166, 0.10)", color: "#14B8A6" },
    "Fee & Finance": { bg: "rgba(249, 115, 22, 0.10)", color: "#F97316" },
};

// NOTE: the two comps disagree on High — the All tab draws it #F5A623 on a 10%
// amber tint, the Parent tab draws it #D97706 on #FFFBEB. The newer (Parent)
// values are used for both so one label cannot render two ways.
export const PRIORITY_TONES = {
    Critical: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    High: { bg: "#FFFBEB", color: "#D97706" },
    Normal: { bg: "#F1F5F9", color: "#64748B" },
    Low: { bg: "#F1F5F9", color: "#64748B" },
};

export const STATUS_TONES = {
    /* `Open` is what the intake API returns on creation — confirmed against a live
       staff-concern response. It reads as "not yet picked up", so it takes the same amber
       as Registered rather than a colour of its own. */
    Open: { bg: "#FFFBEB", color: "#D97706" },
    Registered: { bg: "#FFFBEB", color: "#D97706" },
    "Action Required": { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    "Under Review": { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    "In Progress": { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    "Awaiting Review": { bg: "rgba(245, 166, 35, 0.10)", color: "#F5A623" },
    Resolved: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    Closed: { bg: "#F1F5F9", color: "#64748B" },
};

/* The API spells statuses without spaces ("InProgress"); the comps spell them with
   ("In Progress"). Rather than keep two sets of keys in step, a lookup falls back to a
   space- and case-insensitive match, so either spelling finds its tone.
   Returns undefined when genuinely unknown — callers already supply a fallback. */
const squash = (value) => String(value || "").replace(/[\s_-]/g, "").toLowerCase();

export const toneFor = (map, status) => {
    if (!status) return undefined;
    if (map[status]) return map[status];
    const target = squash(status);
    const key = Object.keys(map).find((name) => squash(name) === target);
    return key ? map[key] : undefined;
};

/* Server SLA state → the tone the SLA cell is painted in.
   Only `WithinSLA` has been seen on a live response; anything else falls through to
   neutral until its real spelling is confirmed, rather than guessing at names. */
export const SLA_STATE_TO_TONE = {
    WithinSLA: "ok",
};

export const slaToneFor = (slaState) => SLA_STATE_TO_TONE[slaState] || "neutral";

// The SLA cell is plain text, coloured by urgency rather than chipped.
export const SLA_TONES = {
    overdue: "#EF4444",
    due: "#D97706",
    ok: "#22C55E",
    neutral: "#1E293B",
};

// Lifecycle filter row, shown once a single tab is selected. Counts are the
// comps' mock totals — they come from the API alongside the rows.
//
// The two tabs run DIFFERENT lifecycles: a parent complaint is Registered →
// Under Review → Resolved, while an internal action is Open → In Progress →
// Awaiting Review → Completed. Keyed by tab so selecting Internal Excellence
// does not show parent-only statuses.
export const STATUS_FILTERS_BY_TAB = {
    All: [
        { label: "All", count: 52 },
        { label: "Open", count: 10 },
        { label: "Action Required", count: 8 },
        { label: "In Progress", count: 15 },
        { label: "Resolved", count: 14 },
        { label: "Closed", count: 5 },
    ],
    "Parent Complaints": [
        { label: "All", count: 34 },
        { label: "Registered", count: 6 },
        { label: "Under Review", count: 10 },
        { label: "Action Required", count: 5 },
        { label: "Resolved", count: 9 },
        { label: "Closed", count: 4 },
    ],
    "Internal Excellence": [
        { label: "All", count: 18 },
        { label: "Open", count: 4 },
        { label: "Action Required", count: 3 },
        { label: "In Progress", count: 5 },
        { label: "Awaiting Review", count: 2 },
        { label: "Completed", count: 3 },
        { label: "Closed", count: 1 },
    ],
};

// Kept so any caller written against the flat export keeps working.
export const STATUS_FILTERS = STATUS_FILTERS_BY_TAB["Parent Complaints"];

/* Page sizes are real settings; the totals come from the list response, which does not
   exist yet — they used to read "of 52", "of 34", "of 18" against an invented table. */
export const PAGINATION_BY_TAB = {
    All: { pageSize: 6, totalItems: 0, pageCount: 0 },
    "Parent Complaints": { pageSize: 5, totalItems: 0, pageCount: 0 },
    "Internal Excellence": { pageSize: 5, totalItems: 0, pageCount: 0 },
};

export const WORKSPACE_PAGINATION = PAGINATION_BY_TAB.All;
