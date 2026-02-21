import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, UserPlus, Users, Trash2, RefreshCw, X, Search, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const BatchStudents = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isChangeBatchOpen, setIsChangeBatchOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [search, setSearch] = useState('');
    const [allBatches, setAllBatches] = useState([]);
    const [newBatchId, setNewBatchId] = useState('');
    const [enrollDate, setEnrollDate] = useState(new Date().toISOString().split('T')[0]);
    const [assignStudentId, setAssignStudentId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBatch();
        fetchEnrollments();
        fetchAllStudents();
    }, [batchId]);

    const fetchBatch = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/batches/${batchId}`);
            setBatch(res.data.batch);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEnrollments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/batches/${batchId}/students`);
            setEnrollments(res.data.students);
        } catch (err) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/list`);
            setAllStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBatchesForCourse = async () => {
        try {
            // Fetch ALL batches so admin can move student to any batch
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/batches`);
            // Filter out the current batch
            setAllBatches((res.data.batches || []).filter(b => b._id !== batchId));
        } catch (err) {
            console.error('Failed to load batches', err);
            toast.error('Could not load available batches');
        }
    };

    const handleAssignStudent = async (e) => {
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
    };

    const handleChangeBatch = async (e) => {
        e.preventDefault();
        if (!newBatchId || !selectedStudent) return;
        setSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/batches/student/change-batch`, {
                studentId: selectedStudent.studentId?._id,
                newBatchId
            });
            toast.success('Student moved to new batch');
            setIsChangeBatchOpen(false);
            fetchEnrollments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to move student');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Remove this student from the batch?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/batches/${batchId}/students/${studentId}`);
            setEnrollments(prev => prev.filter(e => e.studentId?._id !== studentId));
            toast.success('Student removed');
            fetchBatch();
        } catch (err) {
            toast.error('Failed to remove student');
        }
    };

    const openChangeBatch = (enrollment) => {
        setSelectedStudent(enrollment);
        setNewBatchId('');
        fetchBatchesForCourse();
        setIsChangeBatchOpen(true);
    };

    // Already enrolled student IDs
    const enrolledIds = new Set(enrollments.map(e => e.studentId?._id));

    // Filtered students for assignment modal
    const filteredStudents = allStudents.filter(s =>
        !enrolledIds.has(s._id) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/batches')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{batch?.name || 'Batch Students'}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {batch?.courseId?.title} · {enrollments.length} / {batch?.maxStudents} students enrolled
                    </p>
                </div>
                <button
                    onClick={() => { setAssignStudentId(''); setSearch(''); setIsAssignOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                    <UserPlus size={18} /> Assign Student
                </button>
            </div>

            {/* Students Table */}
            {enrollments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No students assigned yet</p>
                    <button onClick={() => setIsAssignOpen(true)} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                        Assign First Student
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {enrollments.map(enrollment => {
                                const s = enrollment.studentId;
                                if (!s) return null;
                                return (
                                    <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {s.profilePicture ? (
                                                    <img src={s.profilePicture} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                                        {s.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{s.courseName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{s.email}</p>
                                            <p className="text-xs text-gray-500">{s.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => openChangeBatch(enrollment)}
                                                    title="Move to another batch"
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                >
                                                    <RefreshCw size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveStudent(s._id)}
                                                    title="Remove from batch"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assign Student Modal */}
            {isAssignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Assign Student to Batch</h2>
                            <button onClick={() => setIsAssignOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAssignStudent} className="p-6 flex flex-col gap-4 flex-1 overflow-hidden">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search students by name or email..."
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm"
                                />
                            </div>
                            <div className="overflow-y-auto flex-1 rounded-lg border border-gray-200 divide-y divide-gray-50">
                                {filteredStudents.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">No available students found</div>
                                ) : (
                                    filteredStudents.map(s => (
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
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date (Drip Start Date)</label>
                                <input
                                    type="date"
                                    value={enrollDate}
                                    onChange={e => setEnrollDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">Content unlocks start from this date (weekdays only)</p>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsAssignOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={!assignStudentId || saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {saving ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Batch Modal */}
            {isChangeBatchOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Move to Another Batch</h2>
                            <button onClick={() => setIsChangeBatchOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleChangeBatch} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">Moving <strong>{selectedStudent?.studentId?.name}</strong> to a new batch</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Batch</label>
                                {allBatches.length === 0 ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                        No other batches found. Please create another batch first from the Batches page.
                                    </div>
                                ) : (
                                    <select
                                        value={newBatchId}
                                        onChange={e => setNewBatchId(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                        required
                                    >
                                        <option value="">Choose batch...</option>
                                        {allBatches.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {b.name} {b.courseId?.title ? `(${b.courseId.title})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsChangeBatchOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                                    {saving ? 'Moving...' : 'Move Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchStudents;
