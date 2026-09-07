import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Grid, Typography, Skeleton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Collapse,
} from "@mui/material";
import axios from "axios";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { FetchOldStudentRecords } from "../../../Api/Api";

const TOKEN = "123";

const MODULE_TONE = {
    School: { main: DASH.blue, light: DASH.blueLight, border: "#BFDBFE" },
    ECA: { main: DASH.violet, light: DASH.violetLight, border: "#DDD6FE" },
    Additional: { main: DASH.cyan, light: DASH.cyanLight, border: "#A5F3FC" },
    Transport: { main: DASH.amber, light: DASH.amberLight, border: "#FDE68A" },
};

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const Field = ({ label, value }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography
            sx={{
                fontSize: "10px",
                fontWeight: 700,
                color: DASH.faint,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
            }}
        >
            {label}
        </Typography>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink, mt: 0.3 }}>
            {value || "—"}
        </Typography>
    </Box>
);

const FeeModuleCard = ({ module, expanded, onToggle }) => {
    const tone = MODULE_TONE[module.module] || MODULE_TONE.Additional;
    const hasItems = (module.items || []).length > 0;
    const settled = Number(module.pending || 0) <= 0;

    return (
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${tone.main}`,
                borderRadius: "10px",
                bgcolor: "#fff",
                overflow: "hidden",
            }}
        >
            <Box
                onClick={hasItems ? onToggle : undefined}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.8,
                    py: 1.3,
                    cursor: hasItems ? "pointer" : "default",
                    "&:hover": hasItems ? { bgcolor: DASH.surface } : {},
                }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: RADIUS,
                        bgcolor: tone.light,
                        border: `1px solid ${tone.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {module.module === "Transport" ? (
                        <DirectionsBusOutlinedIcon sx={{ fontSize: 16, color: tone.main }} />
                    ) : (
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: tone.main }} />
                    )}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                        {module.module} Fee
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.1 }}>
                        {hasItems
                            ? `${module.items.length} item${module.items.length === 1 ? "" : "s"} · billed ${money(module.billed)}`
                            : "Nothing billed"}
                    </Typography>
                </Box>

                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: settled ? DASH.green : DASH.red,
                        }}
                    >
                        {money(module.pending)}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: DASH.faint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {settled ? "Settled" : "Pending"}
                    </Typography>
                </Box>

                {hasItems && (
                    <ExpandMoreIcon
                        sx={{
                            fontSize: 20,
                            color: DASH.faint,
                            flexShrink: 0,
                            transition: "transform .2s ease",
                            transform: expanded ? "rotate(180deg)" : "none",
                        }}
                    />
                )}
            </Box>

            <Collapse in={expanded && hasItems} unmountOnExit>
                <TableContainer sx={{ borderTop: `1px solid ${DASH.line}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {["Fee Name", "Year", "Billed", "Paid", "Concession", "Pending"].map((h, i) => (
                                    <TableCell
                                        key={h}
                                        align={i > 1 ? "right" : "left"}
                                        sx={{
                                            bgcolor: DASH.surface,
                                            borderBottom: `1px solid ${DASH.line}`,
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            color: DASH.muted,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            py: 1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {module.items.map((item, idx) => (
                                <TableRow key={`${item.feeName}-${idx}`} sx={{ "&:hover": { bgcolor: DASH.surface } }}>
                                    <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, fontSize: "12.5px", color: DASH.text, fontWeight: 600 }}>
                                        {item.feeName}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, fontSize: "12px", color: DASH.muted, whiteSpace: "nowrap" }}>
                                        {item.year}
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, fontSize: "12.5px", color: DASH.text }}>
                                        {money(item.billed)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, fontSize: "12.5px", color: DASH.green, fontWeight: 600 }}>
                                        {money(item.paid)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, fontSize: "12.5px", color: DASH.muted }}>
                                        {money(item.concession)}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            borderBottom: `1px solid ${DASH.lineSoft}`,
                                            fontSize: "12.5px",
                                            fontWeight: 700,
                                            color: item.isFullyPaid ? DASH.green : DASH.red,
                                        }}
                                    >
                                        {money(item.pending)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};

const PanelSkeleton = () => (
    <Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
            {[0, 1, 2, 3].map((i) => (
                <Grid key={i} size={{ xs: 6, sm: 3 }}>
                    <Skeleton variant="rounded" width="60%" height={9} sx={{ bgcolor: DASH.lineSoft }} />
                    <Skeleton variant="rounded" width="80%" height={13} sx={{ bgcolor: DASH.lineSoft, mt: 0.6 }} />
                </Grid>
            ))}
        </Grid>
        {[0, 1, 2].map((i) => (
            <Skeleton
                key={i}
                variant="rounded"
                height={58}
                sx={{ bgcolor: DASH.lineSoft, borderRadius: "10px", mb: 1.2 }}
            />
        ))}
    </Box>
);

export default function PreviousRecordPanel({ newRollNumber, refreshKey = 0, onLoaded }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState("");

    const load = useCallback(async () => {
        if (!newRollNumber) return;
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(FetchOldStudentRecords, {
                params: { NewRollNumber: newRollNumber },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const body = res?.data || {};
            if (body.error || !body.previous) {
                setData(null);
                setError(body.message || "No previous record is linked to this student.");
            } else {
                setData(body);
                if (onLoaded) onLoaded(body);
            }
        } catch (err) {
            setData(null);
            setError(err?.response?.data?.message || "Could not load the previous record.");
        } finally {
            setLoading(false);
        }
    }, [newRollNumber, onLoaded]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newRollNumber, refreshKey]);

    if (!newRollNumber) return null;

    const previous = data?.previous;
    const feeModules = [
        ...(data?.fees || []),
        ...((data?.transport || []).length
            ? [{
                module: "Transport",
                billed: (data.transport || []).reduce((sum, t) => sum + Number(t.billed || 0), 0),
                paid: (data.transport || []).reduce((sum, t) => sum + Number(t.paid || 0), 0),
                concession: (data.transport || []).reduce((sum, t) => sum + Number(t.concession || 0), 0),
                pending: (data.transport || []).reduce((sum, t) => sum + Number(t.pending || 0), 0),
                items: (data.transport || []).flatMap((t) => t.items || []),
            }]
            : []),
    ];
    const totalPending = feeModules.reduce((sum, m) => sum + Number(m.pending || 0), 0);

    return (
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${DASH.green}`,
                borderRadius: "10px",
                bgcolor: "#fff",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    px: 2,
                    py: 1.4,
                    bgcolor: DASH.greenLight,
                    borderBottom: `1px solid ${DASH.line}`,
                    flexWrap: "wrap",
                }}
            >
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: DASH.green, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                        Previous record linked
                    </Typography>
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                        This student is continuing from an earlier enrolment at the school
                    </Typography>
                </Box>
                {previous?.linkedOn && (
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.6,
                            px: 1.2,
                            height: 24,
                            borderRadius: "999px",
                            bgcolor: "#fff",
                            border: `1px solid ${DASH.line}`,
                            flexShrink: 0,
                        }}
                    >
                        <HistoryOutlinedIcon sx={{ fontSize: 13, color: DASH.muted }} />
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.text }}>
                            Linked {previous.linkedOn}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ p: 2 }}>
                {loading ? (
                    <PanelSkeleton />
                ) : error ? (
                    <Box sx={{ py: 3, textAlign: "center" }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                            Previous record unavailable
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>{error}</Typography>
                        <Button
                            onClick={load}
                            sx={{
                                mt: 1.5,
                                textTransform: "none",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                height: 32,
                                px: 1.8,
                                borderRadius: RADIUS,
                                color: DASH.text,
                                border: `1px solid ${DASH.line}`,
                                "&:hover": { bgcolor: DASH.lineSoft },
                            }}
                        >
                            Retry
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2} sx={{ mb: 2.2 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Field label="Student" value={data?.studentName} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Field label="Old Roll Number" value={previous?.oldRollNumber} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Field
                                    label="Left From"
                                    value={
                                        previous?.oldGrade
                                            ? `${previous.oldGrade}${previous.oldSection ? ` · ${previous.oldSection}` : ""}`
                                            : ""
                                    }
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Field label="Old Academic Year" value={previous?.oldAcademicYear} />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                px: 1.8,
                                py: 1.3,
                                mb: 1.5,
                                borderRadius: RADIUS,
                                bgcolor: totalPending > 0 ? DASH.redLight : DASH.greenLight,
                                border: `1px solid ${totalPending > 0 ? `${DASH.red}4D` : `${DASH.green}4D`}`,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                                    {totalPending > 0 ? "Carried-forward dues" : "No dues carried forward"}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                    {totalPending > 0
                                        ? "These remain outstanding against the old roll number."
                                        : "Everything billed on the old roll number is settled."}
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: totalPending > 0 ? DASH.red : DASH.green,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {money(totalPending)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            {feeModules.map((m) => (
                                <FeeModuleCard
                                    key={m.module}
                                    module={m}
                                    expanded={expanded === m.module}
                                    onToggle={() => setExpanded((prev) => (prev === m.module ? "" : m.module))}
                                />
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
