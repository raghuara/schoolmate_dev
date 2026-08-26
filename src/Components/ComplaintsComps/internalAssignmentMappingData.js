// Internal Complaints (School Operations) assignment mapping — mock rows
// mirroring the dev-Figma comp 1:1. Replace with the mapping API response.

// Categories match INTERNAL_CATEGORY_ROWS in internalCategoriesData.js.
//
// Faithful to the comp: rows 2 and 6 read "Auto Assign" as the Default Owner while
// their mode is Manual Assignment. Worth confirming with design — everywhere else
// a manual row names a person ("Selected User", "Selected Admin").
export const INTERNAL_ASSIGNMENT_MAPPINGS = [
    { id: 1, category: "Academic & Teaching", role: "Teacher", owner: "Auto Assign", mode: "Auto Assign", status: "Active" },
    { id: 2, category: "Staff & Professional Conduct", role: "Admin", owner: "Auto Assign", mode: "Manual Assignment", status: "Active" },
    { id: 3, category: "Facilities & Maintenance", role: "Office Staff", owner: "Auto Assign", mode: "Auto Assign", status: "Active" },
    { id: 4, category: "Administration & Records", role: "Office Staff", owner: "Selected User", mode: "Manual Assignment", status: "Active" },
    { id: 5, category: "Technology & Digital Systems", role: "Admin", owner: "Selected Admin", mode: "Manual Assignment", status: "Active" },
    { id: 6, category: "General Improvement", role: "Admin", owner: "Auto Assign", mode: "Manual Assignment", status: "Active" },
];

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
