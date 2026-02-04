import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const TrainerList = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrainers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/trainers/list');
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
            await axios.put(`http://localhost:5000/api/admin/trainers/status/${id}`, { status: newStatus });
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
            await axios.delete(`http://localhost:5000/api/admin/trainers/${id}`);
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
                                    <div className="text-sm font-medium text-gray-900">{trainer.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{trainer.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${trainer.status === 'active' ? 'bg-green-100 text-green-800' :
                                            trainer.status === 'applicant' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {trainer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {trainer.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {trainer.status === 'applicant' && (
                                        <>
                                            <a href={`/trainers/${trainer._id}`} className="text-blue-600 hover:underline mr-2">
                                                Review Application
                                            </a>
                                            <button
                                                onClick={() => updateStatus(trainer._id, 'active')}
                                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                            >
                                                Promote to Trainer
                                            </button>
                                        </>
                                    )}
                                    {trainer.status === 'active' && (
                                        <button
                                            onClick={() => updateStatus(trainer._id, 'rejected')}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                    {trainer.status === 'rejected' && (
                                        <button
                                            onClick={() => updateStatus(trainer._id, 'active')}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Activate
                                        </button>
                                    )}
                                    {/* Link to view Exam results could go here */}
                                    <button
                                        onClick={() => deleteTrainer(trainer._id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        title="Delete Trainer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
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
