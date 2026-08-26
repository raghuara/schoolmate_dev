import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AssignmentMappingScreen from "./AssignmentMappingScreen";
import { CATEGORY_ROWS } from "./complaintCategoriesData";
import { ASSIGNMENT_MAPPINGS, MODE_STYLES, COLUMNS } from "./assignmentMappingData";

// Parent-side mapping. Reached from the "Assignment Mapping" tile on the
// Complaint Configuration screen.

const CONFIG_PATH = "/dashboardmenu/complaints/configuration";

export default function AssignmentMappingPage() {
    const navigate = useNavigate();

    const categories = useMemo(
        () => CATEGORY_ROWS.filter((c) => c.status === "ACTIVE").map((c) => c.name),
        [],
    );

    return (
        <AssignmentMappingScreen
            trail={[
                { label: "Administration", onClick: () => navigate(CONFIG_PATH) },
                { label: "Complaint Configuration", onClick: () => navigate(CONFIG_PATH) },
                { label: "Assignment Mapping" },
            ]}
            title="Complaint Assignment Mapping"
            subtitle="Define which role and staff member should normally handle each complaint category."
            initialRows={ASSIGNMENT_MAPPINGS}
            columns={COLUMNS}
            categories={categories}
            modeStyles={MODE_STYLES}
            modeChipWidth={120}
        />
    );
}
