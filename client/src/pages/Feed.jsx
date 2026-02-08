import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import{ BASE_URL } from '../constants';

function Feed() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('query') || "";

    useEffect(() => {
        const fetchVideos = async () => {
             setLoading(true);
             setError(null);
             try {
                // If query exists, search
                const queryParam = query ? `?query=${query}` : '';
                const response = await axios.get(`${BASE_URL}videos${queryParam}`);
                if (response.data.success) {
                    setVideos(response.data.data.videos);
                }
             } catch (err) {
                 console.error(err);
                 // If 401, it means user is restricted (due to global verifyJWT on route)
                 // But for a Home page, filtering empty or showing "Please login" is better handled in UI
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     localStorage.removeItem("user");
                     navigate('/');
                 } else {
                     setError("Failed to load videos.");
                 }
             } finally {
                 setLoading(false);
             }
        };

        fetchVideos();
    }, [query]);

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
        <div className="w-full">
            {query && (
                <div className="mb-6">
                    <h2 className="text-xl text-white font-semibold">Results for "{query}"</h2>
                </div>
            )}
            
            {videos.length === 0 ? (
                 <div className="text-center mt-20">
                     <p className="text-gray-400 text-lg">No videos found.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Feed;
