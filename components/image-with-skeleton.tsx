'use client'

import { useState } from 'react'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithSkeleton({ src, alt, className = '' }: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />
    </div>
  )
}
