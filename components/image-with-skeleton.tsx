'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithSkeleton({ src, alt, className = '' }: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Handle localhost URLs in production - show placeholder
  const isLocalUrl = src?.includes('localhost:')
  const effectiveSrc = isLocalUrl ? '/placeholder.svg' : (src || '/placeholder.svg')

  if (hasError || isLocalUrl) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted/50">
        <div className="text-center text-muted-foreground p-4">
          <ImageOff className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Imagen no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        loading="lazy"
      />
    </div>
  )
}
