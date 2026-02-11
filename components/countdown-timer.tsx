'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo, useId } from 'react'
import { cn } from '@/lib/utils'
import { dateOnlyToMidnightLocal } from '@/lib/utils/event-date'

/**
 * La cuenta regresiva usa solo YYYY-MM-DD y medianoche local (dateOnlyToMidnightLocal).
 * Los números (días, horas, etc.) vienen de ese cálculo; el CSS solo afecta la presentación visual.
 */

interface CountdownTimerProps {
  /** Día del evento en YYYY-MM-DD. Única fuente para el cálculo (medianoche en hora local). Funciona correctamente todos los meses. */
  targetDateOnly: string
  title?: string
  /** Mensaje cuando la cuenta regresiva llegó a cero (opcional) */
  messageOnReachZero?: string
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
    <svg width={size} height={size} className="absolute inset-0 m-auto -rotate-90 transform">
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
    <span
      className={cn(
        'inline-block transition-all duration-150',
        isAnimating && 'scale-110 opacity-80'
      )}
    >
      {currentDigit}
    </span>
  )
}

// Circular time card component (soporta 2 o 3+ dígitos, ej. días 145)
function CircularTimeCard({
  value,
  label,
  progress,
  gradientId,
  gradientColors,
  size = 120,
  minDigits = 2,
}: {
  value: number
  label: string
  progress: number
  gradientId: string
  gradientColors: { start: string; end: string }
  size?: number
  /** Mínimo de dígitos (2 = 01, 02; 0 = sin rellenar para días 9, 15, 145) */
  minDigits?: number
}) {
  const [prevValue, setPrevValue] = useState(value)
  const valueStr =
    minDigits > 0 ? value.toString().padStart(minDigits, '0') : value.toString()
  const prevValueStr =
    minDigits > 0 ? prevValue.toString().padStart(minDigits, '0') : prevValue.toString()

  useEffect(() => {
    const timer = setTimeout(() => setPrevValue(value), 200)
    return () => clearTimeout(timer)
  }, [value])

  const digits = valueStr.split('')
  const prevDigits = prevValueStr.split('')

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 opacity-20 group-hover:opacity-40"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.start}, ${gradientColors.end})`,
          transform: 'scale(0.8)',
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
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Number: uno o más dígitos según el valor (15 → 2, 145 → 3) */}
          <div className="font-bold tabular-nums leading-none text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="inline-flex items-center justify-center min-w-0">
              {digits.map((d, i) => (
                <AnimatedDigit
                  key={i}
                  digit={d}
                  prevDigit={prevDigits[i] ?? '0'}
                />
              ))}
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

export function CountdownTimer({
  targetDateOnly,
  title = 'Próximo Evento',
  messageOnReachZero = '¡Hoy es el gran día!',
}: CountdownTimerProps) {
  const id = useId()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)
  const [hasReachedZero, setHasReachedZero] = useState(false)

  const dateOnlyNormalized = typeof targetDateOnly === 'string' ? targetDateOnly.trim() : ''
  const targetTime =
    dateOnlyNormalized.length >= 10 ? dateOnlyToMidnightLocal(dateOnlyNormalized) ?? 0 : 0
  const hasValidTarget = targetTime > 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setHasReachedZero(false)
  }, [targetTime])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cálculo: "días" = días naturales (calendario) hasta el evento. Ej: 11 feb 2026 → 11 feb 2027 = 365 días + h/m/s.
  useLayoutEffect(() => {
    if (!hasValidTarget) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const calculateTimeLeft = (): void => {
      const now = Date.now()
      const difference = targetTime - now

      if (difference < 1000) {
        setHasReachedZero(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayStartMs = todayStart.getTime()
      const daysCalendar = Math.max(
        0,
        Math.round((targetTime - todayStartMs) / MS_PER_DAY)
      )
      const remainderMs = difference - Math.max(0, daysCalendar - 1) * MS_PER_DAY
      const remainder = Math.max(0, remainderMs)
      const hours = Math.floor(remainder / (1000 * 60 * 60)) % 24
      const minutes = Math.floor((remainder % (1000 * 60 * 60)) / (1000 * 60)) % 60
      const seconds = Math.floor((remainder % (1000 * 60)) / 1000) % 60

      setTimeLeft({
        days: daysCalendar,
        hours,
        minutes,
        seconds,
      })
    }

    calculateTimeLeft()
    intervalRef.current = setInterval(calculateTimeLeft, 1000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetTime, hasValidTarget])

  // Escala del anillo de días: hasta 365 para muchos días (ej. feb–jul ≈ 145 días)
  const maxDaysForProgress = 365
  const timeUnits = useMemo(
    () => [
      {
        key: 'days',
        value: timeLeft.days,
        label: 'Días',
        progress: Math.min((timeLeft.days / maxDaysForProgress) * 100, 100),
        gradientId: `days-${id}`.replace(/:/g, ''),
        gradientColors: { start: '#38bdf8', end: '#0ea5e9' },
        minDigits: 0 as number,
      },
      {
        key: 'hours',
        value: timeLeft.hours,
        label: 'Horas',
        progress: (timeLeft.hours / 24) * 100,
        gradientId: `hours-${id}`.replace(/:/g, ''),
        gradientColors: { start: '#34d399', end: '#10b981' },
        minDigits: 2,
      },
      {
        key: 'minutes',
        value: timeLeft.minutes,
        label: 'Minutos',
        progress: (timeLeft.minutes / 60) * 100,
        gradientId: `minutes-${id}`.replace(/:/g, ''),
        gradientColors: { start: '#fbbf24', end: '#f59e0b' },
        minDigits: 2,
      },
      {
        key: 'seconds',
        value: timeLeft.seconds,
        label: 'Segundos',
        progress: (timeLeft.seconds / 60) * 100,
        gradientId: `seconds-${id}`.replace(/:/g, ''),
        gradientColors: { start: '#f97316', end: '#ea580c' },
        minDigits: 2,
      },
    ],
    [timeLeft, id]
  )

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
          {timeUnits.map(({ key, label, gradientId, gradientColors, minDigits }) => (
            <CircularTimeCard
              key={key}
              value={0}
              label={label}
              progress={0}
              gradientId={gradientId}
              gradientColors={gradientColors}
              size={circleSize}
              minDigits={minDigits}
            />
          ))}
        </div>
      </div>
    )
  }

  if (hasReachedZero) {
    return (
      <div className="text-center py-4 sm:py-6 md:py-8">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white/90">{title}</h3>
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 px-6 py-8">
          <p className="text-lg sm:text-xl font-semibold text-amber-200">{messageOnReachZero}</p>
          <p className="mt-2 text-sm text-white/60">¡Gracias por ser parte!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-4 sm:py-6 md:py-8" role="timer" aria-live="polite">
      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 md:mb-10 text-white/90">
        {title}
      </h3>

      {/* Countdown circles */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 flex-wrap">
        {timeUnits.map(
          ({ key, value, label, progress, gradientId, gradientColors, minDigits }) => (
            <CircularTimeCard
              key={key}
              value={value}
              label={label}
              progress={progress}
              gradientId={gradientId}
              gradientColors={gradientColors}
              size={circleSize}
              minDigits={minDigits}
            />
          )
        )}
      </div>

      {/* Message */}
      <p className="mt-6 sm:mt-8 md:mt-10 text-xs sm:text-sm text-white/40">¡No te lo pierdas!</p>

      {/* Styles for tabular numbers */}
      <style jsx global>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
