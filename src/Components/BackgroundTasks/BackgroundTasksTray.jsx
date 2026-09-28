import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button, LinearProgress, Tooltip, Collapse } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";
import { useBackgroundTasks, TASK_STATUS, isTaskActive } from "./BackgroundTasksContext";

const sizeLabel = (bytes) => {
    const size = Number(bytes) || 0;
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const elapsed = (from, to) => {
    const secs = Math.max(0, Math.round(((to || Date.now()) - from) / 1000));
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`;
};

const TONES = {
    [TASK_STATUS.uploading]: { color: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE", icon: CloudUploadOutlinedIcon },
    [TASK_STATUS.done]: { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0", icon: CheckCircleIcon },
    [TASK_STATUS.failed]: { color: DASH.red, bg: DASH.redLight, border: "#FECACA", icon: ErrorOutlineIcon },
    [TASK_STATUS.cancelled]: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line, icon: BlockOutlinedIcon },
};

const TaskRow = ({ task, onCancel, onDismiss, onOpen }) => {
    const tone = TONES[task.status] || TONES.cancelled;
    const Icon = tone.icon;
    const active = isTaskActive(task);

    /* Elapsed time ticks while the upload runs, so a stalled one is visible as
       a number that keeps climbing against a bar that does not. */
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!active) return undefined;
        const timer = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, [active]);

    return (
        <Box sx={{ px: 1.6, py: 1.3, borderTop: `1px solid ${DASH.lineSoft}` }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.1 }}>
                <Box
                    sx={{
                        width: 32, height: 32, borderRadius: RADIUS, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: tone.bg, border: `1px solid ${tone.border}`,
                    }}
                >
                    <Icon sx={{ fontSize: 17, color: tone.color }} />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        sx={{
                            fontSize: "12.5px", fontWeight: 700, color: DASH.ink,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                        title={task.fileName}
                    >
                        {task.fileName}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.1 }}>
                        {task.label}
                    </Typography>

                    {active && (
                        <>
                            <LinearProgress
                                variant="determinate"
                                value={task.progress}
                                sx={{
                                    mt: 0.9, height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                    "& .MuiLinearProgress-bar": { bgcolor: tone.color, borderRadius: RADIUS },
                                }}
                            />
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                                <Typography sx={{ fontSize: "10.5px", color: tone.color, fontWeight: 700 }}>
                                    {task.progress}% - {sizeLabel(task.loaded)} of {sizeLabel(task.size)}
                                </Typography>
                                <Typography sx={{ fontSize: "10.5px", color: DASH.faint }}>
                                    {elapsed(task.startedAt)}
                                </Typography>
                            </Box>
                        </>
                    )}

                    {!active && (
                        <Typography sx={{ fontSize: "11px", color: tone.color, fontWeight: 600, mt: 0.5, lineHeight: 1.5 }}>
                            {task.message}
                            {task.status === TASK_STATUS.done && task.finishedAt
                                ? ` - took ${elapsed(task.startedAt, task.finishedAt)}`
                                : ""}
                        </Typography>
                    )}

                    {task.status === TASK_STATUS.done && task.link && (
                        <Button
                            onClick={() => onOpen(task)}
                            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                            sx={{
                                textTransform: "none", fontSize: "11.5px", fontWeight: 700, mt: 0.6,
                                minWidth: 0, px: 1, height: 26, borderRadius: RADIUS,
                                color: DASH.green, bgcolor: DASH.greenLight, border: "1px solid #BBF7D0",
                                "&:hover": { bgcolor: DASH.greenLight, borderColor: DASH.green },
                            }}
                        >
                            {task.linkLabel || "Open"}
                        </Button>
                    )}
                </Box>

                <Tooltip title={active ? "Cancel this upload" : "Dismiss"} arrow>
                    <IconButton
                        size="small"
                        onClick={() => (active ? onCancel(task) : onDismiss(task))}
                        sx={{ width: 26, height: 26, mt: -0.3 }}
                    >
                        <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

/* Bottom-right corner, above everything except dialogs and snackbars. Only
   drawn while there is something to show; collapses to one line on request and
   springs open on its own when a new upload starts. */
export default function BackgroundTasksTray() {
    const navigate = useNavigate();
    const { tasks, activeCount, cancelTask, dismissTask, clearFinished } = useBackgroundTasks() || {};
    const [collapsed, setCollapsed] = useState(false);

    const count = tasks?.length || 0;

    useEffect(() => { if (activeCount > 0) setCollapsed(false); }, [activeCount]);

    if (!count) return null;

    const finishedCount = count - activeCount;
    const headline = activeCount > 0
        ? `Uploading ${activeCount} file${activeCount === 1 ? "" : "s"}`
        : `${finishedCount} upload${finishedCount === 1 ? "" : "s"} finished`;

    const overall = activeCount > 0
        ? Math.round(tasks.filter(isTaskActive).reduce((sum, t) => sum + t.progress, 0) / activeCount)
        : 100;

    return (
        <Box
            sx={{
                position: "fixed",
                right: { xs: 12, md: 20 },
                bottom: { xs: 12, md: 20 },
                width: { xs: "calc(100vw - 24px)", sm: 360 },
                zIndex: 1250,
                bgcolor: "#fff",
                border: `1px solid ${activeCount > 0 ? "#DDD6FE" : DASH.line}`,
                borderRadius: RADIUS,
                boxShadow: "0 12px 32px rgba(17,24,39,0.16)",
                overflow: "hidden",
            }}
        >
            <Box
                onClick={() => setCollapsed((v) => !v)}
                sx={{
                    display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 1.1, cursor: "pointer",
                    bgcolor: activeCount > 0 ? DASH.violetLight : DASH.surface,
                    userSelect: "none",
                }}
            >
                <CloudUploadOutlinedIcon sx={{ fontSize: 18, color: activeCount > 0 ? DASH.violet : DASH.muted }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                        {headline}
                        {activeCount > 0 ? ` - ${overall}%` : ""}
                    </Typography>
                    {activeCount > 0 && (
                        <Typography sx={{ fontSize: "10.5px", color: DASH.muted }}>
                            Keep working - this carries on in the background.
                        </Typography>
                    )}
                </Box>
                {finishedCount > 0 && (
                    <Button
                        onClick={(e) => { e.stopPropagation(); clearFinished(); }}
                        sx={{ textTransform: "none", fontSize: "11px", fontWeight: 700, color: DASH.muted, minWidth: 0, px: 0.8, height: 24 }}
                    >
                        Clear done
                    </Button>
                )}
                <IconButton size="small" sx={{ width: 26, height: 26 }}>
                    {collapsed
                        ? <ExpandLessIcon sx={{ fontSize: 18, color: DASH.muted }} />
                        : <ExpandMoreIcon sx={{ fontSize: 18, color: DASH.muted }} />}
                </IconButton>
            </Box>

            {collapsed && activeCount > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={overall}
                    sx={{ height: 3, bgcolor: DASH.lineSoft, "& .MuiLinearProgress-bar": { bgcolor: DASH.violet } }}
                />
            )}

            <Collapse in={!collapsed}>
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onCancel={(t) => cancelTask(t.id)}
                            onDismiss={(t) => dismissTask(t.id)}
                            onOpen={(t) => navigate(t.link)}
                        />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
}
