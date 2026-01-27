import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, Shield, Lock } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

function Settings() {
    const navigate = useNavigate();
    const [changingPassword, setChangingPassword] = useState(false);
    const [deletingParams, setDeletingParams] = useState({ showModal: false, loading: false });
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmNewPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setChangingPassword(true);
        try {
            const response = await axios.post('/api/v1/users/change-password', {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });
            
            if (response.data.success) {
                toast.success("Password changed successfully");
                reset();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeletingParams(prev => ({ ...prev, loading: true }));
        try {
            await axios.delete('/api/v1/users/delete-account');
            toast.success("Account deleted successfully");
            localStorage.removeItem("user");
            navigate('/signup');
        } catch (error) {
            toast.error("Failed to delete account");
            setDeletingParams(prev => ({ ...prev, showModal: false, loading: false }));
        }
    };

    return (
        <div className="w-full text-white max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {/* Change Password Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-800 rounded-full text-blue-400">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Change Password</h2>
                        <p className="text-sm text-gray-400">Update your password to keep your account secure</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-lg ml-0 sm:ml-16">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Current Password</label>
                        <Input 
                            type="password"
                            placeholder="Enter current password"
                            className="bg-gray-800 border-gray-700"
                            {...register("oldPassword", { required: "Current password is required" })}
                        />
                        {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>}
                    </div>
                    
                    <div>
                         <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                        <Input 
                            type="password"
                            placeholder="Enter new password"
                            className="bg-gray-800 border-gray-700"
                            {...register("newPassword", { 
                                required: "New password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters" }
                            })}
                        />
                        {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <div>
                         <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
                        <Input 
                            type="password"
                            placeholder="Confirm new password"
                            className="bg-gray-800 border-gray-700"
                            {...register("confirmNewPassword", { required: "Please confirm your new password" })}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={changingPassword} className="w-full sm:w-auto px-6">
                            {changingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-900/20 rounded-full text-red-500">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
                        <p className="text-sm text-red-400/70">Irreversible actions for your account</p>
                    </div>
                </div>

                <div className="ml-0 sm:ml-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-900/20 rounded-xl border border-red-900/30">
                        <div>
                            <h3 className="font-semibold text-white">Delete Account</h3>
                            <p className="text-sm text-gray-400">Permanently remove your account and all its data.</p>
                        </div>
                        <Button 
                            onClick={() => setDeletingParams({ ...deletingParams, showModal: true })}
                            className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                        >
                           <Trash2 size={18} className="mr-2 inline" /> Delete Account
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deletingParams.showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <h3 className="text-xl font-bold mb-2 text-white">Delete Account?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            Are you sure you want to delete your account? This action cannot be undone. All your videos, playlists, and comments will be lost.
                        </p>
                        
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => setDeletingParams({ ...deletingParams, showModal: false })}
                                className="flex-1 bg-gray-800 hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleDeleteAccount}
                                disabled={deletingParams.loading}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {deletingParams.loading ? "Deleting..." : "Confirm Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
