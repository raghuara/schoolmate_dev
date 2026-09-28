import React, { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import {
    choiceHint, groupMarks, groupSections, sectionHeading, sectionInstruction,
    sectionMarks, sectionMarksLabel, typeMeta,
} from "./questionPaperApi";
import {
    paperText, paperLang, optionLetterFor, durationLabel as langDuration,
    classLine, partLabel,
} from "./paperText";

export const PAPER_TEMPLATES = [
    {
        id: "cbse",
        name: "CBSE Board Sample Paper",
        description: "Roll number grid, Q.P. Code, boxed note and roman-numbered general instructions. Sections A to E.",
        accent: "#1F2937",
        preview: "Roll No. grid - Q.P. Code - NOTE box - SECTION A ... E",
        style: {
            font: "'Times New Roman', Georgia, serif",
            header: "cbse",
            titleSize: 21,
            bodySize: 13,
            columns: 1,
            pageBorder: true,
            registerBox: true,
            qpCode: true,
            noteBox: true,
            romanInstructions: true,
            uppercaseGroups: true,
            centreGroups: true,
            endMark: "",
        },
    },
    {
        id: "stateboard",
        name: "State Board Paper",
        description: "Time on the left, marks on the right, numbered note list, group headings per subject and marks in [brackets].",
        accent: "#1F73C2",
        preview: "Time: 2 Hours ... Marks: 40 - GEOGRAPHY / ECONOMICS - [3]",
        style: {
            font: "'Times New Roman', Georgia, serif",
            header: "stateboard",
            titleSize: 15,
            bodySize: 12.5,
            columns: 1,
            pageBorder: false,
            registerBox: false,
            qpCode: false,
            noteBox: false,
            numberedNote: true,
            uppercaseGroups: true,
            centreGroups: true,
            endMark: "*******",
        },
    },
    {
        id: "activity",
        name: "Activity Based (English)",
        description: "Section headings carry the genre in brackets, activities print with their section total, and OR blocks separate the alternatives.",
        accent: "#A749CC",
        preview: "SECTION - IV (LITERARY GENRE - NOVEL) ... (4) [16]",
        style: {
            font: "'Cambria', Georgia, serif",
            header: "simple",
            titleSize: 17,
            bodySize: 13,
            columns: 1,
            pageBorder: false,
            registerBox: false,
            uppercaseGroups: true,
            centreGroups: true,
            groupTotals: true,
            endMark: "",
        },
    },
    {
        id: "primary",
        name: "Primary / KG Worksheet",
        description: "Large friendly type, marks as 1x10=10 on the right, ruled writing lines and boxes for picture questions.",
        accent: "#7DC353",
        preview: "Time : 2 Hours ... M.M.:35 - Q1. ... 1x10=10",
        style: {
            font: "'Comic Sans MS', 'Segoe UI', sans-serif",
            header: "primary",
            titleSize: 17,
            bodySize: 14.5,
            columns: 1,
            pageBorder: false,
            registerBox: false,
            underlineTitle: true,
            tightEquation: true,
            dottedAnswerLines: true,
            uppercaseGroups: false,
            centreGroups: false,
            endMark: "",
        },
    },
    {
        id: "comprehension",
        name: "Comprehension Model Paper",
        description: "Extract boxes above the questions, stacked options and a running footer with the paper name and page number.",
        accent: "#0891B2",
        preview: "Read the passage ... [1x5=5] - Model Q-Paper - Page 1",
        style: {
            font: "'Segoe UI', Arial, sans-serif",
            header: "simple",
            titleSize: 16,
            bodySize: 12.5,
            columns: 1,
            pageBorder: false,
            registerBox: true,
            stackedOptions: true,
            footerLabel: true,
            uppercaseGroups: true,
            centreGroups: false,
            endMark: "",
        },
    },
    {
        id: "blueprint",
        name: "Blueprint / Format Sheet",
        description: "No questions - just the format. Q. No, nature of questions and marks, the sheet you hand to teachers before they set the paper.",
        accent: "#ED9146",
        preview: "Q. No. | Nature of questions | Marks",
        style: {
            font: "'Times New Roman', Georgia, serif",
            header: "stateboard",
            titleSize: 15,
            bodySize: 12.5,
            columns: 1,
            pageBorder: false,
            blueprint: true,
            numberedNote: true,
            uppercaseGroups: true,
            centreGroups: true,
            endMark: "*******",
        },
    },
    {
        id: "minimal",
        name: "Minimal Modern",
        description: "Sans-serif with thin rules and plenty of white space. Clean on screen and on plain paper.",
        accent: "#6B7280",
        preview: "Plain header - thin rules - no page border",
        style: {
            font: "'Segoe UI', Helvetica, Arial, sans-serif",
            header: "simple",
            titleSize: 17,
            bodySize: 13,
            columns: 1,
            pageBorder: false,
            registerBox: false,
            uppercaseGroups: false,
            centreGroups: false,
            endMark: "",
        },
    },
    {
        id: "bilingual",
        name: "Bilingual Split",
        description: "Every question prints with room for the second language beneath it. For dual medium schools.",
        accent: "#0EA5E9",
        preview: "Question / translation line under each question",
        style: {
            font: "'Segoe UI', Arial, sans-serif",
            header: "simple",
            titleSize: 16,
            bodySize: 12.5,
            columns: 1,
            pageBorder: true,
            registerBox: true,
            bilingual: true,
            uppercaseGroups: true,
            centreGroups: true,
            endMark: "",
        },
    },
];

export const templateById = (id) =>
    PAPER_TEMPLATES.find((t) => t.id === id) || PAPER_TEMPLATES[0];

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];
const roman = (n) => ROMAN[n] || String(n + 1);

