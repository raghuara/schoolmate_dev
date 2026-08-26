import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "approvals", name: "Approvals", color: "#DB2777" };
const PAGES = ["Pending", "History"];

export default function ApprovalsConfigPage() {
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view"]}
            approval={false}
            validate={validate}
        />
    );
}
