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

// Circular progress ring component
function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 4,
  gradientId,
  gradientColors,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  gradientId: string
  gradientColors: { start: string; end: string }
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
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-linear"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientColors.start} />
          <stop offset="100%" stopColor={gradientColors.end} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Animated digit
function AnimatedDigit({ digit, prevDigit }: { digit: string; prevDigit: string }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentDigit, setCurrentDigit] = useState(digit)

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setCurrentDigit(digit)
        setIsAnimating(false)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setCurrentDigit(digit)
    }
  }, [digit, prevDigit])

  return (
    <span className={cn(
      "inline-block transition-all duration-150",
      isAnimating && "scale-110 opacity-80"
    )}>
      {currentDigit}
    </span>
  )
}

// Circular time card component
function CircularTimeCard({
  value,
  label,
  progress,
  gradientId,
  gradientColors,
  size = 120,
}: {
  value: number
  label: string
  progress: number
  gradientId: string
  gradientColors: { start: string; end: string }
  size?: number
}) {
  const [prevValue, setPrevValue] = useState(value)
  const valueStr = value.toString().padStart(2, '0')
  const prevValueStr = prevValue.toString().padStart(2, '0')

  useEffect(() => {
    const timer = setTimeout(() => setPrevValue(value), 200)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 opacity-20 group-hover:opacity-40"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.start}, ${gradientColors.end})`,
          transform: 'scale(0.8)'
        }}
      />

      {/* Circle container */}
      <div
        className="relative flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Progress ring */}
        <CircularProgress
          progress={progress}
          size={size}
          strokeWidth={size > 100 ? 5 : 3}
          gradientId={gradientId}
          gradientColors={gradientColors}
        />

        {/* Inner circle background */}
        <div
          className="absolute rounded-full bg-slate-800/90 backdrop-blur-sm"
          style={{
            width: size - 20,
            height: size - 20,
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Number */}
          <div className="font-bold tabular-nums leading-none text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="inline-flex">
              <AnimatedDigit digit={valueStr[0]} prevDigit={prevValueStr[0]} />
              <AnimatedDigit digit={valueStr[1]} prevDigit={prevValueStr[1]} />
            </span>
          </div>

          {/* Label */}
          <div className="mt-1 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-white/60 font-semibold uppercase tracking-widest">
            {label}
          </div>
        </div>
      </div>
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

  // Calculate progress for each unit (inverted: 100% when full, 0% when empty)
  const daysInYear = 365
  const maxDays = 30 // Show progress based on 30 days max

  const timeUnits = useMemo(() => [
    {
      key: 'days',
      value: timeLeft.days,
      label: 'Días',
      progress: Math.min((timeLeft.days / maxDays) * 100, 100),
      gradientId: 'days-gradient',
      gradientColors: { start: '#38bdf8', end: '#0ea5e9' } // Sky
    },
    {
      key: 'hours',
      value: timeLeft.hours,
      label: 'Horas',
      progress: (timeLeft.hours / 24) * 100,
      gradientId: 'hours-gradient',
      gradientColors: { start: '#34d399', end: '#10b981' } // Emerald
    },
    {
      key: 'minutes',
      value: timeLeft.minutes,
      label: 'Minutos',
      progress: (timeLeft.minutes / 60) * 100,
      gradientId: 'minutes-gradient',
      gradientColors: { start: '#fbbf24', end: '#f59e0b' } // Amber
    },
    {
      key: 'seconds',
      value: timeLeft.seconds,
      label: 'Segundos',
      progress: (timeLeft.seconds / 60) * 100,
      gradientId: 'seconds-gradient',
      gradientColors: { start: '#f97316', end: '#ea580c' } // Orange (accent)
    },
  ], [timeLeft])

  // Responsive size based on screen
  const getCircleSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 400) return 70
      if (window.innerWidth < 640) return 85
      if (window.innerWidth < 768) return 100
      if (window.innerWidth < 1024) return 120
      return 140
    }
    return 120
  }

  const [circleSize, setCircleSize] = useState(120)

  useEffect(() => {
    const updateSize = () => setCircleSize(getCircleSize())
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Loading state
  if (!mounted) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-8 text-white/90">{title}</h3>
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {timeUnits.map(({ key, label, gradientId, gradientColors }) => (
            <CircularTimeCard
              key={key}
              value={0}
              label={label}
              progress={0}
              gradientId={gradientId}
              gradientColors={gradientColors}
              size={circleSize}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-4 sm:py-6 md:py-8">
      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 md:mb-10 text-white/90">
        {title}
      </h3>

      {/* Countdown circles */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 flex-wrap">
        {timeUnits.map(({ key, value, label, progress, gradientId, gradientColors }) => (
          <CircularTimeCard
            key={key}
            value={value}
            label={label}
            progress={progress}
            gradientId={gradientId}
            gradientColors={gradientColors}
            size={circleSize}
          />
        ))}
      </div>

      {/* Message */}
      <p className="mt-6 sm:mt-8 md:mt-10 text-xs sm:text-sm text-white/40">
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
