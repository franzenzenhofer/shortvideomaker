/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_URL: string
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'preview'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global type declarations for better TypeScript support
declare global {
  interface Window {
    // Web APIs that might not be available in all browsers
    webkitRequestFileSystem?: unknown
    mozRequestFileSystem?: unknown
    msRequestFileSystem?: unknown
    
    // Media Recorder API
    MediaRecorder: typeof MediaRecorder
    
    // Web Audio API
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
    
    // Webkit specific properties
    webkitURL?: typeof URL
    
    // Performance API
    performance: Performance
  }

  // MediaRecorder options
  interface MediaRecorderOptions {
    mimeType?: string
    audioBitsPerSecond?: number
    videoBitsPerSecond?: number
    bitsPerSecond?: number
  }

  // Canvas capture stream
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream
  }

  // File system access API (experimental)
  interface FileSystemFileHandle {
    kind: 'file'
    name: string
    getFile(): Promise<File>
    createWritable(): Promise<FileSystemWritableFileStream>
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: unknown): Promise<void>
    close(): Promise<void>
  }

  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string
      types?: Array<{
        description: string
        accept: Record<string, string[]>
      }>
    }) => Promise<FileSystemFileHandle>
  }
}

// Custom utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type ValueOf<T> = T[keyof T]

export type NonNullable<T> = T extends null | undefined ? never : T

// Video processing types
export interface VideoProcessingOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra'
  fps: number
  format: 'webm' | 'mp4'
  codec: string
}

export interface AudioProcessingOptions {
  sampleRate: number
  bitRate: number
  channels: number
}

// File type extensions
export type VideoFileType = '.mp4' | '.webm' | '.mov' | '.avi'
export type AudioFileType = '.mp3' | '.wav' | '.ogg' | '.aac' | '.m4a'
export type SupportedFileType = VideoFileType | AudioFileType

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Event handler types
export type FileSelectHandler = (file: File) => void
export type ProgressHandler = (progress: number) => void
export type ErrorHandler = (error: Error) => void

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProjectData {
  id: string
  name: string
  videoFile?: File
  audioFile?: File
  settings: VideoProcessingOptions
  createdAt: string
  updatedAt: string
}

// Browser capability detection
export interface BrowserCapabilities {
  mediaRecorder: boolean
  webGL: boolean
  audioContext: boolean
  fileSystemAccess: boolean
  offscreenCanvas: boolean
  sharedArrayBuffer: boolean
}

// Performance monitoring
export interface PerformanceMetrics {
  memoryUsage: number
  processingTime: number
  frameRate: number
  droppedFrames: number
}

// Error types
export type ProcessingError = 
  | 'FILE_TOO_LARGE'
  | 'INVALID_FORMAT'
  | 'PROCESSING_TIMEOUT'
  | 'MEMORY_EXCEEDED'
  | 'BROWSER_UNSUPPORTED'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'

export interface ProcessingErrorInfo {
  type: ProcessingError
  message: string
  details?: unknown
  timestamp: number
}

// Theme types
export type Theme = 'dark' | 'light'
export type ColorScheme = 'blue' | 'purple' | 'green' | 'red'

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp: number
  sessionId: string
}

// Local storage types
export interface UserPreferences {
  theme: Theme
  colorScheme: ColorScheme
  autoPlay: boolean
  showAdvancedOptions: boolean
  defaultQuality: VideoProcessingOptions['quality']
}

// Worker message types
export interface WorkerMessage {
  type: 'PROCESS_VIDEO' | 'PROCESS_AUDIO' | 'EXPORT' | 'CANCEL'
  payload: unknown
  id: string
}

export interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR'
  payload: unknown
  id: string
}