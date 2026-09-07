const svg = (width, height, body) =>
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height +
        '" viewBox="0 0 ' + width + " " + height + '">' +
        '<rect width="100%" height="100%" fill="#ffffff"/>' + body +
        "</svg>"
    );

const glyph = (mark, size = 170) =>
    svg(size, size,
        '<text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="' +
        Math.round(size * 0.6) +
        '" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">' + mark + "</text>"
    );

const solarSystem = () => {
    const orbits = [96, 148, 200, 252, 304, 356]
        .map((r) =>
            '<ellipse cx="26" cy="150" rx="' + r + '" ry="' + Math.round(r * 0.92) +
            '" fill="none" stroke="#1f2937" stroke-width="1.6" stroke-dasharray="8 7"/>')
        .join("");
    const sun = '<path d="M 26 40 A 110 110 0 0 1 26 260" fill="none" stroke="#1f2937" stroke-width="4" stroke-dasharray="10 8"/>';
    const planets = [
        { x: 112, y: 96, r: 13 }, { x: 152, y: 194, r: 17 }, { x: 214, y: 88, r: 19 },
        { x: 254, y: 206, r: 16 }, { x: 316, y: 106, r: 29 }, { x: 396, y: 178, r: 26 },
    ]
        .map((p) =>
            '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + p.r +
            '" fill="#ffffff" stroke="#111827" stroke-width="2.6"/>' +
            '<path d="M ' + (p.x - p.r + 3) + " " + p.y + " q " + p.r + " -7 " + (2 * p.r - 6) +
            ' 0" fill="none" stroke="#111827" stroke-width="1.6"/>')
        .join("");
    return svg(480, 300, sun + orbits + planets);
};

