import React from "react";
import ModuleConfigShell from "./ModuleConfigShell";

const MODULE = { key: "communication", name: "Communication", color: "#2563EB" };
const PAGES = [
    "Dashboard",
    "News",
    "Messages",
    "Circulars",
    "Contact Details",
    "Timetables",
    "Homework",
    "Exam Timetables",
    "Study Materials",
    "Marks",
    "School Calendar",
    "Events",
    "Birthday Post",
    "Feedback",
    "Attendance",
    "Notification",
];

// Per-page overrides. By default a page has all ops + approval; only the exceptions are listed.
const PAGE_OVERRIDES = {
    "Dashboard": { opsKeys: ["view"], approval: false },
    "Contact Details": { approval: false },
    "Timetables": { approval: false },
    "Exam Timetables": { approval: false },
    "Study Materials": { approval: false },
    "Marks": { approval: false },
    "School Calendar": { approval: false },
    "Events": { approval: false },
    "Birthday Post": { opsKeys: ["view"], approval: false },
    "Feedback": { approval: false },
    "Attendance": { opsKeys: ["view", "create", "edit"], approval: false },
    "Notification": { opsKeys: ["create"], approval: false },
};

export default function CommunicationConfigPage() {
    // Add Communication-specific validation here if needed.
    const validate = () => null;

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit", "delete"]}
            approval={true}
            validate={validate}
            pageOverrides={PAGE_OVERRIDES}
        />
    );
}
