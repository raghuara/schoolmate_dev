/* Question paper generation, as one band inside the Academics card.

   It spans TWO backend main menus - `questionpapergeneration` (books, patterns,
   the paper wizard) and `patterndiscovery` (the AI that reads past papers) - so
   every page names its own mainMenu and the config shell splits the save.

   Every subMenu and permission key below MUST match the backend exactly. The
   four core operations are the ones the endpoints already gate on; the extra
   keys are the ones that still have to be added - see the JSON handed to the
   backend team.

   Two rules decide which operations a page offers, and both are about honesty:
   an operation is listed only when a screen actually performs it, and an action
   that a different person signs off gets a key of its own instead of hiding
   inside `edit`. */

export const QUESTION_PAPER_PAGES = [
    "Books & Chapters",
    "Patterns",
    "Create Question Paper",
    "AI Pattern Discovery",
    "Discovered Patterns",
];

export const QUESTION_PAPER_OVERRIDES = {
    "Books & Chapters": {
        mainMenu: "questionpapergeneration",
        subMenu: "bookupload",
        opsKeys: ["view", "create", "edit", "delete"],
        approval: false,
    },
    "Patterns": {
        mainMenu: "questionpapergeneration",
        subMenu: "pattern",
        opsKeys: ["view", "create", "edit", "delete"],
        approval: false,
    },
    "Create Question Paper": {
        mainMenu: "questionpapergeneration",
        subMenu: "paper",
        opsKeys: ["view", "create", "edit", "delete"],
        approval: false,
    },
    "AI Pattern Discovery": {
        mainMenu: "patterndiscovery",
        subMenu: "batch",
        opsKeys: ["view", "create", "edit", "delete"],
        approval: false,
    },
    "Discovered Patterns": {
        mainMenu: "patterndiscovery",
        subMenu: "pattern",
        /* No Create and no Delete on purpose. A discovered pattern is never
           written by hand - the AI is the only thing that makes one - and
           rejecting one keeps every source question for audit, so nothing here
           deletes either. Offering the two keys would grant something no screen
           can do. */
        opsKeys: ["view", "edit"],
        approval: false,
    },
};

/* Sign-off actions. Each one is a decision somebody senior makes about work
   somebody else did, which is exactly why it cannot live inside `edit`: a
   teacher who may fix a book's subject is not automatically the person who
   signs off the chapter split every future paper is built from. */
export const QUESTION_PAPER_EXTRA_OPS = {
    "Books & Chapters": [
        {
            key: "allowconfirmchapters",
            label: "Review & confirm chapters",
        },
    ],
    "Create Question Paper": [
        {
            key: "allowregeneratequestion",
            label: "Rewrite a question with AI",
        },
    ],
    "Discovered Patterns": [
        {
            key: "allowconfirmpattern",
            label: "Confirm or reject a pattern",
        },
    ],
};

export const QUESTION_PAPER_EXTRA_OPS_LABELS = {
    "Books & Chapters": "Sign-off",
    "Create Question Paper": "Costs money per use",
    "Discovered Patterns": "Sign-off",
};

/* A paper is built FROM a book and a pattern. Granting the wizard without at
   least View on both leaves a teacher on a step with an empty picker and no way
   to fix it, so the two are required rather than merely recommended. */
export const QUESTION_PAPER_REQUIRES = {
    "Create Question Paper": [
        { page: "Books & Chapters", key: "view" },
        { page: "Patterns", key: "view" },
    ],
    "Discovered Patterns": [
        { page: "AI Pattern Discovery", key: "view" },
    ],
};

export const QUESTION_PAPER_GROUP = {
    title: "Question Paper",
    subtitle: "Books, patterns and the paper builder. A paper needs a book and a pattern, so the wizard stays locked until both can at least be seen.",
    pages: QUESTION_PAPER_PAGES,
};

/* Grouped the way the backend stores them, for the card counts on Feature
   Permissions and for anything else that has to know which menus this band
   writes to. */
export const QUESTION_PAPER_SUBMENUS = QUESTION_PAPER_PAGES.reduce((map, page) => {
    const { mainMenu, subMenu } = QUESTION_PAPER_OVERRIDES[page];
    return { ...map, [mainMenu]: [...(map[mainMenu] || []), subMenu] };
}, {});
