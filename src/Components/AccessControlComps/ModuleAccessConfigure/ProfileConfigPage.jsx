import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "profile", name: "Profile Management", color: "#DB2777" };
const PAGES = ["Student Management", "Staff Management"];

// Page-specific extra permissions beyond the standard view/create/edit operations
const EXTRA_OPS = {
    "Student Management": [{ key: "mergeSiblings", label: "Merge Siblings" }],
};

export default function ProfileConfigPage() {
    // Add Profile-specific validation here if needed.
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit"]}
            approval={false}
            validate={validate}
            extraOps={EXTRA_OPS}
        />
    );
}
