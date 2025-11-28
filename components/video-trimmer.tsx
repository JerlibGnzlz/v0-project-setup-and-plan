'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Scissors, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoTrimmerProps {
  file?: File
  videoUrl?: string // Para editar videos existentes
  initialStartTime?: number
  initialEndTime?: number
  initialThumbnailTime?: number
  maxDuration?: number // Duración máxima permitida en segundos
  onTrimChange: (startTime: number, endTime: number) => void
  onThumbnailChange?: (thumbnailTime: number) => void
  className?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

export function VideoTrimmer({ 
  file, 
  videoUrl: externalVideoUrl,
  initialStartTime,
  initialEndTime,
  initialThumbnailTime,
  maxDuration = 120, // 2 minutos por defecto
  onTrimChange,
  onThumbnailChange,
  className 
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [videoUrl, setVideoUrl] = useState<string>(externalVideoUrl || '')
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Trim range
  const [startTime, setStartTime] = useState<number>(initialStartTime || 0)
  const [endTime, setEndTime] = useState<number>(initialEndTime || 0)
  
  // Thumbnail
  const [thumbnailTime, setThumbnailTime] = useState<number>(initialThumbnailTime || 0)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  
  // Preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Create video URL from file or use external URL
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    } else if (externalVideoUrl) {
      setVideoUrl(externalVideoUrl)
    }
  }, [file, externalVideoUrl])

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      
      // Use initial values or defaults
      const newEndTime = initialEndTime || Math.min(videoDuration, maxDuration)
      const newStartTime = initialStartTime || 0
      const newThumbnailTime = initialThumbnailTime || newStartTime
      
      setStartTime(newStartTime)
      setEndTime(newEndTime)
      setThumbnailTime(newThumbnailTime)
      setIsLoaded(true)
      
      onTrimChange(newStartTime, newEndTime)
      
      // Generate initial thumbnail
      setTimeout(() => captureThumbnail(newThumbnailTime), 100)
    }
  }, [maxDuration, onTrimChange, initialStartTime, initialEndTime, initialThumbnailTime])

  // Capture thumbnail at specific time
  const captureThumbnail = useCallback((time: number) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Set canvas size
        canvas.width = 320
        canvas.height = 180
        
        // Save current time
        const savedTime = video.currentTime
        
        // Seek to thumbnail time
        video.currentTime = time
        
        // Wait for seek to complete
        const handleSeeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          setThumbnailPreview(dataUrl)
          video.removeEventListener('seeked', handleSeeked)
          // Restore time if not playing
          if (!isPlaying) {
            video.currentTime = savedTime
          }
        }
        
        video.addEventListener('seeked', handleSeeked)
      }
    }
  }, [isPlaying])

  // Set current frame as thumbnail
  const setCurrentFrameAsThumbnail = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setThumbnailTime(time)
      captureThumbnail(time)
      onThumbnailChange?.(time)
    }
  }, [captureThumbnail, onThumbnailChange])

  // Update current time during playback
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      
      // If in preview mode and reached end time, pause and loop
      if (isPreviewMode && time >= endTime) {
        videoRef.current.currentTime = startTime
        if (isPlaying) {
          videoRef.current.play()
        }
      }
    }
  }, [endTime, startTime, isPreviewMode, isPlaying])

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // If in preview mode, start from startTime
        if (isPreviewMode && videoRef.current.currentTime < startTime) {
          videoRef.current.currentTime = startTime
        }
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying, isPreviewMode, startTime])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  // Handle trim range change
  const handleTrimChange = useCallback((values: number[]) => {
    const [start, end] = values
    setStartTime(start)
    setEndTime(end)
    onTrimChange(start, end)
    
    // Seek to start time to preview
    if (videoRef.current) {
      videoRef.current.currentTime = start
      setCurrentTime(start)
    }
  }, [onTrimChange])

  // Preview the selected clip
  const previewClip = useCallback(() => {
    if (videoRef.current) {
      setIsPreviewMode(true)
      videoRef.current.currentTime = startTime
      videoRef.current.play()
      setIsPlaying(true)
    }
  }, [startTime])

  // Reset to full video
  const resetTrim = useCallback(() => {
    setStartTime(0)
    setEndTime(Math.min(duration, maxDuration))
    setIsPreviewMode(false)
    onTrimChange(0, Math.min(duration, maxDuration))
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [duration, maxDuration, onTrimChange])

  // Click on progress bar to seek
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const seekTime = percentage * duration
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }, [duration])

  const clipDuration = endTime - startTime
  const isValidDuration = clipDuration <= maxDuration && clipDuration > 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden canvas for thumbnail capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Player */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Cargando video...
          </div>
        )}
        
        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Time display */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-2 right-2 p-2 rounded bg-black/70 text-white hover:bg-black/90 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Preview mode indicator */}
        {isPreviewMode && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-emerald-500/90 text-white text-xs font-medium flex items-center gap-1">
            <Scissors className="w-3 h-3" />
            Vista previa del clip
          </div>
        )}
      </div>

      {/* Progress Bar with Trim Markers */}
      <div className="space-y-2">
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden"
        >
          {/* Trim region highlight */}
          <div
            className="absolute h-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30"
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((endTime - startTime) / duration) * 100}%`,
            }}
          />
          
          {/* Current progress */}
          <div
            className="absolute h-full bg-white/50"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Current time indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
          />
        </div>
      </div>

      {/* Trim Range Slider */}
      {isLoaded && (
        <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Scissors className="w-4 h-4 text-emerald-400" />
              Recortar Video
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetTrim}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reiniciar
            </Button>
          </div>

          {/* Dual Range Slider */}
          <div className="pt-2">
            <Slider
              value={[startTime, endTime]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={handleTrimChange}
              className="w-full"
            />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 font-mono">
                Inicio: {formatTime(startTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-mono">
                Fin: {formatTime(endTime)}
              </span>
            </div>
          </div>

          {/* Clip Duration Info */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Duración del clip: <strong>{formatDuration(clipDuration)}</strong>
              </span>
            </div>
            
            <Badge 
              variant={isValidDuration ? "default" : "destructive"}
              className={cn(
                "flex items-center gap-1",
                isValidDuration 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
              )}
            >
              {isValidDuration ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Válido
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Máx. {formatDuration(maxDuration)}
                </>
              )}
            </Badge>
          </div>

          {/* Preview Button */}
          <Button
            type="button"
            variant="outline"
            onClick={previewClip}
            className="w-full mt-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Play className="w-4 h-4 mr-2" />
            Previsualizar Clip ({formatDuration(clipDuration)})
          </Button>
        </div>
      )}

      {/* Thumbnail Selector */}
      {isLoaded && onThumbnailChange && (
        <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              Portada del Video
            </Label>
            <span className="text-xs text-muted-foreground font-mono">
              {formatTime(thumbnailTime)}
            </span>
          </div>

          <div className="flex gap-4">
            {/* Thumbnail Preview */}
            <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
              {thumbnailPreview ? (
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white/30" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground">
                Navega al frame que deseas usar como portada y presiona el botón
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setCurrentFrameAsThumbnail}
                className="w-full border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                Usar Frame Actual
              </Button>
            </div>
          </div>

          {/* Thumbnail Time Slider */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">O selecciona un momento:</Label>
            <Slider
              value={[thumbnailTime]}
              min={startTime}
              max={endTime}
              step={0.1}
              onValueChange={([value]) => {
                setThumbnailTime(value)
                captureThumbnail(value)
                onThumbnailChange?.(value)
              }}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Duration Warning */}
      {duration > maxDuration && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Video muy largo</p>
            <p className="text-amber-400/70 text-xs mt-1">
              El video original dura {formatDuration(duration)}. 
              Usa los controles para seleccionar un segmento de máximo {formatDuration(maxDuration)}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
