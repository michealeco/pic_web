import React, { useState, useRef, useEffect } from 'react'
import {
  Check,
  Download,
  Eye,
  Image as ImageIcon,
  MoreVertical,
  RotateCcw,
  Share2,
  Star,
  Trash2,
  Wand2,
} from 'lucide-react'

export function PhotoCard({
  photo,
  selected,
  onToggleSelect,
  onPreview,
  onToggleStar,
  onMoveToTrash,
  onRestoreFromTrash,
  onDownload,
  onShare,
  view = 'grid',
  isTrashView = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isEnhanced = photo.name.includes('Enhanced-SR')

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleCardClick = (e) => {
    // If user clicked action buttons or checkbox, don't trigger
    if (e.target.closest('.card-action-btn') || e.target.closest('.popover-menu')) {
      return
    }
    // On mobile screens, tap thumbnail to preview
    if (window.innerWidth <= 768) {
      onPreview(photo)
    } else {
      onToggleSelect(photo.id)
    }
  }

  const handleDoubleClick = () => {
    onPreview(photo)
  }

  return (
    <article
      className={`photo-card ${view}-mode ${selected ? 'selected' : ''} ${photo.starred ? 'is-starred' : ''}`}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
    >
      <div className="thumb-container">
        <img src={photo.url} alt={photo.name} loading="lazy" />

        <div
          className={`select-check ${selected ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(photo.id)
          }}
          title={selected ? 'Deselect photo' : 'Select photo'}
        >
          <Check size={13} />
        </div>

        {!isTrashView && (
          <button
            className={`star-btn card-action-btn ${photo.starred ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(photo.id)
            }}
            title={photo.starred ? 'Unstar photo' : 'Star photo'}
          >
            <Star size={15} fill={photo.starred ? 'currentColor' : 'none'} />
          </button>
        )}

        {isEnhanced && (
          <span className="badge-hd" title="AI Enhanced Super Resolution">
            <Wand2 size={11} />
            <span>HD</span>
          </span>
        )}
      </div>

      <div className="card-details">
        <div className="card-name-row">
          <ImageIcon size={16} className="file-icon" />
          <span className="file-name" title={photo.name}>
            {photo.name}
          </span>
        </div>

        <div className="card-sub-info">
          <span>{photo.modified}</span>
          <span className="dot-sep">•</span>
          <span>{photo.size.toFixed(1)} MB</span>
        </div>
      </div>

      <div className="card-popover-wrapper" ref={menuRef}>
        <button
          className="more-options-btn card-action-btn"
          aria-label="More options"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((prev) => !prev)
          }}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <div className="popover-menu animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setMenuOpen(false)
                onPreview(photo)
              }}
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>

            {!isTrashView ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleStar(photo.id)
                  }}
                >
                  <Star size={15} fill={photo.starred ? 'currentColor' : 'none'} />
                  <span>{photo.starred ? 'Remove Star' : 'Add Star'}</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDownload(photo)
                  }}
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onShare(photo)
                  }}
                >
                  <Share2 size={15} />
                  <span>Share link</span>
                </button>

                <div className="menu-divider" />

                <button
                  className="menu-danger"
                  onClick={() => {
                    setMenuOpen(false)
                    onMoveToTrash(photo.id)
                  }}
                >
                  <Trash2 size={15} />
                  <span>Move to Trash</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onRestoreFromTrash(photo.id)
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Restore photo</span>
                </button>

                <div className="menu-divider" />

                <button
                  className="menu-danger"
                  onClick={() => {
                    setMenuOpen(false)
                    onMoveToTrash(photo.id, true) // permanent delete
                  }}
                >
                  <Trash2 size={15} />
                  <span>Delete permanently</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
