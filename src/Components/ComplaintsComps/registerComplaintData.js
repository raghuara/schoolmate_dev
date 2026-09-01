// Register Complaint — mock roster and form options mirroring the dev-Figma
// comps 1:1. Replace STUDENT_RESULTS with the student-search API response.


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

// ── Intake form ──────────────────────────────────────────────────────────────

// How the complaint reached the office. The comp offers these two.
export const SOURCE_OPTIONS = ["Phone Call", "Walk-In"];

// The comp's upload hint. Enforced on the client here; the API is the real gate.
export const ATTACHMENT_MAX_MB = 5;
export const ATTACHMENT_ACCEPT = ".png,.jpg,.jpeg,.pdf,.doc,.docx";

// ── Fields the POST API expects that the comp does not draw ─────────────────
// The intake endpoint takes ParentRelation, IncidentDate, IncidentLocation,
// PersonOrRoleInvolved and PreferredContactMethod, none of which are in the
// Figma frame, so they are grouped into their own "Incident Details" card.
//
// These option values are the ones the Postman samples send. The backend has
// not published the full enums yet — confirm before relying on them, and keep
// `value` matching the API exactly while `label` stays human-readable.
export const PARENT_RELATIONS = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
];

export const CONTACT_METHODS = [
    { value: "PhoneCall", label: "Phone Call" },
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "Email", label: "Email" },
    { value: "SMS", label: "SMS" },
];

// The API takes ComplaintSource as one word; the comp labels it with a space.
export const SOURCE_VALUES = { "Phone Call": "PhoneCall", "Walk-In": "WalkIn" };
