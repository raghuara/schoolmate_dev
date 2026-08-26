// Internal Complaints > Notification Templates.
// Rendered by NotificationTemplatesPage, which is shared with the Parent variant;
// only the copy and rows differ.
//
// No Internal comp was supplied for this screen — it duplicates the Parent one,
// with the lifecycle stages reworded for School Operations entries ("action"
// rather than "complaint", staff rather than parent). Replace with the internal
// notification-templates API response.

export const INTERNAL_TEMPLATE_ROWS = [
    {
        id: 1,
        name: "Action Logged",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "New action logged — {{action_id}}",
        body:
            "Hi {{staff_name}},\n\n" +
            "A new School Operations action ({{action_id}}) has been logged under {{category}}.\n\n" +
            "Target resolution: {{sla_hours}} hours.\n\n" +
            "Thank you,\nSchoolMate Team",
    },
    {
        id: 2,
        name: "Action Acknowledged",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action acknowledged — {{action_id}}",
        body: "{{staff_name}} has acknowledged action {{action_id}}.",
    },
    {
        id: 3,
        name: "Action Assigned",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action assigned to you — {{action_id}}",
        body: "Action {{action_id}} ({{category}}) has been assigned to you by {{assigned_by}}.",
    },
    {
        id: 4,
        name: "Additional Information Required",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "More information needed — {{action_id}}",
        body: "Additional information is required before action {{action_id}} can proceed.",
    },
    {
        id: 5,
        name: "Under Review",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action under review — {{action_id}}",
        body: "Action {{action_id}} is currently under review by {{reviewer_name}}.",
    },
    {
        id: 6,
        name: "Evidence Uploaded",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Evidence added — {{action_id}}",
        body: "{{staff_name}} uploaded evidence against action {{action_id}}.",
    },
    {
        id: 7,
        name: "SLA Breach Warning",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "SLA breach approaching — {{action_id}}",
        body: "Action {{action_id}} is approaching its {{sla_stage}} deadline.",
    },
    {
        id: 8,
        name: "Action Escalated",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action escalated — {{action_id}}",
        body: "Action {{action_id}} has been escalated to {{escalation_level}}.",
    },
    {
        id: 9,
        name: "Action Completed",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action completed — {{action_id}}",
        body: "Action {{action_id}} has been marked complete by {{staff_name}}.",
    },
    {
        id: 10,
        name: "Action Reopened",
        channels: ["PUSH"],
        status: "ACTIVE",
        subject: "Action reopened — {{action_id}}",
        body: "Action {{action_id}} has been reopened for further work.",
    },
];

export const INTERNAL_TEMPLATE_COPY = {
    crumbLabel: "School Operations Configuration",
    subtitle: "Manage School Operations notifications, reminders and workflow messages.",
};
