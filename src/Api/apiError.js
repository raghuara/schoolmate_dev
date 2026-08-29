const MESSAGE_KEYS = [
    "message",
    "Message",
    "error",
    "Error",
    "errorMessage",
    "ErrorMessage",
    "title",
    "detail",
    "description",
];

const firstMessage = (value, depth = 0) => {
    if (depth > 4) return "";
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = firstMessage(item, depth + 1);
            if (found) return found;
        }
        return "";
    }
    if (value && typeof value === "object") {
        for (const key of MESSAGE_KEYS) {
            const found = firstMessage(value[key], depth + 1);
            if (found) return found;
        }
        const found = firstMessage(value.errors, depth + 1);
        if (found) return found;
        if (value.errors && typeof value.errors === "object") {
            for (const key of Object.keys(value.errors)) {
                const nested = firstMessage(value.errors[key], depth + 1);
                if (nested) return nested;
            }
        }
    }
    return "";
};

export const readApiMessage = (payload) => firstMessage(payload);

export const isErrorPayload = (payload) => {
    if (!payload || typeof payload !== "object") return false;
    if (payload.error === true || payload.isError === true || payload.hasError === true) return true;
    if (payload.success === false || payload.status === false || payload.isSuccess === false) return true;
    if (typeof payload.statusCode === "number" && payload.statusCode >= 400) return true;
    if (typeof payload.error === "string" && payload.error.trim()) return true;
    return false;
};

export const responseErrorMessage = (res, fallback = "") => {
    const payload = res?.data;
    if (!isErrorPayload(payload)) return "";
    return readApiMessage(payload) || fallback || "The request could not be completed.";
};

export const apiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (error?.response) {
        const fromServer = readApiMessage(error.response.data);
        if (fromServer) return fromServer;

        const status = error.response.status;
        if (status === 400) return "The details sent are not valid. Please check and try again.";
        if (status === 401) return "Your session has expired. Please sign in again.";
        if (status === 403) return "You do not have permission to perform this action.";
        if (status === 404) return "The requested record was not found.";
        if (status === 409) return "This record already exists.";
        if (status === 413) return "The uploaded file is too large.";
        if (status >= 500) return "The server could not process this request. Please try again later.";
        return fallback;
    }
    if (error?.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (error?.message === "Network Error") return "Cannot reach the server. Check your connection and try again.";
    return error?.message || fallback;
};
