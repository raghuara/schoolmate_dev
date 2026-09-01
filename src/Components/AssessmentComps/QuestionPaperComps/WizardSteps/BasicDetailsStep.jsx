import React, { useMemo } from "react";
import {
    Box, Grid, Typography, TextField, MenuItem, Autocomplete,
    Checkbox, ListItemText,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import { DASH, RADIUS, Panel } from "../../../DashBoardComps/dashboardTheme";
import { MEDIUMS } from "../../../AcademicsComps/BooksChaptersComps/bookApi";
import { fieldSx, Banner } from "../questionPaperTheme";

export default function BasicDetailsStep({
    form,
    setField,
    errors,
    grades,
    subjectsForGrade,
    examsForGrade,
    sectionsForGrade,
    yearOptions,
}) {
    const subjects = useMemo(() => subjectsForGrade(form.gradeId), [subjectsForGrade, form.gradeId]);
    const exams = useMemo(() => examsForGrade(form.gradeId), [examsForGrade, form.gradeId]);
    const sections = useMemo(() => sectionsForGrade(form.gradeId), [sectionsForGrade, form.gradeId]);

    const durationLabel = (() => {
        const total = Number(form.durationMinutes) || 0;
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        if (hours && mins) return `${hours} hr ${mins} min`;
        if (hours) return `${hours} hour${hours > 1 ? "s" : ""}`;
        return `${mins} min`;
    })();

    return (
        <>
            <Banner tone="info" icon={InfoOutlinedIcon} title="Start with the paper header">
                Everything on this step prints at the top of the paper - class, subject, exam name, time and maximum marks.
            </Banner>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 8, lg: 8 }}>
                    <Panel title="Basic Details" subtitle="Who the paper is for" accent={DASH.primary}>
                        <Grid container spacing={1.6}>
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    select fullWidth size="small" label="Class"
                                    value={form.gradeId}
                                    onChange={(e) => {
                                        setField("gradeId", e.target.value);
                                        setField("sections", []);
                                        setField("subject", "");
                                        setField("examName", "");
                                    }}
                                    error={Boolean(errors.gradeId)} helperText={errors.gradeId || " "}
                                    sx={fieldSx}
                                >
                                    {grades.map((g) => (
                                        <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    select fullWidth size="small" label="Sections"
                                    value={form.sections}
                                    onChange={(e) => setField("sections", e.target.value)}
                                    disabled={!form.gradeId}
                                    helperText={
                                        form.gradeId && sections.length === 0
                                            ? "No sections on this class"
                                            : "Leave empty to cover every section"
                                    }
                                    sx={fieldSx}
                                    slotProps={{
                                        inputLabel: { shrink: true },
                                        select: {
                                            multiple: true,
                                            displayEmpty: true,
                                            renderValue: (selected) => (selected.length ? selected.join(", ") : "All sections"),
                                        },
                                    }}
                                >
                                    {sections.map((s) => (
                                        <MenuItem key={s} value={s} sx={{ fontSize: "13px", py: 0.4 }}>
                                            <Checkbox
                                                size="small"
                                                checked={form.sections.includes(s)}
                                                sx={{ p: 0.5, "&.Mui-checked": { color: DASH.primary } }}
                                            />
                                            <ListItemText primary={s} slotProps={{ primary: { fontSize: "13px" } }} />
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    select fullWidth size="small" label="Subject"
                                    value={form.subject}
                                    onChange={(e) => setField("subject", e.target.value)}
                                    disabled={!form.gradeId}
                                    error={Boolean(errors.subject)}
                                    helperText={errors.subject || (form.gradeId && subjects.length === 0 ? "No subjects mapped to this class" : " ")}
                                    sx={fieldSx}
                                >
                                    {subjects.map((s) => (
                                        <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    select fullWidth size="small" label="Academic Year"
                                    value={form.academicYear}
                                    onChange={(e) => setField("academicYear", e.target.value)}
                                    error={Boolean(errors.academicYear)} helperText={errors.academicYear || " "}
                                    sx={fieldSx}
                                >
                                    {yearOptions.map((y) => (
                                        <MenuItem key={y} value={y} sx={{ fontSize: "13px" }}>{y}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Autocomplete
                                    freeSolo
                                    size="small"
                                    options={exams}
                                    value={form.examName}
                                    onChange={(e, value) => setField("examName", value || "")}
                                    onInputChange={(e, value) => setField("examName", value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Exam name"
                                            placeholder="Half Yearly Examination"
                                            error={Boolean(errors.examName)}
                                            helperText={errors.examName || "Pick a mapped exam, or type your own"}
                                            sx={fieldSx}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    fullWidth size="small" label="Paper name"
                                    placeholder="Mathematics - Half Yearly"
                                    value={form.name}
                                    onChange={(e) => setField("name", e.target.value)}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name || "Internal name shown in the papers list"}
                                    sx={fieldSx}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    fullWidth size="small" type="date" label="Exam date"
                                    value={form.examDate}
                                    onChange={(e) => setField("examDate", e.target.value)}
                                    helperText="Optional - prints on the header"
                                    sx={fieldSx}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>


                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    select fullWidth size="small" label="Medium"
                                    value={form.medium}
                                    onChange={(e) => setField("medium", e.target.value)}
                                    helperText="Language the paper prints in"
                                    sx={fieldSx}
                                >
                                    {MEDIUMS.map((m) => (
                                        <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <TextField
                                    fullWidth size="small" label="Q.P. Code"
                                    value={form.paperCode}
                                    onChange={(e) => setField("paperCode", e.target.value.slice(0, 6))}
                                    helperText="Up to 6 characters"
                                    sx={fieldSx}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <TextField
                                    fullWidth multiline minRows={2} size="small"
                                    label="Notes for the paper (optional)"
                                    placeholder="Anything extra to print below the general instructions."
                                    value={form.notes}
                                    onChange={(e) => setField("notes", e.target.value)}
                                    helperText=" "
                                    sx={fieldSx}
                                />
                            </Grid>
                        </Grid>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                    <Panel title="Header Preview" subtitle="How the top of the paper will read" accent={DASH.blue}>
                        <Box
                            sx={{
                                border: `1px solid ${DASH.line}`,
                                borderRadius: RADIUS,
                                p: 2,
                                bgcolor: "#fff",
                                fontFamily: "'Times New Roman', Georgia, serif",
                            }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 22, color: DASH.faint }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: DASH.ink }}>
                                    Your School Name
                                </Typography>
                                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.text, mt: 0.6 }}>
                                    {form.examName || "Examination"}
                                    {form.academicYear ? ` - ${form.academicYear}` : ""}
                                </Typography>
                            </Box>

                            <Box sx={{ borderTop: `1.5px solid ${DASH.ink}`, my: 1.2 }} />

                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, fontSize: "11.5px" }}>
                                <Box>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text }}>
                                        Class : {grades.find((g) => String(g.id) === String(form.gradeId))?.sign || "-"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text, mt: 0.4 }}>
                                        Subject : {form.subject || "-"}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text }}>
                                        Time : {form.durationMinutes ? durationLabel : "from pattern"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text, mt: 0.4 }}>
                                        Max. Marks : {form.totalMarks || "from pattern"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ borderTop: `1px solid ${DASH.line}`, mt: 1.2 }} />
                        </Box>

                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 1.4, lineHeight: 1.6 }}>
                            Time and maximum marks are set by the pattern you pick in step 3 - they are not typed twice.
                            The school name and logo come from your website settings.
                        </Typography>
                    </Panel>
                </Grid>
            </Grid>
        </>
    );
}
