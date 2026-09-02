/**
 * Firebase Configuration for Picspace Admin Tracking
 *
 * SETUP INSTRUCTIONS (One-time, takes 3 minutes):
 * ─────────────────────────────────────────────────
 * 1. Go to: https://console.firebase.google.com
 * 2. Click "Add project" → Name it "picspace-admin" → Create
 * 3. In the left sidebar, click "Build" → "Realtime Database"
 * 4. Click "Create Database" → Choose any region → "Start in test mode" → Enable
 * 5. Click the gear icon ⚙ → "Project settings"
 * 6. Scroll down to "Your apps" → Click "</>" (Web app icon) → Register app
 * 7. Copy the firebaseConfig values below from the snippet shown
 * ─────────────────────────────────────────────────
 *
 * REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR OWN:
 */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

/**
 * Set this to true AFTER you have filled in the real Firebase config above.
 * When false, the tracker falls back to localStorage-only mode (single device).
 */
export const FIREBASE_ENABLED = false
