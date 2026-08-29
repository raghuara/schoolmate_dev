/**
 * The acting user, attached to every request the app sends to the school API.
 *
 * WHY THIS EXISTS
 * The API's feature-permission layer resolves who is calling from a roll number in the
 * request itself - the bearer token is static and identifies the app, not the person.
 * A call that omits it comes back as a permission failure rather than data:
 *
 *   { error: true, code: "FEATURE_PERMISSION_DENIED",
 *     message: "requestedByRollNumber is required for feature permission validation." }
 *   { error: true,
 *     message: "CreatorRollNumber is required for feature permission validation." }
 *
 * Most readers treat that shape as "no rows" rather than as an error, so the screen shows
 * an empty state instead of saying anything is wrong - which is what made Apply Leave
 * report "no leave types are configured" while the master held one.
 *
 * TWO NAMES, SENT TOGETHER
 * The API names the actor two ways and the split does not follow the controller:
 * staffManagement/GetStaffInformation demands `requestedByRollNumber` while
 * staffManagement/FindStaffManagementDetails demands `creatorRollNumber`, and
 * studentManagement wants `creatorRollNumber` throughout. Guessing per path was wrong
 * for whichever endpoint broke the pattern, and sending the wrong name is worse than
 * sending none - FindStaffManagementDetails falls back to the *target* roll number as
 * the actor and denies on that user's permissions.
 *
 * So both names go on every request. Each endpoint reads the one it wants and ignores
 * the other, which is verified against GetStudentsInformation,
 * FindStudentManagementDetails, GetStaffInformation and FindStaffManagementDetails.
 *
 * WHY ON EVERY REQUEST
 * The endpoints that require it and the ones that ignore it are mixed together with no
 * pattern, and the list grows. The server ignores the extra field where it is not needed,
 * so attaching it everywhere is both correct today and stable as more endpoints start
 * demanding it. A call site that sets a key itself keeps its own value when it has one.
 */

/* Only the school API gets the actor - anything else the app fetches is left untouched. */
const API_HOSTS = ["schoolcommunicationwebapimsmsuat-dredbbfmhzergfhw.canadacentral-01.azurewebsites.net"];

/* Both names the feature-permission layer accepts. */
export const ACTOR_KEYS = ["creatorRollNumber", "requestedByRollNumber"];

/* An empty string counts as missing - the server rejects a blank actor the same way. */
const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const isApiRequest = (url = "") => {
    const target = String(url);
    // a relative URL can only be our own origin, which is the API in dev proxying
    if (!/^https?:\/\//i.test(target)) return true;
    return API_HOSTS.some((host) => target.includes(host));
};

/* redux-persist stores each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Everything is guarded - a private window or cleared storage throws on
   access, and a request without the actor is better than a page that will not render. */
export const currentRollNumber = () => {
    try {
        const raw = localStorage.getItem("persist:auth");
        if (!raw) return "";
        const stored = JSON.parse(raw).rollNumber;
        if (!stored) return "";
        // the field is itself a JSON string: "\"MSMS310\""
        const value = typeof stored === "string" && stored.startsWith('"') ? JSON.parse(stored) : stored;
        return String(value || "");
    } catch {
        return "";
    }
};

/**
 * Attaches the actor to an axios instance.
 *
 * Query params carry it on GET/DELETE; the body carries it otherwise, including multipart,
 * which the create/upload screens use because they may attach a file.
 *
 * A caller that set a key itself keeps its own value, but only when that value is real.
 * Screens read the roll number from Redux, which is an empty string until redux-persist
 * rehydrates, so an early call sends "creatorRollNumber=" - present but blank, which the
 * server rejects exactly as if it were missing. Treating blank as absent lets the value
 * from storage fill in, and storage is readable before React has mounted.
 */
export const withActor = (client) => {
    client.interceptors.request.use((config) => {
        const rollNumber = currentRollNumber();
        const url = config.url || "";
        if (!rollNumber || !isApiRequest(url)) return config;

        const method = String(config.method || "get").toLowerCase();

        if (method === "get" || method === "delete") {
            const params = { ...(config.params || {}) };
            ACTOR_KEYS.forEach((key) => {
                if (!hasValue(params[key])) params[key] = rollNumber;
            });
            config.params = params;
            return config;
        }

        if (config.data instanceof FormData) {
            ACTOR_KEYS.forEach((key) => {
                if (!hasValue(config.data.get(key))) {
                    config.data.delete(key);
                    config.data.append(key, rollNumber);
                }
            });
            return config;
        }

        if (config.data && typeof config.data === "object") {
            const data = { ...config.data };
            ACTOR_KEYS.forEach((key) => {
                if (!hasValue(data[key])) data[key] = rollNumber;
            });
            config.data = data;
        } else if (!config.data) {
            config.data = ACTOR_KEYS.reduce((acc, key) => ({ ...acc, [key]: rollNumber }), {});
        }
        // a string body is already serialised - leave it alone rather than risk corrupting it
        return config;
    });
    return client;
};
