import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, User, Menu, Video, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Logo from './Logo';
import Button from './Button';
import { BASE_URL } from '../constants';

function Header({ toggleSidebar, isOpen }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('query') || '';
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Safe parsing of user data
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;

  const { register, handleSubmit, setValue } = useForm({
      defaultValues: { query: queryFromUrl }
  });

  useEffect(() => {
    setValue('query', queryFromUrl);
  }, [queryFromUrl, setValue]);

  const onSearch = (data) => {
    if (data.query.trim()) {
        navigate(`/feed?query=${data.query}`);
        setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
        await axios.post(`${BASE_URL}users/logout`);
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate('/login');
    } catch (error) {
        toast.error("Logout failed");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/10 backdrop-blur-md h-16">
      <div className="h-full flex items-center justify-between px-4 gap-4">
        
        {/* Mobile Search Overlay */}
        {isMobileSearchOpen ? (
            <div className="absolute inset-0 bg-black z-50 flex items-center px-4 w-full">
                <button onClick={() => setIsMobileSearchOpen(false)} className="mr-4 text-white">
                    <ArrowLeft size={24} />
                </button>
                <form onSubmit={handleSubmit(onSearch)} className="flex-1 flex items-center">
                    <input 
                        {...register('query')}
                        autoFocus
                        type="text" 
                        placeholder="Search" 
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:border-blue-500"
                    />
                </form>
            </div>
        ) : (
            <>
                {/* Left: Logo & Menu */}
                <div className="flex items-center gap-4 shrink-0">
                  <button onClick={toggleSidebar} className="p-2 hover:bg-gray-800 rounded-full text-white transition-colors duration-200">
                    {isOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                  </button>
                  <Link to="/feed" className="flex items-center gap-1">
                    <img src="/Logo_Playback_Space.png" alt="PlaybackSpace" className="h-8 sm:h-10 w-auto" />
                  </Link>
                </div>

                {/* Center: Search Bar (Desktop) */}
                <div className="hidden sm:flex flex-1 max-w-xl mx-4">
                  <form onSubmit={handleSubmit(onSearch)} className="w-full relative flex items-center">
                    <input 
                      {...register('query')}
                      type="text" 
                      placeholder="Search" 
                      className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 pl-4 rounded-l-full focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button type="submit" className="bg-gray-800 border border-l-0 border-gray-700 px-5 py-2 rounded-r-full hover:bg-gray-700 transition-colors text-white">
                      <Search size={20} />
                    </button>
                  </form>
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                   {/* Mobile Search Icon */}
                   <button 
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="sm:hidden p-2 text-white hover:bg-gray-800 rounded-full"
                   >
                     <Search size={24} />
                   </button>

                           {user ? (
                     <div className="flex items-center gap-3">
                        <Link to="/dashboard" className='hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors'>
                           <LayoutDashboard size={20} />
                        </Link>
                        <div className="group relative">
                            <img 
                                src={user.avatar} 
                                alt="User" 
                                className="w-8 h-8 rounded-full object-cover border border-gray-600 cursor-pointer"
                            />
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                        <div className="px-4 py-2 border-b border-gray-800">
                             <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                             <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                        </div>
                        <Link to={`/c/${user.username}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                            <User size={16} /> View Profile
                        </Link>
                        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 text-left">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
             </div>
           ) : (
             <div className='flex gap-2'>
                <Link to="/login">
                    <Button bgColor="bg-transparent" textColor="text-blue-400" className="border border-gray-600 hover:bg-blue-900/20">
                        Log In
                    </Button>
                </Link>
                <Link to="/signup">
                    <Button>Sign Up</Button>
                </Link>
             </div>
                   )}
                </div>
            </>
        )}
      </div>
    </header>
  )
}

export default Header;
