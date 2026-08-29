import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    MasterDashboardHeadline, MasterDashboardAttendanceSection, MasterDashboardAcademicsSection,
    CommonDashboardHeadline, CommonDashboardAttendanceLeave, CommonDashboardWork, CommonDashboardForMe,
} from "../../Api/Api";

const token = "123";

/* The dashboard endpoints have no saved sample responses yet, so every field is
   looked up through a list of likely key names and each section also keeps its
   raw payload. Once the real shapes are confirmed these lists collapse to the
   one exact key. */
export const val = (row, keys, fallback = null) => {
    for (const key of keys) {
        const found = row?.[key];
        if (found !== undefined && found !== null && found !== "") return found;
    }
    return fallback;
};

export const unwrap = (root) => {
    if (!root || typeof root !== "object") return {};
    if (Array.isArray(root)) return root[0] || {};
    return root.data || root.result || root;
};

// First array of objects (or of primitives) found under any of the given keys.
export const listOf = (row, keys) => {
    for (const key of keys) {
        const found = row?.[key];
        if (Array.isArray(found)) return found;
    }
    return [];
};

export const num = (value, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const round1 = (value) => Math.round(num(value) * 10) / 10;

// Sparklines are optional everywhere; a flat line is better than a broken chart.
const spark = (row, keys, fallbackValue) => {
    const found = listOf(row, keys).map((v) => num(v));
    if (found.length) return found;
    const flat = num(fallbackValue);
    return [flat, flat, flat, flat, flat, flat, flat];
};

const ALERT_META = {
    attendance: { severity: "critical", path: "/dashboardmenu/attendance" },
    unmarkedattendance: { severity: "critical", path: "/dashboardmenu/attendance" },
    approvals: { severity: "warning", path: "/dashboardmenu/approvals" },
    fee: { severity: "critical", path: "/dashboardmenu/fee" },
    feedefaulters: { severity: "critical", path: "/dashboardmenu/fee" },
    transport: { severity: "warning", path: "/dashboardmenu/transport" },
    documents: { severity: "warning", path: "/dashboardmenu/transport" },
    mapping: { severity: "info", path: "/dashboardmenu/transport" },
};

const alertMeta = (key) =>
    ALERT_META[String(key || "").toLowerCase().replace(/[\s_-]/g, "")] ||
    { severity: "info", path: "" };

const readAlert = (row, index) => {
    const key = val(row, ["key", "alertKey", "type", "code"], `alert-${index}`);
    const meta = alertMeta(key);
    return {
        key,
        count: num(val(row, ["count", "value", "total"], 0)),
        label: val(row, ["label", "message", "text", "description", "title"], ""),
        severity: String(val(row, ["severity", "level", "priority"], meta.severity)).toLowerCase(),
        path: val(row, ["path", "route", "link"], meta.path),
    };
};

/* ------------------------------------------------------------------ master */

export const readMasterHeadline = (payload) => {
    const data = unwrap(payload);
    const students = val(data, ["students", "studentCount", "totalStudents"], {});
    const staff = val(data, ["staff", "staffCount", "totalStaff"], {});
    const studentAtt = val(data, ["studentAttendance", "studentsAttendance"], {});
    const staffAtt = val(data, ["staffAttendance"], {});
    const fee = val(data, ["fee", "feeCollection", "finance"], {});
    const approvals = val(data, ["approvals", "pendingApprovals"], {});

    // Each block may arrive as a plain number or as an object with a total.
    const block = (source, keys) =>
        (source && typeof source === "object" ? num(val(source, keys, 0)) : num(source));

    return {
        kpis: {
            students: block(students, ["total", "count", "value"]),
            studentsTrend: val(students, ["trend", "note", "changeLabel"], "") ||
                val(data, ["studentsTrend"], ""),
            studentsSpark: spark(students, ["spark", "trendData", "history"], block(students, ["total", "count", "value"])),

            staff: block(staff, ["total", "count", "value"]),
            staffSplit: val(staff, ["split", "note", "breakup"], "") || val(data, ["staffSplit"], ""),
            staffSpark: spark(staff, ["spark", "trendData", "history"], block(staff, ["total", "count", "value"])),

            studentAttendance: round1(block(studentAtt, ["percent", "percentage", "value", "total"])),
            studentAttendanceTrend: val(studentAtt, ["trend", "note", "changeLabel"], "") ||
                val(data, ["studentAttendanceTrend"], ""),
            studentAttendanceSpark: spark(studentAtt, ["spark", "trendData", "history"], block(studentAtt, ["percent", "percentage", "value"])),

            staffAttendance: round1(block(staffAtt, ["percent", "percentage", "value", "total"])),
            staffAttendanceNote: val(staffAtt, ["note", "onLeaveLabel", "trend"], "") ||
                val(data, ["staffAttendanceNote"], ""),
            staffAttendanceSpark: spark(staffAtt, ["spark", "trendData", "history"], block(staffAtt, ["percent", "percentage", "value"])),

            // Money arrives pre-formatted ("12.4L") or as a raw number.
            feeCollected: val(fee, ["collectedLabel", "collectedDisplay", "collected", "total"], "") ||
                val(data, ["feeCollected"], ""),
            feeOutstanding: val(fee, ["outstandingLabel", "outstandingDisplay", "outstanding", "pending"], "") ||
                val(data, ["feeOutstanding"], ""),
            feeSpark: spark(fee, ["spark", "trendData", "history"], 0),

            pendingApprovals: block(approvals, ["count", "pending", "total", "value"]),
            approvalsNote: val(approvals, ["note", "label"], "") || val(data, ["approvalsNote"], ""),
            approvalsSpark: spark(approvals, ["spark", "trendData", "history"], block(approvals, ["count", "pending", "total"])),
        },
        alerts: listOf(data, ["alerts", "needsAttention", "attention", "warnings"]).map(readAlert),
        raw: data,
    };
};

export const readMasterAttendance = (payload) => {
    const data = unwrap(payload);

    const trend = listOf(data, ["trend", "attendanceTrend", "weeklyTrend", "last6Days"]).map((row) => ({
        day: val(row, ["day", "label", "date", "dayName"], ""),
        students: round1(val(row, ["students", "studentPercent", "studentAttendance", "student"], 0)),
        staff: round1(val(row, ["staff", "staffPercent", "staffAttendance"], 0)),
    }));

    const gradeWise = listOf(data, ["gradeWise", "gradeWiseToday", "grades", "classWise"]).map((row) => ({
        grade: val(row, ["grade", "gradeName", "gradeSign", "className", "label"], ""),
        present: round1(val(row, ["present", "percent", "percentage", "value"], 0)),
    }));

    const unmarked = listOf(data, ["unmarkedClasses", "pendingClasses", "notMarked", "unmarked"]).map((row, i) => ({
        id: val(row, ["id", "classId", "sectionId"], i + 1),
        grade: val(row, ["grade", "gradeName", "gradeSign", "className"], ""),
        section: val(row, ["section", "sectionName"], ""),
        teacher: val(row, ["teacher", "teacherName", "classTeacher", "inCharge"], "-"),
    }));

    const staffOnLeave = listOf(data, ["staffOnLeave", "onLeave", "leaveToday"]).map((row, i) => ({
        id: val(row, ["id", "leaveId", "rollNumber"], i + 1),
        name: val(row, ["name", "staffName", "employeeName"], ""),
        role: val(row, ["role", "designation", "subject", "department"], ""),
        type: val(row, ["type", "leaveType"], ""),
    }));

    const totalClasses = num(val(data, ["totalClasses", "totalSections", "expectedClasses"], 0));
    const markedClasses = num(
        val(data, ["markedClasses", "marked", "completedClasses"],
            totalClasses ? totalClasses - unmarked.length : 0)
    );

    return { trend, gradeWise, unmarkedClasses: unmarked, staffOnLeave, totalClasses, markedClasses, raw: data };
};

export const readMasterAcademics = (payload) => {
    const data = unwrap(payload);
    const summary = val(data, ["summary", "academicSummary", "overview"], data) || {};

    return {
        summary: {
            homeworkToday: num(val(summary, ["homeworkToday", "todayHomework"], 0)),
            homeworkThisWeek: num(val(summary, ["homeworkThisWeek", "weekHomework", "homeworkWeek"], 0)),
            materialsThisWeek: num(val(summary, ["materialsThisWeek", "studyMaterialsThisWeek", "materialsWeek"], 0)),
            quizzesActive: num(val(summary, ["quizzesActive", "activeQuizzes"], 0)),
            quizAverage: round1(val(summary, ["quizAverage", "averageQuizScore", "quizAvg"], 0)),
        },
        upcomingExams: listOf(data, ["upcomingExams", "exams", "examSchedule"]).map((row, i) => ({
            id: val(row, ["id", "examId"], i + 1),
            name: val(row, ["name", "examName", "title", "exam"], ""),
            grade: val(row, ["grade", "gradeName", "gradeSign", "className"], ""),
            date: val(row, ["date", "examDate", "scheduledDate"], ""),
        })),
        marksEntry: listOf(data, ["marksEntry", "marksProgress", "marksEntryStatus"]).map((row) => ({
            exam: val(row, ["exam", "examName", "name"], ""),
            entered: num(val(row, ["entered", "completed", "done"], 0)),
            total: num(val(row, ["total", "expected", "totalSubjects"], 0)),
        })),
        raw: data,
    };
};

/* ------------------------------------------------------------------ common */

export const readCommonHeadline = (payload) => {
    const data = unwrap(payload);
    return {
        attendancePercent: round1(val(data, ["attendancePercent", "myAttendancePercent", "percent"], 0)),
        presentDays: num(val(data, ["presentDays", "present", "daysPresent"], 0)),
        workingDays: num(val(data, ["workingDays", "totalWorkingDays", "totalDays"], 0)),
        leaveLeft: num(val(data, ["leaveLeft", "leaveBalance", "remainingLeave"], 0)),
        leaveTotal: num(val(data, ["leaveTotal", "totalLeave", "entitlement"], 0)),
        pendingRequests: num(val(data, ["pendingRequests", "pendingLeaveRequests", "pending"], 0)),
        raw: data,
    };
};

export const readCommonAttendanceLeave = (payload) => {
    const data = unwrap(payload);
    const attendance = val(data, ["attendance", "myAttendance", "monthAttendance"], data) || {};

    return {
        attendance: {
            month: val(attendance, ["month", "monthName", "period"], ""),
            workingDays: num(val(attendance, ["workingDays", "totalWorkingDays", "totalDays"], 0)),
            present: num(val(attendance, ["present", "presentDays"], 0)),
            absent: num(val(attendance, ["absent", "absentDays"], 0)),
            late: num(val(attendance, ["late", "lateDays", "lateCount"], 0)),
            halfDay: num(val(attendance, ["halfDay", "halfDays", "halfDayCount"], 0)),
            percent: round1(val(attendance, ["percent", "percentage", "attendancePercent"], 0)),
        },
        leaveBalance: listOf(data, ["leaveBalance", "balances", "leaveTypes"]).map((row) => ({
            type: val(row, ["type", "leaveType", "name"], ""),
            used: num(val(row, ["used", "taken", "consumed"], 0)),
            total: num(val(row, ["total", "entitlement", "allocated"], 0)),
        })),
        leaveRequests: listOf(data, ["leaveRequests", "myLeaveRequests", "requests", "applications"]).map((row, i) => ({
            id: val(row, ["id", "leaveApplicationId", "applicationId"], i + 1),
            type: val(row, ["type", "leaveType"], ""),
            from: val(row, ["from", "fromDate", "startDate"], ""),
            to: val(row, ["to", "toDate", "endDate"], ""),
            days: num(val(row, ["days", "noOfDays", "totalDays"], 0)),
            status: val(row, ["status", "leaveStatus"], "Pending"),
            applied: val(row, ["applied", "appliedOn", "createdOn"], ""),
        })),
        raw: data,
    };
};

export const readCommonWork = (payload) => {
    const data = unwrap(payload);
    const homework = val(data, ["homework", "myHomework"], data) || {};

    return {
        homework: {
            assignedToday: num(val(homework, ["assignedToday", "todayCount", "today"], 0)),
            thisWeek: num(val(homework, ["thisWeek", "weekCount", "week"], 0)),
            dueTomorrow: num(val(homework, ["dueTomorrow", "tomorrow"], 0)),
            classesCovered: num(val(homework, ["classesCovered", "classes", "sections"], 0)),
        },
        submissions: listOf(data, ["submissions", "mySubmissions", "posts", "myPosts"]).map((row, i) => ({
            id: val(row, ["id", "postId"], i + 1),
            title: val(row, ["title", "headLine", "heading", "name"], ""),
            kind: val(row, ["kind", "type", "module", "category"], ""),
            status: val(row, ["status", "approvalStatus"], "Pending"),
            when: val(row, ["when", "postedOn", "createdOn", "date"], ""),
        })),
        workDone: {
            drafts: num(val(data, ["drafts", "draftCount"], 0)),
            awaitingApproval: num(val(data, ["awaitingApproval", "pendingApproval", "awaiting"], 0)),
            workDone: num(val(data, ["workDone", "workDoneCount", "completed"], 0)),
        },
        raw: data,
    };
};

export const readCommonForMe = (payload) => {
    const data = unwrap(payload);
    const payslip = val(data, ["payslip", "latestPayslip", "salary"], {}) || {};

    return {
        news: listOf(data, ["news", "newsAndCirculars", "announcements", "posts"]).map((row, i) => ({
            id: val(row, ["id", "newsId", "postId"], i + 1),
            title: val(row, ["title", "headLine", "heading"], ""),
            posted: val(row, ["posted", "postedOn", "createdOn", "when"], ""),
            kind: val(row, ["kind", "type", "module"], "News"),
        })),
        events: listOf(data, ["events", "upcomingEvents", "calendar"]).map((row, i) => ({
            id: val(row, ["id", "eventId"], i + 1),
            name: val(row, ["name", "title", "headLine", "event"], ""),
            date: val(row, ["date", "eventDate", "fromDate"], ""),
            tag: val(row, ["tag", "type", "category"], "Event"),
        })),
        birthdays: listOf(data, ["birthdays", "todayBirthdays", "birthdayList"]).map((row, i) => ({
            id: val(row, ["id", "rollNumber"], i + 1),
            name: val(row, ["name", "studentName", "staffName"], ""),
            detail: val(row, ["detail", "grade", "className", "designation"], ""),
            type: val(row, ["type", "userType", "category"], ""),
        })),
        payslip: {
            month: val(payslip, ["month", "payoutMonth", "period"], ""),
            net: val(payslip, ["net", "netPay", "netSalary", "amount"], ""),
            status: val(payslip, ["status", "payslipStatus"], ""),
            creditedOn: val(payslip, ["creditedOn", "creditedDate", "paidOn"], ""),
        },
        raw: data,
    };
};

/* ------------------------------------------------------------------- fetch */

const get = (url, params) =>
    axios.get(url, { params, headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

// Every section resolves on its own so one failing endpoint cannot blank the
// whole dashboard - the band that failed shows its own error instead.
const loadSections = async (sections) => {
    const results = await Promise.allSettled(sections.map((s) => get(s.url, s.params)));

    const data = {};
    const errors = {};
    results.forEach((result, i) => {
        const { key, read } = sections[i];
        if (result.status === "fulfilled") {
            const payload = result.value;
            if (payload?.error) {
                errors[key] = payload.message || "Could not load this section";
                data[key] = read(null);
                return;
            }
            data[key] = read(payload);
        } else {
            console.error(`dashboard section "${key}" failed`, result.reason);
            errors[key] = result.reason?.response?.data?.message || result.reason?.message || "Could not load this section";
            data[key] = read(null);
        }
    });

    return { data, errors };
};

/* Master Overview - the 3 group endpoints fire together, matching the
   "fire all 3 concurrently" note on the collection. */
export const useMasterDashboard = ({ rollNumber, academicYear, workingDays = 6, date, endDate }) => {
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!rollNumber || !academicYear) return;
        setLoading(true);
        const result = await loadSections([
            {
                key: "headline",
                url: MasterDashboardHeadline,
                params: { RollNumber: rollNumber, AcademicYear: academicYear, ...(date ? { Date: date } : {}) },
                read: readMasterHeadline,
            },
            {
                key: "attendance",
                url: MasterDashboardAttendanceSection,
                params: {
                    RollNumber: rollNumber,
                    WorkingDays: workingDays,
                    ...(date ? { Date: date } : {}),
                    ...(endDate ? { EndDate: endDate } : {}),
                },
                read: readMasterAttendance,
            },
            {
                key: "academics",
                url: MasterDashboardAcademicsSection,
                params: { RollNumber: rollNumber, AcademicYear: academicYear, ...(date ? { Date: date } : {}) },
                read: readMasterAcademics,
            },
        ]);
        setData(result.data);
        setErrors(result.errors);
        setLoading(false);
    }, [rollNumber, academicYear, workingDays, date, endDate]);

    useEffect(() => { load(); }, [load]);

    return { data, errors, loading, reload: load };
};

