/* Communication and Academics are two cards over ONE backend main menu.

   The login response carries a single `communication` mainMenu holding all 16
   subMenus; the split is a display grouping only, exactly as the sidebar already
   does it (see SideBar.jsx COMMUNICATION_SUBMENUS / ACADEMICS_SUBMENUS). Keeping
   the two page lists and the shared overrides here means the two Configure
   screens can never disagree about which half owns a page.

   Every subMenu key below MUST match the backend exactly. */

export const COMMUNICATION_PAGES = [
    "Dashboard",
    "News",
    "Messages",
    "Circulars",
    "Consent Forms",
    "Chats",
    "Contact Details",
    "School Calendar",
    "Events",
    "Birthday Post",
    "Feedback",
    "Notification",
];

export const ACADEMICS_PAGES = [
    "Timetables",
    "Homework",
    "Exam Timetables",
    "Study Materials",
    "Marks",
    "Attendance",
];

export const PAGE_OVERRIDES = {
    "Dashboard": { subMenu: "dashboard", opsKeys: ["view"], approval: false },
    "News": { subMenu: "news", approval: true },
    "Messages": { subMenu: "message", approval: true },
    "Circulars": { subMenu: "circular", approval: true },
    /* Consent Forms has no edit: the consentforms/edit route is commented out in
       Router.js, so a granted edit would point at a screen that does not exist. */
    "Consent Forms": { subMenu: "consentforms", opsKeys: ["view", "create", "delete"], approval: false },
    // Chats is two switches, not a page with operations - see COMMUNICATION_EXTRA_OPS.
    "Chats": { subMenu: "chats", opsKeys: [], approval: false },
    "Contact Details": { subMenu: "contactdetails", approval: false },
    "School Calendar": { subMenu: "schoolcalender", approval: false },
    "Events": { subMenu: "events", opsKeys: ["view"], approval: false },
    "Birthday Post": { subMenu: "birthdaypost", opsKeys: ["view"], approval: false },
    "Feedback": { subMenu: "feedback", approval: false },
    "Notification": { subMenu: "notification", opsKeys: ["create"], approval: false },

    "Timetables": { subMenu: "timetable", approval: false },
    "Homework": { subMenu: "homework", approval: true },
    "Exam Timetables": { subMenu: "examtimetable", approval: false },
    "Study Materials": { subMenu: "studymaterial", approval: false },
    "Marks": { subMenu: "marks", approval: false },
    "Attendance": { subMenu: "attendance", opsKeys: ["view", "create", "edit"], approval: false },
};

/* Chats is a whole feature rather than a record you view and edit, so it carries
   two switches instead of the four operations:
     allowchat        - puts Chats in the Communication sub menu at all
     allowcreategroup - shows "New group" inside it

   Creating a group is meaningless without the screen it lives on, so the second
   requires the first and the shell greys it out until Allow Chat is ticked.

   NEITHER KEY EXISTS IN THE LOGIN RESPONSE YET. The screens that read them treat
   an absent chats submenu as "allowed", so nothing changes until the backend
   publishes them - see SubMenu.jsx and ChatPage.jsx. */
export const COMMUNICATION_EXTRA_OPS = {
    "Chats": [
        { key: "allowchat", label: "Allow Chat" },
        { key: "allowcreategroup", label: "Allow Create Group", requires: "allowchat" },
    ],
};

// "" suppresses the default "Additional permissions" heading - on Chats these
// two switches are the whole page, not an extra on top of something else.
export const COMMUNICATION_EXTRA_OPS_LABELS = {
    "Chats": "",
};

// Events is a tab inside School Calendar, not a page of its own - the calendar
// screen reads both keys and hides the tab without schoolcalender view. Granting
// Events alone would be a permission nobody could ever use.
export const PAGE_REQUIRES = {
    "Events": { page: "School Calendar", key: "view" },
};

const subMenusFor = (pages) => pages.map((page) => PAGE_OVERRIDES[page].subMenu);

export const COMMUNICATION_SUBMENUS = subMenusFor(COMMUNICATION_PAGES);
export const ACADEMICS_SUBMENUS = subMenusFor(ACADEMICS_PAGES);
