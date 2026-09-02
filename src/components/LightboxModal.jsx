import React, { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Maximize2,
  Play,
  Pause,
  RotateCw,
  Share2,
  Star,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Calendar,
  HardDrive,
  FileCode,
  Sparkles,
} from 'lucide-react'

export function LightboxModal({
  photo,
  photosList,
  onClose,
  onNavigate,
  onToggleStar,
  onDownload,
  onShare,
  onMoveToTrash,
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentIndex = photosList.findIndex((p) => p.id === photo.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photosList.length - 1

  // Reset zoom & rotation when photo changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
  }, [photo.id])

  // Slideshow auto advance
  useEffect(() => {
    let timer
    if (isPlaying) {
      timer = setInterval(() => {
        if (hasNext) {
          onNavigate(photosList[currentIndex + 1])
        } else {
          onNavigate(photosList[0]) // loop back
        }
      }, 3000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, currentIndex, photosList, hasNext, onNavigate])

  // Keyboard navigation shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(photosList[currentIndex - 1])
      if (e.key === 'ArrowRight' && hasNext) onNavigate(photosList[currentIndex + 1])
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, photosList, hasPrev, hasNext, onClose, onNavigate])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.5))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
  }

  const isEnhanced = photo.name.includes('Enhanced-SR')
  const estimatedWidth = isEnhanced ? '5760' : '3840'
  const estimatedHeight = isEnhanced ? '3840' : '2560'

  const [touchStart, setTouchStart] = useState(null)

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (diff > 50 && hasNext) {
      onNavigate(photosList[currentIndex + 1])
    } else if (diff < -50 && hasPrev) {
      onNavigate(photosList[currentIndex - 1])
    }
    setTouchStart(null)
  }

  return (
    <div className="lightbox-backdrop animate-fade-in" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <header className="lightbox-topbar">
          <div className="lightbox-title-group">
            <span className="lightbox-filename" title={photo.name}>
              {photo.name}
            </span>
            {isEnhanced && <span className="badge-hd-pill">AI Enhanced SR</span>}
          </div>

          <div className="lightbox-actions">
            <button
              className={`lb-btn ${isPlaying ? 'lb-btn-active' : ''}`}
              onClick={() => setIsPlaying((prev) => !prev)}
              title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              className={`lb-btn ${photo.starred ? 'lb-btn-active' : ''}`}
              onClick={() => onToggleStar(photo.id)}
              title={photo.starred ? 'Unstar photo' : 'Star photo'}
            >
              <Star size={18} fill={photo.starred ? 'currentColor' : 'none'} />
            </button>

            <a
              href={photo.url}
              download={photo.name}
              target="_blank"
              rel="noopener noreferrer"
              className="lb-btn"
              onClick={() => onDownload(photo)}
              title="Download image"
            >
              <Download size={18} />
            </a>

            <button
              className="lb-btn"
              onClick={() => onShare(photo)}
              title="Share link"
            >
              <Share2 size={18} />
            </button>

            <button
              className={`lb-btn ${showDetails ? 'lb-btn-active' : ''}`}
              onClick={() => setShowDetails((prev) => !prev)}
              title="Toggle Info Sidebar"
            >
              <Info size={18} />
            </button>

            <button
              className="lb-btn lb-btn-danger"
              onClick={() => {
                onMoveToTrash(photo.id)
                onClose()
              }}
              title="Move to trash"
            >
              <Trash2 size={18} />
            </button>

            <div className="lb-divider" />

            <button className="lb-close-btn" onClick={onClose} title="Close preview (Esc)">
              <X size={22} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div
          className="lightbox-body"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Prev */}
          <button
            className={`lb-nav-btn lb-nav-prev ${!hasPrev ? 'disabled' : ''}`}
            onClick={() => hasPrev && onNavigate(photosList[currentIndex - 1])}
            disabled={!hasPrev}
            title="Previous image (Left arrow)"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Image Viewport */}
          <div className="lightbox-viewport">
            <img
              src={photo.url}
              alt={photo.name}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Navigation Next */}
          <button
            className={`lb-nav-btn lb-nav-next ${!hasNext ? 'disabled' : ''}`}
            onClick={() => hasNext && onNavigate(photosList[currentIndex + 1])}
            disabled={!hasNext}
            title="Next image (Right arrow)"
          >
            <ChevronRight size={28} />
          </button>

          {/* Details Sidebar */}
          {showDetails && (
            <aside className="lightbox-sidebar animate-pop-in">
              <div className="sidebar-header">
                <h3>Image Information</h3>
                <button
                  className="icon-button"
                  onClick={() => setShowDetails(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="sidebar-details-list">
                <div className="detail-item">
                  <FileCode size={16} className="detail-icon" />
                  <div>
                    <div className="detail-label">Filename</div>
                    <div className="detail-value">{photo.name}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <HardDrive size={16} className="detail-icon" />
                  <div>
                    <div className="detail-label">File Size</div>
                    <div className="detail-value">{photo.size.toFixed(2)} MB</div>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar size={16} className="detail-icon" />
                  <div>
                    <div className="detail-label">Date Modified</div>
                    <div className="detail-value">{photo.modified}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <Maximize2 size={16} className="detail-icon" />
                  <div>
                    <div className="detail-label">Resolution</div>
                    <div className="detail-value">
                      {estimatedWidth} × {estimatedHeight} px
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <Sparkles size={16} className="detail-icon" />
                  <div>
                    <div className="detail-label">Format / Processing</div>
                    <div className="detail-value">
                      {isEnhanced ? 'Super-Resolution Upscaled JPEG' : 'Fujifilm FinePix Digital JPEG'}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Bottom Floating Control Bar */}
        <footer className="lightbox-toolbar">
          <span className="lb-counter">
            {currentIndex + 1} / {photosList.length}
          </span>

          <div className="lb-toolbar-controls">
            <button className="lb-tool-btn" onClick={handleZoomOut} title="Zoom out">
              <ZoomOut size={17} />
            </button>
            <span className="lb-zoom-text">{Math.round(zoom * 100)}%</span>
            <button className="lb-tool-btn" onClick={handleZoomIn} title="Zoom in">
              <ZoomIn size={17} />
            </button>
            <button className="lb-tool-btn" onClick={handleRotate} title="Rotate 90°">
              <RotateCw size={17} />
            </button>
            <button className="lb-tool-btn" onClick={handleResetZoom} title="Reset view">
              <Maximize2 size={17} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
