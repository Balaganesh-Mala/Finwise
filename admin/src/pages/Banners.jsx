import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Image, Video, CheckCircle, XCircle, Edit, Link as LinkIcon, Type } from 'lucide-react';
import toast from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null); // Track banner being edited

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        order: '',
        isActive: true,
        description: '',
        buttonText: '',
        buttonLink: '',
        file: null
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
            setBanners(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching banners:', err);
            toast.error('Failed to load banners');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${id}`);
                setBanners(banners.filter(b => b._id !== id));
                toast.success('Banner deleted');
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete banner');
            }
        }
    };

    const handleToggleStatus = async (banner) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${banner._id}`, {
                isActive: !banner.isActive
            });
            setBanners(banners.map(b => b._id === banner._id ? res.data : b));
            toast.success(`Banner ${!banner.isActive ? 'Activated' : 'Deactivated'}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        }
    };

    const handleEditClick = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            order: banner.order,
            isActive: banner.isActive,
            description: banner.description || '',
            buttonText: banner.buttonText || '',
            buttonLink: banner.buttonLink || '',
            file: null // Don't pre-fill file input
        });
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            order: '',
            isActive: true,
            description: '',
            buttonText: '',
            buttonLink: '',
            file: null
        });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: File is required only for creating new banner
        if (!editingBanner && !formData.file) {
            toast.error('Please select a file');
            return;
        }

        const toastId = toast.loading(editingBanner ? 'Updating banner...' : 'Uploading banner...');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('order', formData.order || 50);
            data.append('isActive', formData.isActive);
            data.append('description', formData.description);
            data.append('buttonText', formData.buttonText);
            data.append('buttonLink', formData.buttonLink);

            if (formData.file) {
                data.append('file', formData.file);
            }

            let res;
            if (editingBanner) {
                res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${editingBanner._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Update local state
                setBanners(banners.map(b => b._id === editingBanner._id ? res.data : b).sort((a, b) => a.order - b.order));
                toast.success('Banner updated successfully', { id: toastId });
            } else {
                res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Add new banner and re-sort
                setBanners([...banners, res.data].sort((a, b) => a.order - b.order));
                toast.success('Banner created successfully', { id: toastId });
            }

            setIsModalOpen(false);
            setEditingBanner(null);
            setFormData({ title: '', order: '', isActive: true, description: '', buttonText: '', buttonLink: '', file: null });

        } catch (err) {
            console.error(err);
            toast.error(editingBanner ? 'Failed to update banner' : 'Failed to upload banner', { id: toastId });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading banners...</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage website banners. Order 1-5: Hero, 6-50: Promo.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Add Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No banners found. Add one to get started.</p>
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            {/* Preview Area */}
                            <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden group">
                                {banner.resourceType === 'video' ? (
                                    <video src={banner.fileUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                ) : (
                                    <img src={banner.fileUrl} alt={banner.title} className="w-full h-full object-cover" />
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        Order: {banner.order}
                                    </span>
                                </div>

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(banner)}
                                        className={`p-2 rounded-full ${banner.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-white transition-colors`}
                                        title={banner.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {banner.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(banner)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-white transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-white transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-gray-800 font-semibold truncate">
                                    {banner.resourceType === 'video' ? <Video size={16} className="text-blue-500" /> : <Image size={16} className="text-green-500" />}
                                    {banner.title}
                                </div>
                                {banner.buttonText && (
                                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium bg-indigo-50 p-1.5 rounded w-fit">
                                        <LinkIcon size={12} /> {banner.buttonText}
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Order: {banner.order}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {editingBanner ? 'Edit Banner' : 'Upload New Banner'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="e.g. Summer Sale / Hero Video"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order (1-50)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="1 for Hero, 6+ for Promo"
                                />
                                <p className="text-xs text-gray-500 mt-1">1-5: Hero Section | 6-50: Promo/Other Sections</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="Brief description for the banner..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.buttonText}
                                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="e.g. Learn More"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.buttonLink}
                                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="e.g. /courses or https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingBanner ? 'Replace File (Optional)' : 'File (Image or Video)'}
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    required={!editingBanner}
                                    accept="image/*,video/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {editingBanner && <p className="text-xs text-gray-500 mt-1">Leave empty to keep current file.</p>}
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    {editingBanner ? 'Update Banner' : 'Upload Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
