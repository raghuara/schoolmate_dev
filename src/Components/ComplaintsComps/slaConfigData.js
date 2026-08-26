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
export const DEFAULT_SLA_RULES = [
    {
        key: "critical",
        title: "Critical Priority Rules",
        badge: "CRITICAL",
        values: {
            acknowledgement: "30 min",
            assignment: "1 hr",
            initialResponse: "2 hrs",
            resolution: "24 hrs",
            closure: "48 hrs",
        },
    },
    {
        key: "high",
        title: "High Priority Rules",
        badge: "HIGH",
        values: {
            acknowledgement: "1 hr",
            assignment: "4 hrs",
            initialResponse: "8 hrs",
            resolution: "48 hrs",
            closure: "72 hrs",
        },
    },
    {
        key: "normal",
        title: "Normal Priority Rules",
        badge: "NORMAL",
        values: {
            acknowledgement: "4 hrs",
            assignment: "12 hrs",
            initialResponse: "24 hrs",
            resolution: "5 days",
            closure: "7 days",
        },
    },
    {
        key: "low",
        title: "Low Priority Rules",
        badge: "LOW",
        values: {
            acknowledgement: "8 hrs",
            assignment: "24 hrs",
            initialResponse: "48 hrs",
            resolution: "7 days",
            closure: "10 days",
        },
    },
];

export const DEFAULT_WORKING_RULES = {
    workingDays: "Mon - Fri",
    workingHours: "8:00 AM - 5:00 PM",
    pauseWeekends: true,
    pauseHolidays: true,
};
