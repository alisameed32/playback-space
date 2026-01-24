import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';

// Modern animated background component
const ModernBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gray-900">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    
    {/* Animated geometric shapes */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.4, scale: 1, rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.4, scale: 1, rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"
    />

    {/* Floating video cards animation */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 0, x: Math.random() * 100 - 50, opacity: 0 }}
        animate={{ 
          y: [-20, -120], 
          opacity: [0, 1, 0],
          scale: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 5 + Math.random() * 5, 
          repeat: Infinity, 
          delay: i * 1.5,
          ease: "easeInOut" 
        }}
        className="absolute left-1/2 w-48 h-32 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl"
        style={{ marginLeft: `${(i % 2 === 0 ? 1 : -1) * (100 + Math.random() * 100)}px`, top: '80%' }}
      >
        <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/20" />
        <div className="absolute bottom-4 left-14 w-20 h-2 rounded bg-white/20" />
      </motion.div>
    ))}
  </div>
);

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [isLoading, setIsLoading] = useState(false);

  // Separate forms for Login and Signup
  const loginForm = useForm();
  const signupForm = useForm();

  // Sync state with URL if user navigates manually (optional, but good for deep linking)
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const toggleAuthMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/signup');
  };

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      const payload = { password: data.password };
      if (data.usernameOrEmail.includes('@')) {
        payload.email = data.usernameOrEmail;
      } else {
        payload.username = data.usernameOrEmail;
      }

      const response = await axios.post('/api/v1/users/login', payload);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        toast.success("Login Successful");
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    
    if (data.avatar && data.avatar[0]) formData.append("avatar", data.avatar[0]);
    if (data.coverImage && data.coverImage[0]) formData.append("coverImage", data.coverImage[0]);

    try {
      const response = await axios.post('/api/v1/users/register', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        toast.success('Account created successfully!');
        // Switch to login view automatically after signup
        setTimeout(() => {
            setIsLogin(true);
            navigate('/login');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white relative overflow-hidden">
      <Toaster position='top-center' reverseOrder={false} />
      
      {/* Left Side: Modern Motion Graphics */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        <ModernBackground />
        
        {/* Central Content with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 p-12 backdrop-blur-xl bg-black/30 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-lg"
        >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-0"
            >
              <img src="/Logo_Playback_Space.png" alt="PlaybackSpace Logo" className="h-24 w-auto" />
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent pb-2">
               PlaybackSpace
            </h1>
            <h2 className='text-2xl font-medium text-white mb-6'>
                Stream. Share. Connect.
            </h2>
            <p className='text-gray-400 text-lg leading-relaxed'>
                Experience the next generation of video streaming. <br/>
                Join our community of creators and viewers today.
            </p>
        </motion.div>
      </div>

      {/* Right Side: Auth Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-black lg:bg-transparent">
        
        {/* Mobile Background & Logo */}
        <div className="lg:hidden absolute inset-0 z-0">
            <ModernBackground />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        <div className="w-full max-w-md relative z-10 bg-black/40 lg:bg-transparent sm:backdrop-blur-none backdrop-blur-md p-6 sm:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none">
            
            {/* Mobile Logo */}
            <div className="lg:hidden mb-4 flex flex-col items-center">
                <div className="mb-0">
                  <img src="/Logo_Playback_Space.png" alt="PlaybackSpace Logo" className="h-16 w-auto" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent pb-1">PlaybackSpace</h2>
            </div>

            {/* Toggle Switch */}
            <div className="flex mb-8 bg-gray-900/80 backdrop-blur-md p-1 rounded-full relative border border-white/10">
                 <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-purple-600 rounded-full transition-all duration-300 ease-in-out ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                 ></div>
                 <button 
                    onClick={toggleAuthMode}
                    className={`w-1/2 text-center py-2 z-10 transition-colors duration-300 font-medium ${isLogin ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                    Sign In
                 </button>
                 <button 
                    onClick={toggleAuthMode}
                    className={`w-1/2 text-center py-2 z-10 transition-colors duration-300 font-medium ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                    Sign Up
                 </button>
            </div>

            {/* Forms Container with Transition */}
            <div className="relative overflow-hidden min-h-[500px]">
                {/* Login Form */}
                <div 
                    className={`transition-all duration-500 ease-in-out absolute w-full top-0 ${isLogin ? 'opacity-100 translate-x-0 relative' : 'opacity-0 -translate-x-full absolute pointer-events-none'}`}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="text-gray-400 mt-2">Enter your credentials to access your account</p>
                    </div>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className='space-y-5'>
                        <Input
                            label="Email or Username"
                            placeholder="username@example.com"
                            {...loginForm.register("usernameOrEmail", { required: "Email or username is required" })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                             {...loginForm.register("password", { required: "Password is required" })}
                        />
                        <div className='flex justify-end'>
                            <button type="button" className='text-sm text-purple-400 hover:text-purple-300'>Forgot password?</button>
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>

                {/* Signup Form */}
                <div 
                    className={`transition-all duration-500 ease-in-out absolute w-full top-0 ${!isLogin ? 'opacity-100 translate-x-0 relative' : 'opacity-0 translate-x-full absolute pointer-events-none'}`}
                >
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Create Account</h2>
                        <p className="text-gray-400 mt-2">Join us today and start streaming</p>
                    </div>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className='space-y-4'>
                         <Input
                            label="Full Name"
                            placeholder="John Doe"
                            {...signupForm.register("fullName", { required: true })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                             {...signupForm.register("email", { 
                                required: true,
                                pattern: {
                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Invalid email address"
                                }
                             })}
                        />
                         <Input
                            label="Username"
                            placeholder="johndoe"
                            {...signupForm.register("username", { required: true })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...signupForm.register("password", { required: true })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <Input
                                label="Avatar"
                                type="file"
                                className="bg-gray-800 text-sm"
                                accept="image/*"
                                {...signupForm.register("avatar", { required: true })}
                            />
                             <Input
                                label="Cover (Opt)"
                                type="file"
                                className="bg-gray-800 text-sm"
                                accept="image/*"
                                {...signupForm.register("coverImage")}
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 mt-4" disabled={isLoading}>
                             {isLoading ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default Auth;
