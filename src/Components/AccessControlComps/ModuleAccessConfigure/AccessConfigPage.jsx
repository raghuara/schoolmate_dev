import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "access", name: "Access Control", color: "#DC2626" };
const PAGES = ["Users", "Academics", "Student Promotion", "Issue TC"];

// `subMenu` + all permission keys MUST match the backend exactly.
const PAGE_OVERRIDES = {
    "Users": { subMenu: "users", opsKeys: [] },
    "Academics": { subMenu: "academics", opsKeys: [] },
    "Student Promotion": { subMenu: "studentpromotion", opsKeys: [] },
    "Issue TC": { subMenu: "issuetc", opsKeys: [] },
};

const EXTRA_OPS = {
    "Users": [
        { key: "allowuseractivity", label: "Allow User Activity" },
        { key: "allowpasswordmanagementstudent", label: "Allow Password Management for Student" },
        { key: "allowpasswordmanagementstaff", label: "Allow Password Management for Staff" },
    ],
    "Academics": [
        { key: "allowacademicyear", label: "Allow Academic Year" },
        { key: "allowclasssectionmanagement", label: "Allow Class Section Management" },
        { key: "allowexammanagement", label: "Allow Exam Management" },
        { key: "allowsubjectmanagement", label: "Allow Subject Management" },
    ],
    "Student Promotion": [
        { key: "allowstudentpromotion", label: "Allow Student Promotion" },
        { key: "alloweditpromotedstudents", label: "Allow Edit Promoted Students" },
    ],
    "Issue TC": [
        { key: "allowissuetc", label: "Allow Issue TC" },
        { key: "allowdiscontinue", label: "Allow Discontinue" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Users": "",
    "Academics": "",
    "Student Promotion": "",
    "Issue TC": "",
};

export default function AccessConfigPage() {
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
