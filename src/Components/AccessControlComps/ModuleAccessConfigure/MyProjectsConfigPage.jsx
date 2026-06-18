import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "myprojects", name: "My Projects", color: "#0891B2" };
const PAGES = ["Workdone"];

// Workdone shows only its options (no standard view/create/edit/delete)
const PAGE_OVERRIDES = {
    "Workdone": { opsKeys: [] },
};

const EXTRA_OPS = {
    "Workdone": [
        { key: "allowDailyEntry", label: "Allow Daily Entry" },
        { key: "allowTeacherWise", label: "Allow Teacher Wise" },
        { key: "allowClassWise", label: "Allow Class Wise" },
        { key: "allowPeriodSettings", label: "Allow Period Settings" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Workdone": "Workdone Settings",
};

export default function MyProjectsConfigPage() {
    // Add My Projects-specific validation here if needed.
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
