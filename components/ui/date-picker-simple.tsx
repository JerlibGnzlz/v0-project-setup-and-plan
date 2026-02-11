'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface DatePickerSimpleProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePickerSimple({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disabled = false,
  className,
  id,
  minDate,
  maxDate,
}: DatePickerSimpleProps) {
  // Función helper para convertir Date a string yyyy-MM-dd
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función helper para convertir string yyyy-MM-dd a Date usando zona horaria local
  const parseStringToDate = (str: string): Date | undefined => {
    if (!str) return undefined
    const [year, month, day] = str.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined
    return new Date(year, month - 1, day)
  }

  // Valor del input: siempre YYYY-MM-DD para que todos los meses se sincronicen con la cuenta regresiva.
  // Si viene string tipo ISO, usar solo los primeros 10 caracteres (nunca new Date(str) para el día).
  const inputValue = React.useMemo(() => {
    if (!value) return ''
    if (value instanceof Date) {
      return formatDateToString(value)
    }
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed.slice(0, 10))) {
        return trimmed.slice(0, 10)
      }
    }
    return ''
  }, [value])

  // Calcular min y max para el input
  const minDateString = minDate ? formatDateToString(normalizeDate(minDate)) : undefined
  const maxDateString = maxDate ? formatDateToString(normalizeDate(maxDate)) : undefined

  // Normalizar fecha (solo día, sin hora)
  function normalizeDate(date: Date): Date {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue) {
      const date = parseStringToDate(newValue)
      if (date) {
        onChange?.(date)
      }
    } else {
      onChange?.(undefined)
    }
  }

  return (
    <div className="relative">
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        id={id}
        type="date"
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        min={minDateString}
        max={maxDateString}
        placeholder={placeholder}
        className={cn(
          'pl-10',
          !inputValue && 'text-muted-foreground',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      />
    </div>
  )
}

