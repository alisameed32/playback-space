import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Camera, Save, X, Edit2, PlaySquare, MessageSquare, Plus, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import VideoCard from '../components/VideoCard';
// import { useForm } from 'react-hook-form'; // Can use for easier form handling

function UserProfile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Create Playlist State
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [createPlaylistForm, setCreatePlaylistForm] = useState({ name: '', description: '', isPublic: true });
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState('videos');
    const [tabData, setTabData] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);

    // Auth User
    const userString = localStorage.getItem("user");
    const currentUser = userString && userString !== "undefined" ? JSON.parse(userString) : null;
    const isOwner = currentUser?.username === username;

    // Edit States
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/users/c/${username}`);
            if (response.data.success) {
                setProfile(response.data.data);
                setEditForm({
                    fullName: response.data.data.fullName,
                    email: response.data.data.email || '' // Email might not be in public profile usually, but if owner we might need it
                });
            }
        } catch (error) {
            toast.error("Could not fetch profile");
        } finally {
            setLoading(false);
        }
    };

    // If owner, we might want to fetch personal details (like email) if not provided by public profile endpoint
    const fetchPersonalDetails = async () => {
        if (!isOwner) return;
        try {
            const response = await axios.get('/api/v1/users/me');
            if (response.data.success) {
                setEditForm(prev => ({
                    ...prev,
                    email: response.data.data.email,
                    fullName: response.data.data.fullName
                }));
            }
        } catch (error) {
            console.error("Failed to fetch personal details");
        }
    };

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    useEffect(() => {
        if (isOwner && profile) {
            fetchPersonalDetails();
        }
    }, [isOwner, profile?.username]);

    // Fetch tab data
    useEffect(() => {
        if (profile?._id) {
            fetchTabData();
        }
    }, [activeTab, profile?._id]);

    const fetchTabData = async () => {
        if (!profile?._id) return;
        setTabLoading(true);
        setTabData([]);
        try {
            let response;
            switch (activeTab) {
                case 'videos':
                    response = await axios.get(`/api/v1/videos?userId=${profile._id}`);
                    if (response.data.success) setTabData(response.data.data.videos);
                    break;
                case 'playlists':
                     // Only fetch if owner (backend restriction)
                     if (isOwner) {
                        response = await axios.get(`/api/v1/playlist/user/${profile._id}`);
                        // Backend bug workaround: data and message arguments swapped in controller
                        // Expected: data=playlists, message=string. Actual: data=string, message=playlists.
                        const list = Array.isArray(response.data.data) ? response.data.data : response.data.message;
                        if (response.data.success) setTabData(list || []);
                     }
                    break;
                case 'tweets':
                    response = await axios.get(`/api/v1/tweets/user/${profile._id}`);
                    // Backend bug workaround: data and message arguments swapped in controller
                    const tweets = Array.isArray(response.data.data) ? response.data.data : response.data.message;
                    if (response.data.success) setTabData(tweets || []);
                    break;
                default:
                    setTabData([]);
            }
        } catch (error) {
            console.error(error);
            setTabData([]);
        } finally {
            setTabLoading(false);
        }
    };


    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);
        
        // Optimistic UI update (optional, but good for feedback)
        setAvatarFile(file);

        const toastId = toast.loading("Uploading avatar...");
        try {
            const response = await axios.patch('/api/v1/users/update-avatar', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            if (response.data.success) {
                toast.success("Avatar updated successfully", { id: toastId });
                // Update local storage
                if (currentUser) {
                    const updatedUser = { ...currentUser, avatar: response.data.data.avatar };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                }
                // Refresh profile
                fetchProfile();
                // Clear file selection state
                setAvatarFile(null);
            }
        } catch (error) {
           toast.error("Failed to update avatar", { id: toastId });
           setAvatarFile(null); // Revert
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('coverImage', file);

        setCoverFile(file); // Optimistic

        const toastId = toast.loading("Uploading cover image...");
        try {
            const response = await axios.patch('/api/v1/users/update-cover-image', formData, {
                 headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success) {
                toast.success("Cover image updated successfully", { id: toastId });
                 // Update local storage if cover is stored there (usually not, but coverImage is in User model)
                 if (currentUser) {
                     const updatedUser = { ...currentUser, coverImage: response.data.data.coverImage };
                     localStorage.setItem("user", JSON.stringify(updatedUser));
                 }
                fetchProfile();
                setCoverFile(null);
            }
        } catch (error) {
            toast.error("Failed to update cover image", { id: toastId });
            setCoverFile(null);
        }
    };


    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            // 1. Update text details only
            if (editForm.fullName !== profile.fullName || editForm.email) {
                 await axios.patch('/api/v1/users/update-profile', {
                    fullName: editForm.fullName,
                    email: editForm.email
                 });
                 // Update local storage if name changed
                 if (currentUser) {
                     const updatedUser = { ...currentUser, fullName: editForm.fullName, email: editForm.email };
                     localStorage.setItem("user", JSON.stringify(updatedUser));
                 }
                 toast.success("Profile details updated successfully");
            } else {
                toast("No changes to save");
            }

            setIsEditing(false);
            fetchProfile(); // Refresh
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!createPlaylistForm.name.trim()) return toast.error("Playlist name is required");
        
        setCreatingPlaylist(true);
        try {
            const response = await axios.post('/api/v1/playlist', createPlaylistForm);
            if (response.data.success) {
                toast.success("Playlist created successfully");
                setShowPlaylistModal(false);
                setCreatePlaylistForm({ name: '', description: '', isPublic: true });
                fetchTabData(); // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create playlist");
        } finally {
            setCreatingPlaylist(false);
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Profile...</div>;
    if (!profile) return <div className="text-center mt-20 text-white">Profile not found</div>;

    return (
        <div className="text-white w-full">
            {/* Cover Image */}
            <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-gray-800 overflow-hidden rounded-xl">
                 <img 
                    src={coverFile ? URL.createObjectURL(coverFile) : profile.coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                 />
                 {isOwner && (
                    <label className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors group">
                        <div className='bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Camera className="text-white" size={32} />
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                    </label>
                 )}
            </div>

            {/* Profile Info Section */}
            <div className="px-4 pb-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start -mt-12 sm:-mt-16 mb-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black overflow-hidden bg-gray-800 relative z-10">
                            <img 
                                src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar} 
                                alt={profile.fullName} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isOwner && (
                            <label className="absolute inset-0 rounded-full border-4 border-transparent z-20 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                                <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 mt-12 sm:mt-16 sm:ml-2">
                        {!isEditing ? (
                            <div className='flex justify-between items-start'>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">{profile.fullName}</h1>
                                    <p className="text-gray-400">@{profile.username}</p>
                                    <div className='flex gap-4 mt-2 text-sm text-gray-400'>
                                        <span>{profile.subscribersCount || 0} subscribers</span>
                                        <span>{profile.channelsSubscribedToCount || 0} subscribed</span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                                        <Edit2 size={16} /> Edit Profile
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                                 <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                                        <Input 
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Email</label>
                                        <Input 
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                            className="bg-gray-800 border-gray-700"
                                            // readOnly // Depending on if we want to allow email change
                                        />
                                    </div>
                                 </div>
                                 <div className="flex gap-3">
                                     <Button type="submit" disabled={uploading}>
                                        {uploading ? "Saving..." : "Save Changes"}
                                     </Button>
                                     <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchPersonalDetails(); // Reset text args
                                        }}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                                     >
                                        Cancel
                                     </button>
                                 </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-gray-800 mt-8 mb-6">
                    <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
                        {['videos', 'playlists', 'tweets'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-lg font-medium capitalize px-2 pb-2 transition-colors relative whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'text-white border-b-2 border-white' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {tabLoading ? (
                        <div className="text-center text-gray-500 py-10">Loading...</div>
                    ) : (
                        <>
                            {/* Videos Tab */}
                            {activeTab === 'videos' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {tabData.length > 0 ? (
                                        tabData.map(video => (
                                            <VideoCard key={video._id} video={video} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500 py-10">No videos uploaded yet.</div>
                                    )}
                                </div>
                            )}

                            {/* Playlists Tab */}
                            {activeTab === 'playlists' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {isOwner && (
                                        <button 
                                            onClick={() => setShowPlaylistModal(true)}
                                            className="group flex flex-col items-center justify-center space-y-3 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl aspect-video hover:bg-gray-800 hover:border-blue-500 transition-all cursor-pointer"
                                        >
                                            <div className="p-4 bg-gray-800 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                                <Plus size={32} className="text-gray-400 group-hover:text-blue-400" />
                                            </div>
                                            <span className="font-semibold text-gray-400 group-hover:text-blue-400">Create New Playlist</span>
                                        </button>
                                    )}

                                    {isOwner ? (
                                        tabData.length > 0 ? (
                                            tabData.map(playlist => (
                                                <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group block space-y-3 cursor-pointer">
                                                    <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                                                        {playlist.playlistThumbnail ? (
                                                             <img src={playlist.playlistThumbnail} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                                <PlaySquare size={48} className="opacity-50" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 flex justify-between items-center text-xs text-white">
                                                             <span>{playlist.totalVideos} videos</span>
                                                             <span className="opacity-75 flex items-center gap-1">
                                                                {playlist.isPublic ? <Globe size={10}/> : <Lock size={10}/>}
                                                                {playlist.isPublic ? 'Public' : 'Private'}
                                                             </span>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-semibold text-white group-hover:text-blue-400 truncate">{playlist.name}</h3>
                                                    <p className="text-sm text-gray-400 line-clamp-2">{playlist.description}</p>
                                                </Link>
                                            ))
                                        ) : (
                                            !isOwner && <div className="col-span-full text-center text-gray-500 py-10">No playlists found.</div>
                                        )
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500 py-10 text-lg">
                                            This user's playlists are private.
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* Tweets Tab */}
                             {activeTab === 'tweets' && (
                                <div className="max-w-3xl space-y-4">
                                     {tabData.length > 0 ? (
                                        tabData.map(tweet => (
                                            <div key={tweet._id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                                                <div className="flex gap-3">
                                                    <img src={tweet.ownerDetails?.avatar || profile.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                             <h4 className="font-semibold text-white">{tweet.ownerDetails?.fullName || profile.fullName}</h4>
                                                             <span className="text-gray-500 text-sm">@{profile.username} · {new Date(tweet.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-300">{tweet.content}</p>
                                                        {/* Actions placeholders */}
                                                        <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                                                            <button className="flex items-center gap-1 hover:text-blue-400"><MessageSquare size={16} /> Comment</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                     ) : (
                                        <div className="text-center text-gray-500 py-10">No tweets found.</div>
                                     )}
                                </div>
                             )}
                        </>
                    )}
                </div>
            </div>
            {/* Create Playlist Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button 
                            onClick={() => setShowPlaylistModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <PlaySquare size={24} className="text-blue-500" />
                            Create New Playlist
                        </h2>

                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                                <Input 
                                    placeholder="Enter playlist name"
                                    value={createPlaylistForm.name}
                                    onChange={(e) => setCreatePlaylistForm({...createPlaylistForm, name: e.target.value})}
                                    className="bg-gray-800 border-gray-700"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    placeholder="Enter description (optional)"
                                    value={createPlaylistForm.description}
                                    onChange={(e) => setCreatePlaylistForm({...createPlaylistForm, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={createPlaylistForm.isPublic}
                                        onChange={(e) => setCreatePlaylistForm({...createPlaylistForm, isPublic: e.target.checked})}
                                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">Make public</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" className="w-full" disabled={creatingPlaylist}>
                                    {creatingPlaylist ? "Creating..." : "Create Playlist"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
