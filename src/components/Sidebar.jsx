import React from 'react'
import {
  Clock3,
  HardDrive,
  Plus,
  Star,
  Trash2,
  FolderHeart,
  Wand2,
  Layers,
  Upload,
  PieChart,
} from 'lucide-react'

export function Sidebar({
  activeNav,
  setActiveNav,
  activeAlbum,
  setActiveAlbum,
  customAlbums,
  onOpenUploadModal,
  onOpenStorageModal,
  onEmptyTrash,
  trashCount,
  starredCount,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) {
  const mainNavItems = [
    { id: 'My Drive', label: 'My Drive', icon: HardDrive },
    { id: 'Recent', label: 'Recent', icon: Clock3 },
    { id: 'Starred', label: 'Starred', icon: Star, badge: starredCount },
    { id: 'Trash', label: 'Trash', icon: Trash2, badge: trashCount },
  ]

  const smartAlbums = [
    { id: 'all', label: 'All Media', icon: Layers },
    { id: 'enhanced', label: 'Enhanced SR (HD)', icon: Wand2 },
    { id: 'standard', label: 'Standard JPEGs', icon: FolderHeart },
  ]

  const handleNavSelect = (id) => {
    setActiveNav(id)
    if (mobileSidebarOpen) setMobileSidebarOpen(false)
  }

  const handleAlbumSelect = (albumId) => {
    setActiveNav('My Drive')
    setActiveAlbum(albumId)
    if (mobileSidebarOpen) setMobileSidebarOpen(false)
  }

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-actions">
          <button className="btn-primary new-btn" onClick={onOpenUploadModal}>
            <Plus size={20} />
            <span>Upload Photo</span>
          </button>
        </div>

        <nav className="nav-section">
          <div className="nav-group-label">Library</div>
          {mainNavItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? 'active' : ''}`}
              onClick={() => handleNavSelect(id)}
            >
              <Icon size={18} />
              <span className="nav-label">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className={`nav-badge ${id === 'Trash' ? 'badge-trash' : ''}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-section">
          <div className="nav-group-label">Smart Albums</div>
          {smartAlbums.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === 'My Drive' && activeAlbum === id ? 'active' : ''}`}
              onClick={() => handleAlbumSelect(id)}
            >
              <Icon size={17} />
              <span className="nav-label">{label}</span>
            </button>
          ))}

          {customAlbums.length > 0 && (
            <>
              <div className="nav-group-label mt-3">Custom Albums</div>
              {customAlbums.map((album) => (
                <button
                  key={album}
                  className={`nav-item ${activeNav === 'My Drive' && activeAlbum === album ? 'active' : ''}`}
                  onClick={() => handleAlbumSelect(album)}
                >
                  <FolderHeart size={17} />
                  <span className="nav-label">{album}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {activeNav === 'Trash' && trashCount > 0 && (
          <div className="trash-warning-box">
            <p>Items in Trash are permanently deleted after 30 days.</p>
            <button className="btn-empty-trash" onClick={onEmptyTrash}>
              <Trash2 size={15} />
              <span>Empty Trash</span>
            </button>
          </div>
        )}

        <div className="storage-widget" onClick={onOpenStorageModal}>
          <div className="storage-header">
            <div className="storage-title">
              <PieChart size={16} />
              <span>Storage</span>
            </div>
            <span className="storage-percent">28%</span>
          </div>
          <div className="storage-bar">
            <div className="storage-progress" style={{ width: '28%' }} />
          </div>
          <p className="storage-text">28.4 GB of 100 GB used</p>
          <button className="storage-link">Manage storage</button>
        </div>
      </aside>
    </>
  )
}
