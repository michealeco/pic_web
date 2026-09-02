import React from 'react'
import {
  Download,
  RotateCcw,
  Star,
  Trash2,
  X,
  Layers,
} from 'lucide-react'

export function BatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchStar,
  onBatchDownload,
  onBatchTrash,
  onBatchRestore,
  isTrashView = false,
}) {
  if (selectedCount === 0) return null

  return (
    <div className="batch-action-bar animate-slide-up">
      <div className="batch-count-group">
        <button
          className="batch-close-btn"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <X size={18} />
        </button>
        <span className="batch-count-text">
          <Layers size={16} className="text-brand" />
          <strong>{selectedCount}</strong> {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      <div className="batch-actions">
        {!isTrashView ? (
          <>
            <button className="batch-btn batch-btn-primary" onClick={onBatchDownload}>
              <Download size={16} />
              <span>Download ({selectedCount})</span>
            </button>

            <button className="batch-btn" onClick={() => onBatchStar(true)}>
              <Star size={16} />
              <span>Star</span>
            </button>

            <button className="batch-btn" onClick={() => onBatchStar(false)}>
              <Star size={16} className="opacity-50" />
              <span>Unstar</span>
            </button>

            <button className="batch-btn batch-btn-danger" onClick={onBatchTrash}>
              <Trash2 size={16} />
              <span>Trash</span>
            </button>
          </>
        ) : (
          <>
            <button className="batch-btn batch-btn-primary" onClick={onBatchRestore}>
              <RotateCcw size={16} />
              <span>Restore Selected</span>
            </button>

            <button className="batch-btn batch-btn-danger" onClick={onBatchTrash}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
