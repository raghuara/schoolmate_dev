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

