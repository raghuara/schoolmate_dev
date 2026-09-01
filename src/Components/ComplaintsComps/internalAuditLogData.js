// Internal Complaints > Audit Log — mock entries mirroring the dev-Figma comp 1:1.
// Rendered by AuditLogPage, which is shared with the Parent variant; only the
// copy, rows and totals differ.

// The comp's footer reads "Showing 1-8 of 156 entries" across 3 pages — mock
// totals until the API paginates.
export const INTERNAL_AUDIT_PAGINATION = { pageSize: 8, totalEntries: 156, pageCount: 3 };

export const INTERNAL_AUDIT_COPY = {
    crumbLabel: "School Operations Configuration",
    subtitle: "Track school operations activity and configuration changes.",
};
