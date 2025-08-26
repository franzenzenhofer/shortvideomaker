import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Cog, Download, Loader } from 'lucide-react'

interface ControlsProps {
  canProcess: boolean
  hasProcessedVideo: boolean
  isProcessing: boolean
  isPlaying: boolean
  onProcess: () => void
  onTogglePlayback: () => void
  onExport: () => void
  isExporting: boolean
}

const Controls: React.FC<ControlsProps> = ({
  canProcess,
  hasProcessedVideo,
  isProcessing,
  isPlaying,
  onProcess,
  onTogglePlayback,
  onExport,
  isExporting
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlayback}
        disabled={!hasProcessedVideo && (!canProcess || isProcessing)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200
          ${!hasProcessedVideo && (!canProcess || isProcessing)
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 ml-0.5" />
        ) : (
          <Play className="h-6 w-6 ml-1" />
        )}
      </button>

      {/* Process Button */}
      {!hasProcessedVideo && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onProcess}
          disabled={!canProcess || isProcessing}
          className={`
            flex items-center gap-3 px-8 py-3 rounded-xl font-semibold transition-all duration-200
            ${!canProcess || isProcessing
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Cog className="h-5 w-5" />
              Process Video
            </>
          )}
        </motion.button>
      )}

      {/* Export Button */}
      {hasProcessedVideo && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onExport}
          disabled={isExporting}
          className={`
            flex items-center gap-3 px-8 py-3 rounded-xl font-semibold transition-all duration-200
            ${isExporting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {isExporting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download
            </>
          )}
        </motion.button>
      )}

      {/* Status Text */}
      <div className="text-center sm:text-left sm:ml-auto">
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-blue-400"
          >
            Processing your video...
          </motion.div>
        )}
        {hasProcessedVideo && !isProcessing && !isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-400"
          >
            Video ready for download!
          </motion.div>
        )}
        {!hasProcessedVideo && !isProcessing && canProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400"
          >
            Click &quot;Process Video&quot; to create looped version
          </motion.div>
        )}
        {!canProcess && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            Upload both audio and video files to continue
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Controls