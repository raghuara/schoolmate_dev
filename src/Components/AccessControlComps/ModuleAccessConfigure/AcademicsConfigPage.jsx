import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";
import {
    ACADEMICS_PAGES,
    COMMUNICATION_SUBMENUS,
    PAGE_OVERRIDES,
} from "./communicationGroups";
import {
    QUESTION_PAPER_PAGES,
    QUESTION_PAPER_OVERRIDES,
    QUESTION_PAPER_EXTRA_OPS,
    QUESTION_PAPER_EXTRA_OPS_LABELS,
    QUESTION_PAPER_REQUIRES,
    QUESTION_PAPER_GROUP,
} from "./questionPaperGroups";

const TOKEN = "123";

/* Academics has no main menu of its own - it edits the teaching half of the
   `communication` main menu. FeaturePermissionsPage passes that key through
   route state, so the shell writes to `communication` either way.

   Question paper generation is grouped in here too, even though its pages sit
   under `questionpapergeneration` and `patterndiscovery`: books, patterns and
   the paper builder are academic work, and having them as a separate module
   card meant granting a teacher the wizard on one screen and the books it needs
   on another. Each page carries its own mainMenu and the shell splits the save
   between the three. */
const MODULE = { key: "academics", name: "Academics", color: "#7C3AED" };

const TEACHING_GROUP = {
    title: "Teaching & Classwork",
    subtitle: "The day to day - what a class is given, what it is marked on, and who was there.",
    pages: ACADEMICS_PAGES,
};

const PAGES = [...ACADEMICS_PAGES, ...QUESTION_PAPER_PAGES];

const OVERRIDES = { ...PAGE_OVERRIDES, ...QUESTION_PAPER_OVERRIDES };

export default function AcademicsConfigPage() {
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
            pageOverrides={OVERRIDES}
            pageGroups={[TEACHING_GROUP, QUESTION_PAPER_GROUP]}
            extraOps={QUESTION_PAPER_EXTRA_OPS}
            extraOpsLabels={QUESTION_PAPER_EXTRA_OPS_LABELS}
            pageRequires={QUESTION_PAPER_REQUIRES}
            // Communication edits the other half of the `communication` main menu.
            preserveSubMenus={COMMUNICATION_SUBMENUS}
            onSave={handleSave}
        />
    );
}
