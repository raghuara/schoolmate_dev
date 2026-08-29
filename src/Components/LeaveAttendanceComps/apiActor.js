/**
 * Moved to src/Api/apiActor.js.
 *
 * This module's clients were the first to need the acting user, but every other module
 * needs it too, so the helper now lives with the API layer and is installed on the
 * default axios instance at startup. Re-exported here so the three api/*.js wrappers
 * and leaveAxios.js keep working unchanged.
 */
export { withActor, currentRollNumber, ACTOR_KEYS } from "../../Api/apiActor";
