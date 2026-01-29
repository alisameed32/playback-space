import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants';

function History() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${BASE_URL}users/history`);
                const historyData = res.data.data;
                // historyData could be an array of videos populated with owner info
                setVideos(Array.isArray(historyData) ? historyData : []);
            } catch (error) {
                console.error("Error fetching history:", error);
                // toast.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="text-white text-center mt-20">Loading history...</div>;

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                <HistoryIcon size={64} className="mb-4 opacity-50" />
                <h2 className="text-xl font-semibold">No watch history yet</h2>
                <p>Videos you watch will appear here.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <HistoryIcon className="text-purple-500" />
                    Watch History
                </h1>
                {/* Optional: Clear History button could go here */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    // In watch history, backend returns array of videos
                    // VideoCard expects 'video' prop. 
                    // Let's verify structure. 'getWatchHistory' populates 'watchHistory' which is array of Videos.
                    // Each video has 'owner' populated as object.
                    // VideoCard expects video.ownerDetails OR video.owner (as object) if we fixed it.
                    // In VideoCard: "const owner = video.ownerDetails || {};" and "const ownerName = owner.fullName..."
                    // In WatchVideo we saw that sometimes we need to handle different structures.
                    // getWatchHistory pipeline:
                    // $lookup from Video -> as watchHistory
                    // pipeline within lookup: $lookup from User -> as owner, then $addFields owner: {$first: "$owner"}
                    // So video.owner is an OBJECT.
                    // We need to ensure VideoCard handles video.owner as object.
                    // Let's check VideoCard again.
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
        </div>
    );
}

export default History;
