'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  // Función helper para convertir string yyyy-MM-dd a Date usando zona horaria local
  const parseDateValue = (val: Date | string | undefined): Date | undefined => {
    if (!val) return undefined
    
    if (val instanceof Date) {
      return val
    }
    
    // Si es string en formato yyyy-MM-dd, crear Date usando zona horaria local
    if (typeof val === 'string') {
      // Verificar si es formato yyyy-MM-dd
      const dateMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch.map(Number)
        return new Date(year, month - 1, day)
      }
      // Si no es formato yyyy-MM-dd, usar new Date normal
      return new Date(val)
    }
    
    return undefined
  }

  const [date, setDate] = React.useState<Date | undefined>(parseDateValue(value))
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setDate(parseDateValue(value))
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
    // Cerrar el popover después de seleccionar
    setOpen(false)
  }

  const parsedValue = parseDateValue(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !parsedValue && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {parsedValue ? (
            format(parsedValue, 'dd/MM/yyyy', { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Calendar
          mode="single"
          selected={parsedValue}
          onSelect={handleSelect}
          initialFocus
          locale={es}
          defaultMonth={parsedValue || new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}

