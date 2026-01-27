import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ThumbsUp, Share2, MessageCircle, UserPlus, UserCheck, Send, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import Button from '../components/Button';
import Input from '../components/Input';

function WatchVideo() {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [channelStats, setChannelStats] = useState({ subscribersCount: 0, isSubscribed: false });
    const [likeState, setLikeState] = useState({ isLiked: false, likesCount: 0 });

    useEffect(() => {
        const fetchVideoData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Video Details
                const videoRes = await axios.get(`/api/v1/videos/${videoId}`);
                const videoData = videoRes.data.data;
                setVideo(videoData);
                setLikeState({ isLiked: videoData.isLiked, likesCount: videoData.likesCount });

                // 2. Fetch Channel Info
                if (videoData.owner?.username) {
                    const channelRes = await axios.get(`/api/v1/users/c/${videoData.owner.username}`);
                    setChannelStats({
                        subscribersCount: channelRes.data.data.subscribersCount,
                        isSubscribed: channelRes.data.data.isSubscribed
                    });
                }

                // 3. Fetch Comments
                const commentsRes = await axios.get(`/api/v1/comments/v/${videoId}`);
                // Helper to extract docs from pagination or direct array
                // Backend 'getCommentsForEntity' returns { comments: [...], totalDocs: ... }
                const responseData = commentsRes.data.data;
                const commentsData = responseData.comments || responseData.docs || responseData || [];
                setComments(Array.isArray(commentsData) ? commentsData : []);

                // 4. Fetch Related Videos
                const relatedRes = await axios.get('/api/v1/videos?limit=10');
                const allVideos = relatedRes.data.data.videos || [];
                setRelatedVideos(allVideos.filter(v => v._id !== videoId));

            } catch (error) {
                console.error("Error fetching video data:", error);
                toast.error("Failed to load video");
            } finally {
                setLoading(false);
            }
        };

        if (videoId) {
            fetchVideoData();
        }
    }, [videoId]);

    const handleLike = async () => {
        try {
            await axios.post(`/api/v1/likes/toggle/v/${videoId}`);
            setLikeState(prev => ({
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }));
        } catch (error) {
            toast.error("Failed to toggle like");
        }
    };

    const handleSubscribe = async () => {
        if (!video?.owner?._id) return;
        try {
            await axios.post(`/api/v1/subscriptions/u/${video.owner._id}`);
            setChannelStats(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
            }));
            toast.success(channelStats.isSubscribed ? "Unsubscribed" : "Subscribed");
        } catch (error) {
            toast.error("Subscription failed");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(`/api/v1/comments/v/${videoId}`, { content: newComment });
            // Add new comment to top of list
            // Note: simplistic, ideally we re-fetch or construct full object
            const newCommentObj = { 
                ...res.data.data, 
                owner: { // Mock owner since response might just be the comment doc
                    username: "You",
                    avatar: "https://placehold.co/40", 
                    // In a real app we'd use current user context
                } 
            };
            // Ideally re-fetch or assume owner is current user if we had that info handy
            // For now, let's just re-fetch comments to be safe and get populated owner
            const commentsRes = await axios.get(`/api/v1/comments/v/${videoId}`);
            setComments(commentsRes.data.data.docs || commentsRes.data.data || []);
            
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!video) return <div className="min-h-screen flex items-center justify-center text-white">Video not found</div>;

    const owner = video.owner || {};

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
            {/* Main Content */}
            <div className="flex-1">
                {/* Video Player */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-4 relative group">
                    <video 
                        src={video.videoFile} 
                        poster={video.thumbnail}
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Video Title */}
                <h1 className="text-xl font-bold mb-4">{video.title}</h1>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link to={`/c/${owner.username}`}>
                            <img 
                                src={owner.avatar || "https://placehold.co/40"} 
                                alt={owner.username} 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </Link>
                        <div>
                            <Link to={`/c/${owner.username}`} className="font-semibold block hover:text-purple-400">
                                {owner.fullName || owner.username}
                            </Link>
                            <span className="text-sm text-gray-400">{channelStats.subscribersCount} subscribers</span>
                        </div>
                        <Button 
                            onClick={handleSubscribe}
                            variant={channelStats.isSubscribed ? "secondary" : "primary"}
                            className="ml-4 px-4 py-2 rounded-full font-medium"
                        >
                            {channelStats.isSubscribed ? (
                                <span className="flex items-center gap-2"><UserCheck size={18}/> Subscribed</span>
                            ) : (
                                <span className="flex items-center gap-2"><UserPlus size={18}/> Subscribe</span>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${likeState.isLiked ? 'bg-white/20 text-purple-400' : 'bg-gray-800 hover:bg-gray-700'} transition`}
                        >
                            <ThumbsUp size={20} className={likeState.isLiked ? 'fill-current' : ''} />
                            <span className="font-medium">{likeState.likesCount}</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied!");
                            }}
                        >
                            <Share2 size={20} />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <div className="flex gap-4 text-sm text-gray-400 mb-2">
                        <span>{video.views} views</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-300">{video.description}</p>
                </div>

                {/* Comments Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MessageCircle size={20} />
                        {comments.length} Comments
                    </h3>
                    
                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-6">
                        <img 
                            src="https://placehold.co/40" // Placeholder for current user avatar as we don't have it explicitly globally readily available
                            className="w-10 h-10 rounded-full" 
                            alt="current user" 
                        />
                        <div className="flex-1 flex gap-2">
                            <Input 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full"
                            />
                            <Button type="submit">
                                <Send size={18} />
                            </Button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.map((comment, index) => {
                            const owner = comment.ownerDetails || comment.owner || {};
                            return (
                                <div key={comment._id || index} className="flex gap-4">
                                    <Link to={`/c/${owner.username}`}>
                                        <img 
                                            src={owner.avatar || "https://placehold.co/40"} 
                                            alt={owner.username} 
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link to={`/c/${owner.username}`} className="font-semibold text-sm hover:text-purple-400">
                                                {owner.username || "User"}
                                            </Link>
                                            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Related Videos) */}
            <div className="w-full lg:w-[350px] shrink-0">
                <h3 className="font-bold mb-4 text-lg">Related Videos</h3>
                <div className="flex flex-col gap-4">
                    {relatedVideos.map(video => (
                        <div key={video._id} className="transform scale-90 -ml-4 origin-left lg:scale-100 lg:ml-0 lg:origin-center">
                             <VideoCard video={video} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WatchVideo;
