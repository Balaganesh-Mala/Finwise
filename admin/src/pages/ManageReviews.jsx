import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Star, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const [formData, setFormData] = useState({
        studentName: '',
        role: '',
        courseTaken: '',
        rating: 5,
        reviewText: '',
        isApproved: true,
        file: null
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            // Fetch all reviews
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`);
            // Sort by createdAt desc by default or whatever backend returns
            setReviews(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            toast.error('Failed to load reviews');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${id}`);
                setReviews(reviews.filter(r => r._id !== id));
                toast.success('Review deleted');
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete review');
            }
        }
    };

    const handleToggleStatus = async (review) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${review._id}`, {
                isApproved: !review.isApproved
            });
            setReviews(reviews.map(r => r._id === review._id ? res.data.data : r));
            toast.success(`Review ${!review.isApproved ? 'Approved' : 'Hidden'}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        }
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setFormData({
            studentName: review.studentName,
            role: review.role || '',
            courseTaken: review.courseTaken || '',
            rating: review.rating,
            reviewText: review.reviewText,
            isApproved: review.isApproved,
            file: null // Don't pre-fill file
        });
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingReview(null);
        setFormData({
            studentName: '',
            role: '',
            courseTaken: '',
            rating: 5,
            reviewText: '',
            isApproved: true,
            file: null
        });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const toastId = toast.loading(editingReview ? 'Updating review...' : 'Creating review...');

        try {
            const data = new FormData();
            data.append('studentName', formData.studentName);
            data.append('role', formData.role);
            data.append('courseTaken', formData.courseTaken);
            data.append('rating', formData.rating);
            data.append('reviewText', formData.reviewText);
            data.append('isApproved', formData.isApproved);
            if (formData.file) {
                data.append('studentImage', formData.file);
            }

            let res;
            if (editingReview) {
                res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${editingReview._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setReviews(reviews.map(r => r._id === editingReview._id ? res.data.data : r));
                toast.success('Review updated', { id: toastId });
            } else {
                res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setReviews([res.data.data, ...reviews]);
                toast.success('Review created', { id: toastId });
            }
            setIsModalOpen(false);
            setEditingReview(null);
            setFormData({
                studentName: '',
                role: '',
                courseTaken: '',
                rating: 5,
                reviewText: '',
                isApproved: true,
                file: null
            });
        } catch (err) {
            console.error(err);
            toast.error(editingReview ? 'Failed to update review' : 'Failed to create review', { id: toastId });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Review Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student testimonials and reviews.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <Plus size={20} /> Add Review
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No reviews found. Add one manually or wait for submissions.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                            {review.studentImage !== 'no-photo.jpg' ? (
                                                <img src={review.studentImage} alt={review.studentName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                review.studentName.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{review.studentName}</h3>
                                            <p className="text-xs text-indigo-600 font-medium truncate max-w-[150px]">{review.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>

                                <blockquote className="text-gray-600 text-sm italic mb-4 line-clamp-4">
                                    "{review.reviewText}"
                                </blockquote>

                                <div className="text-xs text-gray-400 mt-auto">
                                    Course: {review.courseTaken}
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-xl">
                                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {review.isApproved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    {review.isApproved ? 'Visible' : 'Hidden'}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(review)}
                                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                                        title={review.isApproved ? "Hide" : "Approve"}
                                    >
                                        {review.isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(review)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {editingReview ? 'Edit Review' : 'Add New Review'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                <input
                                    type="text"
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Company</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="e.g. Analyst @ J.P. Morgan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Taken</label>
                                <input
                                    type="text"
                                    value={formData.courseTaken}
                                    onChange={(e) => setFormData({ ...formData, courseTaken: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="e.g. Financial Modeling"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingReview ? 'Update Image (Optional)' : 'Student Image'}
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                                <textarea
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                                    required
                                    rows="4"
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="The review content..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                                >
                                    {editingReview ? 'Update Review' : 'Add Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;
