import React, { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref){
    const id = useId()
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"

    return (
        <div className='w-full'>
            {label && <label 
            className='inline-block mb-1 pl-1' 
            htmlFor={id}>
                {label}
            </label>
            }
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={`px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 duration-200 border border-gray-600 w-full ${className} ${isPassword ? 'pr-10' : ''}`}
                    ref={ref}
                    {...props}
                    id={id}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    )
})

export default Input
