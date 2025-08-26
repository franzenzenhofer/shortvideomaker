import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, RotateCcw, Music } from 'lucide-react'
import FileUpload from './components/FileUpload'
import VideoPreview from './components/VideoPreview'
import Controls from './components/Controls'
import ProgressBar from './components/ProgressBar'
import ExportOptions from './components/ExportOptions'
import { useVideoProcessor } from './hooks/useVideoProcessor'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'

interface AppState {
  audioFile: File | null
  videoFile: File | null
  isProcessing: boolean
  processedVideoUrl: string | null
  audioDuration: number
  videoDuration: number
  loopCount: number
  isPlaying: boolean
  exportProgress: number
  exportingVideo: boolean
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    audioFile: null,
    videoFile: null,
    isProcessing: false,
    processedVideoUrl: null,
    audioDuration: 0,
    videoDuration: 0,
    loopCount: 0,
    isPlaying: false,
    exportProgress: 0,
    exportingVideo: false
  })

  const { processVideo } = useVideoProcessor()
  const { analyzeAudio } = useAudioAnalyzer()

  const handleAudioUpload = async (file: File) => {
    setState(prev => ({ ...prev, audioFile: file, isProcessing: true }))
    try {
      const duration = await analyzeAudio(file)
      setState(prev => ({ 
        ...prev, 
        audioDuration: duration,
        isProcessing: false,
        loopCount: prev.videoDuration > 0 ? Math.ceil(duration / prev.videoDuration) : 0
      }))
    } catch (error) {
      console.error('Audio analysis failed:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const handleVideoUpload = async (file: File) => {
    setState(prev => ({ ...prev, videoFile: file, isProcessing: true }))
    try {
      // Create video element to get duration
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)
      
      video.onloadedmetadata = () => {
        const duration = video.duration
        setState(prev => ({ 
          ...prev, 
          videoDuration: duration,
          isProcessing: false,
          loopCount: prev.audioDuration > 0 ? Math.ceil(prev.audioDuration / duration) : 0
        }))
        URL.revokeObjectURL(url)
      }
      
      video.src = url
    } catch (error) {
      console.error('Video analysis failed:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const handleProcessVideo = async () => {
    if (!state.audioFile || !state.videoFile) return

    setState(prev => ({ ...prev, isProcessing: true }))
    try {
      const processedUrl = await processVideo(
        state.videoFile, 
        state.audioFile, 
        state.loopCount,
        (progress) => setState(prev => ({ ...prev, exportProgress: progress }))
      )
      setState(prev => ({ 
        ...prev, 
        processedVideoUrl: processedUrl,
        isProcessing: false,
        exportProgress: 0
      }))
    } catch (error) {
      console.error('Video processing failed:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const handleExport = async () => {
    if (!state.processedVideoUrl) return
    
    setState(prev => ({ ...prev, exportingVideo: true }))
    
    try {
      // Create download link
      const link = document.createElement('a')
      link.href = state.processedVideoUrl
      link.download = `looped-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setState(prev => ({ ...prev, exportingVideo: false }))
    }
  }

  const handleReset = () => {
    setState({
      audioFile: null,
      videoFile: null,
      isProcessing: false,
      processedVideoUrl: null,
      audioDuration: 0,
      videoDuration: 0,
      loopCount: 0,
      isPlaying: false,
      exportProgress: 0,
      exportingVideo: false
    })
  }

  const togglePlayback = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const canProcess = Boolean(state.audioFile && state.videoFile && !state.isProcessing)
  const hasProcessedVideo = Boolean(state.processedVideoUrl)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ShortVideoMaker
                </h1>
                <p className="text-sm text-gray-400">Loop video to audio length</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={state.isProcessing}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {!state.audioFile || !state.videoFile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* File Upload Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload
                  type="audio"
                  file={state.audioFile}
                  onFileSelect={handleAudioUpload}
                  isProcessing={state.isProcessing}
                  accept=".mp3,.wav,.m4a,.aac"
                  icon={<Music className="h-8 w-8" />}
                  title="Upload Audio"
                  subtitle="MP3, WAV, M4A, AAC"
                />
                <FileUpload
                  type="video"
                  file={state.videoFile}
                  onFileSelect={handleVideoUpload}
                  isProcessing={state.isProcessing}
                  accept=".mp4,.webm,.mov"
                  icon={<Upload className="h-8 w-8" />}
                  title="Upload Video"
                  subtitle="MP4, WebM, MOV"
                />
              </div>

              {/* File Info */}
              {(state.audioFile || state.videoFile) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <h3 className="text-lg font-semibold mb-4">File Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {state.audioFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Audio File:</p>
                        <p className="font-medium">{state.audioFile.name}</p>
                        <p className="text-sm text-blue-400">
                          Duration: {state.audioDuration.toFixed(2)}s
                        </p>
                      </div>
                    )}
                    {state.videoFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Video File:</p>
                        <p className="font-medium">{state.videoFile.name}</p>
                        <p className="text-sm text-blue-400">
                          Duration: {state.videoDuration.toFixed(2)}s
                        </p>
                        {state.loopCount > 0 && (
                          <p className="text-sm text-purple-400">
                            Will loop {state.loopCount} times
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Video Preview */}
              <VideoPreview
                videoFile={state.videoFile}
                audioFile={state.audioFile}
                processedVideoUrl={state.processedVideoUrl}
                isPlaying={Boolean(state.isPlaying)}
                loopCount={state.loopCount}
              />

              {/* Controls */}
              <Controls
                canProcess={canProcess}
                hasProcessedVideo={hasProcessedVideo}
                isProcessing={state.isProcessing}
                isPlaying={Boolean(state.isPlaying)}
                onProcess={handleProcessVideo}
                onTogglePlayback={togglePlayback}
                onExport={handleExport}
                isExporting={state.exportingVideo}
              />

              {/* Progress Bar */}
              {state.isProcessing && state.exportProgress > 0 && (
                <ProgressBar
                  progress={state.exportProgress}
                  label="Processing video..."
                />
              )}

              {/* Export Options */}
              {hasProcessedVideo && (
                <ExportOptions
                  onExport={handleExport}
                  isExporting={state.exportingVideo}
                  videoUrl={state.processedVideoUrl!}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-400">
            <p>© 2025 ShortVideoMaker. Professional mobile-first video editor.</p>
            <p className="mt-1">Create stunning music videos with seamless looping.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App