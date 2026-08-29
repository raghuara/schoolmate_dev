// Register Complaint — mock roster and form options mirroring the dev-Figma
// comps 1:1. Replace STUDENT_RESULTS with the student-search API response.

import { categoryOptionsFor, PARENT_MODULE } from "./complaintCategorySeed";

// Column widths from the comp. Student Name takes the remaining space.
export const STUDENT_COLS = {
    admission: 150,
    grade: 120,
    section: 100,
    parent: 180,
    mobile: 180,
    action: 100,
    minWidth: 1000,
};

// Filter dropdowns. These come from the grades/sections the school has defined
// once this screen is wired to the API — the comp shows Grade 5 only.
export const CLASS_OPTIONS = ["Grade 5", "Grade 6", "Grade 7"];
export const SECTION_OPTIONS = ["Section A", "Section B", "Section C"];

// The comp's rows are 4 of 4, one page.
export const STUDENT_PAGE_SIZE = 4;

// { id, name, admissionNo, grade, section, parentName, parentMobile }
export const STUDENT_RESULTS = [
    {
        id: 1,
        name: "Aarav Kumar",
        admissionNo: "MSMS10234",
        grade: "Grade 5",
        section: "Section A",
        parentName: "Priya Kumar",
        parentMobile: "9876543221",
    },
    {
        id: 2,
        name: "Ananya Sharma",
        admissionNo: "MSMS10452",
        grade: "Grade 5",
        section: "Section A",
        parentName: "Amit Sharma",
        parentMobile: "9812345678",
    },
    {
        id: 3,
        name: "Rohan Patel",
        admissionNo: "MSMS11094",
        grade: "Grade 5",
        section: "Section B",
        parentName: "Karan Patel",
        parentMobile: "9899112233",
    },
    {
        id: 4,
        name: "Ishita Verma",
        admissionNo: "MSMS09876",
        grade: "Grade 5",
        section: "Section C",
        parentName: "Meenakshi Verma",
        parentMobile: "9777112233",
    },
];

// ── Intake form ──────────────────────────────────────────────────────────────

// How the complaint reached the office. The comp offers these two.
export const SOURCE_OPTIONS = ["Phone Call", "Walk-In"];

// { id, name } — the Select shows the name and posts `id` as the API's
// CategoryId. Sourced from the seed so the form can never offer a category the
// backend does not know.
export const COMPLAINT_CATEGORIES = categoryOptionsFor(PARENT_MODULE);

// Shown when the logged-in user carries no position/name — the dev store is
// empty until login, and the field is read-only either way.
export const RECEIVING_STAFF_FALLBACK = "Front Office - Sunita Rao";

// The comp's upload hint. Enforced on the client here; the API is the real gate.
export const ATTACHMENT_MAX_MB = 5;
export const ATTACHMENT_ACCEPT = ".png,.jpg,.jpeg,.pdf,.doc,.docx";