const linesFor = (marks) => Math.min(10, Math.max(1, Math.round(Number(marks) || 1) * 2));

const RuledLines = ({ count, spacing = 22 }) => (
    <div style={{ marginTop: 6 }}>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} style={{ borderBottom: "1px solid #9CA3AF", height: spacing, marginBottom: 4 }} />
        ))}
    </div>
);

const RollNoBoxes = ({ accent, count = 9, lang }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{paperText(lang).rollNo}</span>
        <div style={{ display: "flex" }}>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    style={{
                        width: 20,
                        height: 22,
                        border: `1px solid ${accent}`,
                        borderRight: i === count - 1 ? `1px solid ${accent}` : "none",
                    }}
                />
            ))}
        </div>
    </div>
);

const WorkBox = ({ label, height = 120, accent }) => (
    <div
        style={{
            marginTop: 8,
            marginLeft: 22,
            border: `1px dashed ${accent}`,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: 11,
            fontStyle: "italic",
        }}
    >
        {label}
    </div>
);

const OptionList = ({ options, style, lang }) => {
    if (!options?.length) return null;
    const longOption = options.some((o) => String(o.text || "").length > 26);
    const stacked = style.stackedOptions || longOption;
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: stacked ? "1fr" : "1fr 1fr",
                columnGap: 26,
                rowGap: 4,
                marginTop: 5,
                marginLeft: 22,
            }}
        >
            {options.map((option, oi) => (
                <div key={option.id} style={{ fontSize: style.bodySize - 0.5, display: "flex", gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>{optionLetterFor(option.id, oi, lang)})</span>
                    <span>{option.text || " "}</span>
                </div>
            ))}
        </div>
    );
};

