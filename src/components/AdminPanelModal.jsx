import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  ShieldCheck,
  Globe,
  UserCheck,
  Activity,
  Key,
  Trash2,
  RefreshCw,
  Search,
  Monitor,
  Smartphone,
  MapPin,
  Cpu,
  Clock,
  Compass,
  FileSpreadsheet,
  FileCode,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react'
import {
  getWhoInfo,
  fetchWhereLocation,
  getAccessLogs,
  clearAccessLogs,
  exportLogsToJSON,
  exportLogsToCSV,
  logAccessEvent,
} from '../services/accessTracker'

const ADMIN_PASSCODE = 'admin123'

export function AdminPanelModal({ onClose, activeNav, showToast }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_session_auth') === 'true'
  })
  const [passcode, setPasscode] = useState('')
  const [passError, setPassError] = useState(false)

  const [activeTab, setActiveTab] = useState('overview')
  const [who, setWho] = useState(() => getWhoInfo())
  const [where, setWhere] = useState(null)
  const [loadingWhere, setLoadingWhere] = useState(true)
  const [logs, setLogs] = useState(() => getAccessLogs())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [sessionTime, setSessionTime] = useState(0)

  // Handle PIN authentication submit
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    if (passcode.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem('admin_session_auth', 'true')
      setIsAuthenticated(true)
      setPassError(false)
      showToast?.('Admin Telemetry Unlocked', 'success')
      logAccessEvent('ADMIN_AUTH_SUCCESS', { activeSection: activeNav })
    } else {
      setPassError(true)
      showToast?.('Invalid Admin Passcode', 'error')
    }
  }

  // Handle Logout / Lock
  const handleLockAdmin = () => {
    sessionStorage.removeItem('admin_session_auth')
    setIsAuthenticated(false)
    setPasscode('')
    showToast?.('Admin Panel Locked', 'info')
  }

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load Geolocation on mount
  useEffect(() => {
    let isMounted = true
    setLoadingWhere(true)
    fetchWhereLocation().then((loc) => {
      if (isMounted) {
        setWhere(loc)
        setLoadingWhere(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Refresh logs data
  const handleRefresh = async () => {
    setLoadingWhere(true)
    const newLoc = await fetchWhereLocation()
    setWhere(newLoc)
    setLoadingWhere(false)
    setWho(getWhoInfo())
    setLogs(getAccessLogs())
    showToast?.('Refreshed Admin access telemetry', 'info')
  }

  // Clear logs action
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all recorded access logs?')) {
      clearAccessLogs()
      setLogs([])
      showToast?.('Cleared all access logs', 'error')
    }
  }

  // Export JSON action
  const handleExportJSON = () => {
    const jsonStr = exportLogsToJSON()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access_logs_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast?.('Exported logs to JSON file', 'success')
  }

  // Export CSV action
  const handleExportCSV = () => {
    const csvStr = exportLogsToCSV()
    const blob = new Blob([csvStr], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access_logs_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast?.('Exported logs to CSV file', 'success')
  }

  // Format session timer string
  const formatSessionTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.who.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.where.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.where.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.where.activeSection.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterType === 'NAV') return log.eventType.includes('VIEW') || log.eventType.includes('INIT')
      if (filterType === 'ACTION') return log.eventType.includes('ACTION') || log.eventType.includes('UPLOAD') || log.eventType.includes('TRASH')
      if (filterType === 'ADMIN') return log.eventType.includes('ADMIN')
      return true
    })
  }, [logs, searchQuery, filterType])

  // Analytics Metrics
  const metrics = useMemo(() => {
    const uniqueVisitors = new Set(logs.map((l) => l.who?.visitorId)).size || 1
    const totalLogs = logs.length
    const sectionCounts = logs.reduce((acc, l) => {
      const sec = l.where?.activeSection || 'My Drive'
      acc[sec] = (acc[sec] || 0) + 1
      return acc
    }, {})

    return {
      uniqueVisitors,
      totalLogs,
      sectionCounts,
    }
  }, [logs])

  if (!isAuthenticated) {
    return (
      <div className="admin-overlay animate-fade-in" onClick={onClose}>
        <div
          className="admin-modal admin-auth-modal animate-pop-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="admin-auth-header">
            <div className="admin-badge-glow purple">
              <Lock size={24} />
            </div>
            <h2>Security Authentication Required</h2>
            <p>Enter the admin passcode to unlock system access telemetry & visitor logs.</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="admin-auth-form">
            <div className="auth-input-group">
              <label htmlFor="admin-passcode-input">Admin Passcode</label>
              <div className={`auth-input-wrapper ${passError ? 'error' : ''}`}>
                <Lock size={16} className="auth-icon" />
                <input
                  id="admin-passcode-input"
                  type="password"
                  autoFocus
                  placeholder="Enter passcode (default: admin123)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setPassError(false)
                  }}
                />
                <button type="submit" className="auth-submit-btn">
                  <span>Unlock</span>
                  <ArrowRight size={16} />
                </button>
              </div>
              {passError && <span className="auth-error-msg">Incorrect passcode. Default passcode is admin123.</span>}
            </div>

            <div className="auth-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-overlay animate-fade-in" onClick={onClose}>
      <div
        className="admin-modal animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="admin-header">
          <div className="admin-title-box">
            <div className="admin-badge-glow">
              <ShieldCheck size={22} className="admin-icon" />
            </div>
            <div>
              <div className="admin-header-title-row">
                <h2>Admin Control Panel</h2>
                <span className="live-status-pill">
                  <span className="pulse-dot"></span>
                  LIVE MONITORING
                </span>
              </div>
              <p className="admin-subtitle">
                Access Security Telemetry • Visitor Identification & Geolocation
              </p>
            </div>
          </div>

          <div className="admin-header-actions">
            <button className="icon-btn-rounded" onClick={handleLockAdmin} title="Lock Admin Session">
              <Lock size={16} />
            </button>
            <button className="icon-btn-rounded" onClick={handleRefresh} title="Refresh Telemetry">
              <RefreshCw size={16} className={loadingWhere ? 'animate-spin' : ''} />
            </button>
            <button className="admin-close-btn" onClick={onClose} aria-label="Close Admin Panel">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} />
            <span>Overview</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'who' ? 'active' : ''}`}
            onClick={() => setActiveTab('who')}
          >
            <UserCheck size={16} />
            <span>WHO (User & Device)</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'where' ? 'active' : ''}`}
            onClick={() => setActiveTab('where')}
          >
            <Globe size={16} />
            <span>WHERE (Location & IP)</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Terminal size={16} />
            <span>Access Logs ({logs.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Key size={16} />
            <span>Hotkeys & Info</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="admin-modal-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon-box blue">
                    <UserCheck size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Current Visitor</span>
                    <span className="kpi-value code">{who.visitorId.substring(0, 15)}...</span>
                    <span className="kpi-sub">Role: System Administrator</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box green">
                    <MapPin size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Current Geolocation</span>
                    <span className="kpi-value">
                      {where?.flag} {where?.city || 'Detecting...'}
                    </span>
                    <span className="kpi-sub">{where?.country || 'Fetching IP details'}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box purple">
                    <Globe size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Public IP Address</span>
                    <span className="kpi-value code">{where?.ip || '127.0.0.1'}</span>
                    <span className="kpi-sub">ISP: {where?.isp || 'Local Network'}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box orange">
                    <Clock size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Active Session</span>
                    <span className="kpi-value">{formatSessionTime(sessionTime)}</span>
                    <span className="kpi-sub">{metrics.totalLogs} events logged</span>
                  </div>
                </div>
              </div>

              {/* Quick Details Columns */}
              <div className="admin-two-col">
                <div className="admin-card">
                  <h3>
                    <UserCheck size={18} />
                    <span>WHO Access Summary</span>
                  </h3>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="detail-key">Visitor ID:</span>
                      <span className="detail-val highlight">{who.visitorId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Operating System:</span>
                      <span className="detail-val">{who.os} ({who.platform})</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Web Browser:</span>
                      <span className="detail-val">{who.browserName} {who.browserVersion}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Device Form Factor:</span>
                      <span className="detail-val">{who.deviceType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Screen Resolution:</span>
                      <span className="detail-val">{who.screenResolution}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3>
                    <Globe size={18} />
                    <span>WHERE Access Summary</span>
                  </h3>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="detail-key">Public IP:</span>
                      <span className="detail-val highlight">{where?.ip || 'Fetching...'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Location:</span>
                      <span className="detail-val">
                        {where?.flag} {where?.city}, {where?.region}, {where?.country}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Network Provider (ISP):</span>
                      <span className="detail-val">{where?.isp || 'Detecting...'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Map Coordinates:</span>
                      <span className="detail-val">{where?.latitude}, {where?.longitude}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Active App View:</span>
                      <span className="detail-val badge-blue">{activeNav}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHO */}
          {activeTab === 'who' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="section-intro">
                <h3>Who is Accessing the Web Application</h3>
                <p>
                  Comprehensive visitor identity profile, hardware specifications, user-agent details, and session state.
                </p>
              </div>

              <div className="admin-card primary-border">
                <div className="visitor-identity-header">
                  <div className="avatar-box">
                    <UserCheck size={32} />
                  </div>
                  <div>
                    <h4>Active User Profile</h4>
                    <p className="code-text">ID: {who.visitorId}</p>
                  </div>
                  <div className="role-pill">ADMINISTRATOR</div>
                </div>

                <div className="grid-specs">
                  <div className="spec-item">
                    <div className="spec-icon"><Monitor size={18} /></div>
                    <div>
                      <span className="spec-title">Operating System</span>
                      <span className="spec-value">{who.os} ({who.platform})</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <div className="spec-icon"><Compass size={18} /></div>
                    <div>
                      <span className="spec-title">Web Browser</span>
                      <span className="spec-value">{who.browserName} v{who.browserVersion}</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <div className="spec-icon"><Smartphone size={18} /></div>
                    <div>
                      <span className="spec-title">Device Category</span>
                      <span className="spec-value">{who.deviceType}</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <div className="spec-icon"><Cpu size={18} /></div>
                    <div>
                      <span className="spec-title">CPU Hardware Cores</span>
                      <span className="spec-value">{who.cores} logical threads</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <div className="spec-icon"><Activity size={18} /></div>
                    <div>
                      <span className="spec-title">Screen & Viewport</span>
                      <span className="spec-value">{who.screenResolution} (Viewport: {who.viewportSize})</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <div className="spec-icon"><Clock size={18} /></div>
                    <div>
                      <span className="spec-title">Timezone & Locale</span>
                      <span className="spec-value">{who.timeZone} ({who.language})</span>
                    </div>
                  </div>
                </div>

                <div className="ua-box">
                  <span className="ua-title">Full User Agent String:</span>
                  <code className="ua-code">{navigator.userAgent}</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHERE */}
          {activeTab === 'where' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="section-intro">
                <h3>Where the Web Application is Being Accessed From</h3>
                <p>
                  Network origin, public IP address, geographic location coordinates, and in-app navigation routes.
                </p>
              </div>

              <div className="admin-two-col">
                <div className="admin-card">
                  <div className="geo-header">
                    <div className="flag-large">{where?.flag || '🌐'}</div>
                    <div>
                      <h4>Network Origin Geolocation</h4>
                      <p>{where?.city}, {where?.region}, {where?.country}</p>
                    </div>
                  </div>

                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="detail-key">Public IP Address:</span>
                      <span className="detail-val highlight">{where?.ip}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Country / Region:</span>
                      <span className="detail-val">{where?.flag} {where?.country} ({where?.countryCode})</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">City / Metro:</span>
                      <span className="detail-val">{where?.city}, {where?.region}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Postal / Zip Code:</span>
                      <span className="detail-val">{where?.postal}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">ISP / Carrier:</span>
                      <span className="detail-val">{where?.isp}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Coordinates:</span>
                      <span className="detail-val">{where?.latitude}, {where?.longitude}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Timezone Region:</span>
                      <span className="detail-val">{where?.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-card flex-col">
                  <h4>
                    <MapPin size={18} />
                    <span>Map Coordinates & Route</span>
                  </h4>
                  <div className="map-visual-placeholder">
                    <div className="map-pin-pulse">
                      <MapPin size={32} className="pin-icon" />
                      <div className="ping"></div>
                    </div>
                    <div className="map-info">
                      <span className="map-coords">{where?.latitude}° N, {where?.longitude}° W</span>
                      <span className="map-place">{where?.city}, {where?.country}</span>
                    </div>
                  </div>

                  <div className="route-section-box">
                    <h5>Current App Navigation Section:</h5>
                    <div className="current-route-tag">
                      <Zap size={16} />
                      <span>Active Tab: <strong>{activeNav}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS LOGS */}
          {activeTab === 'logs' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="logs-header-bar">
                <div className="search-input-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search logs by IP, Visitor ID, Event, Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="log-filter-pills">
                  <button
                    className={`filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterType('ALL')}
                  >
                    All ({logs.length})
                  </button>
                  <button
                    className={`filter-pill ${filterType === 'NAV' ? 'active' : ''}`}
                    onClick={() => setFilterType('NAV')}
                  >
                    Nav & Visits
                  </button>
                  <button
                    className={`filter-pill ${filterType === 'ACTION' ? 'active' : ''}`}
                    onClick={() => setFilterType('ACTION')}
                  >
                    User Actions
                  </button>
                  <button
                    className={`filter-pill ${filterType === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => setFilterType('ADMIN')}
                  >
                    Admin Events
                  </button>
                </div>

                <div className="export-btn-group">
                  <button className="btn-export" onClick={handleExportCSV} title="Export CSV">
                    <FileSpreadsheet size={15} />
                    <span>Export CSV</span>
                  </button>
                  <button className="btn-export" onClick={handleExportJSON} title="Export JSON">
                    <FileCode size={15} />
                    <span>Export JSON</span>
                  </button>
                  <button className="btn-danger-sm" onClick={handleClearLogs} title="Clear Logs">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="logs-table-container">
                {filteredLogs.length > 0 ? (
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>WHO (Visitor ID)</th>
                        <th>WHERE (IP & Location)</th>
                        <th>Device / OS</th>
                        <th>App Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="time-cell">
                            <div>{log.displayTime}</div>
                            <small>{log.displayDate}</small>
                          </td>
                          <td>
                            <span className={`event-type-tag ${log.eventType.toLowerCase()}`}>
                              {log.eventType}
                            </span>
                          </td>
                          <td className="code-cell" title={log.who?.visitorId}>
                            {log.who?.visitorId?.substring(0, 14)}...
                          </td>
                          <td>
                            <div className="ip-location">
                              <span className="ip-text">{log.where?.ip}</span>
                              <span className="location-text">
                                {log.where?.flag} {log.where?.location}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="device-text">{log.who?.browser}</div>
                            <small>{log.who?.os}</small>
                          </td>
                          <td>
                            <span className="section-badge">{log.where?.activeSection}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-logs-box">
                    <Terminal size={36} />
                    <p>No access log entries matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: HOTKEYS & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-tab-content animate-fade-in">
              <div className="admin-card primary-border">
                <h3>
                  <Key size={20} />
                  <span>Keyboard Access Hotkeys</span>
                </h3>
                <p className="description-text">
                  You can toggle this Admin Panel anywhere in the application using the following specific keyboard shortcuts:
                </p>

                <div className="hotkeys-list">
                  <div className="hotkey-row">
                    <div className="key-combo">
                      <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
                    </div>
                    <div className="hotkey-desc">
                      Standard Admin Shortcut (Works on Windows/Linux/macOS)
                    </div>
                  </div>

                  <div className="hotkey-row">
                    <div className="key-combo">
                      <kbd>⌘ Cmd</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
                    </div>
                    <div className="hotkey-desc">
                      Apple macOS Command Shortcut
                    </div>
                  </div>

                  <div className="hotkey-row">
                    <div className="key-combo">
                      <kbd>~</kbd> (Tilde / Backquote)
                    </div>
                    <div className="hotkey-desc">
                      Quick Single-Key Access (Works when not typing in search/input fields)
                    </div>
                  </div>
                </div>

                <div className="test-action-bar">
                  <button
                    className="upload-btn-secondary"
                    onClick={() => {
                      logAccessEvent('ADMIN_TEST_TRIGGER', { activeSection: activeNav })
                      showToast?.('Logged test access telemetry event!', 'success')
                      setLogs(getAccessLogs())
                    }}
                  >
                    <Zap size={16} />
                    <span>Log Test Telemetry Event</span>
                  </button>

                  <button className="upload-btn-secondary" onClick={handleRefresh}>
                    <RefreshCw size={16} />
                    <span>Re-fetch Geolocation & IP</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
