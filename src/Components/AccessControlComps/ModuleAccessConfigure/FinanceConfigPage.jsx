import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "finance", name: "Fee & Finance", color: "#EA580C" };
const PAGES = [
    "Finance Dashboard",
    "Billing Screen",
    "ECA Management",
    "Additional Fee Management",
    "Expense",
    "Concession Log",
    "Create Fees Structure",
];

// `subMenu` + all permission keys MUST match the backend exactly.
const PAGE_OVERRIDES = {
    "Finance Dashboard": { subMenu: "financedashboard", opsKeys: ["view"] },
    "Billing Screen": { subMenu: "billingscreen", opsKeys: [] },
    "ECA Management": { subMenu: "ecamanagement", opsKeys: [] },
    "Additional Fee Management": { subMenu: "additionalfeemanagement", opsKeys: [] },
    "Expense": { subMenu: "expense", opsKeys: [] },
    "Concession Log": { subMenu: "concessionlog", opsKeys: ["view"] },
    "Create Fees Structure": { subMenu: "createfeesstructure", opsKeys: ["view", "create", "edit"] },
};

const EXTRA_OPS = {
    "Finance Dashboard": [
        { key: "sendremindertodefaulters", label: "Send Reminder to Defaulters" },
        { key: "allowreporttab", label: "Allow Report Tab" },
    ],
    "Billing Screen": [
        { key: "allowbilling", label: "Allow Billing" },
        { key: "allowconcession", label: "Allow Concession", requires: "allowbilling" },
    ],
    "ECA Management": [
        { key: "allowmapstudent", label: "Allow Map Student" },
        { key: "editstudent", label: "Edit Student" },
    ],
    "Additional Fee Management": [
        { key: "allowmapstudent", label: "Allow Map Student" },
        { key: "editstudent", label: "Edit Student" },
    ],
    "Expense": [
        { key: "viewdashboard", label: "View Dashboard" },
        { key: "viewhistory", label: "View History" },
        { key: "allowaddbudget", label: "Allow Add Budget" },
        { key: "allowaddexpense", label: "Allow Add Expense" },
    ],
};

const EXTRA_OPS_LABELS = {
    "Finance Dashboard": "Dashboard Access",
    "Billing Screen": "Billing Access",
    "ECA Management": "Student Access",
    "Additional Fee Management": "Student Access",
    "Expense": "Expense Access",
};

export default function FinanceConfigPage() {
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
