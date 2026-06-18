import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "inventory", name: "Inventory & Assets", color: "#0D9488" };
const PAGES = ["Inventory items", "Stock availability"];

export default function InventoryConfigPage() {
    // Add Inventory & Assets-specific validation here if needed.
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit", "delete"]}
            approval={false}
            validate={validate}
        />
    );
}
