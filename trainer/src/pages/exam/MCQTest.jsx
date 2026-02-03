import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';

// --- QUESTION BANKS (Expanded to ~30 Questions each) ---
const QB_MS_OFFICE = [
    { id: 1, question: "What is the key shortcut effectively used to create a new folder?", options: ["Ctrl+S", "Ctrl+Shift+N", "Ctrl+N", "Ctrl+Shift+S"], correct: "Ctrl+Shift+N" },
    { id: 2, question: "Which function calculates the largest value in a set of numbers?", options: ["=LARGE()", "=MAX()", "=HIGH()", "=BIG()"], correct: "=MAX()" },
    { id: 3, question: "In PowerPoint, which key starts the slideshow from the beginning?", options: ["F5", "Shift+F5", "Ctrl+F5", "Alt+F5"], correct: "F5" },
    { id: 4, question: "What is a 'Mail Merge' used for?", options: ["Merging emails", "Sending bulk personalized emails", "Combining inboxes", "Sorting mail"], correct: "Sending bulk personalized emails" },
    { id: 5, question: "Which tab in Word is used to insert a table?", options: ["Home", "Layout", "Insert", "View"], correct: "Insert" },
    { id: 6, question: "What is the extension of an Excel workbook?", options: [".txt", ".xlsx", ".docx", ".exl"], correct: ".xlsx" },
    { id: 7, question: "How do you select the entire document in Word?", options: ["Ctrl+A", "Alt+A", "Shift+A", "Ctrl+S"], correct: "Ctrl+A" },
    { id: 8, question: "Which chart type is best for showing trends over time?", options: ["Pie Chart", "Bar Chart", "Line Chart", "Scatter Plot"], correct: "Line Chart" },
    { id: 9, question: "Function to find the average of a range?", options: ["=AVG()", "=AVERAGE()", "=MEAN()", "=MEDIAN()"], correct: "=AVERAGE()" },
    { id: 10, question: "What does Ctrl+Z do?", options: ["Redo", "Undo", "Cut", "Paste"], correct: "Undo" },
    { id: 11, question: "In Excel, which symbol is used to start a formula?", options: ["#", "+", "=", "@"], correct: "=" },
    { id: 12, question: "Which view in PowerPoint displays all slides as thumbnails?", options: ["Slide Sorter", "Normal", "Reading", "Notes Page"], correct: "Slide Sorter" },
    { id: 13, question: "What is the default file extension for PowerPoint presentations?", options: [".ppt", ".pptx", ".potx", ".ppsx"], correct: ".pptx" },
    { id: 14, question: "Which shortcut aligns text to the center in Word?", options: ["Ctrl+L", "Ctrl+R", "Ctrl+E", "Ctrl+J"], correct: "Ctrl+E" },
    { id: 15, question: "In Excel, how do you make a reference absolute?", options: ["$", "%", "#", "&"], correct: "$" },
    { id: 16, question: "Which feature is used to check spelling errors in Word?", options: ["Thesaurus", "Spell Check", "Research", "Translate"], correct: "Spell Check" },
    { id: 17, question: "What is the intersection of a row and a column called in Excel?", options: ["Range", "Cell", "Block", "Grid"], correct: "Cell" },
    { id: 18, question: "Which shortcut inserts a new slide in PowerPoint?", options: ["Ctrl+N", "Ctrl+M", "Ctrl+D", "Ctrl+S"], correct: "Ctrl+M" },
    { id: 19, question: "Which function counts the number of cells that contain numbers?", options: ["=COUNT()", "=COUNTA()", "=SUM()", "=NUMBER()"], correct: "=COUNT()" },
    { id: 20, question: "What is the maximum number of rows in Excel 2019?", options: ["65,536", "1,048,576", "256", "Unlimited"], correct: "1,048,576" },
    { id: 21, question: "Which shortcut bolds selected text?", options: ["Ctrl+B", "Ctrl+U", "Ctrl+I", "Ctrl+P"], correct: "Ctrl+B" },
    { id: 22, question: "What is the gutter margin?", options: ["Margin added to the left margin when printing", "Margin added to the right margin", "Margin added to the binding side of page when printing", "Margin added to the outside of the page"], correct: "Margin added to the binding side of page when printing" },
    { id: 23, question: "Which of these is NOT a valid chart type in Excel?", options: ["Radar", "Pie", "Graph", "Surface"], correct: "Graph" },
    { id: 24, question: "How can you break the current column?", options: ["Ctrl + Shift + Enter", "Alt + Enter", "Ctrl + Enter", "Alt + Shift"], correct: "Ctrl + Shift + Enter" },
    { id: 25, question: "Which key removes the character to the left of the cursor?", options: ["Delete", "Backspace", "Insert", "Esc"], correct: "Backspace" },
    { id: 26, question: "In Word, what is the default font used?", options: ["Arial", "Calibri", "Times New Roman", "Open Sans"], correct: "Calibri" },
    { id: 27, question: "What allows you to print multiple documents in a sequence?", options: ["Print Preview", "Print Queue", "Collate", "Batch Print"], correct: "Print Queue" },
    { id: 28, question: "Which function joins two or more text strings into one text string?", options: ["=CONCATENATE()", "=JOIN()", "=MERGE()", "=ADD()"], correct: "=CONCATENATE()" },
    { id: 29, question: "Which feature allows you to copy formatting from one object to another?", options: ["Format Painter", "Copy Paste", "Clone", "Duplicate"], correct: "Format Painter" },
    { id: 30, question: "What is the shortcut to Open a file?", options: ["Ctrl+N", "Ctrl+O", "Ctrl+P", "Ctrl+S"], correct: "Ctrl+O" }
];

