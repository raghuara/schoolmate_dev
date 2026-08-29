// Seeded complaint categories, from the backend team's
// "Complaint Category, Severity & SLA Reference" (2026-08-28_complaints_post_foundation.sql).
//
// These are the ids the POST APIs expect in `CategoryId` — the complaints
// endpoints take the integer, not the name — so this file is the single source
// for both the Categories configuration screens and the intake forms.
//
// TWO THINGS TO VERIFY BEFORE RELYING ON THESE IN PRODUCTION:
//   1. The reference states the ids come from a *clean* first run of that
//      migration. If the table already existed, the real ids differ and must be
//      read back with the query in the sheet's Usage Notes.
//   2. The sheet has a "Grace" column between Closure and Confidential Allowed
//      whose values did not come through in the PDF, so it is not represented
//      here. Ask the backend team for it before wiring any grace-period UI.

// Every category's SLA follows its severity band exactly, so the stages are held
// once per band rather than repeated on all 24 rows.
export const SEVERITY_SLA = {
    CRITICAL: {
        acknowledgement: "30 min",
        assignment: "1 hour",
        initialResponse: "2 hours",
        resolution: "24 working hours",
        closure: "48 working hours",
    },
    HIGH: {
        acknowledgement: "1 hour",
        assignment: "4 hours",
        initialResponse: "8 hours",
        resolution: "48 working hours",
        closure: "72 working hours",
    },
    NORMAL: {
        acknowledgement: "4 hours",
        assignment: "12 hours",
        initialResponse: "24 working hours",
        resolution: "5 working days",
        closure: "7 working days",
    },
    LOW: {
        acknowledgement: "8 hours",
        assignment: "24 working hours",
        initialResponse: "48 working hours",
        resolution: "7 working days",
        closure: "10 working days",
    },
};

// Same for every seeded category.
export const WORKING_SCHEDULE = "Mon-Fri, 08:00-17:00 IST";

export const PARENT_MODULE = "ParentComplaint";
export const STAFF_MODULE = "StaffConcern";

// { categoryId, module, code, name, description, severity, confidentialAllowed, criticalApproval }
export const CATEGORY_SEED = [
    // ── Parent complaints ────────────────────────────────────────────────────
    { categoryId: 1, module: PARENT_MODULE, code: "ACADEMICS", name: "Academics", description: "Grade, exam and academic concerns", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 2, module: PARENT_MODULE, code: "TRANSPORT", name: "Transport", description: "Bus, route and transport concerns", severity: "HIGH", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 3, module: PARENT_MODULE, code: "HOMEWORK", name: "Homework", description: "Homework-related concerns", severity: "LOW", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 4, module: PARENT_MODULE, code: "SPORTS", name: "Sports", description: "Sports and physical-education concerns", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 5, module: PARENT_MODULE, code: "FEE_ACCOUNT", name: "Fee & Account", description: "Fee, billing and account concerns", severity: "CRITICAL", confidentialAllowed: true, criticalApproval: true },
    { categoryId: 6, module: PARENT_MODULE, code: "TEACHER_RELATED", name: "Teacher-Related", description: "Teacher communication or conduct concerns", severity: "CRITICAL", confidentialAllowed: true, criticalApproval: true },
    { categoryId: 7, module: PARENT_MODULE, code: "INFRASTRUCTURE", name: "Infrastructure", description: "Classroom, building and facility concerns", severity: "HIGH", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 8, module: PARENT_MODULE, code: "SAFETY_SECURITY", name: "Safety & Security", description: "Student safety and security concerns", severity: "CRITICAL", confidentialAllowed: true, criticalApproval: true },
    { categoryId: 9, module: PARENT_MODULE, code: "COMMUNICATION", name: "Communication", description: "School communication concerns", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 10, module: PARENT_MODULE, code: "GENERAL_SCHOOL", name: "General School", description: "General school complaint or feedback", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 11, module: PARENT_MODULE, code: "CANTEEN", name: "Canteen", description: "Food, hygiene and canteen concerns", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 12, module: PARENT_MODULE, code: "OTHER", name: "Other", description: "Other parent concerns", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },

    // ── Staff concerns (School Operations) ───────────────────────────────────
    { categoryId: 13, module: STAFF_MODULE, code: "ACADEMIC_TEACHING", name: "Academic & Teaching", description: "Academic and teaching actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 14, module: STAFF_MODULE, code: "CLASSROOM_STUDENTS", name: "Classroom & Students", description: "Classroom and student-related actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 15, module: STAFF_MODULE, code: "STAFF_PROFESSIONAL_CONDUCT", name: "Staff & Professional Conduct", description: "Professional conduct actions", severity: "HIGH", confidentialAllowed: true, criticalApproval: true },
    { categoryId: 16, module: STAFF_MODULE, code: "FACILITIES_MAINTENANCE", name: "Facilities & Maintenance", description: "Facility and maintenance actions", severity: "HIGH", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 17, module: STAFF_MODULE, code: "CLEANLINESS_HYGIENE", name: "Cleanliness & Hygiene", description: "Cleanliness and hygiene actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 18, module: STAFF_MODULE, code: "ADMINISTRATION_RECORDS", name: "Administration & Records", description: "Administrative and record actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 19, module: STAFF_MODULE, code: "COMMUNICATION_COORDINATION", name: "Communication & Coordination", description: "Communication and coordination actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 20, module: STAFF_MODULE, code: "TRANSPORT_SECURITY", name: "Transport & Security", description: "Transport and security actions", severity: "HIGH", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 21, module: STAFF_MODULE, code: "EVENTS_SCHEDULING", name: "Events & Scheduling", description: "Event and scheduling actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 22, module: STAFF_MODULE, code: "TECHNOLOGY_DIGITAL", name: "Technology & Digital Systems", description: "Technology and digital-system actions", severity: "NORMAL", confidentialAllowed: true, criticalApproval: false },
    { categoryId: 23, module: STAFF_MODULE, code: "SAFETY_COMPLIANCE", name: "Safety & Compliance", description: "Safety and compliance actions", severity: "CRITICAL", confidentialAllowed: true, criticalApproval: true },
    { categoryId: 24, module: STAFF_MODULE, code: "IMPROVEMENT_RECOGNITION", name: "Improvement & Recognition", description: "Improvement, suggestion and recognition", severity: "LOW", confidentialAllowed: false, criticalApproval: false },
];

// Rows for one module, shaped for the Categories tables. `owners` maps a category
// code to its Default Owner: the seed carries no owner — that is Assignment
// Mapping's job — so the ones already configured are passed in and the rest stay
// blank until the mapping API supplies them.
//
// `status` is ACTIVE for every seeded row; the enable/disable toggle is local
// until the categories API exists.
export function seedRowsFor(module, owners = {}) {
    return CATEGORY_SEED.filter((c) => c.module === module).map((c) => ({
        id: c.categoryId,
        categoryId: c.categoryId,
        code: c.code,
        name: c.name,
        description: c.description,
        priority: c.severity,
        sla: SEVERITY_SLA[c.severity],
        confidentialAllowed: c.confidentialAllowed,
        criticalApproval: c.criticalApproval,
        workingSchedule: WORKING_SCHEDULE,
        owner: owners[c.code] || "",
        status: "ACTIVE",
    }));
}

// { id, name } for the intake forms — the Select shows the name and posts the id.
export const categoryOptionsFor = (module) =>
    CATEGORY_SEED.filter((c) => c.module === module).map((c) => ({
        id: c.categoryId,
        name: c.name,
    }));
