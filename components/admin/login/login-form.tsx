'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { LoginInput } from './login-input'
import { cn } from '@/lib/utils'

interface LoginFormProps {
    onSubmit: (data: LoginFormData & { rememberMe: boolean }) => Promise<void>
    isSubmitting: boolean
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    // Watch values to know if inputs have content
    const emailValue = watch('email')
    const passwordValue = watch('password')

    const handleFormSubmit = async (data: LoginFormData) => {
        await onSubmit({ ...data, rememberMe })
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Email Field */}
            <LoginInput
                id="email"
                type="email"
                label="Correo electrónico"
                icon={<Mail className="w-3.5 h-3.5" />}
                error={errors.email}
                isFocused={focusedField === 'email'}
                hasValue={!!emailValue}
                onFocus={() => setFocusedField('email')}
                gradientFrom="sky-500"
                gradientTo="blue-500"
                iconBgColor="bg-sky-500/20"
                iconTextColor="text-sky-400"
                {...register('email', {
                    onBlur: () => {
                        setFocusedField(null)
                    },
                })}
            />

            {/* Password Field */}
            <LoginInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                icon={<Lock className="w-3.5 h-3.5" />}
                error={errors.password}
                isFocused={focusedField === 'password'}
                hasValue={!!passwordValue}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                gradientFrom="emerald-500"
                gradientTo="teal-500"
                iconBgColor="bg-emerald-500/20"
                iconTextColor="text-emerald-400"
                {...register('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={checked => setRememberMe(checked === true)}
                            className={cn(
                                'h-4 w-4 rounded border-2 border-white/20 bg-white/5',
                                'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-500',
                                'data-[state=checked]:border-amber-500',
                                'transition-all duration-200'
                            )}
                        />
                    </div>
                    <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                        Recordarme
                    </span>
                </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
                <div className="relative group">
                    {/* Button glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

                    <Button
                        type="submit"
                        className={cn(
                            'relative w-full h-10 rounded-lg font-semibold text-sm',
                            'bg-gradient-to-r from-emerald-500 to-teal-500',
                            'hover:from-emerald-400 hover:to-teal-400',
                            'text-white shadow-lg shadow-emerald-500/25',
                            'transition-all duration-300 transform hover:scale-[1.02]',
                            'disabled:opacity-50 disabled:hover:scale-100'
                        )}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Iniciando sesión...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Iniciar Sesión
                                <svg
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}