const QB_SPOKEN_ENGLISH = [
    { id: 101, question: "Which sentence is grammatically correct?", options: ["He don't like coffee.", "He doesn't like coffee.", "He no like coffee.", "He not like coffee."], correct: "He doesn't like coffee." },
    { id: 102, question: "What is a synonym for 'Happy'?", options: ["Sad", "Joyful", "Angry", "Bored"], correct: "Joyful" },
    { id: 103, question: "Choose the correct past tense of 'Go'.", options: ["Goed", "Gone", "Went", "Going"], correct: "Went" },
    { id: 104, question: "Which contains a silent letter?", options: ["Desk", "Ghost", "Lamp", "Milk"], correct: "Ghost" },
    { id: 105, question: "Identify the noun: 'Run'", options: ["Run", "Quickly", "Runner", "Fast"], correct: "Runner" },
    { id: 106, question: "Plural form of 'Child'?", options: ["Childs", "Children", "Childrens", "Childes"], correct: "Children" },
    { id: 107, question: "What is the antonym of 'Brave'?", options: ["Strong", "Cowardly", "Bold", "Fearless"], correct: "Cowardly" },
    { id: 108, question: "Complete: 'She ___ to the market yesterday.'", options: ["go", "goes", "went", "gone"], correct: "went" },
    { id: 109, question: "Which is a conjunction?", options: ["And", "Run", "Blue", "Table"], correct: "And" },
    { id: 110, question: "Adjective in: 'The red car is fast.'", options: ["Car", "Red", "Is", "The"], correct: "Red" },
    { id: 111, question: "Choose the correct article: '___ apple a day keeps the doctor away.'", options: ["A", "An", "The", "No article"], correct: "An" },
    { id: 112, question: "What is the comparative form of 'Good'?", options: ["Gooder", "Better", "Best", "More good"], correct: "Better" },
    { id: 113, question: "Which word is a preposition?", options: ["Under", "Run", "Blue", "Hot"], correct: "Under" },
    { id: 114, question: "Correct spelling?", options: ["Recieve", "Receive", "Receve", "Receiv"], correct: "Receive" },
    { id: 115, question: "Opposite of 'Success'?", options: ["Win", "Failure", "Victory", "Gain"], correct: "Failure" },
    { id: 116, question: "Past participle of 'Write'?", options: ["Wrote", "Written", "Writed", "Writes"], correct: "Written" },
    { id: 117, question: "Which sentence is in Future Tense?", options: ["I am eating.", "I will eat.", "I ate.", "I have eaten."], correct: "I will eat." },
    { id: 118, question: "Find the adverb: 'He runs fast.'", options: ["He", "Runs", "Fast", "None"], correct: "Fast" },
    { id: 119, question: "Homophone for 'Sea'?", options: ["See", "Say", "She", "Saw"], correct: "See" },
    { id: 120, question: "Choose the correct pronoun: '___ is my best friend.'", options: ["Her", "She", "Him", "Them"], correct: "She" },
    { id: 121, question: "What is the plural of 'Foot'?", options: ["Foots", "Feet", "Feets", "Footes"], correct: "Feet" },
    { id: 122, question: "Synonym of 'Dangerous'?", options: ["Safe", "Risky", "Calm", "Secure"], correct: "Risky" },
    { id: 123, question: "Complete: 'They ___ playing football.'", options: ["is", "am", "are", "was"], correct: "are" },
    { id: 124, question: "Which is a proper noun?", options: ["city", "London", "country", "town"], correct: "London" },
    { id: 125, question: "Meaning of idiom 'Break the ice'?", options: ["Break a block of ice", "Start a conversation", "Feel cold", "Get angry"], correct: "Start a conversation" },
    { id: 126, question: "Which word is a verb?", options: ["Beautiful", "Dance", "Song", "Quickly"], correct: "Dance" },
    { id: 127, question: "Superlative form of 'Big'?", options: ["Bigger", "Biggest", "More Big", "Most Big"], correct: "Biggest" },
    { id: 128, question: "Correct sentence:", options: ["I has a pen.", "I have a pen.", "I hav a pen.", "I haves a pen."], correct: "I have a pen." },
    { id: 129, question: "Antonym of 'Top'?", options: ["Up", "Bottom", "High", "Peak"], correct: "Bottom" },
    { id: 130, question: "Which contains a vowel?", options: ["Sky", "Fly", "Cry", "Cat"], correct: "Cat" }
];

