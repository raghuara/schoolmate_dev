import axios from "axios";

import { withActor } from "./apiActor";

/**
 * The axios instance the screens in this module talk to the API through.
 *
 * WHY THIS EXISTS
 * The API's feature-permission layer (25 Aug 2026) resolves the caller from
 * `requestedByRollNumber`. Without it every endpoint this module reads answers 400:
 *
 *   { error: true,
 *     message: "requestedByRollNumber is required for feature permission validation.",
 *     requiredAccess: { mainMenu: "leaveandpayroll", subMenu: "policysetup", … } }
 *
 * The three api/*.js wrappers already send it — each builds its own withActor client
 * (see leavePolicyApi.js / payrollApi.js / leaveAttendanceApi.js). The screens that call
 * axios directly did not, so all of their loads failed: "Failed to load leave types",
 * "Failed to load existing leave policy", "Failed to load salary structures", and the
 * rest of the module's error snackbars.
 *
 * Importing this as `axios` gives those call sites the actor without touching any of
 * them — the interceptor puts it in the query string on GET/DELETE and in the body
 * otherwise, and a call that already sets `requestedByRollNumber` keeps its own value.
 * See apiActor.js for why it goes on every request rather than a chosen subset.
 *
 * Per-call headers still work exactly as before; this adds the actor and nothing else.
 */
export default withActor(axios.create());
