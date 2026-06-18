import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "purchase", name: "Purchase & Supplies", color: "#0891B2" };
const PAGES = ["Purchase orders", "Suppliers"];

export default function PurchaseConfigPage() {
    // Add Purchase & Supplies-specific validation here if needed.
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit", "delete"]}
            approval={true}
            validate={validate}
        />
    );
}
