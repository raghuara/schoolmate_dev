// Internal Complaints (School Operations) assignment mapping — mock rows
// mirroring the dev-Figma comp 1:1. Replace with the mapping API response.

// This comp tints Manual Assignment amber, where the parent-side table uses
// purple. Auto Assign is the same blue on both.
export const INTERNAL_MODE_STYLES = {
    "Auto Assign": { bg: "#DBEAFE", color: "#3B82F6" },
    "Manual Assignment": { bg: "#FEF3C7", color: "#D97706" },
};

// Same widths as the parent table; the first column is titled "Category" here.
export const INTERNAL_MAPPING_COLUMNS = [
    { key: "category", label: "Category", width: 220 },
    { key: "role", label: "Default Role", width: 140 },
    { key: "owner", label: "Default Owner", width: 160 },
    { key: "mode", label: "Assignment Mode", width: 160 },
    { key: "status", label: "Status", width: 100 },
    { key: "actions", label: "Actions", width: 100, align: "right" },
];
