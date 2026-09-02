import React from 'react'
import {
  ChevronRight,
  Grid2X2,
  LayoutGrid,
  List,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react'

export function Toolbar({
  activeNav,
  activeAlbum,
  itemCount,
  sort,
  setSort,
  view,
  setView,
  allSelected,
  onToggleSelectAll,
  onOpenUploadModal,
}) {
  const getNavTitle = () => {
    if (activeNav === 'Starred') return 'Starred Photos'
    if (activeNav === 'Recent') return 'Recent Media'
    if (activeNav === 'Trash') return 'Trash Bin'
    if (activeNav === 'My Drive') {
      if (activeAlbum === 'enhanced') return 'Enhanced SR (HD Photos)'
      if (activeAlbum === 'standard') return 'Standard Photos'
      if (activeAlbum !== 'all') return `Album: ${activeAlbum}`
      return 'Photo Library'
    }
    return activeNav
  }

  return (
    <div className="content-header-container">
      <div className="content-heading">
        <div className="heading-details">
          <div className="breadcrumb">
            <span className="crumb-root">Picspace</span>
            <ChevronRight size={14} className="crumb-sep" />
            <span className="crumb-current">{activeNav}</span>
            {activeAlbum && activeAlbum !== 'all' && (
              <>
                <ChevronRight size={14} className="crumb-sep" />
                <span className="crumb-sub">{activeAlbum}</span>
              </>
            )}
          </div>
          <h1 className="heading-title">{getNavTitle()}</h1>
          <p className="subheading">
            {itemCount} {itemCount === 1 ? 'photo' : 'photos'} available
          </p>
        </div>

        <div className="heading-actions">
          <button className="upload-btn-secondary" onClick={onOpenUploadModal}>
            <Sparkles size={16} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button
            className="select-all-btn"
            onClick={onToggleSelectAll}
            title={allSelected ? 'Deselect all' : 'Select all photos'}
          >
            {allSelected ? (
              <CheckSquare size={18} className="text-brand" />
            ) : (
              <Square size={18} />
            )}
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        <div className="toolbar-right">
          <div className="sort-box">
            <ArrowUpDown size={15} className="sort-icon" />
            <span className="sort-label">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sort-select"
            >
              <option value="Last modified">Last modified</option>
              <option value="Name">Name (A-Z)</option>
              <option value="File size">File size (Largest)</option>
            </select>
          </div>

          <div className="view-divider" />

          <div className="view-switcher">
            <button
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid2X2 size={18} />
            </button>

            <button
              className={`view-btn ${view === 'compact' ? 'active' : ''}`}
              onClick={() => setView('compact')}
              title="Compact Grid view"
              aria-label="Compact Grid view"
            >
              <LayoutGrid size={18} />
            </button>

            <button
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
