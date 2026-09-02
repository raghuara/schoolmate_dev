import axios from "axios";

import {
    PostComplaintAcknowledge,
    PostComplaintStatus,
    PostComplaintNote,
    PostComplaintRequestInformation,
    PostComplaintAssign,
    PostComplaintEscalate,
    PostComplaintManagementReopen,
    PostComplaintReviewResolution,
    PostComplaintClose,
    PostComplaintDuplicate,
    PostComplaintParticipants,
} from "../../Api/Api";

/**
 * The staff and management actions on a complaint (modules 06 and 07).
 *
 * EVERY ONE OF THESE CHANGES SERVER STATE
 * Each call moves the complaint's status, ownership or escalation level and writes a
 * timeline entry. None of them return the updated complaint, so a caller must RELOAD the
 * detail afterwards rather than patching its own copy — the new status, and which actions
 * the server will then allow, are the server's to decide, and the timeline entry only
 * appears on a re-read.
 *
 * WHO THE ACTOR IS
 * `actorRollNumber` is the signed-in staff member. It is recorded as the person who took
 * the action and printed on the timeline, so it is read from the session and never passed
 * in by a caller.
 */

const API_TOKEN = "123";
const REQUEST_TIMEOUT_MS = 45000;

const client = axios.create({
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    timeout: REQUEST_TIMEOUT_MS,
});

/* redux-persist keeps each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Guarded — a private window throws on access. */
const actorRollNumber = () => {
    try {
        const raw = localStorage.getItem("persist:auth");
        if (!raw) return "";
        const stored = JSON.parse(raw).rollNumber;
        if (!stored) return "";
        const value = typeof stored === "string" && stored.startsWith('"') ? JSON.parse(stored) : stored;
        return String(value || "");
    } catch {
        return "";
    }
};

const messageOf = (error, fallback) => {
    if (!error?.response) {
        if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
            return "The server took too long to respond. Check whether the action went through before retrying.";
        }
        if (error?.code === "ERR_NETWORK") {
            return "Could not reach the server. Check the connection and try again.";
        }
    }
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    /* ASP.NET model-validation problems arrive as { errors: { field: [msg] } } rather than
       the API's own envelope, and carry the useful detail — which field was rejected. */
    if (data?.errors && typeof data.errors === "object") {
        const first = Object.values(data.errors).flat()[0];
        if (first) return String(first);
    }
    return error?.message || fallback;
};

/**
 * One POST. `payload` is merged over the actor and token every action shares.
 *
 * A 404 here means the ROUTE is missing, not the complaint — the caller reached this screen
 * by loading that complaint successfully, so it still exists. The detail and timeline routes
 * moved once already (their query-string forms now answer "ComplaintToken was not found"),
 * so this is worth telling apart rather than reporting as a bad token.
 */
