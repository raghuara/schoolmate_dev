import axios from "axios";

import {
    GetParentComplaintOverview,
    GetParentMyComplaints,
    PostParentAdditionalInformation,
    PostParentFeedback,
    PostParentWithdraw,
    PostParentReopen,
} from "../../Api/Api";

/**
 * Parent complaint tracking and actions (module 05, Website rows).
 *
 * WHO THE ACTOR IS
 * Everywhere else in this app `actorRollNumber` is the signed-in staff member. Here it is
 * the PARENT — the collection sends the student's roll number (70707), not an
 * administrator's. The server records that person as the one who withdrew, reopened or
 * accepted the resolution, and the complaint timeline prints their name. Passing a staff
 * roll number to /parent/withdraw would file the withdrawal under the wrong person and
 * there is no way to correct it afterwards, so the actor is taken from the session and
 * never substituted.
 *
 * THREE ENCODINGS, ONE MODULE
 * The reads are GET + query string; feedback, withdraw and reopen are JSON POSTs; and
 * additional-information is multipart, because it carries the parent's attachments. This
 * mirrors the Configuration Hub / Shared Lookups split already in this folder — each is
 * correct for its own controller.
 */

const API_TOKEN = "123";

const REQUEST_TIMEOUT_MS = 45000;

const client = axios.create({
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    timeout: REQUEST_TIMEOUT_MS,
});

/* redux-persist keeps each field JSON-encoded inside a JSON envelope, so the value needs
   unwrapping twice. Guarded — a private window throws on access. */
export const actorRollNumber = () => {
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
            return "The server took too long to respond. It may still be starting up — try again in a moment.";
        }
        if (error?.code === "ERR_NETWORK") {
            return "Could not reach the server. Check the connection and try again.";
        }
    }
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    return error?.message || fallback;
};

/* A 404 is ambiguous: the record is gone, or the route was never deployed. The API answers
   a real "no such record" with a JSON envelope carrying a message; an EMPTY 404 body means
   the controller itself is missing. They need different people, so they are told apart. */
const failureFrom = (error, fallback) => {
    if (error?.response?.status === 404) {
        const body = error.response.data;
        const hasMessage = body && typeof body === "object" && body.message;
        return {
            ok: false,
            notFound: true,
            routeMissing: !hasMessage,
            message: hasMessage ? body.message : "",
        };
    }
    return { ok: false, message: messageOf(error, fallback) };
};

const get = async (url, params, fallback) => {
    try {
        const res = await client.get(url, { params });
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, body: res?.data ?? {} };
    } catch (error) {
        return failureFrom(error, fallback);
    }
};

const post = async (url, payload, fallback) => {
    try {
        const res = await client.post(url, payload);
        if (res?.data?.error) return { ok: false, message: res.data.message || fallback };
        return { ok: true, body: res?.data ?? {}, message: res?.data?.message || "" };
    } catch (error) {
        return failureFrom(error, fallback);
    }
};

/* ─────────────── Overview ───────────────
   Counts plus the five most recent cards, for the parent's landing screen. Keyed on the
   STUDENT, not the parent: one login may sit over more than one child, and the overview is
   per child.

   The field names below are the ones the live UAT response actually uses — `subject` not
   `title`, `createdOnUtc` not `createdOn`, `ownerName` not `assignedTo`. The same row shape
   comes back from /parent/overview and /parent/my-complaints, so one adapter serves both. */

export const parentComplaintFromApi = (row = {}) => ({
    id: row.complaintId,
    token: row.complaintToken || "",
    title: row.subject || "",
    category: row.categoryName || "",
    /* `displayStatus` is what the parent should read; `status` is the workflow value the
       action rules are decided on. They agree today, but they are separate fields and the
       server is free to make them differ. */
    status: row.status || "",
    displayStatus: row.displayStatus || row.status || "",
    priority: row.priority || "",
    raisedOn: row.createdOnUtc || null,
    owner: row.ownerName || "",
    studentName: row.studentName || "",
    slaState: row.slaState || "",
    dueOn: row.currentDueOnUtc || null,
    isEscalated: row.isEscalated === true,
    isConfidential: row.isConfidential === true,
    /* The server's own flag for "this complaint is waiting on the parent". Null on every
       row seen so far, so its vocabulary is unconfirmed — the action rules treat any
       non-null value as "something is being asked of you" rather than matching a spelling
       that has never been observed. */
    parentActionType: row.parentActionType ?? null,
});

