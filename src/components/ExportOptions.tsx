import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Share, Check, ExternalLink } from 'lucide-react'

interface ExportOptionsProps {
  onExport: () => void
  isExporting: boolean
  videoUrl: string
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  onExport,
  isExporting,
  videoUrl
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Short Video',
          text: 'Check out this video I created!',
          url: videoUrl
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const formatFileSize = (_url: string): string => {
    // This is a placeholder - in a real app you'd calculate the actual size
    return '~5-10MB'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Your Video is Ready!</h3>
        <p className="text-gray-400">
          Your looped video has been processed successfully
        </p>
      </div>

      {/* Video info */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Format:</span>
          <span className="text-white">WebM (VP9)</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Estimated Size:</span>
          <span className="text-white">{formatFileSize(videoUrl)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Quality:</span>
          <span className="text-white">High Definition</span>
        </div>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExport}
          disabled={isExporting}
          className={`
            flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200
            ${isExporting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          <Download className="h-5 w-5" />
          {isExporting ? 'Downloading...' : 'Download Video'}
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Share className="h-5 w-5" />
          Share
        </motion.button>
      </div>

      {/* Additional Options */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">Additional Options</h4>
        
        <div className="grid grid-cols-1 gap-2">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-white">
                {copied ? 'Link Copied!' : 'Copy Video Link'}
              </span>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Your video will loop seamlessly to match your audio length</li>
          <li>• WebM format is optimized for web sharing and social media</li>
          <li>• Download the file to save it permanently</li>
        </ul>
      </div>

      {/* Quality note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Video processed with professional quality settings
        </p>
      </div>
    </motion.div>
  )
}

export default ExportOptions