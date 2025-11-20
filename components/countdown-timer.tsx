'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

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

export function CountdownTimer({ targetDate, title = 'Próximo Evento' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

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

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <Card key={unit} className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
            <CardContent className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {unit === 'days' ? 'Días' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
