import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/Input'
import Button from '../components/Button'
import Logo from '../components/Logo'

function Login() {
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm()
    const [isLoading, setIsLoading] = useState(false)

    const login = async (data) => {
        setIsLoading(true)
        try {
            const payload = {
                password: data.password
            }
            // Simple heuristic to differentiate email vs username
            if (data.usernameOrEmail.includes('@')) {
                payload.email = data.usernameOrEmail
            } else {
                payload.username = data.usernameOrEmail
            }

            const response = await axios.post('/api/v1/users/login', payload)
            
            if (response.data.success) {
                // Store auth details
                // Assuming standard practice using localStorage for simplicity in this demo, 
                // though HttpOnly cookies are better (which the backend sets!).
                // However, we might need the accessToken for client-side API calls if the cookies work automatically.
                // The backend sends cookies `accessToken` and `refreshToken`.
                // Accessing the API from browser will handle cookies automatically if credentials: true is set.
                
                // We'll also store user info in context/localstorage for UI display
                 localStorage.setItem("user", JSON.stringify(response.data.data.user))

                toast.success("Login Successful")
                setTimeout(() => {
                     navigate('/feed')
                }, 1000)
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-black text-white p-4'>
            <Toaster position='top-center' reverseOrder={false} />
            <div className='w-full max-w-lg bg-gray-900 rounded-xl p-10 border border-gray-800 shadow-xl'>
                <div className="mb-6 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
                <p className="mt-2 text-center text-base text-gray-400">
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-purple-500 transition-all duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
                <form onSubmit={handleSubmit(login)} className='mt-8'>
                    <div className='space-y-6'>
                        <Input
                            label="Email or Username: "
                            placeholder="Enter your email or username"
                            type="text"
                            {...register("usernameOrEmail", {
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
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                             {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
