// SLA Configuration — per-priority deadlines plus the working-hours rules.
// Values mirror the dev-Figma comp 1:1. Replace with the SLA settings API.

// The five deadline fields every priority band carries, in comp order.
export const SLA_FIELDS = [
    { key: "acknowledgement", label: "Acknowledgement" },
    { key: "assignment", label: "Assignment" },
    { key: "initialResponse", label: "Initial Response" },
    { key: "resolution", label: "Resolution" },
    { key: "closure", label: "Closure" },
];

// { key, title, badge, values }
// `badge` is matched against PRIORITY_STYLE in complaintCategoriesData.js — the
// comp uses the identical four-colour palette on both screens.
/* The four priority bands are real; the durations that used to sit here were the
   Figma comp's example numbers and rendered as though they were the school's own
   policy. Blank until fetchSla fills them. */
export const DEFAULT_SLA_RULES = [
    {
        key: "critical",
        title: "Critical Priority Rules",
        badge: "CRITICAL",
        values: {
            acknowledgement: "",
            assignment: "",
            initialResponse: "",
            resolution: "",
            closure: "",
        },
    },
    {
        key: "high",
        title: "High Priority Rules",
        badge: "HIGH",
        values: {
            acknowledgement: "",
            assignment: "",
            initialResponse: "",
            resolution: "",
            closure: "",
        },
    },
    {
        key: "normal",
        title: "Normal Priority Rules",
        badge: "NORMAL",
        values: {
            acknowledgement: "",
            assignment: "",
            initialResponse: "",
            resolution: "",
            closure: "",
        },
    },
    {
        key: "low",
        title: "Low Priority Rules",
        badge: "LOW",
        values: {
            acknowledgement: "",
            assignment: "",
            initialResponse: "",
            resolution: "",
            closure: "",
        },
    },
];

export const DEFAULT_WORKING_RULES = {
    workingDays: "Mon - Fri",
    workingHours: "8:00 AM - 5:00 PM",
    pauseWeekends: true,
    pauseHolidays: true,
};
