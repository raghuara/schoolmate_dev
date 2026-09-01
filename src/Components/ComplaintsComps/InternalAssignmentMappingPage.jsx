import React from "react";
import { useNavigate } from "react-router-dom";

import AssignmentMappingScreen from "./AssignmentMappingScreen";
import { INTERNAL_MODE_STYLES, INTERNAL_MAPPING_COLUMNS } from "./internalAssignmentMappingData";
import { MODULE } from "./complaintsConfigApi";

// Internal (School Operations) mapping. Reached from the "Department & Ownership
// Mapping" tile on the Internal Complaints configuration screen.

const CONFIG_PATH = "/dashboardmenu/complaints/configuration";

export default function InternalAssignmentMappingPage({ embedded = false }) {
    const navigate = useNavigate();

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
            moduleType={MODULE.staff}
            columns={INTERNAL_MAPPING_COLUMNS}
            modeStyles={INTERNAL_MODE_STYLES}
            modeChipWidth={130}
        />
    );
}
