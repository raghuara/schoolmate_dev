import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "books", name: "Books & Chapters", color: "#0E7490" };

/* The subMenus `questionpapergeneration` publishes. Add a line to both lists when
   the backend publishes another - question paper itself is the obvious next one. */
const PAGES = ["Books & Chapters", "Pattern"];

// `subMenu` and every permission key MUST match the backend exactly.
const PAGE_OVERRIDES = {
    "Books & Chapters": { subMenu: "bookupload", opsKeys: ["view", "create", "edit", "delete"], approval: false },
    "Pattern": { subMenu: "pattern", opsKeys: ["view", "create", "edit", "delete"], approval: false },
};

export default function BooksConfigPage() {
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
            onSave={handleSave}
        />
    );
}
