import os

# Update Admin History
admin_history_file = 'd:/Projects/Finwise/admin/src/pages/Interviews/MockInterviewHistory.jsx'
if os.path.exists(admin_history_file):
    with open(admin_history_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'Youtube' not in content:
        content = content.replace('X, User, Star, CheckSquare, Award, Trash2, Edit2, Save, Sparkles', 'X, User, Star, CheckSquare, Award, Trash2, Edit2, Save, Sparkles, Youtube')
    
    target_block = """                                ) : (
                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                        {new Date(feedback.interviewDate || feedback.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </div>
                        </div>"""
    
    new_block = """                                ) : (
                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                        {new Date(feedback.interviewDate || feedback.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </div>
                            
                            {feedback.recordingUrl && (
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 min-w-[120px] flex items-center justify-center">
                                    <a href={feedback.recordingUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
                                        <Youtube size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Watch Recording</span>
                                    </a>
                                </div>
                            )}
                        </div>"""
    
    if 'feedback.recordingUrl &&' not in content:
        content = content.replace(target_block, new_block)
        
        with open(admin_history_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {admin_history_file}")

# Update Student Dashboard
student_history_file = 'd:/Projects/Finwise/student/src/pages/MockInterviewDashboard.jsx'
if os.path.exists(student_history_file):
    with open(student_history_file, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'Youtube' not in content:
        content = content.replace('Info, X, Trophy, Megaphone, Check, Wallet, Rocket', 'Info, X, Trophy, Megaphone, Check, Wallet, Rocket, Youtube')

    target_block_student = """                                        <p className="text-slate-400 text-xs mb-1">Date</p>
                                        <p className="text-slate-700 font-medium">{new Date(target.interviewDate || target.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>"""

    new_block_student = """                                        <p className="text-slate-400 text-xs mb-1">Date</p>
                                        <p className="text-slate-700 font-medium">{new Date(target.interviewDate || target.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {target.recordingUrl && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <a href={target.recordingUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                                            <Youtube size={18} />
                                            Watch Interview Recording
                                        </a>
                                    </div>
                                )}
                            </div>"""
                            
    if 'target.recordingUrl &&' not in content:
        content = content.replace(target_block_student, new_block_student)
        
        with open(student_history_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {student_history_file}")

