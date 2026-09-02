// Mock data for the Complaint Assignment Mapping screen.
// Values mirror the dev-Figma comp 1:1. Replace with the mapping API response.

// Assignment mode tag colours — Figma used solid tints here, not the 10% alphas
// the dashboard uses, so they are spelled out rather than derived.
export const MODE_STYLES = {
    "Auto Assign": { bg: "#DBEAFE", color: "#3B82F6" },
    "Manual Assignment": { bg: "#EDE9FE", color: "#6D28D9" },
};

export const STATUS_STYLES = {
    Active: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    Inactive: { bg: "rgba(100, 116, 139, 0.10)", color: "#64748B" },
};

// ROUTING LOGIC (reference only — not rendered).
// The mapping rows above drive this chain when a complaint comes in:
//   Parent submits complaint
//     -> complaint category
//     -> default role for that category
//     -> eligible staff in that role
//     -> assigned staff (auto-picked, or the named default owner when the mode
//        is Manual Assignment)
//     -> staff handles complaint

export const ASSIGNMENT_MODES = ["Auto Assign", "Manual Assignment"];

export const MODE_HELPER_TEXT =
    "Auto Assign: System selects eligible staff based on role. Manual Assignment: Staff selects person when handling.";

// Avatar tints for the staff list, applied round-robin so every name keeps a
// stable colour without the data carrying one.
export const AVATAR_TONES = ["#3B82F6", "#10B981", "#F59E0B", "#6D28D9", "#EF4444"];

// Fixed column widths from the comp; the table scrolls horizontally below them.
export const COLUMNS = [
    { key: "category", label: "Complaint Category", width: 220 },
    { key: "role", label: "Default Role", width: 140 },
    { key: "owner", label: "Default Owner", width: 160 },
    { key: "mode", label: "Assignment Mode", width: 160 },
    { key: "status", label: "Status", width: 100 },
    { key: "actions", label: "Actions", width: 100, align: "right" },
];
