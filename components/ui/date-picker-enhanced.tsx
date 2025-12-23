'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerEnhancedProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DatePickerEnhanced({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disabled = false,
  className,
  id,
  minDate,
  maxDate,
  showClearButton = true,
}: DatePickerEnhancedProps) {
  // Función helper para convertir string yyyy-MM-dd a Date usando zona horaria local
  const parseDateValue = React.useCallback((val: Date | string | undefined): Date | undefined => {
    if (!val) return undefined
    
    if (val instanceof Date) {
      return val
    }
    
    // Si es string en formato yyyy-MM-dd, crear Date usando zona horaria local
    if (typeof val === 'string') {
      const dateMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch.map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date(val)
    }
    
    return undefined
  }, [])

  const [open, setOpen] = React.useState(false)
  const parsedValue = React.useMemo(() => parseDateValue(value), [value, parseDateValue])

  const handleSelect = React.useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange?.(selectedDate)
      // Cerrar después de seleccionar con un pequeño delay para mejor UX
      setTimeout(() => {
        setOpen(false)
      }, 100)
    } else {
      onChange?.(undefined)
    }
  }, [onChange])

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onChange?.(undefined)
    setOpen(false)
  }, [onChange])

  // Función para deshabilitar fechas
  const isDateDisabled = React.useCallback((date: Date): boolean => {
    if (disabled) return true
    
    // Normalizar fechas para comparación (solo día, sin hora)
    const normalizeDate = (d: Date): Date => {
      const normalized = new Date(d)
      normalized.setHours(0, 0, 0, 0)
      return normalized
    }
    
    const normalizedDate = normalizeDate(date)
    
    if (minDate) {
      const normalizedMin = normalizeDate(minDate)
      if (normalizedDate < normalizedMin) return true
    }
    
    if (maxDate) {
      const normalizedMax = normalizeDate(maxDate)
      if (normalizedDate > normalizedMax) return true
    }
    
    return false
  }, [disabled, minDate, maxDate])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal relative group',
            !parsedValue && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          disabled={disabled}
          type="button"
          onClick={(e) => {
            if (!disabled) {
              e.preventDefault()
              setOpen(true)
            }
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {parsedValue ? (
              format(parsedValue, 'dd/MM/yyyy', { locale: es })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          {showClearButton && parsedValue && !disabled && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleClear}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Permitir cerrar al hacer click fuera
        }}
      >
        <Calendar
          mode="single"
          selected={parsedValue}
          onSelect={handleSelect}
          initialFocus
          locale={es}
          defaultMonth={parsedValue || new Date()}
          disabled={isDateDisabled}
          className="rounded-md border-0"
        />
      </PopoverContent>
    </Popover>
  )
}

