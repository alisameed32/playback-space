import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

function VideoCard({ video }) {
    // Determine if video.ownerDetails is array or object based on backend structure
    // Support both ownerDetails (aggregation) and owner (populate/lookup)
    const owner = video.ownerDetails || video.owner || {}; 
    const ownerName = owner.fullName || owner.username || "Unknown";
    const ownerAvatar = owner.avatar || "https://placehold.co/40";
    const views = video.views || 0;

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInDays = Math.floor(diffInSeconds / 86400);

        if (diffInDays > 365) return `${Math.floor(diffInDays / 365)} years ago`;
        if (diffInDays > 30) return `${Math.floor(diffInDays / 30)} months ago`;
        if (diffInDays > 0) return `${diffInDays} days ago`;
        if (diffInSeconds > 3600) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds > 60) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        return "Just now";
    };

    return (
        <div className="flex flex-col gap-3 group cursor-pointer w-full">
            {/* Thumbnail Container */}
            <Link to={`/watch/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {video.isPublished === false && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5 z-10">
                        <Lock size={12} />
                        <span>Private</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {formatDuration(video.duration)}
                </div>
            </Link>

            {/* Video Info */}
            <div className="flex gap-3 items-start">
                <Link to={`/c/${owner.username}`} className="shrink-0 mt-0.5">
                    <img src={ownerAvatar} alt={ownerName} className="w-9 h-9 rounded-full object-cover" />
                </Link>
                <div className="flex flex-col">
                    <Link to={`/watch/${video._id}`} className="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {video.title}
                    </Link>
                    <Link to={`/c/${owner.username}`} className="text-gray-400 text-sm mt-1 hover:text-white transition-colors">
                        {ownerName}
                    </Link>
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                        <span>{views} views</span>
                        <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;
