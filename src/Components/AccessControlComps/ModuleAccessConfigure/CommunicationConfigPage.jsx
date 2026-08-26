import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

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

// `subMenu` values MUST match the backend permission keys exactly.
const PAGE_OVERRIDES = {
    "Dashboard": { subMenu: "dashboard", opsKeys: ["view"], approval: false },
    "News": { subMenu: "news", approval: true },
    "Messages": { subMenu: "message", approval: true },
    "Circulars": { subMenu: "circular", approval: true },
    "Contact Details": { subMenu: "contactdetails", approval: false },
    "Timetables": { subMenu: "timetable", approval: false },
    "Homework": { subMenu: "homework", approval: true },
    "Exam Timetables": { subMenu: "examtimetable", approval: false },
    "Study Materials": { subMenu: "studymaterial", approval: false },
    "Marks": { subMenu: "marks", approval: false },
    "School Calendar": { subMenu: "schoolcalender", approval: false },
    "Events": { subMenu: "events", opsKeys: ["view"], approval: false },
    "Birthday Post": { subMenu: "birthdaypost", opsKeys: ["view"], approval: false },
    "Feedback": { subMenu: "feedback", approval: false },
    "Attendance": { subMenu: "attendance", opsKeys: ["view", "create", "edit"], approval: false },
    "Notification": { subMenu: "notification", opsKeys: ["create"], approval: false },
};

// Events is a tab inside School Calendar, not a page of its own - the calendar
// screen reads both keys and hides the tab without schoolcalender view. Granting
// Events alone would be a permission nobody could ever use.
const PAGE_REQUIRES = {
    "Events": { page: "School Calendar", key: "view" },
};

export default function CommunicationConfigPage() {
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
            approval={true}
            validate={validate}
            pageOverrides={PAGE_OVERRIDES}
            pageRequires={PAGE_REQUIRES}
            onSave={handleSave}
        />
    );
}
