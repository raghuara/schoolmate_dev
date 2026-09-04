export const PAPER_LANGUAGES = [
    { key: "en", label: "English" },
    { key: "ta", label: "தமிழ்" },
    { key: "hi", label: "हिन्दी" },
];

const TEXT = {
    en: {
        rollNo: "Roll No.",
        regNo: "Register Number",
        timeAllowed: "Time allowed",
        maximumMarks: "Maximum Marks",
        time: "Time",
        marks: "Marks",
        maxMarks: "Max. Marks",
        mmShort: "M.M.",
        klass: "Class",
        subject: "Subject",
        generalInstructions: "GENERAL INSTRUCTIONS:",
        generalInstructionsNote: "Read the following instructions very carefully and strictly follow them:",
        marksColumn: "Marks",
        questionNo: "Q. No.",
        natureOfQuestions: "Nature of questions",
        page: "Page",
        answerKey: "ANSWER KEY",
        part: "PART",
        section: "SECTION",
        qpCode: "Q.P. Code",
        hoursShort: "Hours",
        hrsShort: "Hrs",
        minShort: "Min",
        hourLong: "hour",
        hoursLong: "hours",
        minutesLong: "minutes",
    },
    ta: {
        rollNo: "பதிவு எண்",
        regNo: "பதிவு எண்",
        timeAllowed: "காலம்",
        maximumMarks: "மதிப்பெண்கள்",
        time: "காலம்",
        marks: "மதிப்பெண்கள்",
        maxMarks: "மதிப்பெண்கள்",
        mmShort: "மதிப்பெண்",
        klass: "வகுப்பு",
        subject: "பாடம்",
        generalInstructions: "பொதுவான அறிவுரைகள்:",
        generalInstructionsNote: "கீழ்க்கண்ட அறிவுரைகளை கவனமாகப் படித்து பின்பற்றவும்:",
        marksColumn: "மதிப்பெண்",
        questionNo: "வினா எண்",
        natureOfQuestions: "வினாவின் தன்மை",
        page: "பக்கம்",
        answerKey: "விடைக் குறிப்பு",
        part: "பகுதி",
        section: "பகுதி",
        qpCode: "வினாத்தாள் குறியீடு",
        hoursShort: "மணி",
        hrsShort: "மணி",
        minShort: "நிமிடம்",
        hourLong: "மணி",
        hoursLong: "மணி",
        minutesLong: "நிமிடங்கள்",
    },
    hi: {
        rollNo: "अनुक्रमांक",
        regNo: "अनुक्रमांक",
        timeAllowed: "समय",
        maximumMarks: "अधिकतम अंक",
        time: "समय",
        marks: "अंक",
        maxMarks: "अधिकतम अंक",
        mmShort: "अ.अं.",
        klass: "कक्षा",
        subject: "विषय",
        generalInstructions: "सामान्य निर्देश:",
        generalInstructionsNote: "निम्नलिखित निर्देशों को ध्यानपूर्वक पढ़कर उनका पालन कीजिए:",
        marksColumn: "अंक",
        questionNo: "प्रश्न सं.",
        natureOfQuestions: "प्रश्न का स्वरूप",
        page: "पृष्ठ",
        answerKey: "उत्तर कुंजी",
        part: "भाग",
        section: "खंड",
        qpCode: "प्रश्नपत्र कोड",
        hoursShort: "घंटे",
        hrsShort: "घंटे",
        minShort: "मिनट",
        hourLong: "घंटा",
        hoursLong: "घंटे",
        minutesLong: "मिनट",
    },
};

const OPTION_LETTERS = {
    en: ["A", "B", "C", "D", "E", "F"],
    ta: ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ"],
    hi: ["क", "ख", "ग", "घ", "ङ", "च"],
};

export const paperLang = (value) => {
    const key = String(value || "").trim().toLowerCase();
    if (key === "ta" || key === "tamil" || key === "தமிழ்") return "ta";
    if (key === "hi" || key === "hindi" || key === "हिन्दी" || key === "हिंदी") return "hi";
    return "en";
};

export const paperText = (lang) => TEXT[paperLang(lang)] || TEXT.en;

export const optionLetter = (index, lang) => {
    const set = OPTION_LETTERS[paperLang(lang)] || OPTION_LETTERS.en;
    return set[index] ?? OPTION_LETTERS.en[index] ?? String(index + 1);
};

export const optionLetterFor = (id, index, lang) => {
    const key = paperLang(lang);
    if (key === "en") return id || optionLetter(index, key);
    const fromId = OPTION_LETTERS.en.indexOf(String(id || "").trim().toUpperCase());
    return optionLetter(fromId >= 0 ? fromId : index, key);
};

export const durationLabel = (minutes, lang, short = false) => {
    const t = paperText(lang);
    const total = Number(minutes) || 0;
    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (paperLang(lang) === "ta") {
        if (hours && mins) return `${hours}.${String(mins).padStart(2, "0")} ${t.hoursShort}`;
        if (hours) return `${hours} ${t.hoursShort}`;
        return `${mins} ${t.minutesLong}`;
    }
    if (hours && mins) return short ? `${hours} ${t.hrsShort} ${mins} ${t.minShort}` : `${hours} ${t.hoursLong} ${mins} ${t.minutesLong}`;
    if (hours) return short ? `${hours} ${t.hoursShort}` : `${hours} ${hours > 1 ? t.hoursLong : t.hourLong}`;
    return `${mins} ${t.minutesLong}`;
};

export const classLine = (grade, lang) => {
    const value = String(grade || "").trim() || "-";
    const key = paperLang(lang);
    if (key === "ta") return `${value}-ஆம் ${TEXT.ta.klass}`;
    if (key === "hi") return `${TEXT.hi.klass} ${value}`;
    return `${TEXT.en.klass} : ${value}`;
};

export const partLabel = (label, lang) => {
    const raw = String(label || "").trim();
    if (!raw) return "";
    const key = paperLang(lang);
    if (key === "en") return raw;

    const t = TEXT[key];
    const match = raw.match(/^(PART|SECTION)\s*[-–—]?\s*(.+)$/i);
    if (!match) return raw;

    const word = match[1].toUpperCase() === "SECTION" ? t.section : t.part;
    const suffix = match[2].trim();
    const letterIndex = OPTION_LETTERS.en.indexOf(suffix.toUpperCase());
    const rendered = letterIndex >= 0 ? optionLetter(letterIndex, key) : suffix;
    return `${word}-${rendered}`;
};
