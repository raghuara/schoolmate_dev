// Internal Complaints (School Operations) SLA settings — mock values mirroring
// the dev-Figma comp 1:1. Replace with the internal SLA settings API.
//
// The bands currently carry the same timings as the parent-side defaults in
// slaConfigData.js, but they are configured separately in the product, so the two
// sets are kept apart rather than shared.
//
// Reuses SLA_FIELDS from slaConfigData.js — both comps show the same five
// deadline fields in the same order — and PRIORITY_STYLE for the badges.

export const INTERNAL_SLA_RULES = [
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
