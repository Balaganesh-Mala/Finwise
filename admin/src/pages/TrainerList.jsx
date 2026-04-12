import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const TrainerList = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrainers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/trainers/list`);
            setTrainers(res.data);
        } catch (error) {
            toast.error('Failed to load trainers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    const updateStatus = async (id, newStatus) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to change status to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/trainers/status/${id}`, { status: newStatus });
            toast.success(`Trainer updated to ${newStatus}`);
            fetchTrainers();
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const deleteTrainer = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Trainer?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/trainers/${id}`);
            Swal.fire(
                'Deleted!',
                'Trainer has been deleted.',
                'success'
            );
            setTrainers(trainers.filter(t => t._id !== id));
        } catch (error) {
            toast.error('Failed to delete trainer');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Trainer Management</h2>
                <a href="/trainers/add" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add New</a>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {trainers.map((trainer) => (
                            <tr key={trainer._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {trainer.photo ? (
                                            <img
                                                src={trainer.photo}
                                                alt={trainer.name}
                                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100">
                                                {trainer.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="text-sm font-bold text-gray-900">{trainer.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{trainer.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5 focus:outline-none">
                                        {trainer.status !== 'applicant' ? (
                                            <button
                                                onClick={() => updateStatus(trainer._id, trainer.status === 'active' ? 'rejected' : 'active')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                                    trainer.status === 'active' ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}
                                                title={`Change to ${trainer.status === 'active' ? 'Inactive' : 'Active'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        trainer.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        ) : (
                                            <span className="px-2 inline-flex text-[10px] leading-5 font-bold uppercase rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                Applicant
                                            </span>
                                        )}
                                        {trainer.status !== 'applicant' && (
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                trainer.status === 'active' ? 'text-indigo-600' : 'text-gray-400'
                                            }`}>
                                                {trainer.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {trainer.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        {/* Applicant Specific Actions */}
                                        {trainer.status === 'applicant' && (
                                            <div className="flex items-center gap-2">
                                                <a href={`/trainers/${trainer._id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm">
                                                    Review
                                                </a>
                                                <button
                                                    onClick={() => updateStatus(trainer._id, 'active')}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm"
                                                >
                                                    Promote
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                                            <a 
                                                href={`/trainers/edit/${trainer._id}`} 
                                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Edit Trainer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </a>
                                            
                                            <button
                                                onClick={() => deleteTrainer(trainer._id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Trainer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrainerList;
