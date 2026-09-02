import React, { useMemo, useState, useEffect } from 'react'
import {
  ImageIcon,
  Upload,
} from 'lucide-react'
import './App.css'

import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { Toolbar } from './components/Toolbar'
import { PhotoCard } from './components/PhotoCard'
import { BatchActionBar } from './components/BatchActionBar'
import { LightboxModal } from './components/LightboxModal'
import { UploadModal } from './components/UploadModal'
import { StorageModal } from './components/StorageModal'
import { Toast } from './components/Toast'

// Load all local image files in images/ folder dynamically
const imageModules = import.meta.glob('../images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const defaultPhotos = Object.entries(imageModules).map(([path, url], index) => {
  const fileName = path.split('/').pop()
  const isEnhanced = fileName.includes('Enhanced-SR')
  return {
    id: fileName,
    name: fileName,
    url,
    size: isEnhanced ? 3.8 + (index % 5) * 0.2 : 1.1 + ((index * 17) % 18) / 10,
    modified: index < 10 ? 'Today' : index < 25 ? 'Yesterday' : 'Aug 28, 2026',
    type: 'JPG image',
    starred: index % 7 === 0,
    trashed: false,
  }
})

// Helper to trigger file download
async function downloadSinglePhoto(photo) {
  try {
    const response = await fetch(photo.url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = photo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  } catch (err) {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export default function App() {
  // Persistence in localStorage
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('picspace_photos_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge with default photos in case local files exist
        const savedMap = new Map(parsed.map((p) => [p.id, p]))
        return defaultPhotos.map((def) => {
          if (savedMap.has(def.id)) {
            return { ...def, ...savedMap.get(def.id) }
          }
          return def
        })
      }
    } catch (e) {
      console.warn('Could not load photos state from localStorage', e)
    }
    return defaultPhotos
  })

  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('My Drive')
  const [activeAlbum, setActiveAlbum] = useState('all')
  const [sort, setSort] = useState('Last modified')
  const [view, setView] = useState('grid')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [theme, setTheme] = useState(() => localStorage.getItem('picspace_theme') || 'light')
  
  // Modals & Overlays
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Save photos state change
  useEffect(() => {
    try {
      localStorage.setItem('picspace_photos_v1', JSON.stringify(photos))
    } catch (e) {
      console.warn('Could not save to localStorage', e)
    }
  }, [photos])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('picspace_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} theme`, 'info')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Filter photos based on search query, active nav, and active album
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // Search matching
      const matchesQuery = photo.name.toLowerCase().includes(query.toLowerCase())
      if (!matchesQuery) return false

      // Trash view filtering
      if (activeNav === 'Trash') {
        return photo.trashed
      }
      
      // For non-trash views, ignore trashed photos
      if (photo.trashed) return false

      // Starred view
      if (activeNav === 'Starred') {
        return photo.starred
      }

      // Recent view (photos modified Today or Yesterday)
      if (activeNav === 'Recent') {
        return photo.modified === 'Today' || photo.modified === 'Yesterday' || photo.modified === 'Just now'
      }

      // Album filtering under 'My Drive'
      if (activeNav === 'My Drive') {
        if (activeAlbum === 'enhanced') return photo.name.includes('Enhanced-SR')
        if (activeAlbum === 'standard') return !photo.name.includes('Enhanced-SR')
      }

      return true
    }).sort((a, b) => {
      if (sort === 'Name') return a.name.localeCompare(b.name)
      if (sort === 'File size') return b.size - a.size
      return 0 // default last modified order
    })
  }, [photos, query, activeNav, activeAlbum, sort])

  // Multi-selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredPhotos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  // Action handlers
  const handleToggleStar = (id) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p))
    )
    const target = photos.find((p) => p.id === id)
    if (target) {
      showToast(target.starred ? 'Removed from Starred' : 'Added to Starred')
    }
  }

  const handleMoveToTrash = (id, permanent = false) => {
    if (permanent) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      showToast('Photo permanently deleted', 'error')
    } else {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, trashed: true } : p))
      )
      showToast('Photo moved to Trash')
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleRestoreFromTrash = (id) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, trashed: false } : p))
    )
    showToast('Photo restored to library')
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleDownload = (photo) => {
    downloadSinglePhoto(photo)
    showToast(`Downloading ${photo.name}...`)
  }

  const handleShare = (photo) => {
    navigator.clipboard?.writeText?.(window.location.href)
    showToast('Image share link copied to clipboard!')
  }

  // Batch actions
  const handleBatchStar = (starredStatus) => {
    setPhotos((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, starred: starredStatus } : p))
    )
    showToast(`${selectedIds.size} photo(s) ${starredStatus ? 'starred' : 'unstarred'}`)
    setSelectedIds(new Set())
  }

  const handleBatchDownload = async () => {
    const selectedPhotosList = photos.filter((p) => selectedIds.has(p.id))
    showToast(`Downloading ${selectedPhotosList.length} photos...`)
    for (const photo of selectedPhotosList) {
      await downloadSinglePhoto(photo)
      // Small pause between downloads so browser doesn't block
      await new Promise((r) => setTimeout(r, 250))
    }
    setSelectedIds(new Set())
  }

  const handleBatchTrash = () => {
    const count = selectedIds.size
    const isTrash = activeNav === 'Trash'
    if (isTrash) {
      setPhotos((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      showToast(`${count} photo(s) permanently deleted`, 'error')
    } else {
      setPhotos((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, trashed: true } : p))
      )
      showToast(`${count} photo(s) moved to Trash`)
    }
    setSelectedIds(new Set())
  }

  const handleBatchRestore = () => {
    const count = selectedIds.size
    setPhotos((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, trashed: false } : p))
    )
    showToast(`${count} photo(s) restored to library`)
    setSelectedIds(new Set())
  }

  const handleEmptyTrash = () => {
    const trashedCount = photos.filter((p) => p.trashed).length
    if (trashedCount === 0) return
    setPhotos((prev) => prev.filter((p) => !p.trashed))
    showToast(`Emptied trash (${trashedCount} items deleted)`, 'error')
    if (showStorageModal) setShowStorageModal(false)
  }

  const handleNewUploads = (newPhotos) => {
    setPhotos((prev) => [...newPhotos, ...prev])
    showToast(`Successfully uploaded ${newPhotos.length} photo(s)`)
  }

  const starredCount = useMemo(() => photos.filter((p) => p.starred && !p.trashed).length, [photos])
  const trashCount = useMemo(() => photos.filter((p) => p.trashed).length, [photos])

  return (
    <main className="drive-app">
      <Navbar
        query={query}
        setQuery={setQuery}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        totalCount={photos.filter((p) => !p.trashed).length}
        onOpenStorageModal={() => setShowStorageModal(true)}
      />

      <div className="workspace">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeAlbum={activeAlbum}
          setActiveAlbum={setActiveAlbum}
          customAlbums={[]}
          onOpenUploadModal={() => setShowUploadModal(true)}
          onOpenStorageModal={() => setShowStorageModal(true)}
          onEmptyTrash={handleEmptyTrash}
          trashCount={trashCount}
          starredCount={starredCount}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        <section className="content">
          <Toolbar
            activeNav={activeNav}
            activeAlbum={activeAlbum}
            itemCount={filteredPhotos.length}
            sort={sort}
            setSort={setSort}
            view={view}
            setView={setView}
            allSelected={filteredPhotos.length > 0 && selectedIds.size === filteredPhotos.length}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenUploadModal={() => setShowUploadModal(true)}
          />

          {filteredPhotos.length > 0 ? (
            <div className={`photo-gallery-${view}`}>
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  selected={selectedIds.has(photo.id)}
                  onToggleSelect={handleToggleSelect}
                  onPreview={(p) => setLightboxPhoto(p)}
                  onToggleStar={handleToggleStar}
                  onMoveToTrash={handleMoveToTrash}
                  onRestoreFromTrash={handleRestoreFromTrash}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  view={view}
                  isTrashView={activeNav === 'Trash'}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-box animate-fade-in">
              <ImageIcon size={48} className="empty-icon" />
              <h2>No photos found</h2>
              <p>
                {query
                  ? `No photos matching "${query}". Try adjusting your search term.`
                  : activeNav === 'Trash'
                  ? 'Your trash bin is empty.'
                  : activeNav === 'Starred'
                  ? 'You haven’t starred any photos yet. Click the star icon on any photo to save it here!'
                  : 'No media items in this view.'}
              </p>
              {activeNav === 'My Drive' && (
                <button
                  className="upload-btn-secondary"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={16} />
                  <span>Upload Photos Now</span>
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Floating Batch Actions Bar */}
      <BatchActionBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBatchStar={handleBatchStar}
        onBatchDownload={handleBatchDownload}
        onBatchTrash={handleBatchTrash}
        onBatchRestore={handleBatchRestore}
        isTrashView={activeNav === 'Trash'}
      />

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <LightboxModal
          photo={lightboxPhoto}
          photosList={filteredPhotos}
          onClose={() => setLightboxPhoto(null)}
          onNavigate={(p) => setLightboxPhoto(p)}
          onToggleStar={handleToggleStar}
          onDownload={handleDownload}
          onShare={handleShare}
          onMoveToTrash={handleMoveToTrash}
        />
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleNewUploads}
        />
      )}

      {/* Storage Breakdown Modal */}
      {showStorageModal && (
        <StorageModal
          photos={photos}
          trashCount={trashCount}
          onClose={() => setShowStorageModal(false)}
          onEmptyTrash={handleEmptyTrash}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  )
}
