import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Eye, Heart, Users, Video } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import Container from '../components/Container'; // Assuming Container is just a div wrapper, reusing logic or direct div

function Dashboard() {
    const [stats, setStats] = useState({});
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchDashboardData();
    }, []);

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
                <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-700">Upload Video</button>
            </div>

            {videos.length === 0 ? (
                <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
                    <p className="text-gray-500">You haven't uploaded any videos yet.</p>
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
                                        username: stats.username || "" 
                                    } 
                                }} 
                              />
                         </div>
                     ))}
                 </div>
            )}
        </div>
    );
}

export default Dashboard;
