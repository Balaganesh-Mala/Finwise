import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Image, Video, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        order: '',
        isActive: true,
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

    const handleOrderChange = async (banner, newOrder) => {
        if (newOrder < 1 || newOrder > 50) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${banner._id}`, {
                order: newOrder
            });
            // Update local state and re-sort
            const updatedBanners = banners.map(b => b._id === banner._id ? res.data : b).sort((a, b) => a.order - b.order);
            setBanners(updatedBanners);
            toast.success('Order updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update order');
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.file) {
            toast.error('Please select a file');
            return;
        }

        const toastId = toast.loading('Uploading banner...');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('order', formData.order || 50);
            data.append('isActive', formData.isActive);
            data.append('file', formData.file);

            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Add new banner and re-sort
            const newBanners = [...banners, res.data].sort((a, b) => a.order - b.order);
            setBanners(newBanners);
            
            toast.success('Banner created successfully', { id: toastId });
            setIsModalOpen(false);
            setFormData({ title: '', order: '', isActive: true, file: null });

        } catch (err) {
            console.error(err);
            toast.error('Failed to upload banner', { id: toastId });
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
                    onClick={() => setIsModalOpen(true)}
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
                                
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Order:</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="50"
                                            value={banner.order}
                                            onChange={(e) => handleOrderChange(banner, parseInt(e.target.value))}
                                            className="w-16 p-1 text-sm border border-gray-300 rounded text-center focus:border-indigo-500 outline-none"
                                        />
                                    </div>
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Upload New Banner</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                    placeholder="1 for Hero, 6+ for Promo"
                                />
                                <p className="text-xs text-gray-500 mt-1">1-5: Hero Section | 6-50: Promo/Other Sections</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File (Image or Video)</label>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    required
                                    accept="image/*,video/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Upload Banner
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
