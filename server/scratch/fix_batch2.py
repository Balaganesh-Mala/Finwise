import os

filepath = 'd:/Projects/Finwise/admin/src/pages/BatchStudents.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
content = content.replace(
    "const [assignStudentId, setAssignStudentId] = useState('');",
    "const [selectedStudentIds, setSelectedStudentIds] = useState([]);"
)

# 2. handleAssignStudent
old_handle = """    const handleAssignStudent = async (e) => {
        e.preventDefault();
        if (!assignStudentId) return;
        setSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/${batchId}/assign`, {
                studentId: assignStudentId,
                enrollmentDate: enrollDate
            });
            toast.success('Student assigned to batch');
            setIsAssignOpen(false);
            setAssignStudentId('');
            fetchEnrollments();
            fetchBatch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign student');
        } finally {
            setSaving(false);
        }
    };"""

new_handle = """    const handleAssignStudent = async (e) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) return;
        setSaving(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/${batchId}/assign`, {
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
    };"""
content = content.replace(old_handle, new_handle)

# 3. assignModalFiltered
old_filter = """    // Already enrolled student IDs
    const enrolledIds = new Set(enrollments.map(e => e.studentId?._id));

    // Filtered students for assignment modal
    const assignModalFiltered = allStudents.filter(s =>
        !enrolledIds.has(s._id) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()))
    );"""

new_filter = """    // Filtered students for assignment modal (Exclude if they exist in ANY batch)
    const assignModalFiltered = allStudents.filter(s =>
        (!s.batchNames || s.batchNames.length === 0) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()))
    );"""
content = content.replace(old_filter, new_filter)

# 4. onClick modal open
old_btn = "onClick={() => { setAssignStudentId(''); setSearch(''); setIsAssignOpen(true); }}"
new_btn = "onClick={() => { setSelectedStudentIds([]); setSearch(''); setIsAssignOpen(true); }}"
content = content.replace(old_btn, new_btn)

# 5. Modal JSX
old_modal = """                            <div className="overflow-y-auto flex-1 rounded-lg border border-gray-200 divide-y divide-gray-50">
                                {assignModalFiltered.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">No available students found</div>
                                ) : (
                                    assignModalFiltered.map(s => (
                                        <label key={s._id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors ${assignStudentId === s._id ? 'bg-indigo-50' : ''}`}>
                                            <input
                                                type="radio"
                                                name="studentSelect"
                                                value={s._id}
                                                checked={assignStudentId === s._id}
                                                onChange={() => setAssignStudentId(s._id)}
                                                className="text-indigo-600"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-gray-800 truncate">{s.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{s.email}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>"""

new_modal = """                            <div className="overflow-y-auto flex-1 flex flex-col rounded-lg border border-gray-200">
                                {assignModalFiltered.length === 0 ? (
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
                                                <label key={s._id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedStudentIds.includes(s._id) ? 'bg-indigo-50' : ''}`}>
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
                                )}
                            </div>"""
content = content.replace(old_modal, new_modal)

# 6. Submit button
old_submit = """<button type="submit" disabled={!assignStudentId || saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {saving ? 'Assigning...' : 'Assign'}
                                </button>"""

new_submit = """<button type="submit" disabled={selectedStudentIds.length === 0 || saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {saving ? 'Assigning...' : `Assign (${selectedStudentIds.length})`}
                                </button>"""
content = content.replace(old_submit, new_submit)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done securely without regex issues.")
