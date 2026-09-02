import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'

export function UploadModal({ onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'))
    setSelectedFiles((prev) => [...prev, ...validImages])
  }

  const startUpload = () => {
    if (selectedFiles.length === 0) return
    setIsUploading(true)
    setProgress(15)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          setTimeout(() => {
            // Process files
            const newPhotos = selectedFiles.map((file, idx) => ({
              id: `upload-${Date.now()}-${idx}-${file.name}`,
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size / (1024 * 1024),
              modified: 'Just now',
              type: file.type || 'JPG image',
              starred: false,
              trashed: false,
            }))
            onUploadSuccess(newPhotos)
            onClose()
          }, 400)
          return 100
        }
        return prev + 20
      })
    }, 180)
  }

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog upload-dialog animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Upload size={20} className="text-brand" />
            <h2>Upload Photos</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden-file-input"
              onChange={handleChange}
            />
            <div className="dropzone-icon">
              <Upload size={32} />
            </div>
            <h3>Drag & Drop photos here</h3>
            <p>or click to browse from your device</p>
            <span className="dropzone-hint">Supports JPEG, PNG, WebP & RAW images</span>
          </div>

          {selectedFiles.length > 0 && (
            <div className="file-preview-list">
              <div className="file-list-header">
                <span>Files ready to upload ({selectedFiles.length})</span>
                <button className="btn-clear-files" onClick={() => setSelectedFiles([])}>
                  Clear all
                </button>
              </div>
              <div className="file-items-scroll">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="file-preview-item">
                    <ImageIcon size={18} className="text-brand" />
                    <span className="file-preview-name">{file.name}</span>
                    <span className="file-preview-size">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="upload-progress-box">
              <div className="progress-label">
                <span>Uploading {selectedFiles.length} item(s)...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={startUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Photos`}
          </button>
        </div>
      </div>
    </div>
  )
}
