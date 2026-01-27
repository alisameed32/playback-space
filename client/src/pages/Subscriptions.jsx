import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function Subscriptions() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get current user
    const userString = localStorage.getItem("user");
    const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;

    useEffect(() => {
        const fetchSubscriptions = async () => {
             if (!user?._id) {
                 setError("Please log in to view subscriptions.");
                 setLoading(false);
                 return;
             }

             setLoading(true);
             try {
                const response = await axios.get(`/api/v1/subscriptions/c/${user._id}`);
                if (response.data.success) {
                    setChannels(response.data.data.channels || []);
                }
             } catch (err) {
                 console.error(err);
                 setError("Failed to load subscriptions.");
             } finally {
                 setLoading(false);
             }
        };

        fetchSubscriptions();
    }, [user?._id]);

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
        <div className="w-full text-white max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
            
            {channels.length === 0 ? (
                 <div className="text-center mt-20">
                     <p className="text-gray-400 text-lg">You are not subscribed to any channels.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {channels.map((channel) => (
                        <Link 
                            key={channel._id} 
                            to={`/c/${channel.username}`}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-gray-700 hover:bg-gray-800/50 transition-all group"
                        >
                            <img 
                                src={channel.avatar || "https://placehold.co/100"} 
                                alt={channel.username} 
                                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-800 group-hover:border-purple-500/50 transition-colors"
                            />
                            <h3 className="font-bold text-lg text-white mb-1 truncate w-full">{channel.fullName}</h3>
                            <p className="text-gray-400 text-sm mb-4">@{channel.username}</p>
                            
                            <div className="mt-auto px-4 py-2 bg-gray-800 rounded-full text-xs font-medium text-gray-300 flex items-center gap-2 group-hover:bg-gray-700">
                                <UserCheck size={14} /> Subscribed
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Subscriptions;