const post = async (url, complaintToken, payload, fallback) => {
    try {
        const res = await client.post(url, {
            actorRollNumber: actorRollNumber(),
            complaintToken,
            ...payload,
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, body: res?.data ?? {}, message: res?.data?.message || "" };
    } catch (error) {
        if (error?.response?.status === 404) {
            return {
                ok: false,
                routeMissing: true,
                message: "This action is not available on the server.",
            };
        }
        return { ok: false, message: messageOf(error, fallback) };
    }
};

/* ─────────────── Staff actions ─────────────── */

/** Take ownership of a complaint that is sitting unacknowledged. */
export const acknowledgeComplaint = async ({ complaintToken }) =>
    post(PostComplaintAcknowledge, complaintToken, {}, "Could not acknowledge the complaint");

/**
 * Move the complaint to a new status.
 *
 * `staffResponse` is the internal record; `parentMessage` is what the parent is shown. They
 * are separate fields on purpose — sending the internal wording as the parent message would
 * publish notes never meant to leave the school.
 */
export const updateComplaintStatus = async ({
    complaintToken,
    status,
    staffResponse = "",
    parentMessage = "",
}) =>
    post(
        PostComplaintStatus,
        complaintToken,
        { status, staffResponse, parentMessage },
        "Could not update the status",
    );

/* Who can see a note, and what kind it is. The API's own wording. */
export const NOTE_VISIBILITY = ["Internal", "Parent"];
export const NOTE_TYPES = ["Progress", "General", "Escalation"];

/** Add a note. Defaults to Internal — the safer of the two if a caller omits it. */
export const addComplaintNote = async ({
    complaintToken,
    note,
    visibility = "Internal",
    noteType = "Progress",
}) => post(PostComplaintNote, complaintToken, { note, visibility, noteType }, "Could not add the note");

/**
 * Ask the parent for more detail.
 * `responseDueOnUtc` is nullable — null means no deadline, which is what the collection sends.
 */
export const requestParentInformation = async ({
    complaintToken,
    requestMessage,
    responseDueOnUtc = null,
}) =>
    post(
        PostComplaintRequestInformation,
        complaintToken,
        { requestMessage, responseDueOnUtc },
        "Could not send the request",
    );

/* Filing a resolution (POST /resolution) is deliberately absent. Staff submit the
   root-cause/action/evidence form on MOBILE — the backend team confirmed it is not a
   website flow, despite the 06/07 mapping listing it for both platforms. That mapping
   lists EVERY endpoint for both, so its platform column cannot tell them apart.

   Review and close stay here: management reviews on the website what staff filed on
   mobile, which is why reviewResolution takes a resolutionId it never creates. */

/* ─────────────── Management actions ─────────────── */

/** Reassign. `ownerRole` is the role's NAME, as the assignment mappings record it. */
export const assignComplaint = async ({ complaintToken, ownerRollNumber, ownerRole = "", reason = "" }) =>
    post(
        PostComplaintAssign,
        complaintToken,
        { ownerRollNumber, ownerRole, reason },
        "Could not reassign the complaint",
    );

/* Manual is what a person clicking Escalate is doing; the automatic levels are raised by
   the escalation rules server-side, which is where "AutoEscalated" timeline entries come
   from. */
export const ESCALATION_TRIGGER = { manual: "Manual", auto: "Auto" };

export const escalateComplaint = async ({
    complaintToken,
    targetLevel,
    triggerType = ESCALATION_TRIGGER.manual,
    reason = "",
}) =>
    post(
        PostComplaintEscalate,
        complaintToken,
        { targetLevel, triggerType, reason },
        "Could not escalate the complaint",
    );

/** Reopen from the management side — distinct from the parent's own /parent/reopen. */
export const managementReopen = async ({ complaintToken, reason }) =>
    post(PostComplaintManagementReopen, complaintToken, { reason }, "Could not reopen the complaint");

export const REVIEW_DECISIONS = ["Approve", "Reject"];

/** Approve or reject a filed resolution. */
export const reviewResolution = async ({ complaintToken, resolutionId, decision, reviewNotes = "" }) =>
    post(
        PostComplaintReviewResolution,
        complaintToken,
        { resolutionId: String(resolutionId ?? ""), decision, reviewNotes },
        "Could not record the review",
    );

export const closeComplaint = async ({ complaintToken, closureNotes = "" }) =>
    post(PostComplaintClose, complaintToken, { closureNotes }, "Could not close the complaint");

/** Mark this complaint as a duplicate of an earlier one, which stays the live record. */
export const markDuplicate = async ({ complaintToken, originalComplaintToken, reason = "" }) =>
    post(
        PostComplaintDuplicate,
        complaintToken,
        { originalComplaintToken, reason },
        "Could not mark it as a duplicate",
    );

export const PARTICIPANT_TYPES = ["Reviewer", "Observer", "Contributor"];

/** Add or deactivate a participant. `isActive: false` removes them without losing the record. */
export const setParticipant = async ({
    complaintToken,
    participantRollNumber,
    participantType = "Reviewer",
    isActive = true,
}) =>
    post(
        PostComplaintParticipants,
        complaintToken,
        { participantRollNumber, participantType, isActive },
        "Could not update the participants",
    );
