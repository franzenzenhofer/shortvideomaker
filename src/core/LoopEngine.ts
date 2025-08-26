export interface LoopConfiguration {
  videoDuration: number
  audioDuration: number
  targetFps: number
  fadeTransition: boolean
  fadeTime: number // seconds
  seamlessLoop: boolean
}

export interface LoopMetrics {
  totalLoops: number
  finalVideoDuration: number
  transitionPoints: number[]
  efficiency: number // 0-1, how well video matches audio
}

export class LoopEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  calculateLoopMetrics(config: LoopConfiguration): LoopMetrics {
    const { videoDuration, audioDuration } = config
    
    if (videoDuration <= 0 || audioDuration <= 0) {
      throw new Error('Invalid duration values')
    }

    // Calculate exact number of loops needed
    const exactLoops = audioDuration / videoDuration
    const totalLoops = Math.ceil(exactLoops)
    
    // Calculate final video duration (will be slightly longer than audio)
    const finalVideoDuration = totalLoops * videoDuration
    
    // Calculate transition points (where loops occur)
    const transitionPoints: number[] = []
    for (let i = 1; i < totalLoops; i++) {
      transitionPoints.push(i * videoDuration)
    }
    
    // Calculate efficiency (how close the final duration is to target)
    const efficiency = Math.min(audioDuration / finalVideoDuration, 1)
    
    return {
      totalLoops,
      finalVideoDuration,
      transitionPoints,
      efficiency
    }
  }

  async createLoopedVideo(
    videoElement: HTMLVideoElement,
    config: LoopConfiguration,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const metrics = this.calculateLoopMetrics(config)
    
    // Setup canvas
    this.canvas.width = videoElement.videoWidth
    this.canvas.height = videoElement.videoHeight
    
    // Setup MediaRecorder
    const stream = this.canvas.captureStream(config.targetFps)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    })
    
    const recordedChunks: Blob[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    }
    
    // Start recording
    mediaRecorder.start()
    
    try {
      await this.renderLoops(videoElement, metrics, config, onProgress)
      
      // Stop recording
      mediaRecorder.stop()
      
      // Wait for recording to complete
      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' })
          resolve(blob)
        }
      })
      
    } catch (error) {
      mediaRecorder.stop()
      throw error
    }
  }

  private async renderLoops(
    video: HTMLVideoElement,
    metrics: LoopMetrics,
    config: LoopConfiguration,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let currentLoop = 0
      let startTime = Date.now()
      let lastFrameTime = 0
      const frameDuration = 1000 / config.targetFps
      
      const renderLoop = () => {
        try {
          const now = Date.now()
          
          // Throttle to target FPS
          if (now - lastFrameTime < frameDuration) {
            requestAnimationFrame(renderLoop)
            return
          }
          lastFrameTime = now
          
          // Calculate current position
          const elapsed = (now - startTime) / 1000
          let videoTime = elapsed % config.videoDuration
          
          // Handle loop transition
          if (elapsed >= (currentLoop + 1) * config.videoDuration) {
            currentLoop++
            if (currentLoop >= metrics.totalLoops) {
              resolve()
              return
            }
            startTime = now
            videoTime = 0
          }
          
          // Set video time
          video.currentTime = videoTime
          
          // Apply fade transition if enabled
          let alpha = 1.0
          if (config.fadeTransition && config.fadeTime > 0) {
            const transitionStart = config.videoDuration - config.fadeTime
            
            if (videoTime >= transitionStart) {
              // Fade out
              const fadeProgress = (videoTime - transitionStart) / config.fadeTime
              alpha = 1.0 - fadeProgress
            } else if (videoTime <= config.fadeTime) {
              // Fade in
              const fadeProgress = videoTime / config.fadeTime
              alpha = fadeProgress
            }
          }
          
          // Clear canvas
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          
          // Set alpha for fade transitions
          this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
          
          // Draw video frame
          this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
          
          // Reset alpha
          this.ctx.globalAlpha = 1.0
          
          // Update progress
          const totalProgress = (currentLoop + videoTime / config.videoDuration) / metrics.totalLoops
          onProgress?.(Math.min(totalProgress * 100, 100))
          
          // Continue rendering
          requestAnimationFrame(renderLoop)
          
        } catch (error) {
          reject(error)
        }
      }
      
      // Start the render loop
      video.play().then(() => {
        requestAnimationFrame(renderLoop)
      }).catch(reject)
    })
  }

  optimizeLoopConfiguration(
    videoDuration: number,
    audioDuration: number,
    maxDeviation: number = 0.1 // 10% max deviation
  ): LoopConfiguration {
    // Try to find the best loop configuration within acceptable deviation
    let bestConfig: LoopConfiguration | null = null
    let bestScore = 0
    
    // Test different configurations
    const targetFpsOptions = [24, 30, 60]
    const fadeTimeOptions = [0, 0.5, 1.0]
    
    for (const targetFps of targetFpsOptions) {
      for (const fadeTime of fadeTimeOptions) {
        const config: LoopConfiguration = {
          videoDuration,
          audioDuration,
          targetFps,
          fadeTransition: fadeTime > 0,
          fadeTime,
          seamlessLoop: true
        }
        
        const metrics = this.calculateLoopMetrics(config)
        const deviation = Math.abs(metrics.finalVideoDuration - audioDuration) / audioDuration
        
        if (deviation <= maxDeviation) {
          const score = metrics.efficiency * (1 - deviation)
          if (score > bestScore || bestConfig === null) {
            bestScore = score
            bestConfig = config
          }
        }
      }
    }
    
    // If no configuration within acceptable deviation, use default
    if (!bestConfig) {
      bestConfig = {
        videoDuration,
        audioDuration,
        targetFps: 30,
        fadeTransition: true,
        fadeTime: 0.5,
        seamlessLoop: true
      }
    }
    
    return bestConfig
  }

  async previewLoop(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    config: LoopConfiguration,
    previewDuration: number = 10 // seconds
  ): Promise<void> {
    const ctx = canvas.getContext('2d')!
    const metrics = this.calculateLoopMetrics(config)
    
    let startTime = Date.now()
    let currentLoop = 0
    
    const previewFrame = () => {
      const elapsed = (Date.now() - startTime) / 1000
      
      if (elapsed >= previewDuration) {
        return // Preview complete
      }
      
      let videoTime = elapsed % config.videoDuration
      
      if (elapsed >= (currentLoop + 1) * config.videoDuration) {
        currentLoop++
        if (currentLoop >= metrics.totalLoops) {
          currentLoop = 0 // Restart for preview
          startTime = Date.now()
        }
        videoTime = 0
      }
      
      video.currentTime = videoTime
      
      // Apply fade if enabled
      let alpha = 1.0
      if (config.fadeTransition && config.fadeTime > 0) {
        const transitionStart = config.videoDuration - config.fadeTime
        
        if (videoTime >= transitionStart) {
          const fadeProgress = (videoTime - transitionStart) / config.fadeTime
          alpha = 1.0 - fadeProgress
        } else if (videoTime <= config.fadeTime) {
          const fadeProgress = videoTime / config.fadeTime
          alpha = fadeProgress
        }
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1.0
      
      requestAnimationFrame(previewFrame)
    }
    
    video.play()
    requestAnimationFrame(previewFrame)
  }

  cleanup(): void {
    if (this.canvas && document.body.contains(this.canvas)) {
      document.body.removeChild(this.canvas)
    }
  }
}