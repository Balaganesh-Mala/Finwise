import os
import re

files_to_update = [
    'd:/Projects/Finwise/admin/src/pages/Interviews/ConductMockInterview.jsx',
    'd:/Projects/Finwise/trainer/src/pages/MockInterviewForm.jsx'
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    if 'Sparkles' not in content:
        content = content.replace('Plus, Trash2, CheckSquare, Save, Loader2', 'Plus, Trash2, CheckSquare, Save, Loader2, Sparkles, X')
    if 'X' not in content and 'X,' not in content:
        content = content.replace('Sparkles', 'Sparkles, X')

    # 2. State
    if 'setAiJsonInput' not in content:
        content = content.replace("const [customTopicInput, setCustomTopicInput] = useState({});",
"""const [customTopicInput, setCustomTopicInput] = useState({});
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiJsonInput, setAiJsonInput] = useState('');""")

    # 3. Calculation & Json logic
    calc_logic = """
    const calculateOverallScore = (skills, topics) => {
        let sum = 0;
        let count = 0;
        const skillKeys = ['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'];
        skillKeys.forEach(k => {
            sum += parseFloat(skills[k] || 0);
            count++;
        });

        topics.forEach(t => {
            if (t.topic && t.topic.trim() !== '') {
                sum += parseFloat(t.score || 0);
                count++;
            }
        });

        return count > 0 ? Number((sum / count).toFixed(1)) : 0;
    };

    const handleJsonImport = () => {
        try {
            const data = JSON.parse(aiJsonInput);
            setFormData(prev => {
                const newState = { ...prev };
                if (data.skills) {
                    newState.communicationScore = data.skills.communicationScore || prev.communicationScore;
                    newState.technicalScore = data.skills.technicalScore || prev.technicalScore;
                    newState.confidenceScore = data.skills.confidenceScore || prev.confidenceScore;
                    newState.problemSolvingScore = data.skills.problemSolvingScore || prev.problemSolvingScore;
                    newState.bodyLanguageScore = data.skills.bodyLanguageScore || prev.bodyLanguageScore;
                    newState.practicalScore = data.skills.practicalScore || prev.practicalScore;
                    if (data.skills.remarks || data.skills.skillRemarks) {
                        const rem = data.skills.remarks || data.skills.skillRemarks;
                        newState.skillRemarks = { ...prev.skillRemarks, ...rem };
                    }
                }
                if (data.topics && Array.isArray(data.topics)) {
                    newState.topicScores = data.topics.map(t => ({
                        topic: t.topic || '',
                        score: t.score || 0,
                        remark: t.remark || ''
                    }));
                }
                if (data.strengths) newState.strengths = data.strengths;
                if (data.weaknesses) newState.weaknesses = data.weaknesses;
                if (data.suggestions) newState.suggestions = data.suggestions;
                if (data.improvementPlanText) newState.improvementPlanText = data.improvementPlanText;
                if (data.overallRemark) newState.overallRemark = data.overallRemark;
                
                newState.overallScore = calculateOverallScore(newState, newState.topicScores);
                return newState;
            });
            toast.success("AI Feedback applied successfully");
            setShowAiModal(false);
            setAiJsonInput('');
        } catch (e) {
            toast.error("Invalid JSON format");
            console.error(e);
        }
    };

    const handleInputChange"""
    if 'calculateOverallScore' not in content:
        content = content.replace('    const handleInputChange', calc_logic)

    # 4. Math Overrides
    
    # Rating Change Replace
    rating_orig = """            // Auto-calculate overallScore when a skill changes
            if (['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'].includes(name)) {
                const total = updated.communicationScore + updated.technicalScore + updated.confidenceScore + 
                              updated.problemSolvingScore + updated.bodyLanguageScore + updated.practicalScore;
                updated.overallScore = Number((total / 6).toFixed(1));
            }"""
    rating_new = """            // Auto-calculate overallScore
            if (['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'].includes(name)) {
                updated.overallScore = calculateOverallScore(updated, updated.topicScores);
            }"""
    content = content.replace(rating_orig, rating_new)

    # Topic Change replace
    topic_change_orig = """    const handleTopicChange = (index, field, value) => {
        const newTopics = [...formData.topicScores];
        newTopics[index][field] = field === 'score' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, topicScores: newTopics }));
    };"""
    topic_change_new = """    const handleTopicChange = (index, field, value) => {
        const newTopics = [...formData.topicScores];
        newTopics[index][field] = field === 'score' ? parseFloat(value) : value;
        setFormData(prev => {
            const updated = { ...prev, topicScores: newTopics };
            updated.overallScore = calculateOverallScore(updated, newTopics);
            return updated;
        });
    };"""
    content = content.replace(topic_change_orig, topic_change_new)

    add_topic_orig = """    const addTopic = () => {
        setFormData(prev => ({
            ...prev,
            topicScores: [...prev.topicScores, { topic: '', score: 0, remark: '' }]
        }));
    };"""
    add_topic_new = """    const addTopic = () => {
        setFormData(prev => {
            const newTopics = [...prev.topicScores, { topic: '', score: 0, remark: '' }];
            return {
                ...prev,
                topicScores: newTopics,
                overallScore: calculateOverallScore(prev, newTopics)
            };
        });
    };"""
    content = content.replace(add_topic_orig, add_topic_new)

    remove_topic_orig = """    const removeTopic = (index) => {
        const newTopics = formData.topicScores.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, topicScores: newTopics }));
    };"""
    remove_topic_new = """    const removeTopic = (index) => {
        setFormData(prev => {
            const newTopics = prev.topicScores.filter((_, i) => i !== index);
            return { 
                ...prev, 
                topicScores: newTopics,
                overallScore: calculateOverallScore(prev, newTopics)
            };
        });
    };"""
    content = content.replace(remove_topic_orig, remove_topic_new)

    # 5. UI Elements
    btn_orig = """                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Interview Feedback</h1>
                    <p className="text-slate-500 text-sm">Provide structured feedback and award points to students.</p>
                </div>
            </div>"""
    btn_new = """                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Interview Feedback</h1>
                    <p className="text-slate-500 text-sm">Provide structured feedback and award points to students.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                >
                    <Sparkles size={16} className="text-amber-400" />
                    Autofill via AI
                </button>
            </div>"""
    if 'Autofill via AI' not in content:
        content = content.replace(btn_orig, btn_new)


    vid_orig = """                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Interview Date</label>
                            <input
                                type="date"
                                name="interviewDate"
                                value={formData.interviewDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1 text-center md:text-left">"""
    
    vid_new = """                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Interview Date</label>
                            <input
                                type="date"
                                name="interviewDate"
                                value={formData.interviewDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Video Recording URL (YouTube/Drive)</label>
                            <input
                                type="url"
                                name="recordingUrl"
                                value={formData.recordingUrl}
                                onChange={handleInputChange}
                                placeholder="https://"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1 text-center md:text-left">"""
    if 'Video Recording URL' not in content:
        content = content.replace(vid_orig, vid_new)


    modal_orig = """            </form>
        </div>
    );
};"""
    modal_new = """            </form>

            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles size={18} className="text-indigo-600" />
                                Paste AI Generated JSON
                            </h2>
                            <button type="button" onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <textarea
                                value={aiJsonInput}
                                onChange={(e) => setAiJsonInput(e.target.value)}
                                className="w-full h-64 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={`{\\n  "skills": {\\n    "communicationScore": 8,\\n    "technicalScore": 7\\n  }\\n}`}
                            ></textarea>
                            <p className="text-xs text-slate-500 mt-2">Paste the exact JSON object you received from ChatGPT to instantly populate this form.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowAiModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button type="button" onClick={handleJsonImport} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100">Parse & Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};"""
    if 'showAiModal &&' not in content:
        content = content.replace(modal_orig, modal_new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        print(f"Updated {filepath}")
