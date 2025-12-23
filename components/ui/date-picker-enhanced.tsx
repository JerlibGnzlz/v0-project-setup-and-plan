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
  const parseDateValue = (val: Date | string | undefined): Date | undefined => {
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
  }

  const [open, setOpen] = React.useState(false)
  const parsedValue = parseDateValue(value)

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange?.(selectedDate)
    // Cerrar después de seleccionar
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

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
              className="ml-2 h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={parsedValue}
          onSelect={handleSelect}
          initialFocus
          locale={es}
          defaultMonth={parsedValue || new Date()}
          disabled={(date) => {
            if (disabled) return true
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          className="rounded-md border-0"
        />
      </PopoverContent>
    </Popover>
  )
}

