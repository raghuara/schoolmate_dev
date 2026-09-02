// Internal Complaints (School Operations) SLA settings — mock values mirroring
// the dev-Figma comp 1:1. Replace with the internal SLA settings API.
//
// The bands currently carry the same timings as the parent-side defaults in
// slaConfigData.js, but they are configured separately in the product, so the two
// sets are kept apart rather than shared.
//
// Reuses SLA_FIELDS from slaConfigData.js — both comps show the same five
// deadline fields in the same order — and PRIORITY_STYLE for the badges.

/* The four priority bands are real; the durations that used to sit here were the
   Figma comp's example numbers and rendered as though they were the school's own
   policy. Blank until fetchSla fills them. */
export const INTERNAL_SLA_RULES = [
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

export const INTERNAL_WORKING_RULES = {
    workingDays: "Mon - Fri",
    workingHours: "8:00 AM - 5:00 PM",
    pauseWeekends: true,
    pauseHolidays: true,
    pauseOutsideHours: true,
};

// This comp carries a third pause rule the parent screen does not.
export const INTERNAL_PAUSE_TOGGLES = [
    { key: "pauseWeekends", label: "Pause SLA on Weekends" },
    { key: "pauseHolidays", label: "Pause SLA on School Holidays" },
    { key: "pauseOutsideHours", label: "Pause SLA Outside Working Hours" },
];