const QB_CODING = [
    { id: 201, question: "Which tag is used for the largest heading in HTML?", options: ["<head>", "<h1>", "<h6>", "<header>"], correct: "<h1>" },
    { id: 202, question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: "Cascading Style Sheets" },
    { id: 203, question: "Which symbol is used for comments in JavaScript?", options: ["//", "<!-- -->", "/* */", "#"], correct: "//" },
    { id: 204, question: "Correct way to declare a variable in JS?", options: ["variable x;", "var x;", "v x;", "int x;"], correct: "var x;" },
    { id: 205, question: "Which is not a programming language?", options: ["Python", "HTML", "Java", "C++"], correct: "HTML" },
    { id: 206, question: "What prints output to the console in Python?", options: ["print()", "console.log()", "echo", "System.out.print()"], correct: "print()" },
    { id: 207, question: "Array index starts at?", options: ["1", "0", "-1", "10"], correct: "0" },
    { id: 208, question: "Which command in Git saves changes?", options: ["git save", "git commit", "git push", "git init"], correct: "git commit" },
    { id: 209, question: "Which database is NoSQL?", options: ["MySQL", "MongoDB", "PostgreSQL", "Oracle"], correct: "MongoDB" },
    { id: 210, question: "What does API stand for?", options: ["Application Programming Interface", "Apple Pie Ingredients", "App Program Init", "None"], correct: "Application Programming Interface" },
    { id: 211, question: "HTML element for inserting a line break?", options: ["<lb>", "<br>", "<break>", "<newline>"], correct: "<br>" },
    { id: 212, question: "Which property changes text color in CSS?", options: ["font-color", "text-color", "color", "fg-color"], correct: "color" },
    { id: 213, question: "How do you write 'Hello World' in an alert box in JS?", options: ["msg('Hello World');", "alertBox('Hello World');", "alert('Hello World');", "msgBox('Hello World');"], correct: "alert('Hello World');" },
    { id: 214, question: "Which SQL statement is used to extract data from a database?", options: ["EXTRACT", "SELECT", "GET", "OPEN"], correct: "SELECT" },
    { id: 215, question: "Which data type is NOT supported in Python?", options: ["List", "Dictionary", "Tuple", "Char"], correct: "Char" },
    { id: 216, question: "Correct HTML tag for making text bold?", options: ["<bold>", "<b>", "<bb>", "<dark>"], correct: "<b>" },
    { id: 217, question: "Which operator is used to check equality in values and type in JS?", options: ["==", "===", "=", "!="], correct: "===" },
    { id: 218, question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Mode", "Digital Ordinance Model", "Desktop Orientation Module"], correct: "Document Object Model" },
    { id: 219, question: "Which symbol is used for ID selector in CSS?", options: [".", "#", "*", "&"], correct: "#" },
    { id: 220, question: "Output of 2 + '2' in JavaScript?", options: ["4", "22", "Error", "NaN"], correct: "22" },
    { id: 221, question: "Which Git command downloads a repository from GitHub?", options: ["git clone", "git pull", "git fork", "git download"], correct: "git clone" },
    { id: 222, question: "What is the correct syntax to create a function in Python?", options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"], correct: "def myFunc():" },
    { id: 223, question: "Which HTML attribute specifies an alternate text for an image?", options: ["title", "src", "alt", "longdesc"], correct: "alt" },
    { id: 224, question: "What is React.js?", options: ["Server-side framework", "Database", "JavaScript Library for UI", "Operating System"], correct: "JavaScript Library for UI" },
    { id: 225, question: "Which keyword creates a constant in JavaScript?", options: ["var", "let", "const", "final"], correct: "const" },
    { id: 226, question: "Method to add an element at the end of an array in JS?", options: ["push()", "pop()", "shift()", "unshift()"], correct: "push()" },
    { id: 227, question: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], correct: "font-size" },
    { id: 228, question: "What does JSON stand for?", options: ["JavaScript Object Notation", "Java Source Object Network", "JavaScript Online Node", "None"], correct: "JavaScript Object Notation" },
    { id: 229, question: "Which status code represents 'Page Not Found'?", options: ["200", "500", "404", "403"], correct: "404" },
    { id: 230, question: "Which of the following is a loops structure in C++?", options: ["do-while", "if-else", "switch", "try-catch"], correct: "do-while" }
];

const MCQTest = () => {
    const navigate = useNavigate();
    const { API_URL, user } = useAuth(); // get user to check role
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [questions, setQuestions] = useState([]);
    const [rounds, setRounds] = useState({
        mcq: { enabled: true, questionCount: 15 },
        video: { enabled: true },
        assignment: { enabled: true }
    });
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Fetch Settings & Load Questions based on Roles
    useEffect(() => {
        const init = async () => {
            if (!user) return;

            let currentRounds = { ...rounds };
            // Fetch Settings
            if (user.hiringRounds) {
                setRounds(user.hiringRounds);
                currentRounds = user.hiringRounds;
            }

            // CHECK EXAM STATUS
            try {
                const token = localStorage.getItem('trainerToken');
                const { data: exam } = await axios.get(`${API_URL}/api/trainer/exam/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (exam && (exam.status === 'submitted' || exam.status === 'reviewed')) {
                    navigate('/exam/success');
                    return;
                }
            } catch (err) {
                console.error("Status Check Failed", err);
            } finally {
                setCheckingStatus(false);
            }

            // 1. Check for Test Bank (High Priority)
            if (currentRounds.mcq?.testId && currentRounds.mcq.testId.questions?.length > 0) {
                const testQs = currentRounds.mcq.testId.questions.map((q, i) => ({
                    id: q._id || `test-${i}`,
                    question: q.questionText,
                    options: q.options,
                    correct: q.correctAnswers, // Now an Array
                    isMultiple: q.isMultiple
                }));
                setQuestions(testQs);
                setTimeLeft(testQs.length * 2 * 60);
                return;
            }

            // 2. Custom Questions check (Legacy/Override)
            if (currentRounds.mcq?.customQuestions && currentRounds.mcq.customQuestions.length > 0) {
                const customQs = currentRounds.mcq.customQuestions.map((q, i) => ({
                    ...q,
                    id: q._id || `custom-${i}`,
                    correct: [q.correct], // Standardize to array for consistent scoring logic? Or handle both.
                    isMultiple: false
                }));
                // Note: For legacy customQuestions, 'correct' is a string. 
                // To keep it simple, we can adapt the scoring logic to handle both string and array.
                setQuestions(customQs);
                setTimeLeft(customQs.length * 2 * 60);
                return;
            }

            // 3. Select Bank (Fallback)
            let fullBank = [];
            if (user.role && user.role.toLowerCase().includes('english')) {
                fullBank = QB_SPOKEN_ENGLISH;
            } else if (user.role && user.role.toLowerCase().includes('coding')) {
                fullBank = QB_CODING;
            } else {
                fullBank = QB_MS_OFFICE;
            }

            // Randomize & Pick Count
            const count = currentRounds.mcq?.questionCount || 15;
            const shuffled = [...fullBank].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, count));

            // Adjust timer: e.g., 2 mins per question
            setTimeLeft(count * 2 * 60);
        };
        init();
    }, [user]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [questions]); // Warning fix: add dependency or disable warning

    const handleSelect = (option) => {
        if (!questions.length) return;
        const q = questions[currentQIndex];

        setAnswers(prev => {
            const currentAns = prev[q.id];

            if (q.isMultiple) {
                // Checkbox Logic
                const currentArr = Array.isArray(currentAns) ? currentAns : [];
                if (currentArr.includes(option)) {
                    return { ...prev, [q.id]: currentArr.filter(o => o !== option) };
                } else {
                    return { ...prev, [q.id]: [...currentArr, option] };
                }
            } else {
                // Radio Logic
                return { ...prev, [q.id]: option };
            }
        });
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Calculate Score
        let score = 0;
        questions.forEach(q => {
            const userAns = answers[q.id];
            const correctAns = q.correct;

            // Normalize to Arrays for comparison
            const userArr = Array.isArray(userAns) ? userAns : [userAns].filter(Boolean);
            const correctArr = Array.isArray(correctAns) ? correctAns : [correctAns];

            // Sort and Compare
            const userStr = JSON.stringify(userArr.sort());
            const correctStr = JSON.stringify(correctArr.sort());

            if (userStr === correctStr) score += 1; // 1 mark each
        });

        const finalScore = score * 5; // 5 marks per question (Scaling up)

        try {
            const token = localStorage.getItem('trainerToken');
            await axios.post(`${API_URL}/exam/mcq/submit`, {
                score: finalScore,
                answers // Send details for review
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Navigation Logic based on Enabled Rounds
            if (rounds.video?.enabled) {
                navigate('/exam/video');
            } else if (rounds.assignment?.enabled) {
                navigate('/exam/assignment');
            } else {
                navigate('/exam/status');
            }

        } catch (error) {
            console.error("Submission Failed", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };



    if (checkingStatus) {
        return <div className="p-10 text-center">Checking status...</div>;
    }

    if (questions.length === 0) return <div className="p-10 text-center">Loading Assessment...</div>;

    const currentQ = questions[currentQIndex];
    const userSelection = answers[currentQ.id];

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Question {currentQIndex + 1} of {questions.length} <span className='text-sm font-normal text-gray-500'>({user?.role})</span></CardTitle>
                    <div className="text-xl font-mono font-bold text-red-600">
                        {formatTime(timeLeft)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h2 className="text-xl font-medium mb-2">{currentQ.question}</h2>
                        {currentQ.isMultiple && <p className="text-sm text-indigo-600 font-medium">(Select all that apply)</p>}
                    </div>

                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = Array.isArray(userSelection) ? userSelection.includes(opt) : userSelection === opt;
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center space-x-3 border rounded-md p-4 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-gray-200'}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    <div className={`h-5 w-5 flex items-center justify-center border transition-all ${currentQ.isMultiple ? 'rounded' : 'rounded-full'
                                        } ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                        {isSelected && <div className={`bg-white ${currentQ.isMultiple ? 'w-3 h-3 rounded-[1px]' : 'w-2 h-2 rounded-full'}`} />}
                                    </div>
                                    <Label className="cursor-pointer flex-1 font-normal text-base">{opt}</Label>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleNext}>
                        {currentQIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MCQTest;
