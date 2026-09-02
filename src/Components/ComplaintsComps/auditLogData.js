// Audit Log — mock entries mirroring the dev-Figma comp 1:1.
// Replace AUDIT_ROWS with the audit-log API response.

// Every module pill is the same neutral tone in the comp, so it is passed to
// TableChip as `tone` rather than looked up per label.
export const MODULE_TONE = { bg: "#F4F6FA", color: "#64748B" };

// Column widths from the comp. Reference takes the remaining space.
export const AUDIT_COLS = {
    date: 160,
    user: 140,
    role: 120,
    action: 200,
    module: 120,
    details: 70,
    gap: 2,
    minWidth: 1060,
};

// The comp's footer reads "Showing 1-7 of 128 entries" across 3 pages. Those are
// mock totals — real paging arrives with the API, at which point `totalEntries`
// and the page count come from the response instead of here.
/* Page size is a real setting; the totals come from the response. */
export const AUDIT_PAGINATION = { pageSize: 7, totalEntries: 0, pageCount: 0 };

