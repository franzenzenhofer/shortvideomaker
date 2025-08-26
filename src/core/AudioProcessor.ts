export interface AudioAnalysisResult {
  duration: number
  sampleRate: number
  channels: number
  bitRate?: number
  peaks?: number[]
  waveform?: number[]
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null

  async analyzeAudio(file: File): Promise<AudioAnalysisResult> {
    try {
      // Initialize audio context
      this.audioContext = new AudioContext()
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      
      // Extract basic information
      const duration = audioBuffer.duration
      const sampleRate = audioBuffer.sampleRate
      const channels = audioBuffer.numberOfChannels
      
      // Calculate approximate bitrate (rough estimation)
      const bitRate = Math.round((file.size * 8) / duration / 1000) // kbps
      
      // Generate waveform data (simplified)
      const waveform = this.generateWaveform(audioBuffer)
      const peaks = this.detectPeaks(waveform)
      
      await this.audioContext.close()
      this.audioContext = null
      
      return {
        duration,
        sampleRate,
        channels,
        bitRate,
        peaks,
        waveform
      }
    } catch (error) {
      if (this.audioContext) {
        await this.audioContext.close()
        this.audioContext = null
      }
      throw new Error(`Audio analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateWaveform(audioBuffer: AudioBuffer, samples: number = 1000): number[] {
    const channelData = audioBuffer.getChannelData(0) // Use first channel
    const blockSize = Math.floor(channelData.length / samples)
    const waveform: number[] = []
    
    for (let i = 0; i < samples; i++) {
      let sum = 0
      const start = i * blockSize
      const end = Math.min(start + blockSize, channelData.length)
      
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j])
      }
      
      waveform.push(sum / (end - start))
    }
    
    // Normalize waveform
    const max = Math.max(...waveform)
    return waveform.map(value => max > 0 ? value / max : 0)
  }

  private detectPeaks(waveform: number[], threshold: number = 0.7): number[] {
    const peaks: number[] = []
    
    for (let i = 1; i < waveform.length - 1; i++) {
      if (
        waveform[i] > threshold &&
        waveform[i] > waveform[i - 1] &&
        waveform[i] > waveform[i + 1]
      ) {
        peaks.push(i)
      }
    }
    
    return peaks
  }

  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio')
      const url = URL.createObjectURL(file)
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
        URL.revokeObjectURL(url)
      }
      
      audio.onerror = () => {
        reject(new Error('Failed to load audio file'))
        URL.revokeObjectURL(url)
      }
      
      audio.src = url
    })
  }

  async createAudioVisualization(
    file: File, 
    canvas: HTMLCanvasElement
  ): Promise<void> {
    try {
      const analysis = await this.analyzeAudio(file)
      const ctx = canvas.getContext('2d')!
      
      // Set canvas dimensions
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      if (!analysis.waveform) return
      
      // Draw waveform
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const barWidth = width / analysis.waveform.length
      
      analysis.waveform.forEach((value, index) => {
        const x = index * barWidth
        const barHeight = value * height * 0.8
        const y = (height - barHeight) / 2
        
        if (index === 0) {
          ctx.moveTo(x, y + barHeight / 2)
        } else {
          ctx.lineTo(x, y + barHeight / 2)
        }
      })
      
      ctx.stroke()
      
      // Highlight peaks
      if (analysis.peaks) {
        ctx.fillStyle = '#EF4444'
        analysis.peaks.forEach(peakIndex => {
          const x = peakIndex * barWidth
          const value = analysis.waveform![peakIndex]
          const barHeight = value * height * 0.8
          const y = (height - barHeight) / 2
          
          ctx.beginPath()
          ctx.arc(x, y + barHeight / 2, 3, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
      
    } catch (error) {
      console.error('Audio visualization failed:', error)
      throw error
    }
  }

  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}