// Add Issue (Staff Concern intake) — form options for the School Operations
// issue report. The categories are the same ones the Internal Categories screen
// maintains, so the form can never offer one that has been disabled there.

import { categoryOptionsFor, STAFF_MODULE } from "./complaintCategorySeed";

// { id, name } — the Select shows the name and posts `id` as the API's CategoryId.
export const OPERATIONS_CATEGORIES = categoryOptionsFor(STAFF_MODULE);

// The comp's upload hint. Enforced on the client here; the API is the real gate.
export const ISSUE_ATTACHMENT_MAX_MB = 10;
export const ISSUE_ATTACHMENT_ACCEPT = ".pdf,.png,.jpg,.jpeg";
