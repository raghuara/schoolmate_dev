import { seedRowsFor, PARENT_MODULE } from "./complaintCategorySeed";

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

// Toolbar dropdowns. The first entry is the resting label the comp draws.
export const STATUS_FILTER = ["All Status", "ACTIVE", "INACTIVE"];
export const PRIORITY_FILTER = ["Priority", "CRITICAL", "HIGH", "NORMAL", "LOW"];

// The comp's footer reads "Showing 1-8 of 12 categories".
export const CATEGORY_PAGE_SIZE = 8;

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

// Default Owner is not part of the seed — Assignment Mapping owns it. These are
// the owners already configured for the categories that existed before the seed
// landed; the rest stay blank until the mapping API supplies them.
const PARENT_OWNERS = {
    ACADEMICS: "Class Teacher",
    TRANSPORT: "Transport Head",
    HOMEWORK: "Subject Teacher",
    SPORTS: "Sports Coordinator",
    FEE_ACCOUNT: "Accounts Team",
    TEACHER_RELATED: "Vice Principal",
};

// The 12 seeded ParentComplaint categories, carrying the CategoryId the POST
// APIs expect. See complaintCategorySeed.js for the caveats on those ids.
export const CATEGORY_ROWS = seedRowsFor(PARENT_MODULE, PARENT_OWNERS);
