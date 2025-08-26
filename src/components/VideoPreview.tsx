import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Volume2, VolumeX } from 'lucide-react'

interface VideoPreviewProps {
  videoFile: File | null
  audioFile: File | null
  processedVideoUrl: string | null
  isPlaying: boolean
  loopCount: number
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoFile,
  audioFile,
  processedVideoUrl,
  isPlaying,
  loopCount
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Setup video and audio URLs
  useEffect(() => {
    if (processedVideoUrl) {
      // Use processed video if available
      setVideoUrl(processedVideoUrl)
      setAudioUrl(null) // Processed video includes audio
    } else {
      // Use original files for preview
      if (videoFile) {
        const url = URL.createObjectURL(videoFile)
        setVideoUrl(url)
        return () => URL.revokeObjectURL(url)
      }
      if (audioFile) {
        const url = URL.createObjectURL(audioFile)
        setAudioUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    }
  }, [videoFile, audioFile, processedVideoUrl])

  // Handle play/pause
  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play()
      audioRef.current?.play()
    } else {
      videoRef.current.pause()
      audioRef.current?.pause()
    }
  }, [isPlaying])

  // Update time and duration
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [videoUrl])

  // Handle mute
  const handleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration

    videoRef.current.currentTime = newTime
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!videoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center"
      >
        <div className="text-center text-gray-400">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Upload video and audio files to see preview</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-black rounded-xl overflow-hidden"
    >
      {/* Video Container */}
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop={!processedVideoUrl} // Only loop original video
          playsInline
          preload="metadata"
        />

        {/* Audio Element (for original preview) */}
        {audioUrl && !processedVideoUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            muted={isMuted}
            loop
            preload="metadata"
          />
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          {/* Loop indicator */}
          {!processedVideoUrl && loopCount > 0 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-sm text-white">
                Will loop {loopCount}x
              </span>
            </div>
          )}

          {/* Mute button */}
          <button
            onClick={handleMute}
            className="absolute top-4 right-4 p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="space-y-2">
          {/* Progress bar */}
          <div
            className="h-2 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150 group-hover:from-blue-400 group-hover:to-purple-400"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between text-sm text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {processedVideoUrl && (
          <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            Processed
          </div>
        )}
        {!processedVideoUrl && audioUrl && (
          <div className="bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            Preview
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default VideoPreview