/* Common Dashboard - self-service, 4 group endpoints fired together. */
export const useCommonDashboard = ({ rollNumber, academicYear, date }) => {
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!rollNumber) return;
        setLoading(true);
        const result = await loadSections([
            {
                key: "headline",
                url: CommonDashboardHeadline,
                params: { RollNumber: rollNumber, AcademicYear: academicYear, ...(date ? { Date: date } : {}) },
                read: readCommonHeadline,
            },
            {
                key: "attendanceLeave",
                url: CommonDashboardAttendanceLeave,
                params: { RollNumber: rollNumber, AcademicYear: academicYear, ...(date ? { Date: date } : {}) },
                read: readCommonAttendanceLeave,
            },
            {
                key: "work",
                url: CommonDashboardWork,
                params: { RollNumber: rollNumber, ...(date ? { Date: date } : {}) },
                read: readCommonWork,
            },
            {
                key: "forMe",
                url: CommonDashboardForMe,
                params: { RollNumber: rollNumber, ...(date ? { Date: date } : {}) },
                read: readCommonForMe,
            },
        ]);
        setData(result.data);
        setErrors(result.errors);
        setLoading(false);
    }, [rollNumber, academicYear, date]);

    useEffect(() => { load(); }, [load]);

    return { data, errors, loading, reload: load };
};

// Convenience for the bands: "did this section come back with anything at all".
export const useSectionState = (data, errors, key) =>
    useMemo(() => ({
        section: data?.[key] || null,
        error: errors?.[key] || "",
        ready: Boolean(data?.[key]),
    }), [data, errors, key]);
