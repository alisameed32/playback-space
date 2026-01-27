import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // We'll manage multiple forms, one for each step for cleaner validation
    // But since we can only call useForm once per component usually or need to rename
    // I will use a single useForm or standard controlled inputs for step 2/3 to keep it simple
    // Actually, react-hook-form works fine if we just render different fields
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    
    // Step 1: Send Email
    const onSubmitEmail = async (data) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/v1/users/forgot-password', { email: data.email });
            if (res.data.success) {
                toast.success("Verification code sent to your email");
                setEmail(data.email);
                setStep(2);
                reset({ otp: "" }); // Clear form for next step
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const onSubmitOtp = async (data) => {
        setLoading(true);
        try {
            // Verify OTP ONLY
            const res = await axios.post('/api/v1/users/verify-otp', { email, otp: data.otp });
             if (res.data.success) {
                toast.success("Code verified successfully");
                setOtp(data.otp);
                setStep(3);
                reset({ newPassword: "", confirmNewPassword: "" });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Code");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const onSubmitReset = async (data) => {
        if (data.newPassword !== data.confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.post('/api/v1/users/reset-password', {
                email,
                otp, // Use the verified OTP from state
                newPassword: data.newPassword
            });
            if (res.data.success) {
                toast.success("Password reset successfully. Please login.");
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Reset failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                 <div className="text-center mb-8">
                     <img src="/Logo_Playback_Space.png" alt="Logo" className="h-12 mx-auto mb-4" />
                     <h2 className="text-2xl font-bold">
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Verification"}
                        {step === 3 && "Reset Password"}
                     </h2>
                     <p className="text-gray-400 text-sm mt-2">
                         {step === 1 && "Enter your email to receive a verification code"}
                         {step === 2 && `Verification code sent to ${email}`}
                         {step === 3 && "Create a strong new password"}
                     </p>
                 </div>

                 {step === 1 && (
                     <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-6">
                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                             <div className="relative">
                                 <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                 <input 
                                     {...register("email", { 
                                         required: "Email is required",
                                         pattern: {
                                             value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                             message: "Invalid email address"
                                         }
                                     })}
                                     type="email"
                                     placeholder="you@example.com"
                                     className="w-full bg-gray-800 border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                 />
                             </div>
                             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                         </div>

                         <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2">
                             {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Code <ArrowRight size={20} /></>}
                         </Button>

                         <div className="text-center">
                             <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                                 <ArrowLeft size={16} /> Back to Login
                             </Link>
                         </div>
                     </form>
                 )}

                 {step === 2 && (
                     <form onSubmit={handleSubmit(onSubmitOtp)} className="space-y-6">
                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">Verification Code</label>
                             <div className="relative">
                                 <KeyRound className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                 <input 
                                     {...register("otp", { required: "Code is required" })}
                                     type="text"
                                     placeholder="Enter 6-digit code"
                                     className="w-full bg-gray-800 border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                 />
                             </div>
                             {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
                         </div>

                         <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2">
                             {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
                         </Button>

                         <div className="text-center">
                             <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white transition-colors">
                                 Change Email
                             </button>
                         </div>
                     </form>
                 )}

                {step === 3 && (
                     <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-6">
                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                             <div className="relative">
                                 <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                 <input 
                                     {...register("newPassword", { 
                                         required: "New password is required",
                                         minLength: { value: 6, message: "Min 6 characters" }
                                     })}
                                     type={showPassword ? "text" : "password"}
                                     placeholder="Enter new password"
                                     className="w-full bg-gray-800 border-gray-700 text-white rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                 />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                             </div>
                             {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                         </div>

                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
                             <div className="relative">
                                 <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                 <input 
                                     {...register("confirmNewPassword", { required: "Please confirm password" })}
                                     type={showPassword ? "text" : "password"}
                                     placeholder="Confirm new password"
                                     className="w-full bg-gray-800 border-gray-700 text-white rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                 />
                             </div>
                         </div>

                         <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2">
                             {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                         </Button>
                     </form>
                 )}
             </div>
        </div>
    );
}

export default ForgotPassword;
