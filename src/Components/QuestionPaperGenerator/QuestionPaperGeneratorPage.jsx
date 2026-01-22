import React, { useState, useCallback, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Description as DocIcon,
    AutoAwesome as AutoAwesomeIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import html2pdf from 'html2pdf.js';
import SnackBar from '../SnackBar';

const steps = ['Upload Document', 'Paper Settings', 'Preview & Export'];

// Question paper templates based on marks
const questionPaperTemplates = {
    50: {
        sections: [
            {
                name: 'Section A - Multiple Choice Questions',
                instruction: 'Choose the correct answer from the given options.',
                questionType: 'mcq',
                questionsCount: 10,
                marksPerQuestion: 1,
                totalMarks: 10,
            },
            {
                name: 'Section B - Fill in the Blanks',
                instruction: 'Fill in the blanks with appropriate words.',
                questionType: 'fillblanks',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section C - True or False',
                instruction: 'Write True or False for each statement.',
                questionType: 'truefalse',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section D - Short Answer Questions',
                instruction: 'Answer the following questions in 2-3 sentences.',
                questionType: 'short',
                questionsCount: 5,
                marksPerQuestion: 2,
                totalMarks: 10,
            },
            {
                name: 'Section E - Long Answer Questions',
                instruction: 'Answer any FOUR of the following questions in detail.',
                questionType: 'long',
                questionsCount: 5,
                marksPerQuestion: 5,
                totalMarks: 20,
                attemptCount: 4,
            },
        ],
    },
    75: {
        sections: [
            {
                name: 'Section A - Multiple Choice Questions',
                instruction: 'Choose the correct answer from the given options.',
                questionType: 'mcq',
                questionsCount: 15,
                marksPerQuestion: 1,
                totalMarks: 15,
            },
            {
                name: 'Section B - Fill in the Blanks',
                instruction: 'Fill in the blanks with appropriate words.',
                questionType: 'fillblanks',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section C - True or False',
                instruction: 'Write True or False for each statement.',
                questionType: 'truefalse',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section D - Match the Following',
                instruction: 'Match the items in Column A with Column B.',
                questionType: 'match',
                questionsCount: 1,
                marksPerQuestion: 5,
                totalMarks: 5,
            },
            {
                name: 'Section E - Short Answer Questions',
                instruction: 'Answer the following questions in 2-3 sentences.',
                questionType: 'short',
                questionsCount: 5,
                marksPerQuestion: 3,
                totalMarks: 15,
            },
            {
                name: 'Section F - Long Answer Questions',
                instruction: 'Answer any FIVE of the following questions in detail.',
                questionType: 'long',
                questionsCount: 6,
                marksPerQuestion: 5,
                totalMarks: 30,
                attemptCount: 5,
            },
        ],
    },
    100: {
        sections: [
            {
                name: 'Section A - Multiple Choice Questions',
                instruction: 'Choose the correct answer from the given options. Each question carries 1 mark.',
                questionType: 'mcq',
                questionsCount: 20,
                marksPerQuestion: 1,
                totalMarks: 20,
            },
            {
                name: 'Section B - Fill in the Blanks',
                instruction: 'Fill in the blanks with appropriate words. Each question carries 1 mark.',
                questionType: 'fillblanks',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section C - True or False',
                instruction: 'Write True or False for each statement. Each question carries 1 mark.',
                questionType: 'truefalse',
                questionsCount: 5,
                marksPerQuestion: 1,
                totalMarks: 5,
            },
            {
                name: 'Section D - Match the Following',
                instruction: 'Match the items in Column A with Column B.',
                questionType: 'match',
                questionsCount: 1,
                marksPerQuestion: 5,
                totalMarks: 5,
            },
            {
                name: 'Section E - Very Short Answer Questions',
                instruction: 'Answer the following questions in one or two sentences. Each question carries 2 marks.',
                questionType: 'veryshort',
                questionsCount: 5,
                marksPerQuestion: 2,
                totalMarks: 10,
            },
            {
                name: 'Section F - Short Answer Questions',
                instruction: 'Answer the following questions in 3-4 sentences. Each question carries 3 marks.',
                questionType: 'short',
                questionsCount: 5,
                marksPerQuestion: 3,
                totalMarks: 15,
            },
            {
                name: 'Section G - Long Answer Questions',
                instruction: 'Answer any FOUR of the following questions in detail with diagrams where necessary. Each question carries 5 marks.',
                questionType: 'long',
                questionsCount: 5,
                marksPerQuestion: 5,
                totalMarks: 20,
                attemptCount: 4,
            },
            {
                name: 'Section H - Essay Type Questions',
                instruction: 'Answer any TWO of the following questions in detail. Each question carries 10 marks.',
                questionType: 'essay',
                questionsCount: 3,
                marksPerQuestion: 10,
                totalMarks: 20,
                attemptCount: 2,
            },
        ],
    },
};

const QuestionPaperGeneratorPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const questionPaperRef = useRef(null);

    // Snackbar state
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    // Document upload state
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [extractedContent, setExtractedContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    // Paper configuration state
    const [paperConfig, setPaperConfig] = useState({
        schoolName: '',
        schoolAddress: '',
        examName: '',
        subject: '',
        grade: '',
        section: '',
        duration: 180,
        totalMarks: 100,
        academicYear: '2025-2026',
        date: '',
    });

    // Generated question paper
    const [generatedPaper, setGeneratedPaper] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles) => {
        const validFormats = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];

        const validFiles = acceptedFiles.filter((file) =>
            validFormats.includes(file.type)
        );

        if (validFiles.length !== acceptedFiles.length) {
            showSnackbar('Some files were rejected. Only PDF, Images, Word, and Text files are allowed.', false);
        }

        if (validFiles.length > 0) {
            setUploadedFiles((prev) => [...prev, ...validFiles]);
            showSnackbar(`${validFiles.length} file(s) uploaded successfully!`, true);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
        },
        multiple: true,
    });

    const showSnackbar = (msg, success) => {
        setMessage(msg);
        setStatus(success);
        setColor(success);
        setOpen(true);
    };

    const removeFile = (index) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return <PdfIcon color="error" />;
        if (fileType.includes('image')) return <ImageIcon color="primary" />;
        return <DocIcon color="action" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Process uploaded documents
    const processDocuments = async () => {
        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            for (let i = 0; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 200));
                setProcessingProgress(i);
            }

            // Simulated extracted content
            const sampleContent = `
Chapter: Force and Motion

1. Force is a push or pull that can change the state of motion of an object.
2. Newton's First Law: An object at rest stays at rest unless acted upon by an external force.
3. Newton's Second Law: Force equals mass times acceleration (F = ma).
4. Newton's Third Law: For every action, there is an equal and opposite reaction.
5. Friction is a force that opposes motion between surfaces in contact.
6. Gravity is the force of attraction between objects with mass.
7. Weight is the force of gravity acting on an object's mass.
8. Momentum is the product of mass and velocity (p = mv).
9. Kinetic energy is the energy of motion (KE = ½mv²).
10. Potential energy is stored energy due to position.
            `;

            setExtractedContent(sampleContent);
            showSnackbar('Document processed successfully!', true);
        } catch (error) {
            showSnackbar('Error processing document.', false);
        } finally {
            setIsProcessing(false);
        }
    };

    // Generate detailed question paper
    const generateQuestionPaper = async () => {
        setIsGenerating(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const template = questionPaperTemplates[paperConfig.totalMarks];
            const sections = [];

            template.sections.forEach((sectionTemplate, sectionIndex) => {
                const questions = [];

                if (sectionTemplate.questionType === 'mcq') {
                    const mcqBank = [
                        { q: 'Which of the following is a vector quantity?', options: ['Speed', 'Distance', 'Velocity', 'Time'], answer: 'C' },
                        { q: 'The SI unit of force is:', options: ['Joule', 'Newton', 'Watt', 'Pascal'], answer: 'B' },
                        { q: 'Newton\'s First Law is also known as:', options: ['Law of Acceleration', 'Law of Inertia', 'Law of Action-Reaction', 'Law of Gravitation'], answer: 'B' },
                        { q: 'The formula F = ma represents:', options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Conservation'], answer: 'B' },
                        { q: 'Which force always opposes motion?', options: ['Gravity', 'Normal force', 'Friction', 'Tension'], answer: 'C' },
                        { q: 'The acceleration due to gravity on Earth is approximately:', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'], answer: 'B' },
                        { q: 'Momentum is measured in:', options: ['kg·m/s', 'kg·m/s²', 'N·m', 'J/s'], answer: 'A' },
                        { q: 'Which type of energy is associated with motion?', options: ['Potential energy', 'Kinetic energy', 'Thermal energy', 'Chemical energy'], answer: 'B' },
                        { q: 'What happens to the acceleration when force is doubled (mass constant)?', options: ['Halved', 'Doubled', 'Remains same', 'Quadrupled'], answer: 'B' },
                        { q: 'The weight of an object depends on:', options: ['Only mass', 'Only gravity', 'Both mass and gravity', 'Neither'], answer: 'C' },
                        { q: 'Which of these is an example of Newton\'s Third Law?', options: ['A ball rolling on ground', 'Rocket propulsion', 'A car accelerating', 'An apple falling'], answer: 'B' },
                        { q: 'The tendency of an object to resist change in motion is called:', options: ['Force', 'Inertia', 'Momentum', 'Acceleration'], answer: 'B' },
                        { q: 'What is the unit of work?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'B' },
                        { q: 'When an object is in free fall, which force acts on it?', options: ['Friction', 'Normal force', 'Gravity only', 'Tension'], answer: 'C' },
                        { q: 'The rate of change of velocity is called:', options: ['Speed', 'Displacement', 'Acceleration', 'Momentum'], answer: 'C' },
                        { q: 'What type of friction acts on a moving object?', options: ['Static friction', 'Kinetic friction', 'Rolling friction', 'Fluid friction'], answer: 'B' },
                        { q: 'Power is defined as:', options: ['Work done', 'Rate of doing work', 'Force × distance', 'Mass × velocity'], answer: 'B' },
                        { q: 'An object at rest has:', options: ['Only kinetic energy', 'Only potential energy', 'Both energies', 'No energy'], answer: 'B' },
                        { q: 'The law of conservation of momentum applies when:', options: ['External force is present', 'No external force acts', 'Friction is present', 'Always'], answer: 'B' },
                        { q: 'What is the relationship between mass and inertia?', options: ['Inversely proportional', 'Directly proportional', 'No relation', 'Exponential'], answer: 'B' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: mcqBank[i % mcqBank.length].q,
                            options: mcqBank[i % mcqBank.length].options,
                            answer: mcqBank[i % mcqBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'fillblanks') {
                    const fillBank = [
                        { q: 'The SI unit of force is _______.', answer: 'Newton' },
                        { q: 'F = ma is known as Newton\'s _______ Law of Motion.', answer: 'Second' },
                        { q: 'The force that opposes motion between two surfaces is called _______.', answer: 'Friction' },
                        { q: 'The acceleration due to gravity on Earth is approximately _______ m/s².', answer: '9.8' },
                        { q: 'Momentum is the product of mass and _______.', answer: 'Velocity' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: fillBank[i % fillBank.length].q,
                            answer: fillBank[i % fillBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'truefalse') {
                    const tfBank = [
                        { q: 'Force is a scalar quantity.', answer: 'False' },
                        { q: 'Newton\'s First Law is also called the Law of Inertia.', answer: 'True' },
                        { q: 'Weight and mass are the same thing.', answer: 'False' },
                        { q: 'Friction always opposes motion.', answer: 'True' },
                        { q: 'An object in motion will stay in motion forever if no force acts on it.', answer: 'True' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: tfBank[i % tfBank.length].q,
                            answer: tfBank[i % tfBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'match') {
                    questions.push({
                        number: 1,
                        columnA: ['Force', 'Momentum', 'Power', 'Work', 'Acceleration'],
                        columnB: ['kg·m/s', 'Joule', 'Newton', 'Watt', 'm/s²'],
                        answers: ['1-C', '2-A', '3-D', '4-B', '5-E'],
                        marks: sectionTemplate.marksPerQuestion,
                    });
                } else if (sectionTemplate.questionType === 'veryshort') {
                    const veryShortBank = [
                        { q: 'Define force.', answer: 'Force is a push or pull that can change the state of motion of an object.' },
                        { q: 'What is inertia?', answer: 'Inertia is the tendency of an object to resist changes in its state of motion.' },
                        { q: 'State Newton\'s Third Law of Motion.', answer: 'For every action, there is an equal and opposite reaction.' },
                        { q: 'What is the SI unit of momentum?', answer: 'The SI unit of momentum is kg·m/s (kilogram meter per second).' },
                        { q: 'Define acceleration.', answer: 'Acceleration is the rate of change of velocity with respect to time.' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: veryShortBank[i % veryShortBank.length].q,
                            answer: veryShortBank[i % veryShortBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'short') {
                    const shortBank = [
                        { q: 'Explain Newton\'s First Law of Motion with an example.', answer: 'Newton\'s First Law states that an object at rest stays at rest and an object in motion stays in motion with constant velocity unless acted upon by an external force. Example: A book on a table remains at rest until someone pushes it.' },
                        { q: 'Differentiate between mass and weight.', answer: 'Mass is the amount of matter in an object and remains constant everywhere. Weight is the gravitational force acting on an object and varies with location. Mass is measured in kg, weight in Newtons.' },
                        { q: 'What is friction? Mention its types.', answer: 'Friction is a force that opposes the relative motion between two surfaces in contact. Types include: Static friction, Kinetic friction, Rolling friction, and Fluid friction.' },
                        { q: 'Derive the relationship between force, mass, and acceleration.', answer: 'According to Newton\'s Second Law, force is directly proportional to acceleration for constant mass. F ∝ a, and F ∝ m. Combining: F = kma, where k=1 in SI units. Hence, F = ma.' },
                        { q: 'Explain the concept of momentum and its conservation.', answer: 'Momentum is the product of mass and velocity (p = mv). The law of conservation of momentum states that in an isolated system, the total momentum before collision equals the total momentum after collision.' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: shortBank[i % shortBank.length].q,
                            answer: shortBank[i % shortBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'long') {
                    const longBank = [
                        { q: 'State and explain Newton\'s three laws of motion. Give two examples for each law.', answer: 'Detailed explanation of all three laws with examples...' },
                        { q: 'What is friction? Explain the factors affecting friction and methods to reduce it.', answer: 'Complete explanation of friction, factors, and reduction methods...' },
                        { q: 'Derive the equations of motion for uniformly accelerated motion. Also solve: A car accelerates from rest at 2 m/s² for 10 seconds. Find the distance covered.', answer: 'Derivation of v=u+at, s=ut+½at², v²=u²+2as with numerical solution...' },
                        { q: 'Explain the law of conservation of momentum with a suitable example. Two objects of masses 5 kg and 10 kg moving with velocities 4 m/s and 2 m/s respectively collide and move together. Find their common velocity.', answer: 'Explanation with numerical solution...' },
                        { q: 'What is gravitational force? Explain the variation of g with altitude and depth. Also explain weightlessness.', answer: 'Complete explanation of gravity, variation of g, and weightlessness...' },
                        { q: 'Distinguish between kinetic energy and potential energy. Derive the expressions for both. A body of mass 5 kg is raised to a height of 10 m. Calculate its potential energy.', answer: 'Explanation with derivations and numerical solution...' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: longBank[i % longBank.length].q,
                            answer: longBank[i % longBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                } else if (sectionTemplate.questionType === 'essay') {
                    const essayBank = [
                        { q: 'Write an essay on Newton\'s Laws of Motion and their applications in daily life. Include diagrams and numerical examples where appropriate.', answer: 'Comprehensive essay...' },
                        { q: 'Explain the concepts of Work, Energy, and Power. Derive the work-energy theorem and explain the law of conservation of mechanical energy with suitable examples and diagrams.', answer: 'Comprehensive essay...' },
                        { q: 'Discuss the concept of friction in detail. Explain its types, advantages, disadvantages, and methods to increase or decrease friction. Include real-world applications.', answer: 'Comprehensive essay...' },
                    ];

                    for (let i = 0; i < sectionTemplate.questionsCount; i++) {
                        questions.push({
                            number: i + 1,
                            question: essayBank[i % essayBank.length].q,
                            answer: essayBank[i % essayBank.length].answer,
                            marks: sectionTemplate.marksPerQuestion,
                        });
                    }
                }

                sections.push({
                    ...sectionTemplate,
                    questions,
                });
            });

            setGeneratedPaper({ sections });
            showSnackbar('Question paper generated successfully!', true);
            setActiveStep(2);
        } catch (error) {
            showSnackbar('Error generating question paper.', false);
        } finally {
            setIsGenerating(false);
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        const element = document.getElementById('question-paper-content');
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${paperConfig.subject}_${paperConfig.grade}_Question_Paper.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };
        html2pdf().set(opt).from(element).save();
        showSnackbar('PDF downloaded successfully!', true);
    };

    // Print function
    const handlePrint = () => {
        const printContent = document.getElementById('question-paper-content');
        const printWindow = window.open('', '', 'height=800,width=900');
        printWindow.document.write(`
            <html>
            <head>
                <title>Question Paper - ${paperConfig.subject}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.5;
                        padding: 20px;
                        color: #000;
                    }
                    .question-paper { max-width: 210mm; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
                    .school-name { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
                    .school-address { font-size: 10pt; margin-top: 5px; }
                    .exam-title { font-size: 14pt; font-weight: bold; margin-top: 10px; text-decoration: underline; }
                    .paper-info { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11pt; }
                    .paper-info-left, .paper-info-right { text-align: left; }
                    .paper-info-right { text-align: right; }
                    .instructions { border: 1px solid #000; padding: 10px; margin: 15px 0; background: #f9f9f9; }
                    .instructions-title { font-weight: bold; margin-bottom: 5px; }
                    .section { margin-top: 20px; page-break-inside: avoid; }
                    .section-title { font-size: 12pt; font-weight: bold; background: #e0e0e0; padding: 8px; border: 1px solid #000; }
                    .section-instruction { font-style: italic; padding: 5px 10px; font-size: 11pt; border-left: 1px solid #000; border-right: 1px solid #000; }
                    .question { padding: 8px 10px; border-left: 1px solid #000; border-right: 1px solid #000; }
                    .question:last-child { border-bottom: 1px solid #000; }
                    .question-text { margin-bottom: 5px; }
                    .options { margin-left: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
                    .option { padding: 2px 0; }
                    .marks { float: right; font-weight: bold; }
                    .match-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    .match-table td, .match-table th { border: 1px solid #000; padding: 8px; text-align: left; }
                    .answer-space { height: 30px; border-bottom: 1px dotted #999; margin: 5px 0; }
                    .or-text { text-align: center; font-weight: bold; margin: 10px 0; font-style: italic; }
                    @media print {
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>${printContent.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Render step content
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return renderUploadStep();
            case 1:
                return renderSettingsStep();
            case 2:
                return renderPreviewStep();
            default:
                return null;
        }
    };

    // Step 1: Upload Document
    const renderUploadStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
                <CloudUploadIcon />
                Upload Study Material / Textbook
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload textbook pages, notes, or study material (PDF, Images, Word, or Text files) to generate examination questions.
            </Typography>

            {/* Dropzone */}
            <Paper
                {...getRootProps()}
                sx={{
                    p: 5,
                    border: '3px dashed',
                    borderColor: isDragActive ? 'primary.main' : '#bdbdbd',
                    borderRadius: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : '#fafafa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#e3f2fd',
                    },
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop files here...' : 'Drag & Drop files here'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    or click to browse files from your computer
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Supported: PDF, JPG, PNG, WEBP, DOC, DOCX, TXT (Max 50MB per file)
                </Typography>
            </Paper>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Uploaded Files ({uploadedFiles.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {uploadedFiles.map((file, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                                        {getFileIcon(file.type)}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight="500" noWrap>
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatFileSize(file.size)}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => removeFile(index)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={processDocuments}
                            disabled={isProcessing}
                            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            {isProcessing ? 'Processing Documents...' : 'Process & Extract Content'}
                        </Button>

                        {isProcessing && (
                            <Box sx={{ mt: 2, maxWidth: 400 }}>
                                <LinearProgress variant="determinate" value={processingProgress} sx={{ height: 8, borderRadius: 4 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Scanning and extracting content... {processingProgress}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Extracted Content Success */}
            {extractedContent && (
                <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2">Content extracted successfully! Proceed to configure your question paper.</Typography>
                </Alert>
            )}
        </Box>
    );

    // Step 2: Paper Settings
    const renderSettingsStep = () => (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
                <SchoolIcon />
                Question Paper Settings
            </Typography>

            <Grid container spacing={3}>
                {/* School Information */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                            School Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="School Name *"
                                    value={paperConfig.schoolName}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, schoolName: e.target.value })}
                                    placeholder="e.g., Delhi Public School"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="School Address"
                                    value={paperConfig.schoolAddress}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, schoolAddress: e.target.value })}
                                    placeholder="e.g., New Delhi - 110001"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Examination Details */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                            Examination Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Examination Type *</InputLabel>
                                    <Select
                                        value={paperConfig.examName}
                                        label="Examination Type *"
                                        onChange={(e) => setPaperConfig({ ...paperConfig, examName: e.target.value })}
                                    >
                                        <MenuItem value="Unit Test - I">Unit Test - I</MenuItem>
                                        <MenuItem value="Unit Test - II">Unit Test - II</MenuItem>
                                        <MenuItem value="Monthly Test">Monthly Test</MenuItem>
                                        <MenuItem value="Quarterly Examination">Quarterly Examination</MenuItem>
                                        <MenuItem value="Half Yearly Examination">Half Yearly Examination</MenuItem>
                                        <MenuItem value="Pre-Board Examination">Pre-Board Examination</MenuItem>
                                        <MenuItem value="Annual Examination">Annual Examination</MenuItem>
                                        <MenuItem value="Practice Test">Practice Test</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Subject *"
                                    value={paperConfig.subject}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, subject: e.target.value })}
                                    placeholder="e.g., Physics"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Class/Grade *</InputLabel>
                                    <Select
                                        value={paperConfig.grade}
                                        label="Class/Grade *"
                                        onChange={(e) => setPaperConfig({ ...paperConfig, grade: e.target.value })}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={`Class ${i + 1}`}>
                                                Class {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        value={paperConfig.section}
                                        label="Section"
                                        onChange={(e) => setPaperConfig({ ...paperConfig, section: e.target.value })}
                                    >
                                        <MenuItem value="">All Sections</MenuItem>
                                        {['A', 'B', 'C', 'D', 'E'].map((section) => (
                                            <MenuItem key={section} value={section}>
                                                Section {section}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    value={paperConfig.date}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Academic Year"
                                    value={paperConfig.academicYear}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, academicYear: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Marks and Duration Selection */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#e3f2fd' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                            Total Marks & Duration
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Select Total Marks for Question Paper
                            </Typography>
                            <ToggleButtonGroup
                                value={paperConfig.totalMarks}
                                exclusive
                                onChange={(e, value) => {
                                    if (value !== null) {
                                        setPaperConfig({
                                            ...paperConfig,
                                            totalMarks: value,
                                            duration: value === 50 ? 90 : value === 75 ? 150 : 180
                                        });
                                    }
                                }}
                                sx={{ mt: 1 }}
                            >
                                <ToggleButton value={50} sx={{ px: 4, py: 2 }}>
                                    <Box textAlign="center">
                                        <Typography variant="h5" fontWeight="bold">50</Typography>
                                        <Typography variant="caption">Marks</Typography>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value={75} sx={{ px: 4, py: 2 }}>
                                    <Box textAlign="center">
                                        <Typography variant="h5" fontWeight="bold">75</Typography>
                                        <Typography variant="caption">Marks</Typography>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value={100} sx={{ px: 4, py: 2 }}>
                                    <Box textAlign="center">
                                        <Typography variant="h5" fontWeight="bold">100</Typography>
                                        <Typography variant="caption">Marks</Typography>
                                    </Box>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Duration (in minutes)"
                                    type="number"
                                    value={paperConfig.duration}
                                    onChange={(e) => setPaperConfig({ ...paperConfig, duration: parseInt(e.target.value) || 0 })}
                                    helperText={`${Math.floor(paperConfig.duration / 60)} hour(s) ${paperConfig.duration % 60} minutes`}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Paper Structure Preview */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#fff3e0' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#e65100' }}>
                            Paper Structure Preview ({paperConfig.totalMarks} Marks)
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#ffe0b2' }}>
                                        <TableCell><strong>Section</strong></TableCell>
                                        <TableCell><strong>Question Type</strong></TableCell>
                                        <TableCell align="center"><strong>Questions</strong></TableCell>
                                        <TableCell align="center"><strong>Marks Each</strong></TableCell>
                                        <TableCell align="center"><strong>Total Marks</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {questionPaperTemplates[paperConfig.totalMarks].sections.map((section, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{String.fromCharCode(65 + index)}</TableCell>
                                            <TableCell>{section.name.split(' - ')[1]}</TableCell>
                                            <TableCell align="center">{section.questionsCount}</TableCell>
                                            <TableCell align="center">{section.marksPerQuestion}</TableCell>
                                            <TableCell align="center">{section.totalMarks}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                                        <TableCell colSpan={4}><strong>Grand Total</strong></TableCell>
                                        <TableCell align="center"><strong>{paperConfig.totalMarks}</strong></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Generate Button */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={generateQuestionPaper}
                            disabled={isGenerating || !paperConfig.schoolName || !paperConfig.subject || !paperConfig.grade}
                            startIcon={isGenerating ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                                }
                            }}
                        >
                            {isGenerating ? 'Generating Question Paper...' : 'Generate Question Paper'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

    // Step 3: Preview & Export
    const renderPreviewStep = () => (
        <Box>
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
                    <VisibilityIcon />
                    Question Paper Preview
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewDialogOpen(true)}
                    >
                        Full Screen Preview
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={exportToPDF}
                    >
                        Download PDF
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                    >
                        Print
                    </Button>
                </Box>
            </Box>

            {/* Question Paper Preview */}
            <Paper sx={{ p: 0, bgcolor: 'white', border: '1px solid #ddd' }}>
                {renderQuestionPaper()}
            </Paper>

            {/* Full Screen Preview Dialog */}
            <Dialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { height: '90vh' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Question Paper - Full Preview</Typography>
                    <Box>
                        <Button startIcon={<DownloadIcon />} onClick={exportToPDF} sx={{ mr: 1 }}>
                            Download PDF
                        </Button>
                        <Button startIcon={<PrintIcon />} onClick={handlePrint}>
                            Print
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100%' }}>
                        <Paper sx={{ p: 0, maxWidth: '210mm', mx: 'auto', bgcolor: 'white' }}>
                            {renderQuestionPaper()}
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

    // Render the actual question paper
    const renderQuestionPaper = () => (
        <Box
            id="question-paper-content"
            sx={{
                fontFamily: '"Times New Roman", Times, serif',
                color: '#000',
                bgcolor: 'white',
                p: 4,
                minHeight: '297mm',
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: 'center', borderBottom: '3px double #000', pb: 2, mb: 2 }}>
                <Typography sx={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {paperConfig.schoolName || 'School Name'}
                </Typography>
                {paperConfig.schoolAddress && (
                    <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
                        {paperConfig.schoolAddress}
                    </Typography>
                )}
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', mt: 1.5, textDecoration: 'underline' }}>
                    {paperConfig.examName || 'Examination'} - {paperConfig.academicYear}
                </Typography>
            </Box>

            {/* Paper Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #000', pb: 1.5 }}>
                <Box>
                    <Typography sx={{ fontSize: '13px' }}><strong>Subject:</strong> {paperConfig.subject}</Typography>
                    <Typography sx={{ fontSize: '13px' }}><strong>Class:</strong> {paperConfig.grade} {paperConfig.section && `(${paperConfig.section})`}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '13px' }}><strong>Time:</strong> {Math.floor(paperConfig.duration / 60)} Hr {paperConfig.duration % 60 > 0 ? `${paperConfig.duration % 60} Min` : ''}</Typography>
                    <Typography sx={{ fontSize: '13px' }}><strong>Maximum Marks:</strong> {paperConfig.totalMarks}</Typography>
                </Box>
            </Box>

            {/* General Instructions */}
            <Box sx={{ border: '1px solid #000', p: 1.5, mb: 3, bgcolor: '#fafafa' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mb: 0.5, textDecoration: 'underline' }}>
                    GENERAL INSTRUCTIONS:
                </Typography>
                <Box component="ol" sx={{ fontSize: '11px', pl: 2.5, m: 0 }}>
                    <li>All questions are compulsory unless otherwise stated.</li>
                    <li>Read each question carefully before answering.</li>
                    <li>Marks are indicated against each question.</li>
                    <li>Write neat and legible answers.</li>
                    <li>Use of calculators is not permitted unless specified.</li>
                </Box>
            </Box>

            {/* Sections */}
            {generatedPaper && generatedPaper.sections.map((section, sectionIndex) => (
                <Box key={sectionIndex} sx={{ mb: 3 }}>
                    {/* Section Header */}
                    <Box sx={{ bgcolor: '#e8e8e8', border: '1px solid #000', p: 1 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {section.name}
                            <span style={{ float: 'right' }}>({section.totalMarks} Marks)</span>
                        </Typography>
                    </Box>

                    {/* Section Instruction */}
                    <Box sx={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', p: 1, bgcolor: '#f9f9f9' }}>
                        <Typography sx={{ fontSize: '11px', fontStyle: 'italic' }}>
                            {section.instruction}
                        </Typography>
                    </Box>

                    {/* Questions */}
                    <Box sx={{ border: '1px solid #000', borderTop: 'none' }}>
                        {section.questions.map((question, qIndex) => (
                            <Box
                                key={qIndex}
                                sx={{
                                    p: 1.5,
                                    borderBottom: qIndex < section.questions.length - 1 ? '1px dashed #ccc' : 'none',
                                }}
                            >
                                {section.questionType === 'mcq' && (
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', mb: 1 }}>
                                            <strong>{qIndex + 1}.</strong> {question.question}
                                            <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                        </Typography>
                                        <Grid container spacing={1} sx={{ pl: 3 }}>
                                            {question.options.map((option, optIndex) => (
                                                <Grid item xs={6} key={optIndex}>
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        ({String.fromCharCode(65 + optIndex)}) {option}
                                                    </Typography>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {section.questionType === 'fillblanks' && (
                                    <Typography sx={{ fontSize: '12px' }}>
                                        <strong>{qIndex + 1}.</strong> {question.question}
                                        <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                    </Typography>
                                )}

                                {section.questionType === 'truefalse' && (
                                    <Typography sx={{ fontSize: '12px' }}>
                                        <strong>{qIndex + 1}.</strong> {question.question}
                                        <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                    </Typography>
                                )}

                                {section.questionType === 'match' && (
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', mb: 1 }}>
                                            <strong>{qIndex + 1}.</strong> Match the following:
                                            <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                        </Typography>
                                        <TableContainer sx={{ pl: 3 }}>
                                            <Table size="small" sx={{ maxWidth: 500, border: '1px solid #000' }}>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                                        <TableCell sx={{ border: '1px solid #000', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>Column A</TableCell>
                                                        <TableCell sx={{ border: '1px solid #000', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>Column B</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {question.columnA.map((item, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell sx={{ border: '1px solid #000', fontSize: '11px', py: 0.5 }}>
                                                                {i + 1}. {item}
                                                            </TableCell>
                                                            <TableCell sx={{ border: '1px solid #000', fontSize: '11px', py: 0.5 }}>
                                                                {String.fromCharCode(65 + i)}. {question.columnB[i]}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {(section.questionType === 'veryshort' || section.questionType === 'short') && (
                                    <Box>
                                        <Typography sx={{ fontSize: '12px' }}>
                                            <strong>{qIndex + 1}.</strong> {question.question}
                                            <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                        </Typography>
                                    </Box>
                                )}

                                {section.questionType === 'long' && (
                                    <Box>
                                        <Typography sx={{ fontSize: '12px' }}>
                                            <strong>{qIndex + 1}.</strong> {question.question}
                                            <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                        </Typography>
                                        {section.attemptCount && qIndex < section.questionsCount - 1 && (
                                            <Typography sx={{ fontSize: '11px', textAlign: 'center', my: 0.5, fontWeight: 'bold' }}>
                                                OR
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {section.questionType === 'essay' && (
                                    <Box>
                                        <Typography sx={{ fontSize: '12px' }}>
                                            <strong>{qIndex + 1}.</strong> {question.question}
                                            <span style={{ float: 'right', fontSize: '11px' }}>[{question.marks}]</span>
                                        </Typography>
                                        {section.attemptCount && qIndex < section.questionsCount - 1 && (
                                            <Typography sx={{ fontSize: '11px', textAlign: 'center', my: 0.5, fontWeight: 'bold' }}>
                                                OR
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid #ccc' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                    *** END OF QUESTION PAPER ***
                </Typography>
            </Box>
        </Box>
    );

    const handleNext = () => {
        if (activeStep === 0 && !extractedContent) {
            showSnackbar('Please upload and process a document first.', false);
            return;
        }
        if (activeStep === 1 && (!paperConfig.schoolName || !paperConfig.subject || !paperConfig.grade)) {
            showSnackbar('Please fill all required fields.', false);
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SchoolIcon sx={{ fontSize: 56, color: 'white' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="white">
                            Question Paper Generator
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                            Upload study materials and create professional examination papers instantly
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Stepper */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel
                                StepIconProps={{
                                    sx: {
                                        fontSize: 32,
                                        '&.Mui-completed': { color: '#4caf50' },
                                        '&.Mui-active': { color: '#1976d2' },
                                    },
                                }}
                            >
                                <Typography fontWeight={activeStep === index ? 'bold' : 'normal'}>
                                    {label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Step Content */}
            <Paper sx={{ p: 4, mb: 3, borderRadius: 2, minHeight: 500 }}>
                {renderStepContent(activeStep)}
            </Paper>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    sx={{ px: 4 }}
                >
                    Back
                </Button>
                {activeStep < steps.length - 1 && activeStep !== 1 && (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        size="large"
                        sx={{ px: 4 }}
                    >
                        Next
                    </Button>
                )}
            </Box>

            {/* Snackbar */}
            <SnackBar
                open={open}
                setOpen={setOpen}
                status={status}
                color={color}
                message={message}
            />
        </Box>
    );
};

export default QuestionPaperGeneratorPage;
