import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AssignmentMappingScreen from "./AssignmentMappingScreen";
import { INTERNAL_CATEGORY_ROWS } from "./internalCategoriesData";
import {
    INTERNAL_ASSIGNMENT_MAPPINGS,
    INTERNAL_MODE_STYLES,
    INTERNAL_MAPPING_COLUMNS,
} from "./internalAssignmentMappingData";

// Internal (School Operations) mapping. Reached from the "Department & Ownership
// Mapping" tile on the Internal Complaints configuration screen.

const CONFIG_PATH = "/dashboardmenu/complaints/configuration";

export default function InternalAssignmentMappingPage({ embedded = false }) {
    const navigate = useNavigate();

    const categories = useMemo(
        () => INTERNAL_CATEGORY_ROWS.filter((c) => c.status === "ACTIVE").map((c) => c.name),
        [],
    );

    return (
        <AssignmentMappingScreen
            embedded={embedded}
            trail={[
                { label: "School Operations", onClick: () => navigate(CONFIG_PATH) },
                { label: "Configuration", onClick: () => navigate(CONFIG_PATH) },
                { label: "Assignment Mapping" },
            ]}
            title="Internal Complaints Assignment Mapping"
            subtitle="Define how School Operations entries are assigned to eligible users."
            initialRows={INTERNAL_ASSIGNMENT_MAPPINGS}
            columns={INTERNAL_MAPPING_COLUMNS}
            categories={categories}
            modeStyles={INTERNAL_MODE_STYLES}
            modeChipWidth={130}
        />
    );
}
