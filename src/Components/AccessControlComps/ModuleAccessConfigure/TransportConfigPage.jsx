import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "transport", name: "Transport", color: "#059669" };
const PAGES = ["Vehicles details", "Route management", "Student Mapping"];

// Student Mapping shows only its options (no standard view/create/edit/delete)
const PAGE_OVERRIDES = {
    "Student Mapping": { opsKeys: [] },
};

const EXTRA_OPS = {
    "Student Mapping": [
        { key: "allowStudentMapping", label: "Allow Student Mapping" },
        { key: "allowEditing", label: "Allow Editing" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Student Mapping": "Student Mapping",
};

export default function TransportConfigPage() {
    // Add Transport-specific validation here if needed.
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
