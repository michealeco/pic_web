/**
 * Cloud Sync Service
 * Syncs all-device access logs to Firebase Realtime Database
 * Falls back to localStorage-only if Firebase is not configured.
 */

import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, push, onValue, off, set, get, child, query, limitToLast, orderByChild } from 'firebase/database'
import { firebaseConfig, FIREBASE_ENABLED } from './firebaseConfig'

let app = null
let db = null

function initFirebase() {
  if (!FIREBASE_ENABLED) return false
  if (db) return true

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    db = getDatabase(app)
    return true
  } catch (err) {
    console.warn('[CloudSync] Firebase init failed:', err)
    return false
  }
}

/**
 * Push a new access log entry to Firebase Realtime Database.
 * Falls back silently if Firebase is not configured.
 */
export async function pushLogToCloud(logEntry) {
  if (!initFirebase()) return null
  try {
    const logsRef = ref(db, 'picspace_access_logs')
    const result = await push(logsRef, logEntry)
    return result.key
  } catch (err) {
    console.warn('[CloudSync] Failed to push log:', err)
    return null
  }
}

/**
 * Upsert a device profile to Firebase (one record per visitorId).
 * This is what the admin panel uses to show "All Devices" in real time.
 */
export async function upsertDeviceToCloud(visitorId, deviceProfile) {
  if (!initFirebase()) return
  try {
    const deviceRef = ref(db, `picspace_devices/${visitorId}`)
    await set(deviceRef, {
      ...deviceProfile,
      lastSeen: new Date().toISOString(),
      lastSeenDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastSeenDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    })
  } catch (err) {
    console.warn('[CloudSync] Failed to upsert device:', err)
  }
}

/**
 * Subscribe to real-time updates of ALL devices from Firebase.
 * Returns an unsubscribe function.
 * @param {function} callback - called with array of device objects whenever data changes
 */
export function subscribeToAllDevices(callback) {
  if (!initFirebase()) {
    callback([])
    return () => {}
  }

  const devicesRef = ref(db, 'picspace_devices')

  const handler = onValue(devicesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const raw = snapshot.val()
    const devices = Object.entries(raw).map(([key, val]) => ({
      visitorId: key,
      ...val,
    }))

    // Sort by lastSeen descending
    devices.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
    callback(devices)
  }, (err) => {
    console.warn('[CloudSync] Error listening to devices:', err)
    callback([])
  })

  return () => off(devicesRef, 'value', handler)
}

/**
 * Subscribe to real-time updates of ALL access logs from Firebase.
 * @param {function} callback - called with array of log objects
 */
export function subscribeToAllLogs(callback) {
  if (!initFirebase()) {
    callback([])
    return () => {}
  }

  const logsRef = query(ref(db, 'picspace_access_logs'), orderByChild('timestamp'), limitToLast(200))

  const handler = onValue(logsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const raw = snapshot.val()
    const logs = Object.entries(raw)
      .map(([key, val]) => ({ _key: key, ...val }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    callback(logs)
  }, (err) => {
    console.warn('[CloudSync] Error listening to logs:', err)
    callback([])
  })

  return () => off(ref(db, 'picspace_access_logs'), 'value', handler)
}

/**
 * Returns true if Firebase is configured and active.
 */
export function isCloudSyncEnabled() {
  return FIREBASE_ENABLED
}