export const MOCK_IMAGES = {
    "https://schoolmateblob.blob.core.windows.net/qp/2026/q04-pumpkin.png": glyph("&#127875;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/q05-solar-system.png": solarSystem(),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-creeper.png": glyph("&#127807;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-tree.png": glyph("&#127794;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-climber.png": glyph("&#127793;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-herb.png": glyph("&#127807;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-grass.png": glyph("&#127807;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-grasshopper.png": glyph("&#129381;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-frog.png": glyph("&#128056;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-snake.png": glyph("&#128013;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-eagle.png": glyph("&#129413;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-carrot.png": glyph("&#129365;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-scissors.png": glyph("&#9986;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-sunflower.png": glyph("&#127803;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-teddy.png": glyph("&#129528;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-mango.png": glyph("&#129389;"),
    "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-spanner.png": glyph("&#128295;"),
};

export const MOCK_PAPER = {
    paperId: "QP-MOCK-0001",
    title: "TERM I EXAMINATION - SCIENCE",
    grade: "III",
    subject: "Science",
    medium: "English",
    timeAllowedMinutes: 90,
    maximumMarks: 50,
    sections: [
        {
            sectionId: "S1",
            heading: "PART - A",
            direction: "Answer all the questions.",
            marksLabel: "10 x 1 = 10",
            questions: [
                {
                    questionId: "Q1",
                    questionNo: 1,
                    marks: 1,
                    type: "fillBlank",
                    content: [
                        { kind: "text", value: "A plant with a weak stem that spreads on the ground is called a ____." },
                    ],
                },
                {
                    questionId: "Q2",
                    questionNo: 2,
                    marks: 1,
                    type: "mcq",
                    content: [
                        { kind: "text", value: "Which of these grows on the ground with a weak stem?" },
                    ],
                    options: [
                        {
                            id: "a",
                            content: [
                                { kind: "image", url: "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-creeper.png", width: "full" },
                                { kind: "text", value: "Creeper" },
                            ],
                        },
                        {
                            id: "b",
                            content: [
                                { kind: "image", url: "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-tree.png", width: "full" },
                                { kind: "text", value: "Tree" },
                            ],
                        },
                        {
                            id: "c",
                            content: [
                                { kind: "image", url: "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-climber.png", width: "full" },
                                { kind: "text", value: "Climber" },
                            ],
                        },
                        {
                            id: "d",
                            content: [
                                { kind: "image", url: "https://schoolmateblob.blob.core.windows.net/qp/2026/opt-herb.png", width: "full" },
                                { kind: "text", value: "Herb" },
                            ],
                        },
                    ],
                },
                {
                    questionId: "Q3",
                    questionNo: 3,
                    marks: 1,
                    type: "match",
                    content: [
                        { kind: "text", value: "Match the following.", bold: true },
                        {
                            kind: "table",
                            headers: ["Animal", "Home", "Answer"],
                            rows: [
                                ["The squirrel", "lives in a hive", ""],
                                ["The bee", "lives on a tree", ""],
                                ["The owl", "has a tunnel-like opening", ""],
                            ],
                        },
                    ],
                },
            ],
        },
        {
            sectionId: "S2",
            heading: "PART - B",
            direction: "Identify the answer by using the picture given below.",
            marksLabel: "5 x 2 = 10",
            questions: [
                {
                    questionId: "Q4",
                    questionNo: 4,
                    marks: 2,
                    type: "short",
                    content: [
                        { kind: "text", value: "My name is pumpkin. I have a weak stem and I grow on the ground." },
                        {
                            kind: "image",
                            url: "https://schoolmateblob.blob.core.windows.net/qp/2026/q04-pumpkin.png",
                            width: "small",
                            align: "right",
                            alt: "A pumpkin growing on the ground",
                        },
                        { kind: "text", value: "Based on my growth, how am I classified?" },
                        { kind: "answerSpace", variant: "lines", count: 2 },
                    ],
                },
                {
                    questionId: "Q5",
                    questionNo: 5,
                    marks: 2,
                    type: "label",
                    content: [
                        { kind: "text", value: "Write the names of the planets in the boxes given.", bold: true },
                        {
                            kind: "labelledImage",
                            url: "https://schoolmateblob.blob.core.windows.net/qp/2026/q05-solar-system.png",
                            width: "large",
                            alt: "The solar system with empty label boxes",
                            labels: [
                                { x: 24, y: 20 }, { x: 32, y: 78 }, { x: 46, y: 16 },
                                { x: 55, y: 84 }, { x: 70, y: 24 }, { x: 86, y: 68 },
                            ],
                        },
                    ],
                },
                {
                    questionId: "Q6",
                    questionNo: 6,
                    marks: 2,
                    type: "order",
                    content: [
                        { kind: "text", value: "Form the food chain sequence. Number the pictures correctly by filling in the boxes.", bold: true },
                        {
                            kind: "imageGrid",
                            columns: 5,
                            items: [
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-grass.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-snake.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-eagle.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-grasshopper.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/fc-frog.png", box: true },
                            ],
                        },
                    ],
                },
                {
                    questionId: "Q7",
                    questionNo: 7,
                    marks: 2,
                    type: "classify",
                    content: [
                        { kind: "text", value: "Classify the things shown below as things that come from plants (tick) and things that do not come from plants (cross).", bold: true },
                        {
                            kind: "imageGrid",
                            columns: 6,
                            items: [
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-carrot.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-scissors.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-sunflower.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-teddy.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-mango.png", box: true },
                                { url: "https://schoolmateblob.blob.core.windows.net/qp/2026/cl-spanner.png", box: true },
                            ],
                        },
                    ],
                },
                {
                    questionId: "Q8",
                    questionNo: 8,
                    marks: 2,
                    type: "long",
                    content: [
                        { kind: "text", value: "Draw a mind map of the parts of a plant and their uses." },
                        { kind: "mindMap", nodes: ["Root", "Stem", "Leaf", "Flower"], centre: "Plant" },
                        { kind: "answerSpace", variant: "box", height: 120 },
                    ],
                },
            ],
        },
    ],
};
