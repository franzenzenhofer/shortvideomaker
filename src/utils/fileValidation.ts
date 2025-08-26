export interface FileValidationResult {
  isValid: boolean
  message: string
  details?: {
    size?: number
    type?: string
    extension?: string
  }
}

export interface FileConstraints {
  maxSizeBytes: number
  allowedTypes: string[]
  allowedExtensions: string[]
  minDurationSeconds?: number
  maxDurationSeconds?: number
}

// Default constraints
export const VIDEO_CONSTRAINTS: FileConstraints = {
  maxSizeBytes: 500 * 1024 * 1024, // 500MB
  allowedTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/avi'
  ],
  allowedExtensions: ['.mp4', '.webm', '.mov', '.avi'],
  maxDurationSeconds: 600 // 10 minutes
}

export const AUDIO_CONSTRAINTS: FileConstraints = {
  maxSizeBytes: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a'
  ],
  allowedExtensions: ['.mp3', '.wav', '.ogg', '.aac', '.m4a'],
  maxDurationSeconds: 1800 // 30 minutes
}

export class FileValidator {
  static validateFile(file: File, constraints: FileConstraints): FileValidationResult {
    // Check file size
    if (file.size > constraints.maxSizeBytes) {
      return {
        isValid: false,
        message: `File size must be less than ${this.formatFileSize(constraints.maxSizeBytes)}`,
        details: {
          size: file.size,
          type: file.type
        }
      }
    }

    // Check file type
    const hasValidType = constraints.allowedTypes.some(type => 
      file.type === type || file.type.startsWith(type.split('/')[0] + '/')
    )

    // Check file extension
    const fileName = file.name.toLowerCase()
    const hasValidExtension = constraints.allowedExtensions.some(ext => 
      fileName.endsWith(ext.toLowerCase())
    )

    if (!hasValidType && !hasValidExtension) {
      return {
        isValid: false,
        message: `Please select a valid file type (${constraints.allowedExtensions.join(', ')})`,
        details: {
          type: file.type,
          extension: this.getFileExtension(file.name)
        }
      }
    }

    return {
      isValid: true,
      message: 'File is valid',
      details: {
        size: file.size,
        type: file.type,
        extension: this.getFileExtension(file.name)
      }
    }
  }

  static validateVideoFile(file: File): FileValidationResult {
    return this.validateFile(file, VIDEO_CONSTRAINTS)
  }

  static validateAudioFile(file: File): FileValidationResult {
    return this.validateFile(file, AUDIO_CONSTRAINTS)
  }

  static async validateMediaDuration(
    file: File, 
    constraints: FileConstraints
  ): Promise<FileValidationResult> {
    try {
      const duration = await this.getMediaDuration(file)

      if (constraints.minDurationSeconds && duration < constraints.minDurationSeconds) {
        return {
          isValid: false,
          message: `Media must be at least ${constraints.minDurationSeconds} seconds long`
        }
      }

      if (constraints.maxDurationSeconds && duration > constraints.maxDurationSeconds) {
        return {
          isValid: false,
          message: `Media must be less than ${this.formatDuration(constraints.maxDurationSeconds)}`
        }
      }

      return {
        isValid: true,
        message: 'Media duration is valid'
      }

    } catch (error) {
      return {
        isValid: false,
        message: `Failed to analyze media duration: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  static async getMediaDuration(file: File): Promise<number> {
    const isVideo = file.type.startsWith('video/')
    const element = isVideo 
      ? document.createElement('video') as HTMLVideoElement
      : document.createElement('audio') as HTMLAudioElement

    const url = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      element.onloadedmetadata = () => {
        resolve(element.duration)
        URL.revokeObjectURL(url)
      }

      element.onerror = () => {
        reject(new Error('Failed to load media file'))
        URL.revokeObjectURL(url)
      }

      element.src = url
    })
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    } else {
      const hours = Math.floor(seconds / 3600)
      const remainingMinutes = Math.floor((seconds % 3600) / 60)
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
  }

  static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot !== -1 ? filename.substring(lastDot) : ''
  }

  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/') || 
           VIDEO_CONSTRAINTS.allowedExtensions.some(ext => 
             file.name.toLowerCase().endsWith(ext)
           )
  }

  static isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/') || 
           AUDIO_CONSTRAINTS.allowedExtensions.some(ext => 
             file.name.toLowerCase().endsWith(ext)
           )
  }

  static async validateVideoAudioPair(
    videoFile: File, 
    audioFile: File
  ): Promise<FileValidationResult> {
    try {
      const [videoDuration, audioDuration] = await Promise.all([
        this.getMediaDuration(videoFile),
        this.getMediaDuration(audioFile)
      ])

      // Check if video is reasonable compared to audio
      const ratio = audioDuration / videoDuration

      if (ratio > 100) {
        return {
          isValid: false,
          message: 'Audio is much longer than video. This may result in very long processing time.'
        }
      }

      if (ratio < 0.1) {
        return {
          isValid: false,
          message: 'Video is much longer than audio. Consider using a shorter video clip.'
        }
      }

      return {
        isValid: true,
        message: 'Video and audio duration ratio is acceptable'
      }

    } catch (error) {
      return {
        isValid: false,
        message: `Failed to validate file pair: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Utility functions for drag and drop
export const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

export const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

export const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

export const extractFilesFromDrop = (e: DragEvent): File[] => {
  e.preventDefault()
  e.stopPropagation()
  
  const files: File[] = []
  
  if (e.dataTransfer?.files) {
    Array.from(e.dataTransfer.files).forEach(file => {
      files.push(file)
    })
  }
  
  return files
}

export const findFileByType = (files: File[], type: 'video' | 'audio'): File | null => {
  return files.find(file => {
    if (type === 'video') {
      return FileValidator.isVideoFile(file)
    } else {
      return FileValidator.isAudioFile(file)
    }
  }) || null
}