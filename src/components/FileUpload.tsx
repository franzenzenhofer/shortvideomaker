import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileAudio, FileVideo, X } from 'lucide-react'

interface FileUploadProps {
  type: 'audio' | 'video'
  file: File | null
  onFileSelect: (file: File) => void
  isProcessing?: boolean
  accept: string
  icon: React.ReactNode
  title: string
  subtitle: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  file,
  onFileSelect,
  isProcessing = false,
  accept,
  icon,
  title,
  subtitle
}) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(f => accept.split(',').some(ext => 
      f.name.toLowerCase().endsWith(ext.trim().replace('*', ''))
    ))
    
    if (validFile) {
      onFileSelect(validFile)
    }
  }, [accept, onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }, [onFileSelect])

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // Reset file by creating a new file input
    const fileInput = document.querySelector(`input[data-testid="${type}-input"]`) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }, [type])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (type === 'audio') return <FileAudio className="h-8 w-8" />
    if (type === 'video') return <FileVideo className="h-8 w-8" />
    return <Upload className="h-8 w-8" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
          ${file 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (!isProcessing) {
            const input = document.querySelector(`input[data-testid="${type}-input"]`) as HTMLInputElement
            input?.click()
          }
        }}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
          data-testid={`${type}-input`}
        />

        <div className="flex flex-col items-center text-center space-y-4">
          {file ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                {getFileIcon()}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-400">{title} Selected</h3>
                <p className="text-sm text-gray-300 break-all">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </>
          ) : (
            <>
              <div className={`
                flex items-center justify-center w-16 h-16 rounded-full
                ${type === 'audio' ? 'bg-blue-500/20' : 'bg-purple-500/20'}
              `}>
                {icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{subtitle}</p>
                <div className="text-xs text-gray-500">
                  Drag & drop or click to browse
                </div>
              </div>
            </>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <div className="flex items-center space-x-2 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* File type indicator */}
      <div className={`
        absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-medium
        ${type === 'audio' 
          ? 'bg-blue-500 text-white' 
          : 'bg-purple-500 text-white'
        }
      `}>
        {type.toUpperCase()}
      </div>
    </motion.div>
  )
}

export default FileUpload