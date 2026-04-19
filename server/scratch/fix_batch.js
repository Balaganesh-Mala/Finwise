const fs = require('fs');

let content = fs.readFileSync('d:/Projects/Finwise/admin/src/pages/BatchStudents.jsx', 'utf8');

// Replace handleAssignStudent
content = content.replace(
  /const handleAssignStudent = async \(e\) => \{([\s\S]*?)setSaving\(false\);\n        \}\n    \};/,
  `const handleAssignStudent = async (e) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) return;
        setSaving(true);
        try {
            const res = await axios.post(\`\${import.meta.env.VITE_API_URL}/api/batches/\${batchId}/assign\`, {
                studentIds: selectedStudentIds,
                enrollmentDate: enrollDate
            });
            toast.success(res.data.message || 'Students assigned to batch');
            setIsAssignOpen(false);
            setSelectedStudentIds([]);
            fetchEnrollments();
            fetchBatch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign students');
        } finally {
            setSaving(false);
        }
    };`
);

// Replace assignModalFiltered
content = content.replace(
    /const assignModalFiltered = allStudents\.filter\(s =>([\s\S]*?)s\.email\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\)\)\n    \);/,
    `const assignModalFiltered = allStudents.filter(s =>
        (!s.batchNames || s.batchNames.length === 0) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()))
    );`
);

// Replace onClick button
content = content.replace(
    /onClick=\{\(\) => \{ setAssignStudentId\(''\); setSearch\(''\); setIsAssignOpen\(true\); \}\}/,
    `onClick={() => { setSelectedStudentIds([]); setSearch(''); setIsAssignOpen(true); }}`
);

// Replace mapping inside modal
content = content.replace(
    /\{assignModalFiltered\.length === 0 \? \(([\s\S]*?)\}\)/,
    `{assignModalFiltered.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">No available students found</div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 shrink-0">
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.length > 0 && selectedStudentIds.length === assignModalFiltered.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedStudentIds(assignModalFiltered.map(s => s._id));
                                                        } else {
                                                            setSelectedStudentIds([]);
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm font-semibold text-gray-700 shrink-0">Select All ({assignModalFiltered.length})</span>
                                            </label>
                                            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-1 rounded-md border border-gray-200">
                                                Selected: <span className="font-bold text-indigo-600">{selectedStudentIds.length}</span>
                                            </span>
                                        </div>
                                        <div className="overflow-y-auto divide-y divide-gray-50">
                                            {assignModalFiltered.map(s => (
                                                <label key={s._id} className={\`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors \${selectedStudentIds.includes(s._id) ? 'bg-indigo-50' : ''}\`}>
                                                    <input
                                                        type="checkbox"
                                                        value={s._id}
                                                        checked={selectedStudentIds.includes(s._id)}
                                                        onChange={() => {
                                                            setSelectedStudentIds(prev =>
                                                                prev.includes(s._id) ? prev.filter(id => id !== s._id) : [...prev, s._id]
                                                            );
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-gray-800 truncate">{s.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{s.email}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}`
);

// Replace button disabled
content = content.replace(
    /<button type="submit" disabled=\{!assignStudentId \|\| saving\}/,
    `<button type="submit" disabled={selectedStudentIds.length === 0 || saving}`
);

// Replace button text
content = content.replace(
    /\{saving \? 'Assigning\.\.\.' : 'Assign'\}/,
    `{saving ? 'Assigning...' : \`Assign (\${selectedStudentIds.length})\`}`
);

fs.writeFileSync('d:/Projects/Finwise/admin/src/pages/BatchStudents.jsx', content, 'utf8');
console.log('Done.');
