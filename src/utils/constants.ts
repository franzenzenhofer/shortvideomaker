// App Configuration
export const APP_CONFIG = {
  name: 'ShortVideoMaker',
  version: '1.0.0',
  description: 'Professional mobile-first short video maker for music videos',
  author: 'Franz AI',
  url: 'https://shortvideomaker.franzai.com',
} as const

// File Constraints
export const FILE_CONSTRAINTS = {
  VIDEO: {
    MAX_SIZE_MB: 500,
    MAX_SIZE_BYTES: 500 * 1024 * 1024,
    MAX_DURATION_SECONDS: 600, // 10 minutes
    MIN_DURATION_SECONDS: 1,
    SUPPORTED_FORMATS: ['.mp4', '.webm', '.mov', '.avi'],
    SUPPORTED_MIME_TYPES: [
      'video/mp4',
      'video/webm', 
      'video/quicktime',
      'video/x-msvideo',
      'video/avi'
    ]
  },
  AUDIO: {
    MAX_SIZE_MB: 100,
    MAX_SIZE_BYTES: 100 * 1024 * 1024,
    MAX_DURATION_SECONDS: 1800, // 30 minutes
    MIN_DURATION_SECONDS: 1,
    SUPPORTED_FORMATS: ['.mp3', '.wav', '.ogg', '.aac', '.m4a'],
    SUPPORTED_MIME_TYPES: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/x-m4a'
    ]
  }
} as const

// Processing Configuration
export const PROCESSING_CONFIG = {
  DEFAULT_FPS: 30,
  MAX_FPS: 60,
  MIN_FPS: 15,
  DEFAULT_VIDEO_QUALITY: 0.8, // 0-1 scale
  MAX_LOOPS: 100,
  DEFAULT_FADE_TIME: 0.5, // seconds
  CANVAS_MAX_WIDTH: 1920,
  CANVAS_MAX_HEIGHT: 1080,
  PROGRESS_UPDATE_INTERVAL: 100, // ms
  PREVIEW_DURATION: 10 // seconds
} as const

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 200, // ms
  TOAST_DURATION: 3000, // ms
  PROGRESS_BAR_HEIGHT: 6, // px
  MOBILE_BREAKPOINT: 768, // px
  UPLOAD_ZONE_MIN_HEIGHT: 200, // px
} as const

// Colors (Tailwind-compatible)
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  SECONDARY: {
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9'
  },
  SUCCESS: {
    500: '#10b981',
    600: '#059669'
  },
  ERROR: {
    500: '#ef4444',
    600: '#dc2626'
  },
  WARNING: {
    500: '#f59e0b',
    600: '#d97706'
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    800: '#1f2937',
    900: '#111827'
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  DURATION_TOO_LONG: 'Media duration is too long',
  DURATION_TOO_SHORT: 'Media duration is too short',
  PROCESSING_FAILED: 'Video processing failed',
  EXPORT_FAILED: 'Video export failed',
  NETWORK_ERROR: 'Network connection error',
  PERMISSION_DENIED: 'Permission denied',
  BROWSER_NOT_SUPPORTED: 'Browser not supported',
  WEBGL_NOT_AVAILABLE: 'WebGL not available',
  AUDIO_CONTEXT_FAILED: 'Audio context initialization failed',
  MEDIA_RECORDER_NOT_SUPPORTED: 'Media recording not supported'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  VIDEO_PROCESSED: 'Video processed successfully',
  VIDEO_EXPORTED: 'Video exported successfully',
  LINK_COPIED: 'Link copied to clipboard'
} as const

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  PROJECTS: '/api/projects',
  ANALYTICS: '/api/analytics'
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_CLOUD_SAVE: false,
  ENABLE_ADVANCED_EFFECTS: false,
  ENABLE_BATCH_PROCESSING: false,
  ENABLE_PREVIEW_EFFECTS: true,
  ENABLE_FADE_TRANSITIONS: true
} as const

// Browser Support Detection
export const BROWSER_SUPPORT = {
  REQUIRED_FEATURES: [
    'MediaRecorder',
    'Canvas',
    'AudioContext',
    'URL.createObjectURL'
  ],
  OPTIONAL_FEATURES: [
    'WebGL',
    'OffscreenCanvas',
    'SharedArrayBuffer'
  ]
} as const

// Social Media Presets
export const SOCIAL_PRESETS = {
  TIKTOK: {
    name: 'TikTok',
    aspectRatio: 9/16,
    width: 1080,
    height: 1920,
    maxDuration: 60
  },
  INSTAGRAM_REEL: {
    name: 'Instagram Reel', 
    aspectRatio: 9/16,
    width: 1080,
    height: 1920,
    maxDuration: 90
  },
  YOUTUBE_SHORT: {
    name: 'YouTube Short',
    aspectRatio: 9/16,
    width: 1080,
    height: 1920,
    maxDuration: 60
  },
  INSTAGRAM_SQUARE: {
    name: 'Instagram Square',
    aspectRatio: 1/1,
    width: 1080,
    height: 1080,
    maxDuration: 60
  },
  TWITTER: {
    name: 'Twitter',
    aspectRatio: 16/9,
    width: 1280,
    height: 720,
    maxDuration: 140
  }
} as const

// Performance Monitoring
export const PERFORMANCE_CONFIG = {
  MEMORY_CHECK_INTERVAL: 5000, // ms
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
  PROCESSING_TIMEOUT: 300000, // 5 minutes
  MAX_CONCURRENT_PROCESSES: 1
} as const

// Local Storage Keys  
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'svm_user_preferences',
  RECENT_PROJECTS: 'svm_recent_projects',
  ANALYTICS_SESSION: 'svm_analytics_session',
  ONBOARDING_COMPLETED: 'svm_onboarding_completed'
} as const

// Default Settings
export const DEFAULT_SETTINGS = {
  quality: 'high',
  enableFadeTransitions: true,
  autoPlay: false,
  showAdvancedOptions: false,
  preserveOriginalAspectRatio: true,
  enableAnalytics: true
} as const

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ', // spacebar
  RESET: 'r',
  EXPORT: 'e',
  UPLOAD_VIDEO: 'v',
  UPLOAD_AUDIO: 'a'
} as const

// Animation Presets
export const ANIMATION_PRESETS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  }
} as const

// Video Codecs Priority (preferred order)
export const VIDEO_CODECS = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus', 
  'video/mp4;codecs=h264',
  'video/webm'
] as const