const PairTable = ({ pairs, style, accent }) => {
    if (!pairs?.length) return null;
    return (
        <table
            style={{
                marginTop: 7,
                marginLeft: 22,
                borderCollapse: "collapse",
                fontSize: style.bodySize - 0.5,
                width: "88%",
            }}
        >
            <thead>
                <tr>
                    <th style={{ border: `1px solid ${accent}`, padding: "4px 8px", textAlign: "left", width: "50%" }}>
                        Column A
                    </th>
                    <th style={{ border: `1px solid ${accent}`, padding: "4px 8px", textAlign: "left" }}>
                        Column B
                    </th>
                </tr>
            </thead>
            <tbody>
                {pairs.map((pair, i) => (
                    <tr key={i}>
                        <td style={{ border: `1px solid ${accent}`, padding: "4px 8px" }}>
                            {i + 1}. {pair.left}
                        </td>
                        <td style={{ border: `1px solid ${accent}`, padding: "4px 8px" }}>
                            {String.fromCharCode(97 + i)}) {pair.right}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const BulletBrief = ({ bullets, style }) => {
    if (!bullets?.length) return null;
    return (
        <div style={{ marginTop: 5, marginLeft: 34 }}>
            {bullets.filter(Boolean).map((point, i) => (
                <div key={i} style={{ fontSize: style.bodySize - 0.5, display: "flex", gap: 8, lineHeight: 1.7 }}>
                    <span>&mdash;</span>
                    <span>{point}</span>
                </div>
            ))}
        </div>
    );
};

const PassageBox = ({ passage, style, accent }) => {
    if (!passage) return null;
    return (
        <div
            style={{
                marginTop: 6,
                marginLeft: 22,
                marginBottom: 4,
                border: `1px solid ${accent}`,
                padding: "8px 10px",
                fontSize: style.bodySize - 1,
                lineHeight: 1.7,
                textAlign: "justify",
                // The sheet colour shows through - a fill of its own would print
                // as a white patch on tinted stock. The border already sets the
                // extract apart from the question text.
                background: "transparent",
            }}
        >
            {passage}
        </div>
    );
};

const QuestionBody = ({ question, style, accent, answerSpace, lang }) => {
    const meta = typeMeta(question.type);
    return (
        <>
            {meta.hasOptions && <OptionList options={question.options} style={style} lang={lang} />}
            {meta.hasPairs && <PairTable pairs={question.pairs} style={style} accent={accent} />}
            {meta.hasBullets && <BulletBrief bullets={question.bullets} style={style} />}
            {answerSpace && meta.needsSpace && (
                <WorkBox
                    accent="#D1D5DB"
                    label={
                        question.type === "mapwork"
                            ? "Space for the outline map"
                            : question.type === "graph"
                                ? "Space for the graph"
                                : "Space for the picture"
                    }
                    height={question.type === "picture" ? 90 : 150}
                />
            )}
            {answerSpace && meta.ruled && <RuledLines count={style.ruledCount || 6} spacing={26} />}
        </>
    );
};

const QuestionBlock = ({ question, number, section, style, accent, showAnswers, answerSpace, lang, tag = true }) => {
    const meta = typeMeta(question.type);
    // Answer ruling is part of the answer space, never part of the question, so
    // the whole thing is off in "questions only" mode however the pattern or
    // the template asked for it.
    const showAnswerLines =
        answerSpace &&
        (Number(section?.answerLines) > 0 ||
            (style.dottedAnswerLines && !meta.hasOptions && !meta.needsSpace && !meta.ruled));

    return (
        <div data-qp-block={tag ? "q" : undefined} style={{ breakInside: "avoid", marginBottom: answerSpace ? (style.dottedAnswerLines ? 14 : 11) : 9 }}>
            {/* The extract sits above the question it belongs to. */}
            {meta.hasPassage && question.passage && (
                <PassageBox passage={question.passage} style={style} accent={accent} />
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: style.bodySize, fontWeight: 700, minWidth: 24 }}>{number}.</span>
                <span style={{ fontSize: style.bodySize, flex: 1, lineHeight: 1.65, whiteSpace: "pre-line" }}>
                    {question.text}
                </span>
                {question.marks > 1 && (
                    <span style={{ fontSize: style.bodySize - 1.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                        [{question.marks}]
                    </span>
                )}
            </div>

            <QuestionBody question={question} style={style} accent={accent} answerSpace={answerSpace} lang={lang} />

            {style.bilingual && (
                <div
                    style={{
                        marginLeft: 32, marginTop: 6, borderLeft: "2px solid #E5E7EB", paddingLeft: 10,
                        minHeight: 20, fontSize: style.bodySize - 1, color: "#6B7280", fontStyle: "italic",
                    }}
                >
                    {question.translation || "( translation )"}
                </div>
            )}

            {question.alternative && (
                <>
                    <div style={{ textAlign: "center", fontSize: style.bodySize - 0.5, fontWeight: 700, margin: "7px 0" }}>
                        OR
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ minWidth: 24 }} />
                        <span style={{ fontSize: style.bodySize, flex: 1, lineHeight: 1.65, whiteSpace: "pre-line" }}>
                            {question.alternative.text}
                        </span>
                    </div>
                    {meta.hasOptions && <OptionList options={question.alternative.options} style={style} lang={lang} />}
                </>
            )}

            {showAnswerLines && (
                <RuledLines count={Number(section?.answerLines) || linesFor(question.marks)} />
            )}

            {showAnswers && (
                <div style={{ marginLeft: 32, marginTop: 5, fontSize: style.bodySize - 1, color: "#047857", fontWeight: 600 }}>
                    Ans: {meta.hasOptions
                        ? `${question.answerKey}) ${(question.options.find((o) => o.id === question.answerKey) || {}).text || ""}`
                        : question.answerKey || "-"}
                </div>
            )}
        </div>
    );
};

const CbseHeader = ({ paper, pattern, style, accent, school, lang }) => (
    <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <RollNoBoxes accent={accent} lang={lang} />
            {style.qpCode && (
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                    Q.P. Code <span style={{ fontSize: 15 }}>{paper?.paperCode || "01"}</span>
                </div>
            )}
        </div>

        {style.qpCode && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <div style={{ border: `1px solid ${accent}`, padding: "6px 10px", fontSize: 11.5, lineHeight: 1.5, maxWidth: 270 }}>
                    Candidates must write the Q.P. Code on the title page of the answer-book.
                </div>
            </div>
        )}

        <div style={{ textAlign: "center", marginTop: 18 }}>
            <div style={{ fontSize: style.titleSize, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {paper?.name || school?.name || "Question Paper"}
            </div>
            <div style={{ fontSize: style.titleSize - 4, fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>
                {paper?.subject || ""}
            </div>
            {school?.name && (
                <div style={{ fontSize: 11.5, color: "#4B5563", marginTop: 4 }}>{school.name}</div>
            )}
        </div>

        <div
            style={{
                display: "flex", justifyContent: "space-between", gap: 12,
                border: `1px dashed ${accent}`, padding: "5px 10px", marginTop: 14, fontSize: 12,
            }}
        >
            <span>{paperText(lang).timeAllowed} : {langDuration(paper?.durationMinutes, lang)}</span>
            <span>{paperText(lang).maximumMarks} : {paper?.totalMarks ?? 0}</span>
        </div>

        {style.noteBox && (
            <div style={{ border: `1px dashed ${accent}`, padding: "8px 12px", marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, fontStyle: "italic", marginBottom: 5 }}>NOTE:</div>
                {[
                    "Q.P. Code given on the right hand side of the question paper should be written on the title page of the answer-book by the candidate.",
                    `Please check that this question paper contains ${paper?.questionCount || (pattern?.sections || []).reduce((n, s) => n + (Number(s.questionsToPrint) || 0), 0)} questions.`,
                    "Please write down the serial number of the question in the answer-book before attempting it.",
                    pattern?.readingTimeMinutes
                        ? `${pattern.readingTimeMinutes} minute time has been allotted to read this question paper. The students will read the question paper only and will not write any answer on the answer-book during this period.`
                        : null,
                ].filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, fontStyle: "italic", lineHeight: 1.6, marginBottom: 3 }}>
                        <span style={{ minWidth: 22, textAlign: "right" }}>({roman(i)})</span>
                        <span style={{ fontWeight: i === 2 ? 700 : 400 }}>{line}</span>
                    </div>
                ))}
            </div>
        )}
    </>
);

const StateBoardHeader = ({ paper, style, accent, lang }) => (
    <>
        <div style={{ textAlign: "center", fontSize: style.titleSize, fontWeight: 700, marginBottom: 12 }}>
            {paper?.name || "Question Paper"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
            <span>{paperText(lang).time}: {langDuration(paper?.durationMinutes, lang, true)}</span>
            <span>{paperText(lang).marks}: {paper?.totalMarks ?? 0}</span>
        </div>
        <div style={{ textAlign: "center", fontSize: style.titleSize - 1, fontWeight: 700, textTransform: "uppercase", marginTop: 12 }}>
            {paper?.subject || ""}
        </div>
        <div style={{ borderTop: `1px dashed ${accent}`, marginTop: 10, marginBottom: 8 }} />
    </>
);

const PrimaryHeader = ({ paper, style, lang }) => (
    <>
        <div style={{ textAlign: "center" }}>
            {[paper?.examName, paper?.grade ? `${paper.grade} CLASS` : "", paper?.subject].filter(Boolean).map((line, i) => (
                <div
                    key={i}
                    style={{
                        fontSize: style.titleSize - i,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        textDecoration: "underline",
                        marginBottom: 4,
                    }}
                >
                    {line}
                </div>
            ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginTop: 12 }}>
            <span>{paperText(lang).time} : {langDuration(paper?.durationMinutes, lang, true)}</span>
            <span>{paperText(lang).mmShort}:{paper?.totalMarks ?? 0}</span>
        </div>
    </>
);

const SimpleHeader = ({ paper, style, accent, school, lang }) => (
    <>
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: style.titleSize, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>
                {school?.name || "Your School Name"}
            </div>
            {school?.address && <div style={{ fontSize: 11.5, color: "#4B5563", marginTop: 2 }}>{school.address}</div>}
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                {paper?.examName || "Examination"}{paper?.academicYear ? ` - ${paper.academicYear}` : ""}
            </div>
        </div>

        <div style={{ borderTop: `1.5px solid ${accent}`, marginTop: 10, marginBottom: 10 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, fontSize: 12.5, fontWeight: 600 }}>
            <div>
                <div>{classLine(paper?.grade, lang)}</div>
                <div style={{ marginTop: 3 }}>{paperText(lang).subject} : {paper?.subject || "-"}</div>
            </div>
            {style.registerBox && <RollNoBoxes accent={accent} count={8} lang={lang} />}
            <div style={{ textAlign: "right" }}>
                <div>{paperText(lang).time} : {langDuration(paper?.durationMinutes, lang, true)}</div>
                <div style={{ marginTop: 3 }}>{paperText(lang).maxMarks} : {paper?.totalMarks ?? 0}</div>
            </div>
        </div>

        <div style={{ borderTop: `1px solid ${accent}`, marginTop: 10, marginBottom: 12 }} />
    </>
);

const Instructions = ({ pattern, paper, style, accent, lang }) => {
    const lines = String(pattern?.instructions || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length && !paper?.notes) return null;

    if (style.romanInstructions) {
        return (
            <div style={{ marginTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>{paperText(lang).generalInstructions}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, fontStyle: "italic", marginBottom: 6 }}>
                    {paperText(lang).generalInstructionsNote}
                </div>
                {lines.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.75, marginBottom: 2 }}>
                        <span style={{ minWidth: 24, textAlign: "right" }}>({roman(i)})</span>
                        <span>{line}</span>
                    </div>
                ))}
                {paper?.notes && (
                    <div style={{ fontSize: 11.5, lineHeight: 1.75, marginTop: 6, marginLeft: 32 }}>{paper.notes}</div>
                )}
            </div>
        );
    }

    if (style.numberedNote) {
        return (
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 3 }}>Note:</div>
                {lines.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.7, marginLeft: 12 }}>
                        <span style={{ minWidth: 22 }}>({i + 1})</span>
                        <span style={{ fontWeight: 600 }}>{line}</span>
                    </div>
                ))}
                {paper?.notes && (
                    <div style={{ fontSize: 11.5, lineHeight: 1.7, marginTop: 5, marginLeft: 34 }}>{paper.notes}</div>
                )}
            </div>
        );
    }

    return (
        <div style={{ marginBottom: 14, borderLeft: `2px solid ${accent}`, paddingLeft: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>General Instructions :</div>
            {lines.map((line, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.65 }}>
                    {i + 1}. {line}
                </div>
            ))}
            {paper?.notes && (
                <div style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.65, marginTop: 4 }}>{paper.notes}</div>
            )}
        </div>
    );
};

