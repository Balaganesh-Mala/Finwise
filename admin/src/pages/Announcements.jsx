import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Trash2, 
    Save, 
    Image as ImageIcon, 
    Video, 
    CheckCircle, 
    XCircle, 
    Edit, 
    Link as LinkIcon, 
    Youtube,
    Calendar,
    Megaphone,
    Search,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'image',
        youtubeUrl: '',
        buttonText: '',
        buttonLink: '',
        startDate: '',
        endDate: '',
        isActive: true,
        file: null
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/announcements`);
            setAnnouncements(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load announcements');
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            type: 'image',
            youtubeUrl: '',
            buttonText: '',
            buttonLink: '',
            startDate: '',
            endDate: '',
            isActive: true,
            file: null
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            type: item.type,
            youtubeUrl: item.youtubeUrl || '',
            buttonText: item.buttonText || '',
            buttonLink: item.buttonLink || '',
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            isActive: item.isActive,
            file: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Announcement?',
            text: 'This will remove the spotlight popup for all students.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.delete(`${API_URL}/api/announcements/${id}`);
                setAnnouncements(announcements.filter(a => a._id !== id));
                toast.success('Announcement removed');
            } catch (err) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingItem ? 'Updating...' : 'Creating...');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) data.append(key, formData[key]);
            });

            if (editingItem) {
                const res = await axios.put(`${API_URL}/api/announcements/${editingItem._id}`, data);
                setAnnouncements(announcements.map(a => a._id === editingItem._id ? res.data : a));
                toast.success('Announcement updated', { id: toastId });
            } else {
                const res = await axios.post(`${API_URL}/api/announcements`, data);
                setAnnouncements([res.data, ...announcements]);
                toast.success('Announcement created', { id: toastId });
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error('Operation failed', { id: toastId });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="text-indigo-600" /> Spotlight Announcements
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage popups that appear when students open the portal.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus size={20} /> Create Spotlight
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>)
                ) : announcements.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No spotlight announcements yet.</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group">
                            <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {item.type === 'youtube' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600">
                                        <Youtube size={48} strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">YouTube Video</span>
                                    </div>
                                ) : item.type === 'video' ? (
                                    <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
                                ) : (
                                    <img src={item.mediaUrl} className="w-full h-full object-cover" alt="" />
                                )}

                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${item.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                                        {item.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>

                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button onClick={() => handleEditClick(item)} className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-xl">
                                        <Edit size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{item.title}</h3>
                                <p className="text-slate-500 text-xs mt-2 line-clamp-2 h-8">{item.description}</p>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Now'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Forever'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {item.type === 'image' ? <ImageIcon size={12} /> : item.type === 'youtube' ? <Youtube size={12} /> : <Video size={12} />}
                                        {item.type}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-8">
                                {editingItem ? 'Edit Spotlight' : 'Create New Spotlight'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Announcement Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="e.g. Major Platform Update!"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            rows="3"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="What should students know?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Content Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                                        >
                                            <option value="image">Poster Image</option>
                                            <option value="video">Uploaded Video</option>
                                            <option value="youtube">YouTube Video</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">YouTube URL</label>
                                        <input
                                            type="text"
                                            disabled={formData.type !== 'youtube'}
                                            value={formData.youtubeUrl}
                                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-2xl outline-none transition-all ${formData.type === 'youtube' ? 'bg-white border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Button Text</label>
                                        <input
                                            type="text"
                                            value={formData.buttonText}
                                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                                            placeholder="e.g. Learn More"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Button Link</label>
                                        <input
                                            type="text"
                                            value={formData.buttonLink}
                                            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                                            placeholder="e.g. /courses or https://..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Media File (Required for Image/Video)</label>
                                        <input
                                            type="file"
                                            disabled={formData.type === 'youtube'}
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Show spotlight to students</label>
                                </div>

                                <div className="flex justify-end gap-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                    >
                                        {editingItem ? 'Save Changes' : 'Publish Spotlight'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
