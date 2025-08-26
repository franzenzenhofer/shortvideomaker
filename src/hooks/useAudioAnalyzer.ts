import { useState, useCallback, useRef, useEffect } from 'react'
import { AudioProcessor, AudioAnalysisResult } from '../core/AudioProcessor'

interface UseAudioAnalyzerReturn {
  analyzeAudio: (file: File) => Promise<number>
  analysisResult: AudioAnalysisResult | null
  audioDuration: number
  isAnalyzing: boolean
  error: string | null
  createVisualization: (file: File, canvas: HTMLCanvasElement) => Promise<void>
  getDuration: (file: File) => Promise<number>
  cleanup: () => void
}

export const useAudioAnalyzer = (): UseAudioAnalyzerReturn => {
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processorRef = useRef<AudioProcessor | null>(null)

  // Initialize audio processor
  useEffect(() => {
    processorRef.current = new AudioProcessor()

    return () => {
      processorRef.current?.cleanup()
    }
  }, [])

  const analyzeAudio = useCallback(async (file: File): Promise<number> => {
    if (!processorRef.current) {
      throw new Error('Audio processor not initialized')
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Quick duration check first (faster method)
      const duration = await processorRef.current.getAudioDuration(file)
      setAudioDuration(duration)

      // Full analysis (optional, for advanced features)
      try {
        const analysis = await processorRef.current.analyzeAudio(file)
        setAnalysisResult(analysis)
        setAudioDuration(analysis.duration)
        return analysis.duration
      } catch (analysisError) {
        // If full analysis fails, fall back to basic duration
        console.warn('Full audio analysis failed, using basic duration:', analysisError)
        return duration
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio analysis failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const createVisualization = useCallback(async (
    file: File, 
    canvas: HTMLCanvasElement
  ): Promise<void> => {
    if (!processorRef.current) {
      throw new Error('Audio processor not initialized')
    }

    try {
      await processorRef.current.createAudioVisualization(file, canvas)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Visualization creation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const getDuration = useCallback(async (file: File): Promise<number> => {
    if (!processorRef.current) {
      throw new Error('Audio processor not initialized')
    }

    try {
      const duration = await processorRef.current.getAudioDuration(file)
      setAudioDuration(duration)
      return duration
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Duration analysis failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const cleanup = useCallback(() => {
    processorRef.current?.cleanup()
    setAnalysisResult(null)
    setAudioDuration(0)
    setIsAnalyzing(false)
    setError(null)
  }, [])

  return {
    analyzeAudio,
    analysisResult,
    audioDuration,
    isAnalyzing,
    error,
    createVisualization,
    getDuration,
    cleanup
  }
}

// Additional hook for simple audio duration checking
export const useSimpleAudioDuration = () => {
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getDuration = useCallback(async (file: File): Promise<number> => {
    setIsLoading(true)
    setError(null)

    try {
      const duration = await new Promise<number>((resolve, reject) => {
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

      setDuration(duration)
      return duration

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Duration check failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    duration,
    isLoading,
    error,
    getDuration
  }
}

// Hook for audio format validation
export const useAudioValidation = () => {
  const validateAudioFile = useCallback((file: File): { isValid: boolean; message: string } => {
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        message: 'File size must be less than 100MB'
      }
    }

    // Check file type
    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a'
    ]

    const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a']

    const hasValidType = validTypes.some(type => file.type === type)
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      return {
        isValid: false,
        message: 'Please select a valid audio file (MP3, WAV, OGG, AAC, M4A)'
      }
    }

    return {
      isValid: true,
      message: 'Audio file is valid'
    }
  }, [])

  return { validateAudioFile }
}