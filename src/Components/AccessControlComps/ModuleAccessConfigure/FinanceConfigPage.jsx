import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "finance", name: "Fee & Finance", color: "#EA580C" };
const PAGES = [
    "Finance Dashboard",
    "Billing Screen",
    "ECA Management",
    "Additional Fee Management",
    "Expense",
    "Concession Log",
    "Create Fee Structure",
];

// Per-page overrides. Dashboard is view-only; the rest use the module defaults.
const PAGE_OVERRIDES = {
    "Finance Dashboard": { opsKeys: [] },
    "Billing Screen": { opsKeys: [] },
    "ECA Management": { opsKeys: [] },
    "Additional Fee Management": { opsKeys: [] },
    "Expense": { opsKeys: [], approval: true },
    "Concession Log": { opsKeys: ["view"] },
    "Create Fee Structure": { opsKeys: ["view", "create", "edit"], approval: true },
};

// Page-specific extra permissions beyond the standard operations
const EXTRA_OPS = {
    "Finance Dashboard": [
        { key: "view", label: "View" },
        { key: "sendReminder", label: "Send Reminder to Defaulters" },
        { key: "allowReportTab", label: "Allow Report Tab" },
    ],
    "Billing Screen": [
        { key: "allowBilling", label: "Allow Billing" },
        { key: "allowConcession", label: "Allow Concession" },
    ],
    "ECA Management": [
        { key: "allowMapStudent", label: "Allow Map Student" },
        { key: "editStudent", label: "Edit Student" },
    ],
    "Additional Fee Management": [
        { key: "allowMapStudent", label: "Allow Map Student" },
        { key: "editStudent", label: "Edit Student" },
    ],
    "Expense": [
        { key: "viewDashboard", label: "View Dashboard" },
        { key: "viewHistory", label: "View History" },
        { key: "allowAddBudget", label: "Allow Add Budget" },
        { key: "allowAddExpense", label: "Allow Add Expense" },
    ],
};

// Headings shown above each page's options (defaults to "Additional permissions")
const EXTRA_OPS_LABELS = {
    "Finance Dashboard": "Dashboard Access",
    "Billing Screen": "Billing Access",
    "ECA Management": "Student Access",
    "Additional Fee Management": "Student Access",
    "Expense": "Expense Access",
};

export default function FinanceConfigPage() {
    // Add Finance-specific validation here if needed.
    const validate = () => null;

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
        />
    );
}
