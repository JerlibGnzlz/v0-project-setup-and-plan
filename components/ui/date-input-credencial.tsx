'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const DDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
const YEAR_MIN = 1920
const YEAR_MAX = 2030

function toDisplay(isoOrDate: string | Date | undefined): string {
  if (!isoOrDate) return ''
  let y: number, m: number, d: number
  if (typeof isoOrDate === 'string') {
    const s = isoOrDate.trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return ''
    ;[y, m, d] = s.split('-').map(Number)
  } else {
    y = isoOrDate.getFullYear()
    m = isoOrDate.getMonth() + 1
    d = isoOrDate.getDate()
  }
  const day = String(d).padStart(2, '0')
  const month = String(m).padStart(2, '0')
  return `${day}/${month}/${y}`
}

function parseDisplay(display: string): Date | undefined {
  const t = display.trim()
  const match = t.match(DDMMYYYY)
  if (!match) return undefined
  const [, d, m, y] = match.map(Number)
  if (y < YEAR_MIN || y > YEAR_MAX) return undefined
  if (m < 1 || m > 12) return undefined
  const lastDay = new Date(y, m, 0).getDate()
  if (d < 1 || d > lastDay) return undefined
  return new Date(y, m - 1, d)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Aplica máscara dd/mm/yyyy: solo dígitos y barras, auto-inserción de barras */
function applyMask(prev: string, next: string): string {
  const digits = next.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}

export interface DateInputCredencialProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  minDate?: Date
  maxDate?: Date
}

export function DateInputCredencial({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  className,
  id,
  minDate,
  maxDate,
}: DateInputCredencialProps) {
  const displayFromValue = toDisplay(value)
  const [display, setDisplay] = React.useState(displayFromValue)
  const [lastValid, setLastValid] = React.useState(displayFromValue)

  // Sincronizar display cuando el value externo cambia (ej. reset del formulario)
  React.useEffect(() => {
    const d = toDisplay(value)
    setDisplay(d)
    setLastValid(d)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    const masked = applyMask(display, next)
    setDisplay(masked)
    if (masked.length === 10) {
      const date = parseDisplay(masked)
      if (date) {
        setLastValid(masked)
        onChange?.(date)
      }
    }
  }

  const handleBlur = () => {
    const date = parseDisplay(display)
    if (date) {
      setLastValid(display)
      const iso = toISO(date)
      setDisplay(toDisplay(iso))
      onChange?.(date)
    } else {
      if (display.trim() === '') {
        onChange?.(undefined)
        setLastValid('')
      } else {
        setDisplay(lastValid)
      }
    }
  }

  const years = React.useMemo(() => {
    const list: number[] = []
    for (let y = YEAR_MAX; y >= YEAR_MIN; y--) list.push(y)
    return list
  }, [])

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value)
    if (Number.isNaN(year)) return
    let d = 1
    let m = 1
    const parsed = parseDisplay(display)
    if (parsed) {
      d = parsed.getDate()
      m = parsed.getMonth() + 1
    }
    const date = new Date(year, m - 1, d)
    const iso = toISO(date)
    setDisplay(toDisplay(iso))
    setLastValid(toDisplay(iso))
    onChange?.(date)
  }

  const currentYear = display.length === 10 ? parseDisplay(display)?.getFullYear() ?? null : null

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={10}
          className={cn(
            'pl-10 pr-2 font-mono',
            !display && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          aria-describedby={id ? `${id}-hint` : undefined}
        />
      </div>
      <select
        aria-label="Año"
        value={currentYear !== null && currentYear !== undefined ? String(currentYear) : ''}
        onChange={handleYearSelect}
        disabled={disabled}
        className={cn(
          'h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'min-w-[80px]'
        )}
      >
        <option value="">Año</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
