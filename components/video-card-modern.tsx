'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GaleriaImagen } from '@/lib/api/galeria'

interface VideoCardModernProps {
  video: GaleriaImagen
  thumbnailUrl: string
  onPlay: () => void
  isFullPlaying: boolean
  className?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoCardModern({ 
  video, 
  thumbnailUrl, 
  onPlay, 
  isFullPlaying,
  className 
}: VideoCardModernProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isHovering, setIsHovering] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // Calcular duración del clip si hay metadata
  const clipDuration = video.videoEndTime && video.videoStartTime 
    ? video.videoEndTime - video.videoStartTime 
    : duration

  // Handle mouse enter - start preview after delay
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    setShowControls(true)
    
    // Start preview after 500ms delay
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !isFullPlaying) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
        setIsPreviewPlaying(true)
      }
    }, 500)
  }, [isFullPlaying])

  // Handle mouse leave - stop preview
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setShowControls(false)
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    if (videoRef.current && isPreviewPlaying) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPreviewPlaying(false)
      setProgress(0)
    }
  }, [isPreviewPlaying])

  // Update progress during playback
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
      
      // Loop preview after 10 seconds
      if (current >= 10) {
        videoRef.current.currentTime = 0
      }
    }
  }, [])

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoaded(true)
    }
  }, [])

  // Toggle mute
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      videoRef.current.currentTime = percentage * videoRef.current.duration
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Stop preview if full play starts
  useEffect(() => {
    if (isFullPlaying && videoRef.current) {
      videoRef.current.pause()
      setIsPreviewPlaying(false)
    }
  }, [isFullPlaying])

  return (
    <div 
      className={cn(
        "relative group cursor-pointer",
        "transform transition-all duration-500 ease-out",
        isHovering && "scale-[1.02] z-10",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onPlay}
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute -inset-2 rounded-2xl transition-all duration-500",
        "bg-gradient-to-r from-sky-500/0 via-blue-500/0 to-emerald-500/0",
        isHovering && "from-sky-500/30 via-blue-500/30 to-emerald-500/30 blur-xl"
      )} />
      
      {/* Card container */}
      <div className={cn(
        "relative aspect-video overflow-hidden rounded-2xl",
        "bg-[#0d1f35] border transition-all duration-500",
        isHovering ? "border-sky-500/50 shadow-2xl shadow-sky-500/20" : "border-white/10"
      )}>
        {/* Video element for preview */}
        <video
          ref={videoRef}
          src={video.imagenUrl}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isPreviewPlaying ? "opacity-100" : "opacity-0"
          )}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          muted={isMuted}
          playsInline
          preload="metadata"
        />

        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={video.titulo}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-700",
            isHovering && "scale-110",
            isPreviewPlaying && "opacity-0"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg'
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-80" />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-sky-900/20 to-transparent opacity-0 transition-opacity duration-500",
          isHovering && "opacity-100"
        )} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Duration badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            "bg-black/60 backdrop-blur-md text-white text-xs font-medium",
            "transform transition-all duration-300",
            isHovering ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          )}>
            <Clock className="w-3 h-3" />
            {formatDuration(clipDuration || duration)}
          </div>

          {/* Live preview indicator */}
          {isPreviewPlaying && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-xs font-medium animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Preview
            </div>
          )}
        </div>

        {/* Center play button */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-500",
          isPreviewPlaying && "opacity-0 pointer-events-none"
        )}>
          <div className="relative">
            {/* Animated rings */}
            <div className={cn(
              "absolute -inset-4 rounded-full",
              "bg-gradient-to-r from-sky-500/20 to-blue-500/20",
              "transition-all duration-500",
              isHovering ? "scale-150 opacity-100 animate-ping" : "scale-100 opacity-0"
            )} />
            <div className={cn(
              "absolute -inset-2 rounded-full",
              "bg-gradient-to-r from-sky-500/30 to-blue-500/30",
              "transition-all duration-300",
              isHovering && "animate-pulse"
            )} />
            
            {/* Play button */}
            <div className={cn(
              "relative w-16 h-16 rounded-full",
              "bg-gradient-to-r from-sky-500 to-blue-500",
              "flex items-center justify-center",
              "shadow-2xl shadow-sky-500/50",
              "transform transition-all duration-300",
              isHovering ? "scale-110" : "scale-100"
            )}>
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Progress bar */}
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className={cn(
              "relative h-1 mx-3 mb-2 rounded-full overflow-hidden cursor-pointer",
              "bg-white/20 backdrop-blur-sm",
              "transform transition-all duration-300",
              showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            {/* Buffer indicator */}
            <div className="absolute inset-0 bg-white/10" style={{ width: '100%' }} />
            
            {/* Progress */}
            <div 
              className="absolute h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            
            {/* Progress handle */}
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full",
                "bg-white shadow-lg",
                "transform transition-all duration-200",
                isHovering ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Info and controls */}
          <div className="px-4 pb-4 flex items-end justify-between gap-4">
            {/* Title and description */}
            <div className={cn(
              "flex-1 min-w-0 transform transition-all duration-300",
              isHovering ? "translate-y-0" : "translate-y-2"
            )}>
              <h4 className="text-white font-semibold text-lg truncate">
                {video.titulo}
              </h4>
              {video.descripcion && (
                <p className={cn(
                  "text-white/60 text-sm mt-1 line-clamp-2 transition-all duration-300",
                  isHovering ? "opacity-100 max-h-10" : "opacity-0 max-h-0"
                )}>
                  {video.descripcion}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className={cn(
              "flex items-center gap-2 transition-all duration-300",
              showControls ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            )}>
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-200",
                  "bg-white/10 hover:bg-white/20 backdrop-blur-md",
                  "text-white hover:scale-110"
                )}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Fullscreen / Play full */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay()
                }}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-200",
                  "bg-gradient-to-r from-sky-500 to-blue-500",
                  "text-white hover:scale-110 shadow-lg shadow-sky-500/30"
                )}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hover border animation */}
        <div className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "border-2 border-transparent transition-all duration-500",
          isHovering && "border-sky-500/50"
        )}>
          {/* Animated border gradient */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500",
            isHovering && "opacity-100"
          )}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-sky-500 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
          </div>
        </div>

        {/* Loading shimmer */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}
      </div>
    </div>
  )
}
