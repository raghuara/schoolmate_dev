// Presentation helpers for a single Audit Log entry.
//
// The per-entry payloads that used to live here were composed from the mock list rows —
// invented audit ids, outcomes and narratives for records that did not exist. There is no
// audit-detail endpoint, so nothing is looked up: the screen redirects back to the list
// until one ships. AuditLogPage already passes `detailPathFor = null`, so no row links here.

// Outcome pill. The comp only shows SUCCESS; the others follow its treatment so
// a failed or partial entry does not render untinted.
export const STATUS_TONES = {
    SUCCESS: { bg: "#E6F4EA", color: "#10B981" },
    FAILED: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    PARTIAL: { bg: "rgba(245, 166, 35, 0.10)", color: "#F5A623" },
};

/* No detail endpoint yet. Returning null sends the screen back to the list rather than
   rendering a page of blanks. Replace with the GET audit-log detail call when it exists. */
export const getAuditEntry = () => null;

// "Admin Tamil" -> "AT"
export const initialsOf = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
