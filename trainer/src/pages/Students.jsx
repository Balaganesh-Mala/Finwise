import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, BookOpen, Calendar, MapPin, Mail, Phone } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // We can pass params if needed, but client-side filter is fine for medium datasets
            const token = localStorage.getItem('trainerToken');
            const { data } = await axios.get(`${API_URL}/api/trainer/students`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setStudents(data);
            setFilteredStudents(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = students;

        if (search) {
            result = result.filter(student =>
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filterCourse !== 'All') {
            result = result.filter(student => student.courseName === filterCourse);
        }

        setFilteredStudents(result);
    }, [search, filterCourse, students]);

    // Extract unique courses for filter
    const uniqueCourses = ['All', ...new Set(students.map(s => s.courseName).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                    <p className="text-gray-500">Manage and view student details.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                        >
                            {uniqueCourses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {student.profilePicture ? (
                                                <img src={student.profilePicture} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                student.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {student._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        student.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {student.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                    {student.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            <span>{student.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-gray-400" />
                                        <span>{student.courseName || 'No Course'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>{student.batchTiming || 'Flexible Timing'}</span>
                                    </div>
                                    {student.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{student.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500 text-xs font-medium">Progress</span>
                                        <span className="text-indigo-600 text-xs font-bold">{student.progress?.percentage || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${student.progress?.percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                        {student.progress?.completed || 0}/{student.progress?.total || 0} Topics
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No students found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Students;
