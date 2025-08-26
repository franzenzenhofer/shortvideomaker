# CLAUDE.md - ShortVideoMaker v1.0 - 10X Video Production Platform

## 🎯 MISSION: PROFESSIONAL VIDEO CREATION
**Mobile-First Short Video Maker for Music Videos**
- Combines audio (MP3) with short video clips
- Loops video seamlessly to match audio duration
- One-click export with professional quality
- Instant preview with real-time controls
- 100% browser-based, no server processing needed

## 🚀 KEY FEATURES
1. **Audio-First Workflow**: Upload MP3, then add video
2. **Smart Video Looping**: Seamless transitions at loop points
3. **Frame-Accurate Sync**: Perfect audio-video alignment
4. **Mobile Optimized**: Touch gestures, swipe controls
5. **Progressive Export**: See progress while rendering
6. **Multiple Quality Options**: 720p, 1080p, 4K export
7. **PWA Installable**: Works offline after first load
8. **Zero Upload**: All processing happens in-browser

## 📱 MOBILE-FIRST DESIGN
- **Touch Gestures**: Pinch to zoom, swipe to seek
- **Bottom Sheet UI**: Easy thumb access on mobile
- **Floating Action Buttons**: Primary actions always visible
- **Responsive Layout**: Adapts to any screen size
- **Haptic Feedback**: Physical response on interactions
- **Dark Mode**: Comfortable viewing in any light

## 🛠️ TECHNICAL ARCHITECTURE

### Core Video Engine (`/src/core/`)
1. **VideoProcessor.ts**: Main processing pipeline
   - Canvas-based frame extraction
   - WebCodecs API for encoding
   - MP4 muxing with mp4box.js

2. **AudioProcessor.ts**: Audio handling
   - Web Audio API for analysis
   - Duration extraction
   - Waveform visualization

3. **LoopEngine.ts**: Smart looping algorithm
   - Seamless transition detection
   - Crossfade at loop points
   - Frame-perfect synchronization

### Frontend Stack
- **React 18** with TypeScript (strict mode)
- **Tailwind CSS** for responsive design
- **Framer Motion** for animations
- **Vite** for fast builds
- **PWA** with service workers

### Video Processing
- **Input**: MP3 audio + MP4/WebM/MOV video
- **Processing**: Client-side only (WebCodecs API)
- **Output**: MP4 with H.264/AAC encoding
- **Max Size**: 500MB files supported

### Deployment Infrastructure
- **Cloudflare Workers** for edge serving
- **KV Storage** for project metadata
- **Static Assets** served from edge
- **Domain**: shortvideomaker.franzai.com

## 📋 COMMANDS

### Development
```bash
npm run dev          # Start dev server (Vite :3000, Worker :8787)
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run test:all     # Run all tests
npm run test:coverage # Generate coverage report
```

### Deployment
```bash
npm run deploy       # Full deployment with tests (REQUIRED)
npm run deploy:preview # Deploy to preview environment
wrangler tail        # Monitor live logs
```

### Code Quality
```bash
npm run lint         # ESLint with zero warnings
npm run typecheck    # TypeScript strict mode
npm run format       # Prettier formatting
```

## 🎥 VIDEO PROCESSING PIPELINE

### 1. File Upload Stage
```typescript
// Validate and load files
validateAudio(file) // MP3, M4A, WAV
validateVideo(file) // MP4, WebM, MOV
extractMetadata()   // Duration, codec, resolution
```

### 2. Processing Stage
```typescript
// Core processing loop
1. Extract audio duration
2. Load video into canvas
3. Calculate loop count needed
4. Generate frame sequence
5. Apply crossfade at loop points
6. Encode with WebCodecs
7. Mux audio + video
8. Generate download blob
```

### 3. Export Options
- **720p**: Fast export, smaller file
- **1080p**: Default quality
- **4K**: Maximum quality (if source supports)

## 🔒 SECURITY & LIMITS
- **File Size**: 500MB maximum per file
- **Duration**: 10 minutes maximum output
- **Processing**: 100% client-side (no uploads)
- **Storage**: IndexedDB for temporary data
- **Memory**: Chunked processing for large files

## 🎨 UI/UX COMPONENTS

### Mobile Components (`/src/components/mobile/`)
- `FileUploadZone.tsx` - Drag & drop with visual feedback
- `VideoPreview.tsx` - Touch-enabled player
- `ProgressRing.tsx` - Circular progress indicator
- `BottomSheet.tsx` - Swipeable options panel
- `FloatingActionButton.tsx` - Primary action trigger

### Desktop Components (`/src/components/desktop/`)
- `Timeline.tsx` - Visual audio waveform
- `VideoControls.tsx` - Full playback controls
- `QualitySelector.tsx` - Export options
- `ProgressBar.tsx` - Linear progress

## 🧪 TESTING STRATEGY

### Unit Tests (`/src/__tests__/`)
- Video processing functions
- Audio duration extraction
- Loop calculation logic
- File validation

### E2E Tests (`/tests/e2e/`)
- Full upload to download flow
- Mobile gesture interactions
- Cross-browser compatibility
- PWA installation

## 📊 PERFORMANCE TARGETS
- **First Load**: < 3 seconds
- **Processing Start**: < 1 second
- **Export Speed**: Real-time or faster
- **Memory Usage**: < 2GB for 500MB files
- **Browser Support**: Chrome 90+, Safari 15+, Firefox 95+

## 🚀 DEPLOYMENT CHECKLIST
1. ✅ All tests passing (unit + E2E)
2. ✅ TypeScript strict mode (no errors)
3. ✅ ESLint zero warnings
4. ✅ Lighthouse score > 95
5. ✅ Mobile responsiveness verified
6. ✅ Cross-browser tested
7. ✅ PWA manifest valid
8. ✅ Service worker registered

## 📝 KEY FILES
```
/src/
├── App.tsx                 # Main app component
├── core/
│   ├── VideoProcessor.ts   # Video processing engine
│   ├── AudioProcessor.ts   # Audio handling
│   └── LoopEngine.ts      # Looping algorithm
├── components/
│   ├── mobile/            # Mobile-specific UI
│   └── desktop/           # Desktop-enhanced UI
├── hooks/
│   ├── useVideoProcessor.ts
│   ├── useAudioAnalyzer.ts
│   └── useExporter.ts
├── utils/
│   ├── fileValidation.ts
│   ├── memoryManager.ts
│   └── progressTracker.ts
└── worker.js              # Cloudflare Worker

## 🎯 CRITICAL SUCCESS FACTORS
1. **Seamless Loops**: No visible cuts or jumps
2. **Perfect Sync**: Audio and video stay aligned
3. **Fast Export**: Real-time or better
4. **Mobile First**: Touch-optimized interface
5. **Zero Upload**: Everything processes locally

## ⚡ QUICK START
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build and deploy
npm run deploy  # ALWAYS use this, never wrangler deploy directly
```

## 🏆 SUCCESS METRICS
- Sub-second interaction response
- 60fps preview playback
- < 5 second export for 1-minute video
- 95+ Lighthouse score
- Zero runtime errors
- 100% mobile responsive

**Remember: This is a 10X product. Every interaction should feel instant, every export should be professional quality, and the mobile experience must be flawless.**