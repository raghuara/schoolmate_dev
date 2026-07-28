import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "transport", name: "Transport", color: "#059669" };
// Page names normalize to the backend subMenu keys:
//   "Vehicle Details" → vehicledetails, "Route Management" → routemanagement, "Student Mapping" → studentmapping
const PAGES = ["Vehicle Details", "Route Management", "Student Mapping"];

const PAGE_OVERRIDES = {
    "Student Mapping": { opsKeys: [] },
};

// Keys MUST match the backend permission keys exactly (lowercase).
const EXTRA_OPS = {
    "Student Mapping": [
        { key: "allowstudentmapping", label: "Allow Student Mapping" },
        { key: "allowediting", label: "Allow Editing" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Student Mapping": "Student Mapping",
};

export default function TransportConfigPage() {
    const validate = () => null;

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
