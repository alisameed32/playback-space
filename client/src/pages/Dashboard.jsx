import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Eye, Heart, Users, Video, Plus, X, Upload, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import Button from '../components/Button';
import Input from '../components/Input';
import { BASE_URL } from '../constants';

function Dashboard() {
    const [stats, setStats] = useState({});
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadUtil, setUploadUtil] = useState({
        uploading: false,
        title: '',
        description: '',
        videoFile: null,
        thumbnailFile: null
    });

    // Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editVideo, setEditVideo] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, videosRes] = await Promise.all([
                axios.get(`${BASE_URL}dashboard/stats`),
                axios.get(`${BASE_URL}dashboard/videos`)
            ]);
            
            // Backend dashboard controller might have argument order issue in ApiResponse
            // So we check if data property exists, regardless of success flag for dashboard routes
            const statsData = statsRes.data.data || statsRes.data; 
            setStats(statsData);

            const videosData = videosRes.data.data || videosRes.data;
            if (Array.isArray(videosData)) {
                setVideos(videosData);
            } else if (videosRes.data.success && Array.isArray(videosRes.data.data)) {
                setVideos(videosRes.data.data);
            }
            
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!uploadUtil.videoFile) {
            return toast.error("Please select a video file");
        }
        if (!uploadUtil.title) {
            return toast.error("Please enter a title");
        }

        setUploadUtil(prev => ({ ...prev, uploading: true }));
        const toastId = toast.loading("Uploading video...");

        const formData = new FormData();
        formData.append("title", uploadUtil.title);
        formData.append("description", uploadUtil.description);
        formData.append("videoFile", uploadUtil.videoFile);
        if (uploadUtil.thumbnailFile) {
            formData.append("thumbnail", uploadUtil.thumbnailFile);
        }

        try {
            const response = await axios.post(`${BASE_URL}videos`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data" 
                }
            });

            if (response.data.success) {
                toast.success("Video uploaded successfully!", { id: toastId });
                setShowUploadModal(false);
                setUploadUtil({
                    uploading: false,
                    title: '',
                    description: '',
                    videoFile: null,
                    thumbnailFile: null
                });
                // Refresh list
                const videosRes = await axios.get(`${BASE_URL}dashboard/videos`);
                const videosData = videosRes.data.data || videosRes.data;
                if (Array.isArray(videosData)) {
                    setVideos(videosData);
                } else if (videosRes.data.success && Array.isArray(videosRes.data.data)) {
                    setVideos(videosRes.data.data);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
            setUploadUtil(prev => ({ ...prev, uploading: false }));
        }
    };

    const statItems = [
        { label: "Total Views", value: stats.totalViews || 0, icon: Eye, color: "text-blue-400" },
        { label: "Total Subscribers", value: stats.totalSubscribers || 0, icon: Users, color: "text-purple-400" },
        { label: "Total Likes", value: stats.totalLikes || 0, icon: Heart, color: "text-red-400" },
        { label: "Total Videos", value: stats.totalVideos || 0, icon: Video, color: "text-green-400" },
    ];

    const handleDeleteClick = (videoId) => {
        setVideoToDelete(videoId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;
        
        const toastId = toast.loading("Deleting video...");
        try {
            await axios.delete(`${BASE_URL}videos/${videoToDelete}`);
            toast.success("Video deleted successfully", { id: toastId });
            setVideos(prev => prev.filter(v => v._id !== videoToDelete));
            // Update stats locally
            setStats(prev => ({ ...prev, totalVideos: Math.max(0, (prev.totalVideos || 0) - 1) }));
        } catch (error) {
             toast.error("Failed to delete video", { id: toastId });
        } finally {
            setShowDeleteModal(false);
            setVideoToDelete(null);
        }
    };

    const openEditModal = (video) => {
        setEditVideo({
            _id: video._id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            isPublished: video.isPublished,
            originalIsPublished: video.isPublished, // Store original state to compare
            thumbnailFile: null
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editVideo.title) return toast.error("Title is required");

        setUpdating(true);
        const toastId = toast.loading("Updating video...");

        const formData = new FormData();
        formData.append("title", editVideo.title);
        formData.append("description", editVideo.description);
        if (editVideo.thumbnailFile) {
            formData.append("thumbnail", editVideo.thumbnailFile);
        }

        try {
            await axios.patch(`${BASE_URL}videos/${editVideo._id}`, formData, {
                 headers: { "Content-Type": "multipart/form-data" }
            });
            
            // Handle Publish Status Toggle
            if (editVideo.isPublished !== editVideo.originalIsPublished) {
                await axios.patch(`${BASE_URL}videos/toggle/publish/${editVideo._id}`);
            }

            toast.success("Video updated successfully", { id: toastId });
            setShowEditModal(false);
            setEditVideo(null);
            
            // Refresh videos
            fetchDashboardData(); 

        } catch (error) {
            toast.error("Failed to update video", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
         return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="w-full text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Channel Dashboard</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statItems.map((item) => (
                        <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-gray-800 ${item.color}`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">{item.label}</p>
                                    <p className="text-2xl font-bold">{item.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">My Videos</h2>
                <Button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} /> Upload Video
                </Button>
            </div>

            {videos.length === 0 ? (
                <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
                    <p className="text-gray-500 mb-4">You haven't uploaded any videos yet.</p>
                    <Button onClick={() => setShowUploadModal(true)}>
                        Upload Your First Video
                    </Button>
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                     {/* Reuse Video Card but typically dashboard has table view or edit actions */}
                     {videos.map(video => (
                         <div key={video._id} className="relative group">
                              <VideoCard 
                                video={{ 
                                    ...video, 
                                    ownerDetails: { 
                                        fullName: stats.fullName || "You", 
                                        avatar: stats.avatar || "",
                                        username: stats.username || "me" 
                                    } 
                                }} 
                              />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(video); }} 
                                        className="p-2 bg-gray-900/90 rounded-full text-white hover:text-blue-400 hover:bg-black transition-colors"
                                        title="Edit Video"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteClick(video._id); }} 
                                        className="p-2 bg-gray-900/90 rounded-full text-white hover:text-red-400 hover:bg-black transition-colors"
                                        title="Delete Video"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                         </div>
                     ))}
                 </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => !uploadUtil.uploading && setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
                            disabled={uploadUtil.uploading}
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Upload size={24} className="text-purple-500" />
                            Upload New Video
                        </h2>

                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* Video File Input */}
                            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:bg-gray-800/50 transition-colors">
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    id="video-upload"
                                    className="hidden"
                                    onChange={(e) => setUploadUtil({ ...uploadUtil, videoFile: e.target.files[0] })}
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-4 bg-purple-500/10 rounded-full text-purple-500">
                                        <Video size={32} />
                                    </div>
                                    <span className="font-medium text-white">
                                        {uploadUtil.videoFile ? uploadUtil.videoFile.name : "Select Video File"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {uploadUtil.videoFile ? (uploadUtil.videoFile.size / (1024 * 1024)).toFixed(2) + " MB" : "Click to browse"}
                                    </span>
                                </label>
                            </div>

                            {/* Thumbnail Input */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Thumbnail</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                                    onChange={(e) => setUploadUtil({ ...uploadUtil, thumbnailFile: e.target.files[0] })}
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                <Input 
                                    placeholder="Video title"
                                    value={uploadUtil.title}
                                    onChange={(e) => setUploadUtil({...uploadUtil, title: e.target.value})}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    placeholder="Video description"
                                    value={uploadUtil.description}
                                    onChange={(e) => setUploadUtil({...uploadUtil, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="w-full" disabled={uploadUtil.uploading}>
                                    {uploadUtil.uploading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Uploading...
                                        </span>
                                    ) : (
                                        "Upload Video"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => !updating && setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
                            disabled={updating}
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Pencil size={24} className="text-blue-500" />
                            Edit Video
                        </h2>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Thumbnail Input */}
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">New Thumbnail (Optional)</label>
                                <div className="flex items-center gap-4 mb-2">
                                    {(editVideo.thumbnailFile || editVideo.thumbnail) && (
                                        <img 
                                          src={editVideo.thumbnailFile ? URL.createObjectURL(editVideo.thumbnailFile) : editVideo.thumbnail} 
                                          alt="Preview" 
                                          className="w-32 h-20 object-cover rounded-md border border-gray-700" 
                                        />
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                                    onChange={(e) => setEditVideo({ ...editVideo, thumbnailFile: e.target.files[0] })}
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                <Input 
                                    placeholder="Video title"
                                    value={editVideo.title}
                                    onChange={(e) => setEditVideo({...editVideo, title: e.target.value})}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    placeholder="Video description"
                                    value={editVideo.description}
                                    onChange={(e) => setEditVideo({...editVideo, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={editVideo.isPublished}
                                        onChange={(e) => setEditVideo({...editVideo, isPublished: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-300">
                                        {editVideo.isPublished ? 'Public' : 'Private'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={updating}>
                                    {updating ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Updating...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative transform transition-all scale-100">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Delete Video?</h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to delete this video? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;