"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Image as ImageIcon, FileText, Receipt } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ComprobanteUploadProps {
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
}

export function ComprobanteUpload({ 
  value, 
  onChange, 
  onUpload, 
  disabled = false, 
  className 
}: ComprobanteUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Función para validar si la imagen es un comprobante de pago (validación más permisiva)
  const validateComprobante = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        // Limpiar URL después de cargar para evitar memory leaks
        URL.revokeObjectURL(objectUrl)
        
        const width = img.width
        const height = img.height
        const aspectRatio = width / height
        
        // Validación básica de dimensiones (más permisiva)
        // Solo rechazar si es extremadamente pequeña (menos de 100px en ambas dimensiones)
        if (width < 100 && height < 100) {
          resolve({
            isValid: false,
            error: "La imagen es demasiado pequeña. Por favor, sube una imagen de al menos 100px de ancho o alto."
          })
          return
        }
        
        // Validación de proporción de aspecto (más permisiva)
        // Aceptar un rango más amplio: desde muy vertical (0.2) hasta muy horizontal (5.0)
        // Esto cubre la mayoría de comprobantes (verticales, horizontales, cuadrados)
        if (aspectRatio < 0.2 || aspectRatio > 5.0) {
          resolve({
            isValid: false,
            error: "La proporción de la imagen es inusual. Por favor, verifica que sea una captura del comprobante completo."
          })
          return
        }
        
        // Si pasa las validaciones básicas, se acepta
        resolve({ isValid: true })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({
          isValid: false,
          error: "No se pudo cargar la imagen. Por favor, verifica que sea un archivo de imagen válido (JPG, JPEG, PNG, WEBP, GIF)."
        })
      }
      
      img.src = objectUrl
    })
  }

  const handleFileChange = async (file: File) => {
    // Validate file type - solo imágenes (incluyendo variaciones de JPEG)
    const allowedTypes = [
      "image/jpeg", 
      "image/jpg", // Algunos navegadores usan image/jpg
      "image/png", 
      "image/webp", 
      "image/gif"
    ]
    
    // También validar por extensión de archivo como respaldo
    const fileName = file.name.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setError("Solo se permiten imágenes de comprobantes. Formatos: JPG, JPEG, PNG, WEBP o GIF")
      return
    }
    
    // Normalizar el tipo MIME si es necesario
    if (file.type === "image/jpg") {
      // Algunos navegadores pueden reportar image/jpg en lugar de image/jpeg
      Object.defineProperty(file, 'type', { value: 'image/jpeg', writable: false })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El comprobante no debe superar los 5MB. Por favor, comprime la imagen.")
      return
    }

    // Validar tamaño mínimo (evitar archivos corruptos o muy pequeños)
    if (file.size < 1024) { // Menos de 1KB probablemente no es una imagen válida
      setError("El archivo parece estar vacío o corrupto. Por favor, verifica el comprobante.")
      return
    }

    // Validar que sea un comprobante de pago (validación básica y permisiva)
    setError(null)
    setIsUploading(true)
    
    try {
      const validation = await validateComprobante(file)
      if (!validation.isValid) {
        setError(validation.error || "La imagen no cumple con los requisitos básicos. Por favor, verifica que sea un comprobante de pago.")
        setIsUploading(false)
        return
      }
    } catch (err) {
      console.error("Error validando comprobante:", err)
      // Si hay error en la validación, mostrar advertencia pero permitir continuar
      console.warn("Advertencia: No se pudo validar completamente la imagen, pero se permitirá la subida.")
      // No bloquear la subida si hay error en la validación
    }

    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      setError("Error al subir el comprobante. Por favor, intenta de nuevo.")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    // Validar que sea una imagen
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    // Verificar que sea una imagen antes de procesar (por tipo MIME o extensión)
    const fileName = file.name.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!file.type.startsWith('image/') && !hasValidExtension) {
      setError("Por favor, arrastra solo imágenes de comprobantes (JPG, JPEG, PNG, WEBP, GIF)")
      return
    }
    
    await handleFileChange(file)
  }

  const handleRemove = () => {
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        id="comprobante-upload"
      />

      {value ? (
        <div className="relative w-full rounded-lg overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-muted/30">
          <div className="relative w-full h-64">
            <Image 
              src={value} 
              alt="Comprobante de pago" 
              fill 
              className="object-contain" 
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20">
            <Receipt className="h-3 w-3" />
            <span className="font-medium">Comprobante de pago cargado</span>
          </div>
        </div>
      ) : (
        <label
          htmlFor="comprobante-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-all",
            isDragging 
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" 
              : "border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/30 dark:hover:bg-amber-950/10",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-3" />
              <span className="text-sm text-muted-foreground">Subiendo comprobante...</span>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 mb-3 shadow-lg">
                {isDragging ? (
                  <Receipt className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                ) : (
                  <div className="relative">
                    <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                      <ImageIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold">
                  {isDragging ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Suelta el comprobante aquí</span>
                  ) : (
                    "Arrastra el comprobante de pago aquí"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDragging ? (
                    "Suelta para subir el comprobante"
                  ) : (
                    "o haz clic para seleccionar desde tu dispositivo"
                  )}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Solo comprobantes de pago
                  </p>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Captura del comprobante completo con texto visible • JPG, JPEG, PNG, WEBP, GIF • Máx. 5MB
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 font-medium pt-1">
                  ⚠️ No se aceptan fotos de personas o imágenes sin texto
                </p>
              </div>
            </>
          )}
        </label>
      )}

      {error && (
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

