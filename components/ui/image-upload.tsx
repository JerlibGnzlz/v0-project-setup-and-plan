'use client'

import type React from 'react'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, FileImage } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
  label?: string
  maxSize?: number // en MB
  previewSize?: 'sm' | 'md' | 'lg'
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  label = 'Subir imagen',
  maxSize = 5,
  previewSize = 'md',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  const validateFile = (file: File): string | null => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG, WEBP o GIF'
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      return `La imagen no debe superar los ${maxSize}MB`
    }

    return null
  }

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Crear preview local
      const reader = new FileReader()
      reader.onload = e => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      setError(null)
      setIsUploading(true)

      try {
        const url = await onUpload(file)
        onChange(url)
        setPreview(null) // Limpiar preview local después de subir
      } catch (err) {
        setError('Error al subir la imagen. Intenta de nuevo.')
        console.error('Upload error:', err)
        setPreview(null)
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload, onChange, maxSize]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const displayImage = preview || value

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        id="image-upload"
      />

      {displayImage ? (
        <div className={cn('relative rounded-lg overflow-hidden border', sizeClasses[previewSize])}>
          <Image
            src={displayImage || '/placeholder.svg'}
            alt="Preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all',
            sizeClasses[previewSize],
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground text-center px-2">
                Subiendo...
              </span>
            </>
          ) : (
            <>
              {isDragging ? (
                <>
                  <FileImage className="h-8 w-8 text-primary mb-2" />
                  <span className="text-xs text-primary font-medium text-center px-2">
                    Suelta aquí
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground text-center px-2">{label}</span>
                  <span className="text-xs text-muted-foreground/70 text-center px-2 mt-1">
                    o arrastra y suelta
                  </span>
                </>
              )}
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
