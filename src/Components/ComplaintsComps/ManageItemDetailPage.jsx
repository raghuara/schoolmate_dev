import React from "react";
import { useParams } from "react-router-dom";

import ComplaintDetailPage from "./ComplaintDetailPage";
import ActionDetailPage from "./ActionDetailPage";

// The Complaints Management workspace lists both streams, and a row's "View"
// opens whichever detail screen matches. Both live at complaints/manage/:id, so
// this picks by the reference itself:
//
//   MSMS-CMP-2026-00124  → parent complaint  → ComplaintDetailPage
//   MSMS-ACT-2026-0042   → internal action   → ActionDetailPage
//
// Keying off the reference rather than a query param means a pasted deep link
// resolves correctly on its own. Swap for the record's `type` field once the
// workspace is API-backed.
export const isActionRef = (ref = "") => /-ACT-/i.test(ref);

export default function ManageItemDetailPage() {
    const { id } = useParams();
    return isActionRef(id) ? <ActionDetailPage /> : <ComplaintDetailPage />;
}
