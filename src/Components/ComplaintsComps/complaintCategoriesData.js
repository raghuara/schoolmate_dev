// Complaint Categories table — mock rows mirroring the dev-Figma comp 1:1.
// Replace CATEGORY_ROWS with the categories API response; the shape below is what
// the table expects.

// Chip palettes. LOW and HIGH use flat hex in the comp while NORMAL/CRITICAL use
// alpha tints — kept exactly as drawn rather than normalised.
export const PRIORITY_STYLE = {
    LOW: { bg: "#F1F5F9", color: "#64748B" },
    NORMAL: { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    HIGH: { bg: "#FFF8ED", color: "#F5A623" },
    CRITICAL: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
};

export const STATUS_STYLE = {
    ACTIVE: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    INACTIVE: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
};

// Column widths from the comp. Description takes the remaining space.
export const CATEGORY_COLS = {
    name: 180,
    priority: 120,
    owner: 150,
    status: 100,
    actions: 110,
    gap: "25px",
    minWidth: 900,
};

// { id, name, description, priority, owner, status }
export const CATEGORY_ROWS = [
    {
        id: 1,
        name: "Academics",
        description: "Grade/exam related",
        priority: "NORMAL",
        owner: "Class Teacher",
        status: "ACTIVE",
    },
    {
        id: 2,
        name: "Transport",
        description: "Bus/route complaints",
        priority: "HIGH",
        owner: "Transport Head",
        status: "ACTIVE",
    },
    {
        id: 3,
        name: "Homework",
        description: "Homework-related",
        priority: "LOW",
        owner: "Subject Teacher",
        status: "ACTIVE",
    },
    {
        id: 4,
        name: "Sports",
        description: "Sports/PE complaints",
        priority: "NORMAL",
        owner: "Sports Coordinator",
        status: "INACTIVE",
    },
    {
        id: 5,
        name: "Fee & Account",
        description: "Fee disputes",
        priority: "HIGH",
        owner: "Accounts Team",
        status: "ACTIVE",
    },
    {
        id: 6,
        name: "Teacher-Related",
        description: "Teacher behaviour",
        priority: "CRITICAL",
        owner: "Vice Principal",
        status: "ACTIVE",
    },
];
