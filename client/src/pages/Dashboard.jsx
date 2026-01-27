import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Eye, Heart, Users, Video, Plus, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import Button from '../components/Button';
import Input from '../components/Input';

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

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, videosRes] = await Promise.all([
                axios.get('/api/v1/dashboard/stats'),
                axios.get('/api/v1/dashboard/videos')
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
            const response = await axios.post('/api/v1/videos', formData, {
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
                const videosRes = await axios.get('/api/v1/dashboard/videos');
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
        </div>
    );
}

export default Dashboard;