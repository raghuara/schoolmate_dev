import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "access", name: "Access Control", color: "#DC2626" };
const PAGES = ["Users", "Academics", "Student Promotion", "Issue TC"];

// Every page shows only its options (no standard view/create/edit/delete)
const PAGE_OVERRIDES = {
    "Users": { opsKeys: [] },
    "Academics": { opsKeys: [] },
    "Student Promotion": { opsKeys: [] },
    "Issue TC": { opsKeys: [] },
};

const EXTRA_OPS = {
    "Users": [
        { key: "allowUserActivity", label: "Allow User Activity" },
        {
            group: "Password Management",
            gate: { key: "allowPasswordManagement", label: "Allow Password Management" },
            items: [
                { key: "passwordStudent", label: "Student" },
                { key: "passwordStaff", label: "Staff" },
            ],
        },
    ],
    "Academics": [
        { key: "allowAcademicYear", label: "Allow Academic Year" },
        { key: "allowClassSection", label: "Allow Class Section Management" },
        { key: "allowExamManagement", label: "Allow Exam Management" },
        { key: "allowSubjectManagement", label: "Allow Subject Management" },
    ],
    "Student Promotion": [
        { key: "allowStudentPromotion", label: "Allow Student Promotion" },
        { key: "allowEditPromoted", label: "Allow Edit Promoted Students" },
    ],
    "Issue TC": [
        { key: "allowIssueTc", label: "Allow Issue TC" },
        { key: "allowDiscontinue", label: "Allow Discontinue" },
    ],
};

// "" hides the section heading; grouped entries carry their own sub-heading
const EXTRA_OPS_LABELS = {
    "Users": "",
    "Academics": "",
    "Student Promotion": "",
    "Issue TC": "",
};

export default function AccessConfigPage() {
    // Add Access Control-specific validation here if needed.
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit", "delete"]}
            approval={false}
            validate={validate}
            pageOverrides={PAGE_OVERRIDES}
            extraOps={EXTRA_OPS}
            extraOpsLabels={EXTRA_OPS_LABELS}
        />
    );
}
