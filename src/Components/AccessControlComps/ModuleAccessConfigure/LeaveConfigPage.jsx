import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "leave", name: "Leave & Payroll", color: "#7C3AED" };
const PAGES = ["Leave Policy Master", "Leave & Attendance", "Payroll Management"];

// Per-page overrides. Policy Master & Leave/Attendance use only their options (no standard ops).
const PAGE_OVERRIDES = {
    "Leave Policy Master": { opsKeys: [] },
    "Leave & Attendance": { opsKeys: [], approval: true },
};

// Page-specific options. Leave Policy Master is grouped per tab.
const EXTRA_OPS = {
    "Leave Policy Master": [
        { group: "Policy Setup", items: [
            { key: "policySetupView", label: "View" },
            { key: "policySetupCreate", label: "Create" },
            { key: "policySetupEdit", label: "Edit" },
        ] },
        { group: "Leave Types", items: [
            { key: "leaveTypesView", label: "View" },
            { key: "leaveTypesCreate", label: "Create" },
            { key: "leaveTypesEdit", label: "Edit" },
        ] },
        { group: "Working Calendar", items: [
            { key: "workingCalendarView", label: "View" },
            { key: "workingCalendarCreate", label: "Create" },
            { key: "workingCalendarEdit", label: "Edit" },
        ] },
    ],
    "Leave & Attendance": [
        { group: "Attendance Access", items: [
            { key: "dashboardView", label: "Allow Dashboard View" },
            { key: "addAttendance", label: "Allow Add Attendance" },
            { key: "overview", label: "Allow Overview" },
            { key: "reports", label: "Allow Reports" },
        ] },
        { group: "Leave Management", items: [
            { key: "leaveDetails", label: "Allow Leave Details" },
        ] },
    ],
};

// Headings shown above each page's options ("" hides the heading; groups carry their own)
const EXTRA_OPS_LABELS = {
    "Leave Policy Master": "",
    "Leave & Attendance": "",
};

// Custom approval-section wording per page
const APPROVAL_TEXT = {
    "Leave & Attendance": {
        title: "Leave Management — Apply Leave approval",
        subtitle: "Set up level-based approvers for staff leave requests.",
    },
};

export default function LeaveConfigPage() {
    // Add Leave & Payroll-specific validation here if needed.
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
            approvalText={APPROVAL_TEXT}
            approvalNoun="leave request"
        />
    );
}