/** → { ok, counts, cards } */
export const fetchParentOverview = async ({ studentRollNumber }) => {
    const result = await get(
        GetParentComplaintOverview,
        { studentRollNumber },
        "Could not load the complaint overview",
    );
    if (!result.ok) return result;
    const body = result.body?.data ?? {};
    const cards = Array.isArray(body.recentComplaints) ? body.recentComplaints : [];
    return {
        ok: true,
        /* These are the server's five buckets, not a generic open/closed split — it reports
           `actionRequired` and `underReview`, which do not map onto complaint statuses
           one-for-one, so they are passed through under their own names. */
        counts: {
            total: body.totalComplaints ?? 0,
            actionRequired: body.actionRequired ?? 0,
            underReview: body.underReview ?? 0,
            resolved: body.resolved ?? 0,
            closed: body.closed ?? 0,
        },
        cards: cards.map(parentComplaintFromApi),
    };
};

/* ─────────────── My complaints ───────────────
   The full list behind the overview, filtered and paged server-side. */

/**
 * → { ok, rows, page, pageSize, totalCount, totalPages }
 * `status: "All"` is the server's own wording for no status filter, not an empty string.
 */
export const fetchMyComplaints = async ({
    studentRollNumber,
    status = "All",
    priority = "",
    categoryId = "",
    search = "",
    page = 1,
    pageSize = 20,
} = {}) => {
    const result = await get(
        GetParentMyComplaints,
        {
            actorRollNumber: actorRollNumber(),
            studentRollNumber,
            status,
            priority,
            categoryId,
            search,
            page,
            pageSize,
        },
        "Could not load your complaints",
    );
    if (!result.ok) return result;
    const body = result.body ?? {};
    /* `items` / `totalItems`, not the `data` / `totalCount` the configuration endpoints use. */
    const rows = Array.isArray(body.items) ? body.items : [];
    return {
        ok: true,
        rows: rows.map(parentComplaintFromApi),
        page: body.page ?? page,
        pageSize: body.pageSize ?? pageSize,
        totalCount: body.totalItems ?? rows.length,
        totalPages: body.totalPages ?? 1,
    };
};

/* ─────────────── Additional information ───────────────
   Multipart, because the parent may attach files. Sent as FormData with no explicit
   Content-Type: the browser has to set it so it can append the multipart boundary, and
   naming the header ourselves would strip that and the server would reject the body. */

export const submitAdditionalInformation = async ({
    complaintToken,
    informationRequestId,
    responseMessage,
    attachments = [],
}) => {
    const form = new FormData();
    form.append("actorRollNumber", actorRollNumber());
    form.append("complaintToken", complaintToken);
    form.append("informationRequestId", String(informationRequestId ?? ""));
    form.append("responseMessage", responseMessage || "");
    attachments.forEach((file) => form.append("attachments", file));
    return post(PostParentAdditionalInformation, form, "Could not submit the information");
};

/* ─────────────── Feedback, withdraw, reopen ───────────────
   The three closing actions. Each ends with the server changing the complaint's status, so
   the caller should reload the detail rather than patching its own copy. */

/* The wording the API expects — not free text, and not a rating. */
export const FEEDBACK_OPTIONS = ["Satisfied", "Not Satisfied"];

/**
 * Confirm the resolution. "Satisfied" closes the complaint; "Not Satisfied" reopens it —
 * one endpoint, two outcomes, decided by `feedbackOption`.
 */
export const submitParentFeedback = async ({ complaintToken, feedbackOption, comment = "" }) =>
    post(
        PostParentFeedback,
        { actorRollNumber: actorRollNumber(), complaintToken, feedbackOption, comment },
        "Could not submit your feedback",
    );

/** Withdraw. Status becomes Withdrawn, processing stops, and the audit trail is kept. */
export const withdrawComplaint = async ({ complaintToken, reason }) =>
    post(
        PostParentWithdraw,
        { actorRollNumber: actorRollNumber(), complaintToken, reason },
        "Could not withdraw the complaint",
    );

/** Reopen. The SAME token comes back — escalated and queued for reassignment, not a new complaint. */
export const reopenComplaint = async ({ complaintToken, reason }) =>
    post(
        PostParentReopen,
        { actorRollNumber: actorRollNumber(), complaintToken, reason },
        "Could not reopen the complaint",
    );
