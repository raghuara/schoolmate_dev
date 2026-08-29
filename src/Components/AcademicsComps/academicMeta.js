import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchAllSubjects } from "../../Api/Api";
import { selectGrades } from "../../Redux/Slices/DropdownController";

const uniq = (list) => Array.from(new Set(list.filter(Boolean).map((s) => String(s).trim()))).filter(Boolean);

/* fetchAllSubjects answers one row per grade:
   { gradeID: "10", exams: [{ exam, primarySubjects: [], secondarySubjects: [] }] }
   Both Books & Chapters and the question paper wizard read subjects and
   exam names out of it, so the fetch lives here once. */
export const useGradeSubjects = () => {
    // The `|| []` has to be memoised - a fresh array every render would make
    // every callback below a new function and defeat the memos that use them.
    const storedGrades = useSelector(selectGrades);
    const grades = useMemo(() => storedGrades || [], [storedGrades]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;
    const userType = user?.userType;
    const token = "123";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(fetchAllSubjects, {
                params: { rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setRows(Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
        } catch (error) {
            console.error("fetchAllSubjects failed", error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [rollNumber, userType]);

    useEffect(() => { load(); }, [load]);

    const byGrade = useMemo(() => {
        const map = {};
        rows.forEach((row) => {
            const key = String(row?.gradeID ?? row?.gradeId ?? "");
            if (!key) return;
            const exams = Array.isArray(row?.exams) ? row.exams : [];
            map[key] = {
                exams: uniq(exams.map((e) => e?.exam)),
                subjects: uniq(exams.flatMap((e) => [
                    ...(e?.primarySubjects || []),
                    ...(e?.secondarySubjects || []),
                ])),
            };
        });
        return map;
    }, [rows]);

    const subjectsForGrade = useCallback(
        (gradeId) => byGrade[String(gradeId)]?.subjects || [],
        [byGrade]
    );

    const examsForGrade = useCallback(
        (gradeId) => byGrade[String(gradeId)]?.exams || [],
        [byGrade]
    );

    const allSubjects = useMemo(
        () => uniq(Object.values(byGrade).flatMap((g) => g.subjects)).sort(),
        [byGrade]
    );

    // Sections already ride along on the grades in redux, so no extra call.
    const sectionsForGrade = useCallback(
        (gradeId) => {
            const grade = (grades || []).find((g) => String(g.id) === String(gradeId));
            return uniq(grade?.sections || []);
        },
        [grades]
    );

    // Exams shared by every one of the given grades, plus the ones that are only
    // on some of them - a pattern spanning three classes should still offer an
    // exam that two of them have, just flagged.
    const examsForGrades = useCallback((gradeIds = []) => {
        const lists = gradeIds.map((id) => examsForGrade(id));
        if (!lists.length) return [];
        const all = uniq(lists.flat());
        return all.map((exam) => ({
            exam,
            missingIn: gradeIds.filter((id, i) => !lists[i].includes(exam)),
        }));
    }, [examsForGrade]);

    return {
        grades, byGrade, subjectsForGrade, examsForGrade, examsForGrades,
        sectionsForGrade, allSubjects, loading, reload: load,
    };
};

export const gradeById = (grades, gradeId) =>
    (grades || []).find((g) => String(g.id) === String(gradeId)) || null;

export const gradeSign = (grades, gradeId) => gradeById(grades, gradeId)?.sign || "";
