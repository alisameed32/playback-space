import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function LikedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLikedVideos = async () => {
             setLoading(true);
             setError(null);
             try {
                const response = await axios.get('/api/v1/likes/videos');
                if (response.data.success) {
                    setVideos(response.data.data.videos);
                }
             } catch (err) {
                 console.error(err);
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     setError("Please log in to view liked videos.");
                 } else {
                     setError("Failed to load liked videos.");
                 }
             } finally {
                 setLoading(false);
             }
        };

        fetchLikedVideos();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
                <p className="text-gray-400 mb-4">{error}</p>
                {error.includes("log in") && (
                     <a href="/login" className="px-6 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700">Log In</a>
                )}
            </div>
        );
    }

    return (
        <div className="w-full text-white">
            <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
            
            {videos.length === 0 ? (
                 <div className="text-center mt-20">
                     <p className="text-gray-400 text-lg">You haven't liked any videos yet.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((item) => (
                        <VideoCard key={item._id} video={item.videoDetails} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LikedVideos;
