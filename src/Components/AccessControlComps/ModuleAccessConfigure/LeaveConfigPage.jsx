import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "leave", name: "Leave & Payroll", color: "#7C3AED" };
// One card per backend subMenu. `subMenu` + keys MUST match the backend exactly.
const PAGES = [
    "Policy Setup",
    "Leave Types",
    "Working Calendar",
    "Attendance Access",
    "Leave Management",
    "Payroll Management",
];

const PAGE_OVERRIDES = {
    "Policy Setup": { subMenu: "leavepolicymasterpolicysetup", opsKeys: ["view", "create", "edit"] },
    "Leave Types": { subMenu: "leavepolicymasterleavetypes", opsKeys: ["view", "create", "edit"] },
    "Working Calendar": { subMenu: "leavepolicymasterworkingcalendar", opsKeys: ["view", "create", "edit"] },
    "Attendance Access": { subMenu: "leaveandattendanceattendanceaccess", opsKeys: [] },
    "Leave Management": { subMenu: "leaveandattendanceleavemanagement", opsKeys: [] },
    "Payroll Management": { subMenu: "payrollmanagement", opsKeys: ["view", "create", "edit", "delete"] },
};

const EXTRA_OPS = {
    "Attendance Access": [
        { key: "allowdashboardview", label: "Allow Dashboard View" },
        { key: "allowaddattendance", label: "Allow Add Attendance" },
        { key: "allowoverview", label: "Allow Overview" },
        { key: "allowreports", label: "Allow Reports" },
    ],
    "Leave Management": [
        { key: "allowleavedetails", label: "Allow Leave Details" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Attendance Access": "",
    "Leave Management": "",
};

export default function LeaveConfigPage() {
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
