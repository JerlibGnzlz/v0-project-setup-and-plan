'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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

// Componente para animar cada dígito individual
function AnimatedDigit({ value, prevValue }: { value: string; prevValue: string }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (value !== prevValue) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <span className="relative inline-block overflow-hidden h-[1.2em]">
      <span
        className={cn(
          "inline-block transition-all duration-300 ease-out",
          isAnimating && "opacity-0 -translate-y-full"
        )}
      >
        {displayValue}
      </span>
      {isAnimating && (
        <span
          className="absolute inset-0 inline-block animate-slide-in"
        >
          {value}
        </span>
      )}
    </span>
  )
}

// Componente para mostrar un número con animación de dígitos
function AnimatedNumber({ value }: { value: number }) {
  const [prevValue, setPrevValue] = useState(value)
  const valueStr = value.toString().padStart(2, '0')
  const prevValueStr = prevValue.toString().padStart(2, '0')

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="flex justify-center font-mono">
      {valueStr.split('').map((digit, index) => (
        <AnimatedDigit
          key={index}
          value={digit}
          prevValue={prevValueStr[index]}
        />
      ))}
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

  const timeUnits = [
    { key: 'days', value: timeLeft.days, label: 'Días' },
    { key: 'hours', value: timeLeft.hours, label: 'Horas' },
    { key: 'minutes', value: timeLeft.minutes, label: 'Minutos' },
    { key: 'seconds', value: timeLeft.seconds, label: 'Segundos' },
  ]

  if (!mounted) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {timeUnits.map(({ key, label }) => (
            <Card key={key} className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2 tabular-nums">
                  00
                </div>
                <div className="text-xs md:text-sm text-white/60 font-medium">
                  {label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {timeUnits.map(({ key, value, label }) => (
          <Card
            key={key}
            className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <CardContent className="p-3 md:p-4">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2 tabular-nums tracking-tight">
                <AnimatedNumber value={value} />
              </div>
              <div className="text-xs md:text-sm text-white/60 font-medium">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estilos para la animación */}
      <style jsx global>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
