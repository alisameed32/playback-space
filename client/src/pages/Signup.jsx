import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/Input'
import Button from '../components/Button'
import Logo from '../components/Logo'

function Signup() {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [isLoading, setIsLoading] = useState(false)

    const create = async (data) => {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("fullName", data.fullName)
        formData.append("email", data.email)
        formData.append("username", data.username)
        formData.append("password", data.password)
        
        if (data.avatar && data.avatar[0]) {
            formData.append("avatar", data.avatar[0])
        }
        
        if (data.coverImage && data.coverImage[0]) {
            formData.append("coverImage", data.coverImage[0])
        }

        try {
            const response = await axios.post('/api/v1/users/register', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            if (response.data.success) {
                toast.success('Account created successfully!')
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            }
        } catch (error) {
            console.error(error)
            const errorMessage = error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
            <Toaster position='top-center' reverseOrder={false} />
            <div className={`w-full max-w-lg bg-gray-900 rounded-xl p-10 border border-gray-800 shadow-xl`}>
                <div className="mb-6 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-gray-400">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-purple-500 transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {errors.root && <p className="text-red-600 mt-8 text-center">{errors.root.message}</p>}

                <form onSubmit={handleSubmit(create)} className='mt-8 space-y-5'>
                    <div className='space-y-4'>
                        <Input
                            label="Full Name: "
                            placeholder="Enter your full name"
                            {...register("fullName", {
                                required: true,
                            })}
                        />
                        <Input
                            label="Email: "
                            placeholder="Enter your email"
                            type="email"
                            {...register("email", {
                                required: true,
                                validate: {
                                    matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                        "Email address must be a valid address",
                                }
                            })}
                        />
                         <Input
                            label="Username: "
                            placeholder="Enter your username"
                            {...register("username", {
                                required: true,
                            })}
                        />
                        <Input
                            label="Password: "
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: true,
                            })}
                        />
                         <Input
                            label="Avatar: "
                            type="file"
                            className="bg-gray-800"
                            accept="image/png, image/jpg, image/jpeg, image/gif"
                            {...register("avatar", {
                                required: true,
                            })}
                        />
                         <Input
                            label="Cover Image (Optional): "
                            type="file"
                            className="bg-gray-800"
                            accept="image/png, image/jpg, image/jpeg, image/gif"
                            {...register("coverImage")}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup
