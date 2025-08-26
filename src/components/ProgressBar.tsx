import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = 'Processing...',
  showPercentage = true,
  className = ''
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        {showPercentage && (
          <span className="text-sm font-semibold text-blue-400">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-gray-600/30"></div>
        
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: 'easeOut' 
          }}
          className="relative h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
        </motion.div>

        {/* Progress indicator dot */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${clampedProgress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: 'easeOut' 
          }}
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500"
          style={{ left: `${clampedProgress}%` }}
        />
      </div>

      {/* Progress stages */}
      <div className="flex justify-between mt-4 text-xs text-gray-400">
        <span className={clampedProgress >= 0 ? 'text-blue-400' : ''}>Start</span>
        <span className={clampedProgress >= 25 ? 'text-blue-400' : ''}>25%</span>
        <span className={clampedProgress >= 50 ? 'text-purple-400' : ''}>50%</span>
        <span className={clampedProgress >= 75 ? 'text-pink-400' : ''}>75%</span>
        <span className={clampedProgress >= 100 ? 'text-green-400' : ''}>Complete</span>
      </div>

      {/* Time estimate (placeholder for future enhancement) */}
      {clampedProgress > 0 && clampedProgress < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <span className="text-xs text-gray-500">
            Processing your video, please wait...
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProgressBar