// This service handles AI generation for questions and evaluations.
// Currently configured to use "Simulation Mode" since no OPENAI_API_KEY was detected.
// To enable real AI, add OPENAI_API_KEY to your .env file and uncomment the OpenAI logic.

// const { OpenAI } = require("openai");
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MOCK_QUESTIONS = {
  HR: [
    "Tell me about yourself.",
    "Why do you want to work for this company?",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenging situation you faced at work and how you handled it.",
    "Where do you see yourself in 5 years?"
  ],
  "Web Development": [
    "Explain the difference between `let`, `const`, and `var` in JavaScript.",
    "What is the Virtual DOM in React?",
    "Explain the concept of closure in JavaScript.",
    "How do you optimize a website for performance?",
    "What is the difference between SQL and NoSQL databases?"
  ],
  "Communication": [
    "How would you explain a complex technical concept to a non-technical person?",
    "Describe a time you had a disagreement with a colleague.",
    "How do you handle constructive criticism?",
    "Give an example of how you persuade others."
  ],
  "MS Office": [
    "What are the main components of Microsoft Office?",
    "How do you use VLOOKUP in Excel?",
    "Explain the difference between 'Save' and 'Save As' in Word.",
    "How do you create a presentation in PowerPoint?",
    "What is a Pivot Table in Excel?"
  ],
  "Data Entry": [
    "What is your typing speed (WPM)?",
    "How do you ensure accuracy when entering large amounts of data?",
    "Which software tools have you used for data entry?",
    "How do you handle confidential data?",
    "Describe a time you found an error in data and how you fixed it."
  ]
};

const getRandomQuestion = (type, excludeList = []) => {
  const list = MOCK_QUESTIONS[type] || MOCK_QUESTIONS["HR"];
  // Filter out questions that have already been asked (fuzzy match or exact match)
  const available = list.filter(q => !excludeList.some(excluded => excluded.includes(q)));
  
  // If we ran out of unique questions, fall back to the full list
  if (available.length === 0) {
      return list[Math.floor(Math.random() * list.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
};

const generateQuestion = async (type, previousAnswer = "", previousQuestions = []) => {
  // SIMULATION MODE
  // In a real implementation with OpenAI, you would send the `previousAnswer` context.
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const nextQuestionText = getRandomQuestion(type, previousQuestions);

  if (!previousAnswer) {
    // First question
    return {
      text: `Hello! Let's start this ${type} interview. First question: ${nextQuestionText}`,
      audio: null // Voice generation would go here
    };
  }

  // Follow-up question logic (Simulated)
  return {
    text: `Thank you for that answer. Moving on: ${nextQuestionText}`,
    audio: null
  };
};

const evaluateAnswer = async (question, answer, type) => {
  // SIMULATION MODE
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis delay

  // Basic heuristic scoring
  const length = answer.length;
  let score = 5;
  if (length > 30) score += 1;
  if (length > 50) score += 1;
  if (length > 100) score += 1;

  // Keyword check (Simple simulation)
  const keywords = {
    "HR": ["team", "work", "challenge", "learn", "goal"],
    "Web Development": ["react", "javascript", "css", "component", "code", "virtual", "dom"],
    "Communication": ["listen", "understand", "clear", "speak", "empathy"],
    "MS Office": ["excel", "word", "powerpoint", "formula", "sheet", "slide"],
    "Data Entry": ["accuracy", "speed", "keyboard", "detail", "type"]
  };

  const typeKeywords = keywords[type] || [];
  const foundKeywords = typeKeywords.filter(k => answer.toLowerCase().includes(k));
  if (foundKeywords.length > 0) score += 1;
  if (foundKeywords.length > 2) score += 1;

  // Cap score
  score = Math.min(9, score);

  // Randomize slightly to feel organic
  const technical = Math.min(10, Math.max(3, score + Math.floor(Math.random() * 3) - 1));
  const communication = Math.min(10, Math.max(4, score + Math.floor(Math.random() * 2)));
  const confidence = Math.min(10, Math.max(5, (length > 20 ? 7 : 4) + Math.floor(Math.random() * 3)));

  // Generate generic feedback based on score/length
  let feedback = "Good effort.";
  if (length < 20) {
      feedback = "Your answer was a bit short. Try to elaborate more to show your understanding.";
  } else if (foundKeywords.length > 0) {
      feedback = `Good answer! You correctly mentioned relevant concepts like ${foundKeywords.join(", ")}.`;
  } else {
      feedback = "That's a reasonable answer, but try to use more specific terminology related to the topic.";
  }

  return {
    communicationScore: communication,
    confidenceScore: confidence,
    technicalScore: technical,
    feedback: feedback,
    corrections: length < 20 ? "Try to use full sentences." : "No major grammatical errors detected.",
    improvementTip: "Remember to use the STAR method (Situation, Task, Action, Result) when answering behavioral questions."
  };
};

const generateFinalReport = async (sessionData) => {
   // SIMULATION MODE
   await new Promise(resolve => setTimeout(resolve, 1000));

   return {
     strengths: ["Clear communication style", "Good technical vocabulary", "Maintained professional tone"],
     weaknesses: ["Some answers were too brief", "Could provide more specific examples"],
     improvementPlan: "Focus on structuring your answers. Practice the fundamentals of the selected topic to boost confidence."
   };
};

module.exports = {
  generateQuestion,
  evaluateAnswer,
  generateFinalReport
};
