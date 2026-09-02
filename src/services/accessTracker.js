/**
 * Access Tracker Service
 * Tracks "WHO" (Visitor ID, Device Specs, Browser, OS, Session)
 * and "WHERE" (Public IP, Geolocation, ISP, App Section/Route)
 */

const VISITOR_KEY = 'picspace_visitor_id_v1'
const LOGS_KEY = 'picspace_access_logs_v1'
const MAX_LOGS = 100

// Helper to generate a unique visitor ID
function getOrCreateVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    const randomStr = Math.random().toString(36).substring(2, 9)
    const timestamp = Date.now().toString(36)
    id = `usr_${timestamp}_${randomStr}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

// Detect Browser details
function getBrowserDetails() {
  const ua = navigator.userAgent
  let name = 'Unknown Browser'
  let version = ''

  if (ua.includes('Firefox/')) {
    name = 'Mozilla Firefox'
    version = ua.split('Firefox/')[1]?.split(' ')[0] || ''
  } else if (ua.includes('Edg/')) {
    name = 'Microsoft Edge'
    version = ua.split('Edg/')[1]?.split(' ')[0] || ''
  } else if (ua.includes('Chrome/')) {
    name = 'Google Chrome'
    version = ua.split('Chrome/')[1]?.split(' ')[0] || ''
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    name = 'Apple Safari'
    version = ua.split('Version/')[1]?.split(' ')[0] || ''
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    name = 'Opera'
    version = ua.split('OPR/')[1]?.split(' ')[0] || ''
  }

  return { name, version, fullUserAgent: ua }
}

// Detect OS details
function getOSDetails() {
  const ua = navigator.userAgent
  const platform = navigator.platform || ''
  let os = 'Unknown OS'

  if (ua.includes('Win')) os = 'Windows OS'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { os, platform }
}

// Get comprehensive "WHO" information
export function getWhoInfo() {
  const visitorId = getOrCreateVisitorId()
  const browser = getBrowserDetails()
  const osInfo = getOSDetails()

  return {
    visitorId,
    browserName: browser.name,
    browserVersion: browser.version,
    os: osInfo.os,
    platform: osInfo.platform,
    screenResolution: `${window.screen.width} x ${window.screen.height}`,
    viewportSize: `${window.innerWidth} x ${window.innerHeight}`,
    language: navigator.language || 'en-US',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    deviceType: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile / Tablet' : 'Desktop PC',
    cores: navigator.hardwareConcurrency || 'N/A',
    maxTouchPoints: navigator.maxTouchPoints || 0,
    onlineStatus: navigator.onLine ? 'Online' : 'Offline',
  }
}

// Memory cache for location info
let cachedLocation = null
let isFetchingLocation = false

// Country code to Flag Emoji helper
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Fetch "WHERE" location (IP & Geolocation)
export async function fetchWhereLocation() {
  if (cachedLocation) return cachedLocation
  if (isFetchingLocation) {
    // Wait briefly if request is in flight
    await new Promise((r) => setTimeout(r, 800))
    if (cachedLocation) return cachedLocation
  }

  isFetchingLocation = true

  // Primary API: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' })
    if (res.ok) {
      const data = await res.json()
      cachedLocation = {
        ip: data.ip || '127.0.0.1 (Local)',
        city: data.city || 'Local Area',
        region: data.region || data.region_code || 'Unknown State',
        country: data.country_name || 'Local Host',
        countryCode: data.country_code || 'US',
        flag: getCountryFlag(data.country_code),
        isp: data.org || data.asn || 'Local Network Provider',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        postal: data.postal || 'N/A',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
      isFetchingLocation = false
      return cachedLocation
    }
  } catch (err) {
    console.warn('ipapi.co failed, trying fallback ip-api.com', err)
  }

  // Fallback API: ip-api.com
  try {
    const res = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,query', { cache: 'no-cache' })
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        cachedLocation = {
          ip: data.query || 'Local IP',
          city: data.city || 'Local Area',
          region: data.regionName || 'Unknown Region',
          country: data.country || 'Local Host',
          countryCode: data.countryCode || 'US',
          flag: getCountryFlag(data.countryCode),
          isp: data.isp || 'Local ISP',
          latitude: data.lat || 0,
          longitude: data.lon || 0,
          postal: data.zip || 'N/A',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        isFetchingLocation = false
        return cachedLocation
      }
    }
  } catch (err) {
    console.warn('Fallback geolocation API failed', err)
  }

  // Default fallback if offline or blocked by adblocker
  cachedLocation = {
    ip: '127.0.0.1 (Client Device)',
    city: 'Local Environment',
    region: 'Local Workstation',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    isp: 'Local Host Connection',
    latitude: 37.7749,
    longitude: -122.4194,
    postal: '94103',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }
  isFetchingLocation = false
  return cachedLocation
}

// Get saved Access Logs
export function getAccessLogs() {
  try {
    const saved = localStorage.getItem(LOGS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not read access logs', e)
  }
  return []
}

// Save Access Logs
function saveAccessLogs(logs) {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)))
  } catch (e) {
    console.warn('Could not save access logs', e)
  }
}

// Add a new log entry
export async function logAccessEvent(eventType, details = {}) {
  const who = getWhoInfo()
  const where = cachedLocation || (await fetchWhereLocation())

  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    displayDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    eventType, // 'APP_INIT', 'VIEW_SECTION', 'ACTION_UPLOAD', 'ADMIN_OPEN', etc.
    who: {
      visitorId: who.visitorId,
      browser: `${who.browserName} ${who.browserVersion}`,
      os: who.os,
      deviceType: who.deviceType,
      screen: who.screenResolution,
    },
    where: {
      ip: where.ip,
      location: `${where.city}, ${where.region}, ${where.country}`,
      flag: where.flag,
      isp: where.isp,
      coordinates: `${where.latitude}, ${where.longitude}`,
      activeSection: details.activeSection || 'My Drive',
      path: window.location.pathname || '/',
    },
    meta: details.meta || {},
  }

  const existing = getAccessLogs()
  const updated = [newLog, ...existing]
  saveAccessLogs(updated)
  return newLog
}

// Clear all recorded logs
export function clearAccessLogs() {
  try {
    localStorage.removeItem(LOGS_KEY)
  } catch (e) {
    console.warn('Could not clear access logs', e)
  }
}

// Export logs to JSON string
export function exportLogsToJSON() {
  const logs = getAccessLogs()
  return JSON.stringify(logs, null, 2)
}

// Export logs to CSV string
export function exportLogsToCSV() {
  const logs = getAccessLogs()
  if (logs.length === 0) return 'No logs available'

  const headers = ['Timestamp', 'Event Type', 'Visitor ID', 'IP Address', 'Location', 'ISP', 'Browser', 'OS', 'App Section']
  const rows = logs.map((l) => [
    `"${l.timestamp}"`,
    `"${l.eventType}"`,
    `"${l.who.visitorId}"`,
    `"${l.where.ip}"`,
    `"${l.where.location}"`,
    `"${l.where.isp}"`,
    `"${l.who.browser}"`,
    `"${l.who.os}"`,
    `"${l.where.activeSection}"`,
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
