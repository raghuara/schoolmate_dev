import React from "react";
import { useNavigate } from "react-router-dom";

import SlaConfigurationScreen from "./SlaConfigurationScreen";
import {
    INTERNAL_SLA_RULES,
    INTERNAL_WORKING_RULES,
    INTERNAL_PAUSE_TOGGLES,
} from "./internalSlaConfigData";

// Internal (School Operations) SLA settings. Reached from the "SLA Configuration"
// tile on the Internal Complaints configuration screen.

const CONFIG_PATH = "/dashboardmenu/complaints/configuration";

// The comp tints the current crumb #997821 — a darker gold than the accent, so it
// stays readable as a label rather than reading like a button.
const CURRENT_CRUMB = "#997821";

export default function InternalSlaConfigurationPage({ embedded = false }) {
    const navigate = useNavigate();

    return (
        <SlaConfigurationScreen
            embedded={embedded}
            trail={[
                { label: "Administration", onClick: () => navigate(CONFIG_PATH) },
                { label: "School Operations", onClick: () => navigate(CONFIG_PATH) },
                { label: "SLA Configuration" },
            ]}
            currentCrumbColor={CURRENT_CRUMB}
            title="Internal Complaints SLA Configuration"
            subtitle="Configure acknowledgement, assignment, response and resolution timelines for school operation entries."
            initialRules={INTERNAL_SLA_RULES}
            initialWorking={INTERNAL_WORKING_RULES}
            pauseToggles={INTERNAL_PAUSE_TOGGLES}
            showReset
        />
    );
}
