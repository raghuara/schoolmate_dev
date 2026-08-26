// Detail payload for a single Audit Log entry, mirroring the dev-Figma comp.
// The list rows live in auditLogData.js; this file adds the per-entry fields the
// detail screen shows on top of them (audit id, outcome, narrative, diff).
//
// Replace DETAILS_BY_ID with the GET /audit-log/:id response — the merge below is
// only needed while the list and the detail come from the same mock.

import { AUDIT_ROWS } from "./auditLogData";
import { INTERNAL_AUDIT_ROWS } from "./internalAuditLogData";

// Outcome pill. The comp only shows SUCCESS; the others follow its treatment so
// a failed or partial entry does not render untinted.
export const STATUS_TONES = {
    SUCCESS: { bg: "#E6F4EA", color: "#10B981" },
    FAILED: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    PARTIAL: { bg: "rgba(245, 166, 35, 0.10)", color: "#F5A623" },
};

// { auditId, status, description, before, after: [] }
// Entry 1 is spelled out by the comp. The rest carry no designed copy yet, so
// they fall back to a description derived from the row — see getAuditEntry.
const DETAILS_BY_ID = {
    1: {
        auditId: "AUD-2026-00124",
        status: "SUCCESS",
        description:
            "Super Admin created the Academic category and configured its default priority and resolution timeline.",
        before: "Category did not exist",
        after: ["Category: Academic", "Priority: Normal", "Status: Active"],
    },
};

// Merges a list row with its detail payload. Returns null when the id is unknown
// so the screen can show a not-found state instead of rendering blanks.
//
// The Parent and Internal logs reuse the same numeric ids, so each variant gets
// its own lookup over its own rows rather than one merged search.
const makeAuditEntryLookup = (rows, detailsById = {}) => (id) => {
    const index = rows.findIndex((r) => String(r.id) === String(id));
    if (index === -1) return null;

    const row = rows[index];
    const detail = detailsById[row.id];
    if (detail) return { ...row, ...detail };

    // TODO: remove once the detail API is wired — until then, entries the comp
    // did not specify show the row's own facts rather than invented copy.
    return {
        ...row,
        auditId: `AUD-2026-${String(124 + index).padStart(5, "0")}`,
        status: "SUCCESS",
        description: `${row.role} performed "${row.action}" on ${row.module}.`,
        before: null,
        after: [],
    };
};

export const getAuditEntry = makeAuditEntryLookup(AUDIT_ROWS, DETAILS_BY_ID);

// No Internal detail copy is drawn in any comp, so every entry falls back to the
// row-derived description above.
export const getInternalAuditEntry = makeAuditEntryLookup(INTERNAL_AUDIT_ROWS);

// "Admin Tamil" -> "AT"
export const initialsOf = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
