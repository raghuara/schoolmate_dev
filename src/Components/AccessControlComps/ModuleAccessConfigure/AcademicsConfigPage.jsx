import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";
import {
    ACADEMICS_PAGES,
    COMMUNICATION_SUBMENUS,
    PAGE_OVERRIDES,
} from "./communicationGroups";

const TOKEN = "123";

/* Academics has no main menu of its own - it edits the teaching half of the
   `communication` main menu. FeaturePermissionsPage passes that key through
   route state, so the shell writes to `communication` either way. */
const MODULE = { key: "academics", name: "Academics", color: "#7C3AED" };

export default function AcademicsConfigPage() {
    const validate = () => null;

    const handleSave = async (payload) => {
        const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
        return res?.data;
    };

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={ACADEMICS_PAGES}
            opsKeys={["view", "create", "edit", "delete"]}
            approval={true}
            validate={validate}
            pageOverrides={PAGE_OVERRIDES}
            // Communication edits the other half of this same main menu.
            preserveSubMenus={COMMUNICATION_SUBMENUS}
            onSave={handleSave}
        />
    );
}
