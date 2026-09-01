import { C, TINT } from "./complaintsTokens";

/**
 * Presentation helpers shared by the two parent screens.
 *
 * The status names here are the ones the parent endpoints return. Anything unrecognised
 * falls through to a neutral chip rather than being guessed at — a status painted the wrong
 * colour reads as a fact about the complaint, so an unknown one is better left grey.
 */

export const PARENT_STATUS_TONES = {
    Registered: { fg: C.blue, bg: TINT.blue },
    Acknowledged: { fg: C.blue, bg: TINT.blue },
    "Action in Progress": { fg: C.amber, bg: TINT.amber },
    "In Progress": { fg: C.amber, bg: TINT.amber },
    "On Hold": { fg: C.textMuted, bg: TINT.neutral },
    Escalated: { fg: C.redDark, bg: TINT.redDark },
    Resolved: { fg: C.green, bg: TINT.green },
    Closed: { fg: C.textMuted, bg: TINT.neutral },
    Reopened: { fg: C.amber, bg: TINT.amber },
    Withdrawn: { fg: C.textMuted, bg: TINT.neutral },
};

export const PARENT_PRIORITY_TONES = {
    Low: { fg: C.textMuted, bg: TINT.neutral },
    Normal: { fg: C.blue, bg: TINT.blue },
    High: { fg: C.amber, bg: TINT.amber },
    Critical: { fg: C.red, bg: TINT.red },
};

/* The status filter's own wording. "All" is the server's value for no filter, not "". */
export const PARENT_STATUS_FILTERS = [
    "All",
    "Registered",
    "Acknowledged",
    "Action in Progress",
    "On Hold",
    "Escalated",
    "Resolved",
    "Closed",
    "Reopened",
    "Withdrawn",
];

export const PARENT_PRIORITY_FILTERS = ["Low", "Normal", "High", "Critical"];

/** A date the parent can read. Returns an em dash rather than "Invalid Date". */
export const formatOn = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * Which of the four actions this complaint currently allows.
 *
 * Driven by the row's own state, not by a fixed list: a resolved complaint invites
 * feedback, a live one can be withdrawn, a closed one can be reopened, and an outstanding
 * request for information outranks all of them. Offering an action the server will refuse
 * is worse than offering none, so the rules stay conservative.
 */
export const availableActions = (row = {}) => {
    const status = row.status || "";
    const actions = [];

    /* `parentActionType` is the server's flag for "this one is waiting on you". It has been
       null on every row observed, so its values are unknown — any non-null value is taken
       as a request rather than matching a spelling that has never been seen. */
    if (row.parentActionType != null) actions.push("information");

    if (status === "Resolved") actions.push("feedback");

    /* Already finished, one way or another — nothing left to withdraw. */
    if (!["Closed", "Withdrawn", "Resolved"].includes(status)) actions.push("withdraw");

    if (["Closed", "Resolved"].includes(status)) actions.push("reopen");

    return actions;
};

export const ACTION_LABELS = {
    information: "Provide information",
    feedback: "Confirm resolution",
    withdraw: "Withdraw",
    reopen: "Reopen",
};

/* SLA state → the colour it is printed in. Only the states the API has actually returned
   are mapped; anything else stays muted rather than being guessed at. */
export const SLA_STATE_TONES = {
    WithinSLA: "#22C55E",
    Overdue: "#EF4444",
};
