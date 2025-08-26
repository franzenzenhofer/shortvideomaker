export interface ProcessingProgress {
  phase: 'analyzing' | 'processing' | 'rendering' | 'finalizing'
  progress: number // 0-100
  message: string
}

export class VideoProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.canvas.style.display = 'none'
    document.body.appendChild(this.canvas)
  }

  async processVideo(
    videoFile: File,
    audioFile: File,
    loopCount: number,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<string> {
    try {
      onProgress?.({ 
        phase: 'analyzing', 
        progress: 0, 
        message: 'Analyzing video and audio files...' 
      })

      // Create video and audio elements
      const video = document.createElement('video')
      const audio = document.createElement('audio')
      
      // Load video
      const videoUrl = URL.createObjectURL(videoFile)
      video.src = videoUrl
      video.muted = true
      
      // Load audio
      const audioUrl = URL.createObjectURL(audioFile)
      audio.src = audioUrl

      // Wait for both to load
      await Promise.all([
        new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve
          video.onerror = reject
        }),
        new Promise((resolve, reject) => {
          audio.onloadedmetadata = resolve
          audio.onerror = reject
        })
      ])

      onProgress?.({ 
        phase: 'processing', 
        progress: 20, 
        message: 'Setting up canvas and recording...' 
      })

      // Setup canvas dimensions
      this.canvas.width = video.videoWidth
      this.canvas.height = video.videoHeight

      // Setup MediaRecorder
      const stream = this.canvas.captureStream(30) // 30 FPS
      
      // Add audio track to the stream
      const audioContext = new AudioContext()
      const audioBuffer = await this.loadAudioBuffer(audioFile, audioContext)
      const audioTrack = await this.createAudioTrack(audioBuffer, audioContext)
      stream.addTrack(audioTrack)

      this.recordedChunks = []
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      // Start recording
      this.mediaRecorder.start()

      onProgress?.({ 
        phase: 'rendering', 
        progress: 30, 
        message: 'Rendering looped video...' 
      })

      // Render the looped video
      await this.renderLoopedVideo(video, loopCount, onProgress)

      onProgress?.({ 
        phase: 'finalizing', 
        progress: 90, 
        message: 'Finalizing video...' 
      })

      // Stop recording
      this.mediaRecorder.stop()

      // Wait for recording to complete
      const blob = await new Promise<Blob>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          resolve(new Blob(this.recordedChunks, { type: 'video/webm' }))
        }
      })

      // Clean up
      URL.revokeObjectURL(videoUrl)
      URL.revokeObjectURL(audioUrl)
      audioContext.close()

      onProgress?.({ 
        phase: 'finalizing', 
        progress: 100, 
        message: 'Video processing complete!' 
      })

      // Create blob URL for download
      return URL.createObjectURL(blob)

    } catch (error) {
      console.error('Video processing failed:', error)
      throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async loadAudioBuffer(audioFile: File, audioContext: AudioContext): Promise<AudioBuffer> {
    const arrayBuffer = await audioFile.arrayBuffer()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  private async createAudioTrack(audioBuffer: AudioBuffer, audioContext: AudioContext): Promise<MediaStreamTrack> {
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    
    const destination = audioContext.createMediaStreamDestination()
    source.connect(destination)
    source.start()
    
    return destination.stream.getAudioTracks()[0]
  }

  private async renderLoopedVideo(
    video: HTMLVideoElement,
    loopCount: number,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      let currentLoop = 0
      const videoDuration = video.duration
      let startTime = 0

      const renderFrame = () => {
        if (currentLoop >= loopCount) {
          resolve()
          return
        }

        const currentTime = (Date.now() - startTime) / 1000
        const videoTime = currentTime % videoDuration

        // Set video time
        video.currentTime = videoTime

        // Draw frame to canvas
        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)

        // Update progress
        const overallProgress = ((currentLoop + videoTime / videoDuration) / loopCount) * 60 + 30
        onProgress?.({ 
          phase: 'rendering', 
          progress: Math.min(overallProgress, 90), 
          message: `Rendering loop ${currentLoop + 1} of ${loopCount}...` 
        })

        // Check if we completed a loop
        if (videoTime < 0.1 && currentTime > videoDuration) {
          currentLoop++
          startTime = Date.now()
        }

        if (currentLoop < loopCount) {
          requestAnimationFrame(renderFrame)
        } else {
          resolve()
        }
      }

      // Start rendering
      video.play()
      startTime = Date.now()
      renderFrame()
    })
  }

  cleanup(): void {
    if (this.canvas && document.body.contains(this.canvas)) {
      document.body.removeChild(this.canvas)
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
  }
}