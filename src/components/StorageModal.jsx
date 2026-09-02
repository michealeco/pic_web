import React from 'react'
import { PieChart, X, HardDrive, Wand2, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react'

export function StorageModal({ photos, trashCount, onClose, onEmptyTrash }) {
  const activePhotos = photos.filter((p) => !p.trashed)
  const trashedPhotos = photos.filter((p) => p.trashed)

  const enhancedPhotos = activePhotos.filter((p) => p.name.includes('Enhanced-SR'))
  const standardPhotos = activePhotos.filter((p) => !p.name.includes('Enhanced-SR'))

  const enhancedSize = enhancedPhotos.reduce((acc, p) => acc + p.size, 0) / 1024 // GB
  const standardSize = standardPhotos.reduce((acc, p) => acc + p.size, 0) / 1024 // GB
  const trashSize = trashedPhotos.reduce((acc, p) => acc + p.size, 0) / 1024 // GB

  const totalUsedGB = 28.4 + (enhancedSize + standardSize + trashSize)
  const totalCapacityGB = 100
  const usedPercent = Math.round((totalUsedGB / totalCapacityGB) * 100)

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog storage-dialog animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <PieChart size={20} className="text-brand" />
            <h2>Storage Breakdown</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="storage-summary-card">
            <div className="storage-summary-info">
              <span className="used-gigabytes">{totalUsedGB.toFixed(1)} GB</span>
              <span className="total-gigabytes">of {totalCapacityGB} GB used</span>
            </div>

            <div className="storage-multi-bar">
              <div className="bar-segment seg-enhanced" style={{ width: '14%' }} title="Enhanced SR Photos" />
              <div className="bar-segment seg-standard" style={{ width: '12%' }} title="Standard Photos" />
              <div className="bar-segment seg-trash" style={{ width: '2%' }} title="Trash" />
            </div>
            <p className="storage-hint">You have {100 - usedPercent}% space remaining in your Picspace Cloud.</p>
          </div>

          <div className="storage-breakdown-list">
            <div className="storage-item">
              <div className="storage-item-icon icon-enhanced">
                <Wand2 size={18} />
              </div>
              <div className="storage-item-details">
                <div className="item-title">Enhanced SR Photos</div>
                <div className="item-sub">{enhancedPhotos.length} items • High resolution</div>
              </div>
              <div className="storage-item-size">{(enhancedSize * 1024).toFixed(1)} MB</div>
            </div>

            <div className="storage-item">
              <div className="storage-item-icon icon-standard">
                <ImageIcon size={18} />
              </div>
              <div className="storage-item-details">
                <div className="item-title">Standard Photos</div>
                <div className="item-sub">{standardPhotos.length} items • Original JPEG</div>
              </div>
              <div className="storage-item-size">{(standardSize * 1024).toFixed(1)} MB</div>
            </div>

            <div className="storage-item">
              <div className="storage-item-icon icon-trash">
                <Trash2 size={18} />
              </div>
              <div className="storage-item-details">
                <div className="item-title">Trash Bin</div>
                <div className="item-sub">{trashedPhotos.length} items queued for deletion</div>
              </div>
              <div className="storage-item-size">{(trashSize * 1024).toFixed(1)} MB</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {trashCount > 0 && (
            <button className="btn-empty-trash" onClick={onEmptyTrash}>
              <Trash2 size={15} />
              <span>Empty Trash ({trashCount})</span>
            </button>
          )}
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
