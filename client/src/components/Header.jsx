import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, User, Menu, Video, LayoutDashboard, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Logo from './Logo';
import Button from './Button';

function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  // Safe parsing of user data
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;

  const onSearch = (data) => {
    navigate(`/feed?query=${data.query}`);
  };

  const handleLogout = async () => {
    try {
        await axios.post('/api/v1/users/logout');
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate('/login');
    } catch (error) {
        toast.error("Logout failed");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/10 backdrop-blur-md h-16">
      <div className="h-full flex items-center justify-between px-4">
        
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-800 rounded-full lg:hidden text-white">
            <Menu size={24} />
          </button>
          <Link to="/feed" className="flex items-center gap-1">
            <img src="/Logo_Playback_Space.png" alt="PlaybackSpace" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Center: Search Bar */}
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
        <div className="flex items-center gap-2 sm:gap-4">
           {/* Mobile Search Icon (could expand) */}
           <button className="sm:hidden p-2 text-white">
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
      </div>
    </header>
  )
}

export default Header;
