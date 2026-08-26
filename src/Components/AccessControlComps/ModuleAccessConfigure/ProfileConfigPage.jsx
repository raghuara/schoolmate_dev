import React from "react";
import axios from "axios";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";

const TOKEN = "123";

const MODULE = { key: "profile", name: "Profile Management", color: "#DB2777" };
const PAGES = ["Student Management", "Staff Management"];

// Keys MUST match the backend permission keys exactly.
const EXTRA_OPS = {
    "Student Management": [{ key: "siblingapproval", label: "Merge Siblings" }],
};

export default function ProfileConfigPage() {
    const validate = () => null;

    // The shell builds the payload and hands it here; this page owns the PUT.
    const handleSave = async (payload) => {
        const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
        return res?.data; // shell reads { error?, message? } to show the snackbar
    };

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={PAGES}
            opsKeys={["view", "create", "edit"]}
            approval={false}
            validate={validate}
            extraOps={EXTRA_OPS}
            onSave={handleSave}
        />
    );
}
