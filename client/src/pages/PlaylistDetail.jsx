import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlaySquare, Edit2, Trash2, Globe, Lock, Save, X, MoreVertical } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import VideoCard from '../components/VideoCard'; 

function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [editForm, setEditForm] = useState({ name: '', description: '', isPublic: true });
    const [saving, setSaving] = useState(false);

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRemoveVideoModal, setShowRemoveVideoModal] = useState(false);
    const [videoToRemove, setVideoToRemove] = useState(null);

    // Auth User
    const userString = localStorage.getItem("user");
    const currentUser = userString && userString !== "undefined" ? JSON.parse(userString) : null;
    const isOwner = currentUser && playlist && currentUser._id === (playlist.owner?._id || playlist.owner);

    useEffect(() => {
        fetchPlaylist();
    }, [playlistId]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/playlist/${playlistId}`);
            if (response.data.success) {
                // Backend Bug Workaround: Data and Message arguments are swapped in ApiResponse
                // 'data' might be the success message string, and 'message' contains the actual object
                let responsePayload = response.data.data;
                if (typeof response.data.data === 'string') {
                     responsePayload = response.data.message;
                }

                // The payload structure is { playlist: {...}, pagination: {...} }
                const plData = responsePayload?.playlist || responsePayload;
                
                if (plData) {
                    setPlaylist(plData);
                    setEditForm({
                        name: plData.name,
                        description: plData.description,
                        isPublic: plData.isPublic
                    });
                }
            }
        } catch (error) {
            console.error("Fetch Playlist Error:", error);
            toast.error("Failed to load playlist");
            // navigate(-1); // Go back if failed
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // 1. Update text details
            const response = await axios.patch(`/api/v1/playlist/${playlistId}`, {
                name: editForm.name,
                description: editForm.description
            });

            // 2. Update visibility if changed
            if (editForm.isPublic !== playlist.isPublic) {
                 // Endpoint toggles status without explicit value, so we only call if different
                 await axios.patch(`/api/v1/playlist/toggle/public/${playlistId}`);
            }

            if (response.data.success) {
                toast.success("Playlist updated");
                setIsEditing(false);
                fetchPlaylist();
            }
        } catch (error) {
            toast.error("Failed to update playlist");
        } finally {
            setSaving(false);
        }
    };

    const confirmDeletePlaylist = async () => {
        try {
            await axios.delete(`/api/v1/playlist/${playlistId}`);
            toast.success("Playlist deleted");
            navigate(`/c/${currentUser.username}`); // Redirect to profile
        } catch (error) {
            toast.error("Failed to delete playlist");
            setShowDeleteModal(false);
        }
    };

    const confirmRemoveVideo = async () => {
        if (!videoToRemove) return;
        try {
            await axios.patch(`/api/v1/playlist/remove/${videoToRemove}/${playlistId}`);
            toast.success("Video removed");
            setVideoToRemove(null);
            setShowRemoveVideoModal(false);
            fetchPlaylist(); // Refresh
        } catch (error) {
             toast.error("Failed to remove video");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

     const handleRemoveVideoClick = (videoId) => {
        setVideoToRemove(videoId);
        setShowRemoveVideoModal(true);
    };


    if (loading) return <div className="text-center mt-20 text-white">Loading Playlist...</div>;
    if (!playlist) return <div className="text-center mt-20 text-white">Playlist not found</div>;

    // Use aggregate data video objects if present (controller seems to populate them in `videos` array)
    const videos = playlist.videos || [];

    return (
        <div className="w-full text-white">
             {/* Header Section */}
            <div className={`p-6 bg-gray-900 rounded-2xl mb-8 border border-gray-800 ${isEditing ? 'border-blue-500/50' : ''}`}>
                {!isEditing ? (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="w-full md:w-80 aspect-video bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 relative group">
                             {videos.length > 0 ? (
                                 <img src={videos[0].thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <PlaySquare size={48} className="opacity-50" />
                                </div>
                             )}
                             <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 text-center text-sm">
                                 {videos.length} videos
                             </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                        <span className="flex items-center gap-1.5">
                                            {playlist.isPublic ? <Globe size={14}/> : <Lock size={14}/>}
                                            {playlist.isPublic ? 'Public' : 'Private'}
                                        </span>
                                        <span>•</span>
                                        <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-line">{playlist.description || "No description provided."}</p>
                                </div>
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2" bgColor="bg-gray-800" textColor="text-white">
                                            <Edit2 size={16} /> Edit
                                        </Button>
                                        <button onClick={handleDeleteClick} className="p-2 bg-gray-800 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-gray-400 transition-colors" title="Delete Playlist">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Edit Mode
                    <form onSubmit={handleUpdate} className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Edit2 size={20} className="text-blue-500" /> Edit Playlist
                        </h2>
                        
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Name</label>
                            <Input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="bg-gray-800 border-gray-700"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                             <label className="flex items-center gap-2 cursor-pointer group p-2 border border-transparent rounded-lg hover:bg-gray-800 transition-colors">
                                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${editForm.isPublic ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${editForm.isPublic ? 'translate-x-4' : ''}`} />
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={editForm.isPublic}
                                        onChange={(e) => setEditForm({...editForm, isPublic: e.target.checked})}
                                    />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    {editForm.isPublic ? 'Public Playlist' : 'Private Playlist'}
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                             <button 
                                type="button"
                                onClick={() => { setIsEditing(false); setEditForm({ name: playlist.name, description: playlist.description, isPublic: playlist.isPublic }); }} // Reset
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium"
                             >
                                Cancel
                             </button>
                             <Button type="submit" disabled={saving} className="min-w-[100px]">
                                {saving ? "Saving..." : "Save Changes"}
                             </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Videos List */}
            <div>
                <h3 className="text-xl font-bold mb-4">Videos</h3>
                <div className="grid grid-cols-1 gap-4">
                    {videos.length > 0 ? (
                        videos.map((video) => (
                             <div key={video._id} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-900 transition-colors relative">
                                 {/* Use VideoCard but maybe customized or strict layout */}
                                 <div className="w-48 flex-shrink-0">
                                     <VideoCard video={video} />
                                 </div>
                                 <div className="flex-1 py-1">
                                      <h4 className="font-bold text-lg mb-1">{video.title}</h4>
                                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                                      
                                      {/* Quick Actions for Owner */}
                                      {isOwner && (
                                         <button 
                                            onClick={() => handleRemoveVideoClick(video._id)}
                                            className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-black/80 p-2 rounded-lg"
                                         >
                                            <X size={14} /> Remove from playlist
                                         </button>
                                      )}
                                 </div>
                             </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-10 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                            No videos in this playlist yet.
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Playlist Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <h3 className="text-xl font-bold mb-2">Delete Playlist</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to delete this playlist? This action cannot be undone.</p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <Button 
                                onClick={confirmDeletePlaylist}
                                className="bg-red-500 hover:bg-red-600 border-none text-white px-4 py-2 rounded-lg"
                            >
                                Delete Playlist
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Video Modal */}
            {showRemoveVideoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <h3 className="text-xl font-bold mb-2">Remove Video</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to remove this video from the playlist?</p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowRemoveVideoModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <Button 
                                onClick={confirmRemoveVideo}
                                className="bg-red-500 hover:bg-red-600 border-none text-white px-4 py-2 rounded-lg"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistDetail;
