// Notification Templates table — mock rows mirroring the dev-Figma comp 1:1.
// Replace TEMPLATE_ROWS with the notification-templates API response.

// Channel pills. Only PUSH appears in the comp; EMAIL/SMS fall through to the
// neutral tone in TableChip until the design specifies their colours.
export const CHANNEL_STYLE = {
    PUSH: { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
};

// Column widths from the comp. Template Name takes the remaining space — rows
// carry one or two short channel pills, so letting Active Channels flex instead
// strands a wide empty gap before Status.
export const TEMPLATE_COLS = {
    name: 280,
    channels: 200,
    status: 120,
    actions: 110,
    gap: "25px",
    minWidth: 860,
};

// Channels the Edit Template dialog offers. The comp shows Push selected and SMS
// available; add EMAIL here once the design covers it.
export const TEMPLATE_CHANNELS = [
    { key: "PUSH", label: "Push" },
    { key: "SMS", label: "SMS" },
];

// { id, name, channels[], status, subject, body }
// Only "Complaint Registered" has its subject and body drawn in the comp — the
// rest carry short placeholder copy so the editor never opens empty. Replace all
// of them with the API's stored templates.
export const TEMPLATE_ROWS = [
    {
        id: 1,
        name: "Complaint Registered",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been registered — {{complaint_id}}",
        body:
            "Hi {{parent_name}},\n\n" +
            "Your complaint ({{complaint_id}}) regarding {{complaint_category}} has been successfully registered. " +
            "Our team will review it and take necessary action.\n\n" +
            "Expected resolution: {{sla_days}} working days.\n\n" +
            "Thank you,\nSchoolMate Team",
    },
    {
        id: 2,
        name: "Complaint Acknowledged",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been acknowledged — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nWe have acknowledged your complaint ({{complaint_id}}).\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 3,
        name: "Complaint Assigned",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been assigned — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nYour complaint ({{complaint_id}}) has been assigned to {{assigned_to}}.\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 4,
        name: "Additional Information Required",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "More information needed — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nWe need a little more information about your complaint ({{complaint_id}}).\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 5,
        name: "Under Review",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint is under review — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nYour complaint ({{complaint_id}}) is currently under review.\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 6,
        name: "Action Started",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action has started on your complaint — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nWork has started on your complaint ({{complaint_id}}).\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 7,
        name: "Complaint Resolved",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been resolved — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nYour complaint ({{complaint_id}}) has been resolved.\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 8,
        name: "Parent Confirmation Requested",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Please confirm the resolution — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nPlease confirm that your complaint ({{complaint_id}}) has been resolved to your satisfaction.\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 9,
        name: "Complaint Closed",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been closed — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nYour complaint ({{complaint_id}}) has been closed.\n\nThank you,\nSchoolMate Team",
    },
    {
        id: 10,
        name: "Complaint Reopened",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Your complaint has been reopened — {{complaint_id}}",
        body: "Hi {{parent_name}},\n\nYour complaint ({{complaint_id}}) has been reopened.\n\nThank you,\nSchoolMate Team",
    },
];