const BlueprintTable = ({ groups, style, accent, lang }) => (
    <div style={{ marginTop: 6 }}>
        <div style={{ borderTop: `1px dashed ${accent}`, borderBottom: `1px dashed ${accent}`, padding: "5px 0", marginBottom: 10 }}>
            <div style={{ display: "flex", fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 62 }}>{paperText(lang).questionNo}</span>
                <span style={{ flex: 1 }}>{paperText(lang).natureOfQuestions}</span>
                <span style={{ width: 60, textAlign: "right" }}>{paperText(lang).marksColumn}</span>
            </div>
        </div>

        {groups.map((group) => (
            <div key={group.name || "main"} style={{ marginBottom: 16 }}>
                {group.name && (
                    <div style={{ textAlign: "center", fontSize: style.bodySize + 1, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>
                        {group.name}
                    </div>
                )}
                {group.sections.map((section) => (
                    <div key={section.id} data-qp-block="q" style={{ display: "flex", alignItems: "flex-start", fontSize: style.bodySize, marginBottom: 7, breakInside: "avoid" }}>
                        <span style={{ width: 62, fontWeight: 700 }}>{partLabel(sectionHeading(section), lang)}</span>
                        <span style={{ flex: 1, lineHeight: 1.6 }}>
                            {section.title || typeMeta(section.type).label}
                            {choiceHint(section) && (
                                <em style={{ marginLeft: 5 }}>{choiceHint(section)}</em>
                            )}
                        </span>
                        <span style={{ width: 60, textAlign: "right", fontWeight: 700 }}>
                            [{sectionMarks(section)}]
                        </span>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

/* The printable paper. Kept in plain divs with inline styles so html2pdf
   renders it exactly as it appears on screen. */
/* Sheet colour. A pure-white page glares under classroom tube lights and shows
   every toner streak, so the off-white stock is the default; white and cream
   are there for schools that want them. All three print exactly as previewed -
   the print window forces colour fidelity on. */
/* Board papers are printed on tinted stock - pink, buff, green and blue separate
   the sets and subjects, and make a photocopy obvious at a glance. Every tint
   here is light enough to keep black body text at print-legible contrast. */
export const PAPER_COLORS = [
    { key: "gray", label: "Gray", hex: "#F3F4F6" },
    { key: "white", label: "White", hex: "#FFFFFF" },
    { key: "cream", label: "Cream", hex: "#FAF3E3" },
    { key: "pink", label: "Pink", hex: "#FBE4E8" },
    { key: "green", label: "Green", hex: "#E8F4EA" },
    { key: "blue", label: "Blue", hex: "#E7F0FA" },
];

export const DEFAULT_PAPER_COLOR = "white";

/* Page sizes schools actually print on. Width and height are the sheet at 96dpi,
   so the same node lays out 1:1 in the print window and in the PDF. */
export const PAPER_SIZES = [
    { key: "a4", label: "A4", hint: "210 x 297 mm", width: 794, height: 1123, css: "A4", pdf: "a4" },
    { key: "legal", label: "Legal", hint: "8.5 x 14 in", width: 816, height: 1344, css: "8.5in 14in", pdf: "legal" },
    { key: "fs", label: "FS", hint: "8.5 x 13 in", width: 816, height: 1248, css: "8.5in 13in", pdf: [612, 936] },
    { key: "letter", label: "Letter", hint: "8.5 x 11 in", width: 816, height: 1056, css: "8.5in 11in", pdf: "letter" },
];

export const DEFAULT_PAPER_SIZE = "a4";

export const paperSizeOf = (key) => PAPER_SIZES.find((s) => s.key === key) || PAPER_SIZES[0];

/* Blank space kept at the top and bottom of every page after the first, so a
   question pushed to a new page never prints against the sheet edge. */
const PAGE_PAD = 48;
const KEEP_WITH_NEXT = 70;

/* Moves any block that would be cut by a page edge to the top of the next
   page. The margins live in the DOM, so the on-screen preview, the print
   window and the PDF all break in the same places. Returns the page count. */
const paginate = (root, pageHeight) => {
    if (!root) return 1;
    const blocks = Array.from(root.querySelectorAll("[data-qp-block]"));

    blocks.forEach((b) => {
        if (b.dataset.qpShift) {
            b.style.marginTop = b.dataset.qpBase || "";
            delete b.dataset.qpShift;
            delete b.dataset.qpBase;
        }
    });

    const usable = pageHeight - PAGE_PAD * 2;

    blocks.forEach((b) => {
        const rootRect = root.getBoundingClientRect();
        const scale = root.offsetWidth ? rootRect.width / root.offsetWidth : 1;
        const top = (b.getBoundingClientRect().top - rootRect.top) / (scale || 1);
        const height = b.offsetHeight;
        const keep = b.dataset.qpBlock === "heading" ? KEEP_WITH_NEXT : 0;
        if (height + keep > usable) return;

        const page = Math.floor(top / pageHeight);
        const intoPage = top - page * pageHeight;
        let add = 0;
        if (page > 0 && intoPage < PAGE_PAD) add = PAGE_PAD - intoPage;
        else if (top + height + keep > (page + 1) * pageHeight - PAGE_PAD) add = (page + 1) * pageHeight + PAGE_PAD - top;
        if (add <= 0) return;

        const base = parseFloat(window.getComputedStyle(b).marginTop) || 0;
        b.dataset.qpBase = b.style.marginTop;
        b.dataset.qpShift = "1";
        b.style.marginTop = `${base + add}px`;
    });

    return Math.max(1, Math.ceil(root.scrollHeight / pageHeight));
};

export const paperColorHex = (key) =>
    (PAPER_COLORS.find((c) => c.key === key) || PAPER_COLORS[0]).hex;


/* One A4 page at 96dpi. 794 x 1123 is the same 1:1.414 ratio as the real sheet,
   so a node this wide slices cleanly into pages. */
export const A4_PAGE_PX = 1123;

/* The sheet element is only as tall as its content, so a paper that runs to 1.4
   pages leaves the bottom 60% of page 2 with no background behind it - white,
   whatever colour the sheet is. Growing it to a whole number of pages puts the
   element's own background under every page.

   Padding the element rather than the page is what makes this work in Firefox
   too: unticking "Print backgrounds" there suppresses the page canvas, but an
   element carrying print-color-adjust: exact still prints its fill.

   Returns the undo, so the on-screen preview is never left padded. */
export const padToWholePages = (node, pageHeight = A4_PAGE_PX) => {
    if (!node) return () => {};
    const previous = node.style.minHeight;
    const pages = Math.max(1, Math.ceil(node.scrollHeight / pageHeight));
    node.style.minHeight = `${pages * pageHeight}px`;
    return () => { node.style.minHeight = previous; };
};

/* The sheet colour is what the paper in the tray looks like. It is only
   printed when printColor is on - otherwise the page stays white and the
   coloured stock supplies the tint, with no toner spent on a background. */
export const printedSheetHex = (paperColor, printColor) =>
    (printColor ? paperColorHex(paperColor) : "#FFFFFF");

export const exportPaperPdf = (node, { filename, sizeKey = DEFAULT_PAPER_SIZE, sheetHex = "#FFFFFF" } = {}) => {
    if (!node) return Promise.resolve();
    const size = paperSizeOf(sizeKey);
    const undoPad = padToWholePages(node, size.height);
    return html2pdf()
        .set({
            margin: 0,
            filename: filename || "question-paper.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: sheetHex, width: size.width, windowWidth: size.width },
            jsPDF: { unit: "pt", format: size.pdf, orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] },
        })
        .from(node)
        .save()
        .then(undoPad, undoPad);
};

/* A bare popup leaves the browser free to draw its own header and footer - the
   document title, the source URL, the page number and the print date - into the
   @page margin band. Zeroing that margin removes the band, so the sheet prints
   clean; PaperDocument's own 44-50px padding supplies the real margins.
   print-color-adjust keeps the sheet colour, which browsers drop to save ink. */
export const printPaperNode = (node, title, { sheetHex = "#FFFFFF", sizeKey = DEFAULT_PAPER_SIZE } = {}) => {
    if (!node) return false;
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return false;
    const size = paperSizeOf(sizeKey);

    // The copy has to carry the padding, so grow the node, read it, put it back.
    const undoPad = padToWholePages(node, size.height);

    win.document.write(
        `<html><head><title>${title || "Question Paper"}</title><style>
            @page { size: ${size.css}; margin: 0; }
            .qp-page-guide { display: none !important; }
            html, body {
                margin: 0;
                padding: 0;
                background: ${sheetHex};
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style></head><body>${node.outerHTML}</body></html>`
    );
    undoPad();
    win.document.close();
    win.focus();

    // Printing before the written document has laid out gives a blank first
    // page. The window is left open so the browser can finish spooling -
    // closing it mid-job truncates the print in Firefox.
    const fire = () => { try { win.print(); } catch (err) { /* window already closed */ } };
    if (win.document.readyState === "complete") fire();
    else win.onload = fire;
    return true;
};

const PaperDocument = forwardRef(({
    paper,
    pattern,
    questions = [],
    templateId = "cbse",
    school = {},
    showAnswers = false,
    paperColor = DEFAULT_PAPER_COLOR,
    answerSpace = false,
    language,
    paperSize = DEFAULT_PAPER_SIZE,
    pageGuides = false,
    onPages,
}, ref) => {
    const size = paperSizeOf(paperSize);
    const rootRef = useRef(null);
    const [pageCount, setPageCount] = useState(1);

    const setRefs = useCallback((node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    }, [ref]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        let frame = 0;
        const run = () => {
            const pages = paginate(root, size.height);
            setPageCount((prev) => (prev === pages ? prev : pages));
        };
        run();
        const later = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(run); };
        if (document.fonts?.ready) document.fonts.ready.then(later);
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(later) : null;
        observer?.observe(root);
        return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
    });

    useLayoutEffect(() => { if (onPages) onPages(pageCount); }, [pageCount, onPages]);

    const lang = paperLang(language || paper?.medium);
    const template = templateById(templateId);
    const style = template.style;
    const accent = template.accent;
    const sections = pattern?.sections || [];
    const groups = groupSections(sections);

    let running = 0;

    const header = (() => {
        if (style.header === "cbse") return <CbseHeader paper={paper} pattern={pattern} style={style} accent={accent} school={school} lang={lang} />;
        if (style.header === "stateboard") return <StateBoardHeader paper={paper} style={style} accent={accent} lang={lang} />;
        if (style.header === "primary") return <PrimaryHeader paper={paper} style={style} lang={lang} />;
        return <SimpleHeader paper={paper} style={style} accent={accent} school={school} lang={lang} />;
    })();

    return (
        <div
            ref={setRefs}
            style={{
                width: `${size.width}px`,
                minHeight: `${size.height}px`,
                margin: "0 auto",
                background: paperColorHex(paperColor),
                color: "#111827",
                fontFamily: style.font,
                padding: style.pageBorder ? "24px" : "44px 50px",
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            <div
                style={{
                    border: style.pageBorder ? `2px solid ${accent}` : "none",
                    padding: style.pageBorder ? "20px 24px" : 0,
                    minHeight: style.pageBorder ? `${size.height - 59}px` : "auto",
                    boxSizing: "border-box",
                }}
            >
                {header}

                <Instructions pattern={pattern} paper={paper} style={style} accent={accent} lang={lang} />

                {style.blueprint ? (
                    <BlueprintTable groups={groups} style={style} accent={accent} lang={lang} />
                ) : (
                    groups.map((group) => (
                        <div key={group.name || "main"} style={{ marginBottom: 6 }}>
                            {group.name && (
                                <div
                                    data-qp-block="heading"
                                    style={{
                                        textAlign: style.centreGroups ? "center" : "left",
                                        margin: "16px 0 10px",
                                        breakAfter: "avoid",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: style.bodySize + 2,
                                            fontWeight: 800,
                                            letterSpacing: 1.2,
                                            textTransform: style.uppercaseGroups ? "uppercase" : "none",
                                            borderBottom: `1.5px solid ${accent}`,
                                            paddingBottom: 2,
                                        }}
                                    >
                                        {group.name}
                                    </span>
                                    {style.groupTotals && (
                                        <span style={{ fontSize: style.bodySize - 0.5, fontWeight: 700, marginLeft: 10 }}>
                                            [{groupMarks(group)}]
                                        </span>
                                    )}
                                </div>
                            )}

                            {group.sections.map((section) => {
                                const items = questions.filter((q) => q.sectionId === section.id);
                                const heading = partLabel(sectionHeading(section), lang);
                                const marksLabel = sectionMarksLabel(section);
                                const tightMarks = style.tightEquation ? marksLabel.replace(/[()]/g, "").replace(/\s/g, "") : marksLabel;
                                const twoColumn = style.columns === 2 && ["mcq", "truefalse", "fillblank", "oneword"].includes(section.type);

                                return (
                                    <div key={section.id} style={{ marginBottom: 16 }}>
                                        <div
                                            data-qp-block="heading"
                                            style={{
                                                display: "flex",
                                                alignItems: "baseline",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                marginBottom: 6,
                                            }}
                                        >
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <span style={{ fontSize: style.bodySize + 0.5, fontWeight: 800 }}>
                                                    {heading}{heading && section.title ? " " : ""}
                                                </span>
                                                <span style={{ fontSize: style.bodySize, fontWeight: 700 }}>
                                                    {section.title}
                                                </span>
                                            </div>
                                            {tightMarks && (
                                                <span style={{ fontSize: style.bodySize - 0.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                                                    {tightMarks}
                                                </span>
                                            )}
                                        </div>

                                        {!style.tightEquation && (
                                            <div style={{ fontSize: style.bodySize - 1, fontStyle: "italic", color: "#374151", marginBottom: 8 }}>
                                                {sectionInstruction(section)}
                                            </div>
                                        )}

                                        <div
                                            data-qp-block={twoColumn ? "q" : undefined}
                                            style={twoColumn ? { columnCount: 2, columnGap: 30 } : undefined}
                                        >
                                            {items.length === 0 ? (
                                                <div style={{ fontSize: style.bodySize - 1, color: "#9CA3AF", fontStyle: "italic" }}>
                                                    No questions added to this section yet.
                                                </div>
                                            ) : (
                                                items.map((question) => {
                                                    running += 1;
                                                    return (
                                                        <QuestionBlock
                                                            key={question.id}
                                                            question={question}
                                                            number={running}
                                                            section={section}
                                                            style={style}
                                                            accent={accent}
                                                            showAnswers={showAnswers}
                                                            answerSpace={answerSpace}
                                                            lang={lang}
                                                            tag={!twoColumn}
                                                        />
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}

                {style.endMark && (
                    <div data-qp-block="q" style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, fontWeight: 700, letterSpacing: 3 }}>
                        {style.endMark}
                    </div>
                )}

                {style.footerLabel && (
                    <div
                        data-qp-block="q"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: `1px solid ${accent}`,
                            marginTop: 26,
                            paddingTop: 6,
                            fontSize: 10.5,
                            color: "#6B7280",
                        }}
                    >
                        <span>{paper?.name || "Model Q-Paper"}{paper?.academicYear ? ` ${paper.academicYear}` : ""}</span>
                        <span>Page {pageCount} of {pageCount}</span>
                    </div>
                )}
            </div>

            {pageGuides && Array.from({ length: pageCount - 1 }, (_, i) => (
                <div
                    key={i}
                    className="qp-page-guide"
                    data-html2canvas-ignore="true"
                    style={{
                        position: "absolute",
                        left: -1,
                        right: -1,
                        top: (i + 1) * size.height - 7,
                        height: 14,
                        background: "#EEF0F4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "sans-serif",
                            fontSize: 9.5,
                            fontWeight: 700,
                            color: "#6B7280",
                            background: "#fff",
                            border: "1px solid #D1D5DB",
                            borderRadius: 3,
                            padding: "0 5px",
                            marginRight: 8,
                            lineHeight: "13px",
                        }}
                    >
                        Page {i + 2}
                    </span>
                </div>
            ))}
        </div>
    );
});

PaperDocument.displayName = "PaperDocument";

export default PaperDocument;
