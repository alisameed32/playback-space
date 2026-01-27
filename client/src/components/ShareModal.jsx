import React from 'react';
import { X, Copy, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ShareModal({ isOpen, onClose, url, title }) {
    if (!isOpen) return null;

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const fullText = `${encodedTitle} ${encodedUrl}`;

    const handleShare = (platform) => {
        let shareUrl = "";
        switch (platform) {
            case 'copy':
                navigator.clipboard.writeText(`${title} ${url}`);
                toast.success("Link copied to clipboard");
                onClose();
                return;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${fullText}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            default:
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <h3 className="text-xl font-bold mb-6 text-white text-center">Share to</h3>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="grid grid-cols-5 gap-4">
                    <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                            <Copy size={24} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white">Copy</span>
                    </button>
                    
                    <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-gray-800 rounded-full group-hover:bg-[#25D366] transition-colors">
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white">WhatsApp</span>
                    </button>

                    <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-gray-800 rounded-full group-hover:bg-[#1DA1F2] transition-colors">
                            <Twitter size={24} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white">Twitter</span>
                    </button>
                    
                    <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-gray-800 rounded-full group-hover:bg-[#4267B2] transition-colors">
                            <Facebook size={24} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white">Facebook</span>
                    </button>
                    
                    <button onClick={() => handleShare('linkedin')} className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-gray-800 rounded-full group-hover:bg-[#0077b5] transition-colors">
                            <Linkedin size={24} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white">LinkedIn</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
