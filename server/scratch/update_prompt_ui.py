import os

files_to_update = [
    'd:/Projects/Finwise/admin/src/pages/Interviews/ConductMockInterview.jsx',
    'd:/Projects/Finwise/trainer/src/pages/MockInterviewForm.jsx'
]

js_function = """    const handleCopyPrompt = () => {
        const promptText = `Act as an expert technical interviewer and HR manager. I am conducting a mock interview with a student.
Please read my shorthand notes below about their performance, specific topics we covered, and general skills. 
Based solely on my notes, generate a comprehensive feedback report formatted EXACTLY as the JSON structure below. 
Do not output anything except the JSON string.

{
  "skills": {
    "communicationScore": 8,
    "technicalScore": 7,
    "confidenceScore": 8,
    "problemSolvingScore": 6,
    "bodyLanguageScore": 7,
    "practicalScore": 8,
    "remarks": {
      "communication": "Good verbal clarity and structured answers",
      "technical": "Solid technical foundation with minor gaps",
      "confidence": "Confident while answering most questions",
      "problemSolving": "Needs improvement in logical approach",
      "bodyLanguage": "Good posture and eye contact",
      "practical": "Strong hands-on understanding"
    }
  },
  "topics": [
    {
      "topic": "React Hooks",
      "score": 8,
      "remark": "Excellent understanding of useState and useEffect"
    },
    {
      "topic": "JavaScript ES6",
      "score": 7,
      "remark": "Good knowledge of promises, arrow functions, and destructuring"
    }
  ],
  "strengths": [
    "Strong React fundamentals",
    "Good communication skills"
  ],
  "weaknesses": [
    "Needs work on testing frameworks",
    "Problem solving speed can improve"
  ],
  "suggestions": [
    "Practice Jest and React Testing Library",
    "Solve coding problems daily"
  ],
  "improvementPlanText": "1. Study Jest for 1 hour daily\\n2. Practice coding daily",
  "overallRemark": "Good effort with strong frontend skills. Candidate has good potential.",
  "recommendedRole": "Frontend Developer / React Developer",
  "interviewResult": "Selected for next round"
}

My Interview Notes:
[PASTE YOUR NOTES HERE]`;

        navigator.clipboard.writeText(promptText);
        toast.success("AI Prompt Template copied to clipboard!");
    };"""

ui_old = """                        <div className="p-6 flex-1 overflow-y-auto">
                            <textarea"""

ui_new = """                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                                <p className="text-xs text-indigo-800 font-medium leading-relaxed max-w-[70%]">
                                    To get perfectly formatted results, click the button to copy our optimized ChatGPT prompt template.
                                </p>
                                <button type="button" onClick={handleCopyPrompt} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                    <Copy size={14}/> Copy AI Prompt
                                </button>
                            </div>
                            <textarea"""

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Imports
        if 'Copy' not in content and 'Copy,' not in content:
            content = content.replace('Sparkles, X', 'Sparkles, X, Copy')
            
        # 2. Add Function
        if 'handleCopyPrompt' not in content:
            content = content.replace("    const handleJsonImport = () => {", f"{js_function}\n\n    const handleJsonImport = () => {{")
            
        # 3. Update UI
        if 'Copy AI Prompt' not in content:
            content = content.replace(ui_old, ui_new)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated prompt UI in {filepath}")
