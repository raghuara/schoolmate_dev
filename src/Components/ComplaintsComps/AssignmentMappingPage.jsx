import React from "react";
import { useNavigate } from "react-router-dom";

import AssignmentMappingScreen from "./AssignmentMappingScreen";
import { MODE_STYLES, COLUMNS } from "./assignmentMappingData";
import { MODULE } from "./complaintsConfigApi";

// Parent-side mapping. Reached from the "Assignment Mapping" tile on the
// Complaint Configuration screen.

const CONFIG_PATH = "/dashboardmenu/complaints/configuration";

export default function AssignmentMappingPage({ embedded = false }) {
    const navigate = useNavigate();

    return (
        <AssignmentMappingScreen
            embedded={embedded}
            trail={[
                { label: "Administration", onClick: () => navigate(CONFIG_PATH) },
                { label: "Complaint Configuration", onClick: () => navigate(CONFIG_PATH) },
                { label: "Assignment Mapping" },
            ]}
            title="Complaint Assignment Mapping"
            subtitle="Define which role and staff member should normally handle each complaint category."
            moduleType={MODULE.parent}
            columns={COLUMNS}
            modeStyles={MODE_STYLES}
            modeChipWidth={120}
        />
    );
}
