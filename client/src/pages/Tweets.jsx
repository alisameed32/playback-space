import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, MessageSquare, Share2, Send, X, MoreVertical, Copy, Twitter, Facebook, Linkedin } from 'lucide-react';
import Button from '../components/Button';
import ShareModal from '../components/ShareModal';
import { BASE_URL } from '../constants';

function Tweets() {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tweetContent, setTweetContent] = useState("");
    const [posting, setPosting] = useState(false);

    // Comment Modal State
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [activeTweetForComments, setActiveTweetForComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [tweetToShare, setTweetToShare] = useState(null);

    const userString = localStorage.getItem("user");
    const currentUser = userString && userString !== "undefined" ? JSON.parse(userString) : null;

    useEffect(() => {
        fetchTweets();
    }, []);

    const fetchTweets = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}tweets/feed`);
            if (response.data.success) {
                setTweets(response.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load tweets");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTweet = async (e) => {
        e.preventDefault();
        if (!tweetContent.trim()) return;

        setPosting(true);
        try {
            const response = await axios.post(`${BASE_URL}tweets`, { content: tweetContent });
            if (response.data.success) {
                toast.success("Tweet posted");
                setTweetContent("");
                fetchTweets(); // Refresh feed
            }
        } catch (error) {
            toast.error("Failed to post tweet");
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (tweetId) => {
        try {
            const response = await axios.post(`${BASE_URL}likes/toggle/t/${tweetId}`);
            if (response.data.success) {
                // Optimistic update
                setTweets(prev => prev.map(tweet => {
                    if (tweet._id === tweetId) {
                        return {
                            ...tweet,
                            isLiked: !tweet.isLiked,
                            likesCount: tweet.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1
                        };
                    }
                    return tweet;
                }));
            }
        } catch (error) {
            toast.error("Failed to like tweet");
        }
    };

    const openComments = async (tweet) => {
        setActiveTweetForComments(tweet);
        setShowCommentModal(true);
        setComments([]);
        setLoadingComments(true);
        try {
            const response = await axios.get(`${BASE_URL}comments/t/${tweet._id}`);
            if (response.data.success) {
                // The backend returns { comments: [], totalDocs: ... }
                setComments(response.data.data.comments || []);
            }
        } catch (error) {
            toast.error("Failed to load comments");
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        
        setPostingComment(true);
        try {
            const response = await axios.post(`${BASE_URL}comments/t/${activeTweetForComments._id}`, { content: commentContent });
            if (response.data.success) {
                toast.success("Comment added");
                setCommentContent("");
                
                // Construct comment object with owner details for immediate display
                const newComment = {
                    ...response.data.data,
                    owner: {
                        fullName: currentUser?.fullName || "You",
                        avatar: currentUser?.avatar,
                        username: currentUser?.username
                    }
                };

                // Append new comment
                setComments(prev => [newComment, ...prev]);
                // Update comment count in feed
                setTweets(prev => prev.map(t => t._id === activeTweetForComments._id ? { ...t, commentsCount: t.commentsCount + 1 } : t));
            }
        } catch (error) {
            toast.error("Failed to post comment");
        } finally {
            setPostingComment(false);
        }
    };

    const openShareModal = (tweet) => {
        setTweetToShare(tweet);
        setShowShareModal(true);
    };

    const handleShare = (platform) => {
       /* Handled by ShareModal */
    };

    return (
        <div className="w-full text-white max-w-2xl mx-auto pb-10">
            <h1 className="text-2xl font-bold mb-6">Tweets</h1>

            {/* Create Tweet */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
                <div className="flex gap-4">
                    <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover bg-gray-800" />
                    <div className="flex-1">
                        <textarea
                            value={tweetContent}
                            onChange={(e) => setTweetContent(e.target.value)}
                            placeholder="What's happening?"
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none min-h-[80px] p-0 text-lg outline-none"
                        />
                        <div className="flex justify-end pt-2 border-t border-gray-800 mt-2">
                             <Button 
                                onClick={handleCreateTweet} 
                                disabled={posting || !tweetContent.trim()}
                                className="px-6 py-1.5 rounded-full"
                             >
                                {posting ? "Posting..." : "Tweet"}
                             </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            {loading ? (
                <div className="text-center text-gray-500 mt-10">Loading Tweets...</div>
            ) : tweets.length > 0 ? (
                <div className="space-y-4">
                    {tweets.map(tweet => (
                        <div key={tweet._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                            <div className="flex gap-3">
                                <Link to={`/c/${tweet.ownerDetails.username}`} className="shrink-0">
                                    <img src={tweet.ownerDetails.avatar} alt={tweet.ownerDetails.username} className="w-10 h-10 rounded-full object-cover bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all" />
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link to={`/c/${tweet.ownerDetails.username}`} className="font-bold text-white hover:underline cursor-pointer">
                                            {tweet.ownerDetails.fullName}
                                        </Link>
                                        <Link to={`/c/${tweet.ownerDetails.username}`} className="text-gray-500 text-sm hover:text-gray-300">
                                            @{tweet.ownerDetails.username}
                                        </Link>
                                        <span className="text-gray-500 text-sm">· {new Date(tweet.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-200 whitespace-pre-wrap mb-3">{tweet.content}</p>
                                    
                                    <div className="flex items-center justify-between text-gray-500 max-w-md">
                                        <button 
                                            onClick={() => openComments(tweet)}
                                            className="flex items-center gap-2 hover:text-blue-400 group transition-colors"
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                                                <MessageSquare size={18} />
                                            </div>
                                            <span className="text-sm">{tweet.commentsCount || 0}</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleLike(tweet._id)}
                                            className={`flex items-center gap-2 group transition-colors ${tweet.isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                                                <Heart size={18} fill={tweet.isLiked ? "currentColor" : "none"} />
                                            </div>
                                            <span className="text-sm">{tweet.likesCount || 0}</span>
                                        </button>

                                        <button 
                                            onClick={() => openShareModal(tweet)}
                                            className="flex items-center gap-2 hover:text-green-400 group transition-colors"
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-green-500/10">
                                                <Share2 size={18} />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-10">No tweets found. Be the first to tweet!</div>
            )}

            {/* Comment Modal */}
            {showCommentModal && activeTweetForComments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Comments</h3>
                            <button onClick={() => setShowCommentModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="overflow-y-auto p-4 flex-1 space-y-4">
                            {/* Original Tweet Context */}
                            <div className="p-4 bg-gray-800/30 rounded-xl mb-4 border border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link to={`/c/${activeTweetForComments.ownerDetails?.username}`}>
                                        <img src={activeTweetForComments.ownerDetails?.avatar || "https://placehold.co/40"} className="w-6 h-6 rounded-full object-cover hover:ring-1 hover:ring-blue-500" />
                                    </Link>
                                    <Link to={`/c/${activeTweetForComments.ownerDetails?.username}`} className="font-semibold text-sm text-gray-300 hover:text-white hover:underline">
                                        {activeTweetForComments.ownerDetails?.fullName}
                                    </Link>
                                    <span className="text-xs text-gray-500">· {new Date(activeTweetForComments.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-white text-base">{activeTweetForComments.content}</p>
                            </div>

                            {loadingComments ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => {
                                    const owner = comment.ownerDetails || comment.owner || {};
                                    return (
                                        <div key={comment._id} className="flex gap-3 animate-in fade-in duration-300">
                                            <Link to={`/c/${owner.username}`} className="shrink-0">
                                                <img src={owner.avatar || "https://placehold.co/40"} className="w-8 h-8 rounded-full object-cover bg-gray-800 flex-shrink-0 hover:ring-2 hover:ring-blue-500 transition-all" />
                                            </Link>
                                            <div className="flex-1">
                                                <div className="flex gap-2 items-end mb-1">
                                                    <Link to={`/c/${owner.username}`} className="font-semibold text-sm text-white hover:underline">
                                                        {owner.fullName || "User"}
                                                    </Link>
                                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-gray-500 py-8 italic">No comments yet. Be the first to say something!</div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-2xl">
                            <form onSubmit={handlePostComment} className="flex gap-3 items-center">
                                <img src={currentUser?.avatar || "https://placehold.co/40"} className="w-8 h-8 rounded-full object-cover bg-gray-800 flex-shrink-0" />
                                <div className="flex-1 relative">
                                     <input 
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Post your reply..."
                                        className="w-full bg-gray-800 border-none rounded-full pl-4 pr-12 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500"
                                     />
                                     <button 
                                        type="submit" 
                                        disabled={postingComment || !commentContent.trim()}
                                        className="absolute right-1 top-1 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                     >
                                        <Send size={14} />
                                     </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                url={`${window.location.origin}/tweets`} // Ideally specific ID if routing existed
                title={tweetToShare ? `Check out this tweet by ${tweetToShare.ownerDetails?.fullName || "User"}: "${tweetToShare.content}"` : ""}
            />
        </div>
    );
}

export default Tweets;
