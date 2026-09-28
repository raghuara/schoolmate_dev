import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

/* Long uploads that outlive the page that started them.

   A 50 MB ZIP takes minutes to leave the browser, and a request tied to a
   component dies with it the moment the user clicks the sidebar. Held here, at
   the app shell, the request keeps going while they carry on with other work,
   and the tray in the corner shows how far along it is. */

const BackgroundTasksContext = createContext(null);

export const useBackgroundTasks = () => useContext(BackgroundTasksContext);

export const TASK_STATUS = {
    uploading: "uploading",
    done: "done",
    failed: "failed",
    cancelled: "cancelled",
};

export const isTaskActive = (task) => task?.status === TASK_STATUS.uploading;

let sequence = 0;

export function BackgroundTasksProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    /* Bumped every time a task finishes, so a page can reload its list when an
       upload it did not necessarily start lands. */
    const [lastFinished, setLastFinished] = useState(null);
    const controllers = useRef({});

    const patchTask = useCallback((id, patch) => {
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));
    }, []);

    /* startUpload({
         kind:      what this is, so a page can pick out its own ("patternBatch")
         label:     one line for the tray ("Past papers for pattern discovery")
         file:      the File object
         url:       endpoint
         fields:    other multipart fields
         headers:   extra headers - never Content-Type, FormData sets its own
         onSuccess: (res) => { error } | { message, link, linkLabel }
       }) -> task id */
    const startUpload = useCallback(({ kind = "upload", label, file, url, fields = {}, headers = {}, onSuccess }) => {
        const id = `task-${Date.now()}-${sequence++}`;
        const controller = new AbortController();
        controllers.current[id] = controller;

        const body = new FormData();
        body.append("file", file);
        Object.entries(fields).forEach(([key, value]) => body.append(key, value ?? ""));

        setTasks((prev) => [{
            id,
            kind,
            label: label || "Upload",
            fileName: file.name,
            size: file.size,
            loaded: 0,
            progress: 0,
            status: TASK_STATUS.uploading,
            message: "",
            link: "",
            linkLabel: "",
            startedAt: Date.now(),
            finishedAt: null,
        }, ...prev]);

        const finish = (patch) => {
            const finishedAt = Date.now();
            patchTask(id, { ...patch, finishedAt });
            setLastFinished({ id, kind, status: patch.status, finishedAt, link: patch.link || "" });
        };

        axios
            .post(url, body, {
                headers,
                signal: controller.signal,
                onUploadProgress: (event) => {
                    const total = event.total || file.size || 1;
                    patchTask(id, {
                        loaded: event.loaded,
                        progress: Math.min(100, Math.round((event.loaded / total) * 100)),
                    });
                },
            })
            .then((res) => {
                const outcome = onSuccess ? onSuccess(res) : null;
                if (outcome?.error) {
                    finish({ status: TASK_STATUS.failed, message: outcome.error });
                    return;
                }
                finish({
                    status: TASK_STATUS.done,
                    progress: 100,
                    loaded: file.size,
                    message: outcome?.message || "Uploaded",
                    link: outcome?.link || "",
                    linkLabel: outcome?.linkLabel || "Open",
                });
            })
            .catch((error) => {
                if (axios.isCancel(error) || error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
                    finish({ status: TASK_STATUS.cancelled, message: "Cancelled" });
                    return;
                }
                finish({
                    status: TASK_STATUS.failed,
                    message: error?.response?.data?.message || error?.message || "The upload failed",
                });
            })
            .finally(() => { delete controllers.current[id]; });

        return id;
    }, [patchTask]);

    const cancelTask = useCallback((id) => { controllers.current[id]?.abort(); }, []);

    const dismissTask = useCallback((id) => {
        controllers.current[id]?.abort();
        setTasks((prev) => prev.filter((task) => task.id !== id));
    }, []);

    const clearFinished = useCallback(() => {
        setTasks((prev) => prev.filter(isTaskActive));
    }, []);

    const activeCount = useMemo(() => tasks.filter(isTaskActive).length, [tasks]);

    /* A tab close or reload would kill every upload in flight. The browser only
       lets us show its own wording, but a prompt is better than silent loss. */
    useEffect(() => {
        if (!activeCount) return undefined;
        const guard = (event) => { event.preventDefault(); event.returnValue = ""; };
        window.addEventListener("beforeunload", guard);
        return () => window.removeEventListener("beforeunload", guard);
    }, [activeCount]);

    useEffect(() => () => {
        Object.values(controllers.current).forEach((controller) => controller.abort());
    }, []);

    const value = useMemo(() => ({
        tasks, activeCount, lastFinished, startUpload, cancelTask, dismissTask, clearFinished,
    }), [tasks, activeCount, lastFinished, startUpload, cancelTask, dismissTask, clearFinished]);

    return (
        <BackgroundTasksContext.Provider value={value}>
            {children}
        </BackgroundTasksContext.Provider>
    );
}
