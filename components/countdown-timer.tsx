'use client'

import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: Date
  title?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Progress ring for seconds
function ProgressRing({ progress, size = 100, strokeWidth = 3 }: {
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 m-auto -rotate-90 transform"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#countdown-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-linear"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Animated digit with flip effect
function AnimatedDigit({ digit, prevDigit }: { digit: string; prevDigit: string }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentDigit, setCurrentDigit] = useState(digit)

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setCurrentDigit(digit)
        setIsAnimating(false)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setCurrentDigit(digit)
    }
  }, [digit, prevDigit])

  return (
    <span className={cn(
      "inline-block transition-all duration-200",
      isAnimating && "scale-110 opacity-70"
    )}>
      {currentDigit}
    </span>
  )
}

// Time unit card component
function TimeCard({
  value,
  label,
  showRing = false,
  ringProgress = 0,
  glowColor,
  textColor,
}: {
  value: number
  label: string
  showRing?: boolean
  ringProgress?: number
  glowColor: string
  textColor: string
}) {
  const [prevValue, setPrevValue] = useState(value)
  const valueStr = value.toString().padStart(2, '0')
  const prevValueStr = prevValue.toString().padStart(2, '0')

  useEffect(() => {
    const timer = setTimeout(() => setPrevValue(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="relative group">
      {/* Glow effect on hover */}
      <div
        className="absolute -inset-2 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-60"
        style={{ backgroundColor: glowColor }}
      />

      {/* Card */}
      <div className={cn(
        "relative flex flex-col items-center justify-center",
        "w-[72px] h-[88px] sm:w-[88px] sm:h-[104px] md:w-[100px] md:h-[120px]",
        "rounded-xl overflow-hidden",
        "bg-white/[0.05] backdrop-blur-md",
        "border border-white/10 hover:border-white/25",
        "transition-all duration-300",
        "group-hover:scale-105 group-hover:bg-white/[0.08]"
      )}>
        {/* Progress ring for seconds */}
        {showRing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ProgressRing progress={ringProgress} size={80} strokeWidth={2} />
          </div>
        )}

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

        {/* Number */}
        <div
          className="relative z-10 font-bold tabular-nums leading-none text-3xl sm:text-4xl md:text-5xl"
          style={{ color: textColor }}
        >
          <span className="inline-flex">
            <AnimatedDigit digit={valueStr[0]} prevDigit={prevValueStr[0]} />
            <AnimatedDigit digit={valueStr[1]} prevDigit={prevValueStr[1]} />
          </span>
        </div>

        {/* Label */}
        <div className="relative z-10 mt-2 text-[9px] sm:text-[10px] md:text-xs text-white/50 font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  )
}

// Colon separator
function ColonSeparator() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 mx-1 sm:mx-2">
      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/30 animate-pulse" />
      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '500ms' }} />
    </div>
  )
}

export function CountdownTimer({ targetDate, title = 'Próximo Evento' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = useMemo(() => [
    { key: 'days', value: timeLeft.days, label: 'Días', glowColor: 'rgba(56, 189, 248, 0.4)', textColor: '#38bdf8' },
    { key: 'hours', value: timeLeft.hours, label: 'Horas', glowColor: 'rgba(59, 130, 246, 0.4)', textColor: '#60a5fa' },
    { key: 'minutes', value: timeLeft.minutes, label: 'Min', glowColor: 'rgba(52, 211, 153, 0.4)', textColor: '#34d399' },
    { key: 'seconds', value: timeLeft.seconds, label: 'Seg', glowColor: 'rgba(251, 191, 36, 0.4)', textColor: '#fbbf24', showRing: true },
  ], [timeLeft])

  // Calculate ring progress
  const secondsProgress = ((60 - timeLeft.seconds) / 60) * 100

  // Loading state
  if (!mounted) {
    return (
      <div className="text-center">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white/90">{title}</h3>
        <div className="flex items-center justify-center">
          {timeUnits.map(({ key, label, glowColor, textColor }, index) => (
            <div key={key} className="flex items-center">
              <TimeCard value={0} label={label} glowColor={glowColor} textColor={textColor} />
              {index < timeUnits.length - 1 && <ColonSeparator />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white/90">
        {title}
      </h3>

      {/* Countdown cards */}
      <div className="flex items-center justify-center">
        {timeUnits.map(({ key, value, label, glowColor, textColor, showRing }, index) => (
          <div key={key} className="flex items-center">
            <TimeCard
              value={value}
              label={label}
              glowColor={glowColor}
              textColor={textColor}
              showRing={showRing}
              ringProgress={showRing ? secondsProgress : 0}
            />
            {index < timeUnits.length - 1 && <ColonSeparator />}
          </div>
        ))}
      </div>

      {/* Message */}
      <p className="mt-6 text-xs sm:text-sm text-white/40">
        ¡No te lo pierdas!
      </p>

      {/* Styles for tabular numbers */}
      <style jsx global>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
