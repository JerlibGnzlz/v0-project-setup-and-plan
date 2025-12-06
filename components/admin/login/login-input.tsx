'use client'

import { InputHTMLAttributes, ReactNode } from 'react'
import { FieldError } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onFocus'> {
    label: string
    icon: ReactNode
    error?: FieldError
    isFocused: boolean
    hasValue: boolean
    onFocus?: () => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    showPasswordToggle?: boolean
    showPassword?: boolean
    onTogglePassword?: () => void
    gradientFrom: string
    gradientTo: string
    iconBgColor: string
    iconTextColor: string
}

export function LoginInput({
    label,
    icon,
    error,
    isFocused,
    hasValue,
    onFocus,
    onBlur,
    showPasswordToggle,
    showPassword,
    onTogglePassword,
    gradientFrom,
    gradientTo,
    iconBgColor,
    iconTextColor,
    className,
    id,
    ...props
}: LoginInputProps) {
    return (
        <div className="relative">
            {/* Input glow on focus */}
            <div
                className={cn(
                    'absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300',
                    isFocused && 'opacity-50',
                    gradientFrom === 'sky-500' && 'bg-gradient-to-r from-sky-500 to-blue-500',
                    gradientFrom === 'emerald-500' && 'bg-gradient-to-r from-emerald-500 to-teal-500'
                )}
            />

            <div className="relative">
                {/* Icon */}
                <div
                    className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-300 z-10',
                        isFocused || hasValue ? iconBgColor : 'bg-white/5'
                    )}
                >
                    <div
                        className={cn(
                            'transition-colors duration-300',
                            isFocused || hasValue ? iconTextColor : 'text-white/40'
                        )}
                    >
                        {icon}
                    </div>
                </div>

                {/* Input */}
                <input
                    id={id}
                    className={cn(
                        'peer w-full h-11 pl-12 pr-12 pt-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm',
                        'focus:bg-white/[0.07] focus:outline-none focus:ring-0',
                        'transition-all duration-300',
                        error && 'border-rose-500/50',
                        showPasswordToggle && 'pr-12',
                        !showPasswordToggle && 'pr-4',
                        className
                    )}
                    placeholder=" "
                    onFocus={onFocus}
                    onBlur={onBlur}
                    {...props}
                />

                {/* Floating Label */}
                <label
                    htmlFor={id}
                    className={cn(
                        'absolute left-12 transition-all duration-300 pointer-events-none',
                        'text-white/50',
                        // Floating state: when focused OR has value
                        isFocused || hasValue
                            ? `top-1.5 text-[10px] font-medium ${iconTextColor}`
                            : 'top-1/2 -translate-y-1/2 text-xs'
                    )}
                >
                    {label}
                </label>

                {/* Password toggle button */}
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200 z-10',
                            'hover:bg-white/10 focus:outline-none focus:bg-white/10',
                            showPassword ? iconBgColor : 'bg-transparent'
                        )}
                    >
                        {showPassword ? (
                            <svg
                                className={cn('w-3.5 h-3.5 transition-colors duration-200', iconTextColor)}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-3.5 h-3.5 text-white/40 hover:text-white/60 transition-colors duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-1.5 ml-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {error.message}
                </p>
            )}
        </div>
    )
}
