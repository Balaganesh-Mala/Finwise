import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {
    Play, Trash2, Save, Moon, Sun, Code2, Terminal, Layout,
    Monitor, RefreshCw, Smartphone, Tablet, Laptop,
    FileCode, FileJson, Files, Settings, ChevronDown, CheckCircle2, XCircle,
    Eye, PenTool
} from 'lucide-react';

const Playground = () => {
    // General State
    const [language, setLanguage] = useState('html');
    const [theme, setTheme] = useState('vs-dark');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('code'); // 'code' (terminal) or 'web' (preview)
    const [sidebarVisible, setSidebarVisible] = useState(true);

    // Mobile Responsive State
    const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Code State (Non-Web)
    const [code, setCode] = useState('// Write your code here\nconsole.log("Hello Playground!");');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);

    // Web Mode State - Simpler Boilerplate
    const [webCode, setWebCode] = useState({
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
</head>
<body>
    <div >
        <h1>Hello World</h1>
    </div>
</body>
</html>`,
        css: `body {
    
    min-height: 100vh;
    background: #f0f0f0;
}
h1 { color: #333; }`,
        js: `// JavaScript Code
console.log('Hello from Web Mode');`
    });
    const [activeWebTab, setActiveWebTab] = useState('html'); // 'html', 'css', 'js'
    const [previewContent, setPreviewContent] = useState('');

    // Device Preview State
    const [deviceSize, setDeviceSize] = useState('responsive');
    const [customDims, setCustomDims] = useState({ width: '100%', height: '100%' });

    const devices = {
        responsive: { label: 'Responsive', width: '100%', height: '100%', icon: Monitor },
        xs: { label: 'Mobile (375px)', width: '375px', height: '667px', icon: Smartphone },
        sm: { label: 'Tablet (640px)', width: '640px', height: '800px', icon: Tablet },
        md: { label: 'iPad (768px)', width: '768px', height: '1024px', icon: Tablet },
        lg: { label: 'Laptop (1024px)', width: '1024px', height: '800px', icon: Laptop },
        xl: { label: 'Desktop (1280px)', width: '1280px', height: '800px', icon: Monitor },
    };

    // Templates
    const templates = {
        javascript: '// JavaScript\nconsole.log("Hello World");',
        python: '# Python 3.10\nprint("Hello World")',
        c: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
        cpp: '// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}',
        java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
        sql: '-- SQL (SQLite)\nSELECT "Hello World";',
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('studentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Effect: Switch mode and templates
    useEffect(() => {
        if (language === 'html') {
            setActiveTab('web');
        } else {
            setActiveTab('code');
            if (templates[language]) {
                setCode(templates[language]);
            }
        }
        setError(null);
        setOutput('');
    }, [language]);

    // Effect: Live Preview
    useEffect(() => {
        if (language === 'html') {
            const combinedHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>${webCode.css}</style>
</head>
<body>
  ${webCode.html}
  <script>
    try {
      ${webCode.js}
    } catch (err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
            setPreviewContent(combinedHtml);
        }
    }, [webCode, language]);

    // History State
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Handlers
    const fetchHistory = async () => {
        if (!user) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/code/${user._id}`);
            setHistory(res.data.data);
            setShowHistory(true);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch history');
        }
    };

    const loadVersion = (version) => {
        setLanguage(version.language);
        if (version.language === 'html') {
            try {
                const parsed = JSON.parse(version.code);
                setWebCode(parsed);
            } catch (e) {
                console.error('Failed to parse web code', e);
            }
        } else {
            setCode(version.code);
        }
        setShowHistory(false);
    };

    const handleDeviceChange = (e) => {
        const size = e.target.value;
        setDeviceSize(size);
        if (size === 'responsive') {
            setCustomDims({ width: '100%', height: '100%' });
        } else {
            setCustomDims({ width: devices[size].width, height: devices[size].height });
        }
    };

    const handleRun = async () => {
        // Switch to preview tab on mobile when running
        if (isMobile) setMobileView('preview');

        if (language === 'html') return;

        setLoading(true);
        setOutput('');
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/run`, {
                language,
                code
            });

            if (res.data.error) {
                setError(res.data.error);
            } else {
                setOutput(res.data.output || 'No output');
            }
        } catch (err) {
            console.error(err);
            const serverError = err.response?.data?.error;
            setError(serverError || 'Execution failed. Please ensure the server is running and Docker images are built.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return alert('Please login to save your work.');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/code/save`, {
                studentId: user._id,
                language,
                code: language === 'html' ? JSON.stringify(webCode) : code,
                versionName: `Save ${new Date().toLocaleString()}`
            });
            alert('Code saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save code.');
        }
    };

    return (
        <div className={`h-full flex flex-col ${theme === 'vs-dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'} font-sans relative`}>
            {/* History Modal */}
            {showHistory && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl ${theme === 'vs-dark' ? 'bg-[#252526] border border-[#333]' : 'bg-white'}`}>
                        {/* ... (History Modal Content Omitted for brevity, logic same) ... */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-lg font-bold">Version History</h2>
                            <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-red-500/20 rounded-full hover:text-red-500 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No saved versions found.</p>
                            ) : (
                                history.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-3 rounded bg-[#333] hover:bg-[#444] transition-colors border border-transparent hover:border-blue-500 group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded ${item.language === 'html' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {item.language === 'html' ? <Layout size={16} /> : <Code2 size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-200">{item.versionName || 'Untitled Version'}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="uppercase font-bold">{item.language}</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => loadVersion(item)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            Load
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Menu Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333] overflow-x-auto">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-400 hidden sm:flex">
                        <Code2 size={20} />
                        <span className="font-semibold tracking-wide">PLAYGROUND</span>
                    </div>

                    <div className="h-4 w-px bg-gray-600 mx-2 hidden sm:block" />

                    <div className="relative group">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-[#3c3c3c] text-white pl-3 pr-8 py-1.5 rounded-md outline-none border border-transparent focus:border-blue-500 appearance-none cursor-pointer text-sm w-32 sm:w-[150px]"
                        >
                            <option value="html">Web Development</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="sql">SQL</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Run Button */}
                    {language !== 'html' && (
                        <button
                            onClick={handleRun}
                            disabled={loading}
                            className={`flex items-center gap-2 px-3 sm:px-6 py-1.5 rounded-[4px] font-medium transition-all ${loading
                                ? 'bg-gray-600 cursor-not-allowed opacity-70'
                                : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white shadow-lg shadow-green-900/20'
                                }`}
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                            <span className="hidden sm:inline">Run</span>
                        </button>
                    )}

                    <div className="h-4 w-px bg-gray-600 mx-2" />

                    <button className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors text-gray-400 hover:text-white" onClick={handleSave} title="Save">
                        <Save size={18} />
                    </button>
                    <button className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors text-gray-400 hover:text-white" onClick={fetchHistory} title="History">
                        <Files size={18} />
                    </button>
                    <button className="p-2 hover:bg-[#3c3c3c] rounded-md transition-colors text-gray-400 hover:text-white hidden sm:block" onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')} title="Theme">
                        {theme === 'vs-dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            {isMobile && (
                <div className="flex bg-[#252526] border-b border-[#333]">
                    <button
                        onClick={() => setMobileView('editor')}
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${mobileView === 'editor' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}
                    >
                        <PenTool size={16} /> Editor
                    </button>
                    <button
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${mobileView === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}
                    >
                        <Eye size={16} /> Result
                    </button>
                </div>
            )}

            {/* Main Area */}
            <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden`}>

                {/* Editor Section */}
                {/* Visible if Desktop OR (Mobile AND view is editor) */}
                {(!isMobile || mobileView === 'editor') && (
                    <div className="flex-1 flex flex-col min-w-0 h-full">

                        {/* TOP TABS for Web Mode (Replaces Sidebar) */}
                        {language === 'html' && (
                            <div className="bg-[#252526] border-b border-[#333] flex items-center">
                                {['html', 'css', 'js'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveWebTab(type)}
                                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-r border-[#333]
                                            ${activeWebTab === type
                                                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                                                : 'text-gray-500 hover:bg-[#2a2d2e] hover:text-gray-300 border-t-2 border-t-transparent'
                                            }`}
                                    >
                                        <FileCode size={14} className={type === 'html' ? 'text-orange-500' : type === 'css' ? 'text-blue-400' : 'text-yellow-400'} />
                                        <span>{type}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Editor Itself */}
                        <div className="flex-1 min-h-0">
                            <Editor
                                height="100%"
                                language={language === 'html' ? (activeWebTab === 'js' ? 'javascript' : activeWebTab) : language}
                                theme={theme}
                                value={language === 'html' ? webCode[activeWebTab] : code}
                                onChange={(val) => language === 'html' ? setWebCode(prev => ({ ...prev, [activeWebTab]: val })) : setCode(val)}
                                options={{
                                    minimap: { enabled: !isMobile }, // Disable minimap on mobile
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
                                    padding: { top: 20, bottom: 20 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    lineNumbers: isMobile ? "off" : "on",
                                    glyphMargin: !isMobile,
                                    folding: !isMobile,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Resizable Divider (Desktop Only) */}
                {!isMobile && <div className="w-1 bg-[#333] hover:bg-blue-500 cursor-col-resize transition-colors" />}

                {/* Right Panel (Output/Preview) */}
                {/* Visible if Desktop OR (Mobile AND view is preview) */}
                {(!isMobile || mobileView === 'preview') && (
                    <div className={`flex flex-col bg-[#1e1e1e] border-l border-[#333] ${isMobile ? 'flex-1' : (language === 'html' ? 'w-1/2' : 'w-2/5')}`}>

                        {/* Panel Tabs (Desktop Only) */}
                        {!isMobile && (
                            <div className="flex border-b border-[#333] bg-[#252526]">
                                <button
                                    className={`px-6 py-2.5 text-xs font-medium uppercase tracking-wider border-t-2 transition-colors ${activeTab === 'code' ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('code')}
                                >
                                    Output
                                </button>
                                <button
                                    className={`px-6 py-2.5 text-xs font-medium uppercase tracking-wider border-t-2 transition-colors ${activeTab === 'web' ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('web')}
                                >
                                    Preview
                                </button>
                            </div>
                        )}

                        {/* Web Preview Toolbar */}
                        {activeTab === 'web' && (
                            <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#333] flex items-center gap-4 overflow-x-auto">
                                <div className="relative group shrink-0">
                                    <select
                                        className="bg-[#1e1e1e] text-white text-xs pl-2 pr-8 py-1.5 rounded border border-[#444] outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                        value={deviceSize}
                                        onChange={handleDeviceChange}
                                    >
                                        {Object.entries(devices).map(([key, d]) => (
                                            <option key={key} value={key}>{d.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                                </div>

                                <div className="h-4 w-px bg-[#444] shrink-0" />

                                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                                    <span className="uppercase">W:</span>
                                    <input
                                        className="w-12 bg-[#1e1e1e] border border-[#444] rounded px-1 py-1 text-white text-center focus:border-blue-500 outline-none"
                                        value={customDims.width.replace('px', '')}
                                        onChange={(e) => setCustomDims(p => ({ ...p, width: e.target.value + (e.target.value.includes('%') ? '' : 'px') }))}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                                    <span className="uppercase">H:</span>
                                    <input
                                        className="w-12 bg-[#1e1e1e] border border-[#444] rounded px-1 py-1 text-white text-center focus:border-blue-500 outline-none"
                                        value={customDims.height.replace('px', '')}
                                        onChange={(e) => setCustomDims(p => ({ ...p, height: e.target.value + (e.target.value.includes('%') ? '' : 'px') }))}
                                    />
                                </div>

                                <button
                                    className="ml-auto p-1.5 text-gray-400 hover:text-white hover:bg-[#444] rounded shrink-0"
                                    onClick={() => handleDeviceChange({ target: { value: 'responsive' } })}
                                    title="Reset View"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-auto bg-[#1e1e1e] relative">
                            {(activeTab === 'code' && language !== 'html') || (isMobile && language !== 'html') ? (
                                <div className="p-0 h-full">
                                    {error ? (
                                        <div className="p-4 text-red-400 font-mono text-sm bg-red-900/10 h-full">
                                            <div className="flex items-center gap-2 mb-2 font-bold text-red-500">
                                                <XCircle size={16} />
                                                <span>Execution Error</span>
                                            </div>
                                            <pre className="whitespace-pre-wrap">{error}</pre>
                                        </div>
                                    ) : output ? (
                                        <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">{output}</pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                            <Terminal size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm">Run code to see output</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#111] p-4">
                                    <div
                                        className="bg-white transition-all duration-300 shadow-2xl overflow-hidden relative"
                                        style={{
                                            width: customDims.width,
                                            height: customDims.height,
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            border: deviceSize !== 'responsive' ? '12px solid #2d2d2d' : 'none',
                                            borderRadius: deviceSize !== 'responsive' ? '20px' : '0',
                                        }}
                                    >
                                        <iframe
                                            title="preview"
                                            srcDoc={previewContent}
                                            className="w-full h-full border-none bg-white"
                                            sandbox="allow-scripts allow-modals"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center px-4 text-xs select-none justify-between hidden sm:flex">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Code2 size={12} /> {language.toUpperCase()}</span>
                    <span>Ready</span>
                </div>
                <div>
                    <span>Spaces: 4</span>
                    <span className="ml-4">UTF-8</span>
                </div>
            </div>
        </div>
    );
};

export default Playground;
