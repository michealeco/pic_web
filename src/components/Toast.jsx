import React, { useEffect } from 'react'
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      onClose()
    }, 3200)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const getIcon = () => {
    if (toast.type === 'error') return <AlertCircle size={18} className="toast-icon-error" />
    if (toast.type === 'info') return <Info size={18} className="toast-icon-info" />
    return <CheckCircle2 size={18} className="toast-icon-success" />
  }

  return (
    <div className={`toast-banner animate-slide-up toast-${toast.type || 'success'}`}>
      {getIcon()}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-dismiss" onClick={onClose} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  )
}
