import React from 'react'
import {
  Image as ImageIcon,
  Menu,
  Moon,
  Search,
  Sun,
  X,
  Sparkles,
} from 'lucide-react'

export function Navbar({
  query,
  setQuery,
  theme,
  toggleTheme,
  onToggleMobileSidebar,
  totalCount,
  onOpenStorageModal,
}) {
  return (
    <header className="topbar">
      <div className="topbar-row-primary">
        <div className="brand-group">
          <button
            className="icon-button mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={onToggleMobileSidebar}
          >
            <Menu size={20} />
          </button>
          
          <div className="brand">
            <span className="brand-mark">
              <ImageIcon size={20} />
            </span>
            <div className="brand-text">
              <span className="brand-name">Picspace</span>
              <span className="brand-tag">Cloud Library</span>
            </div>
          </div>
        </div>

        <div className="top-actions">
          <button
            className="theme-toggle-btn icon-button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button
            className="icon-button storage-pill-btn"
            onClick={onOpenStorageModal}
            title="View storage statistics"
          >
            <Sparkles size={16} className="text-brand" />
            <span className="count-badge">{totalCount} items</span>
          </button>

          <div className="user-avatar-btn" title="Account Settings (John S.)">
            <span>JS</span>
          </div>
        </div>
      </div>

      <div className="search-wrapper">
        <label className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos by filename, resolution, or tag..."
            aria-label="Search photos"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => setQuery('')}
            >
              <X size={15} />
            </button>
          )}
        </label>
      </div>
    </header>
  )
}
