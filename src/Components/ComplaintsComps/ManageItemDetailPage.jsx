import React from "react";
import { useParams } from "react-router-dom";

import ComplaintDetailPage from "./ComplaintDetailPage";
import ActionDetailPage from "./ActionDetailPage";

// The Complaints Management workspace lists both streams, and a row's "View"
// opens whichever detail screen matches. Both live at complaints/manage/:id, so
// this picks by the token itself:
//
//   MSMS-CMP-2026-000001  → parent complaint  → ComplaintDetailPage
//   MSMS-IES-2026-000001  → internal (IES)    → ActionDetailPage
//
// IES is the agreed segment for the internal stream. The intake API currently
// issues MSMS-ACT- for staff concerns, so both are accepted: a link minted before
// the server switches must keep resolving afterwards, and the two segments are
// unambiguous — no parent token can contain either.
//
// Keying off the token rather than a query param means a pasted deep link resolves
// on its own. Swap for the record's `type` field once the workspace is API-backed.
export const ACTION_REF_SEGMENTS = ["-IES-", "-ACT-"];

export const isActionRef = (ref = "") => /-(?:IES|ACT)-/i.test(ref);

export default function ManageItemDetailPage() {
    const { id } = useParams();
    return isActionRef(id) ? <ActionDetailPage /> : <ComplaintDetailPage />;
}
