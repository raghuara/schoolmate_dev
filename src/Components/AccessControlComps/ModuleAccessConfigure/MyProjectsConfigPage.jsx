import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "myprojects", name: "My Projects", color: "#0891B2" };
const PAGES = ["Workdone"];

const PAGE_OVERRIDES = {
    "Workdone": { opsKeys: [] },
};

// Keys MUST match the backend permission keys exactly (lowercase).
const EXTRA_OPS = {
    "Workdone": [
        { key: "allowdailyentry", label: "Allow Daily Entry" },
        { key: "allowteacherwise", label: "Allow Teacher Wise" },
        { key: "allowclasswise", label: "Allow Class Wise" },
        { key: "allowperiodsettings", label: "Allow Period Settings" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Workdone": "Workdone Settings",
};

export default function MyProjectsConfigPage() {
    const validate = () => null;

    // The shell builds the payload from this file's keys; this file owns the PUT.
    const handleSave = async (payload) => {
        const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
        return res?.data;
    };

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
            onSave={handleSave}
        />
    );
}
