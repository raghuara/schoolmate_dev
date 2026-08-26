/**
 * The acting user, attached to every request in this module.
 *
 * The API gained a third auth layer on 25 Aug 2026: alongside the static bearer token and
 * the roll number that write endpoints already carried, reads now resolve permissions from
 * `requestedByRollNumber`. Without it the server answers 200 with
 *
 *   { error: true, code: "FEATURE_PERMISSION_DENIED",
 *     message: "requestedByRollNumber is required for feature permission validation." }
 *
 * which normalisers read as "no data" rather than as a failure — so a screen silently shows
 * an empty state instead of an error. That is what made the Apply Leave type picker report
 * "no leave types are configured" while the master held one.
 *
 * 12 of the 22 endpoints this module calls require it and 10 do not, with no pattern to the
 * split, so it is attached to everything: the server ignores it where it is not needed, and
 * an endpoint that starts requiring it later needs no further change here.
 */

/* redux-persist stores each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Everything is guarded — a private window or cleared storage throws on
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
 * A caller that already set `requestedByRollNumber` explicitly keeps its own value — this
 * only fills the gap. Query params carry it on GET/DELETE; the body carries it otherwise,
 * including multipart, which leave-apply uses because it may attach a document.
 */
export const withActor = (client) => {
    client.interceptors.request.use((config) => {
        const rollNumber = currentRollNumber();
        if (!rollNumber) return config;

        const method = String(config.method || "get").toLowerCase();

        if (method === "get" || method === "delete") {
            config.params = { requestedByRollNumber: rollNumber, ...(config.params || {}) };
            return config;
        }

        if (config.data instanceof FormData) {
            if (!config.data.has("requestedByRollNumber")) {
                config.data.append("requestedByRollNumber", rollNumber);
            }
            return config;
        }

        if (config.data && typeof config.data === "object") {
            config.data = { requestedByRollNumber: rollNumber, ...config.data };
        } else if (!config.data) {
            config.data = { requestedByRollNumber: rollNumber };
        }
        // a string body is already serialised — leave it alone rather than risk corrupting it
        return config;
    });
    return client;
};
