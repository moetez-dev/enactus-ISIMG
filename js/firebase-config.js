/* ═══════════════════════════════════════════════════════════════
   firebase-config.js  —  Enactus ISIMG
   Single initialization point for Firebase.
   Loaded ONCE — before any other JS file that needs auth or db.

   Load order in every HTML page:
     1. firebase-app-compat.js
     2. firebase-auth-compat.js
     3. firebase-firestore-compat.js
     4. THIS FILE                    ← single init
     5. toast.js
     6. Page logic  (login.js / index.js / member.js / admin.js)

   Exports (attached to window for compat-SDK pages):
     window.auth  — firebase.auth()     instance
     window.db    — firebase.firestore() instance
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   CONFIGURATION
   ⚠️  NEVER commit real values to a public repo.
   Use environment variables or a build-time
   injection step (e.g. GitHub Secrets + CI/CD)
   for production deployments.
───────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

/* ─────────────────────────────────────────────
   GUARD — prevent duplicate initialization
   firebase.apps.length check ensures this file
   is safe to load multiple times (e.g. hot-reload
   in dev) without throwing:
   "Firebase: Firebase App named '[DEFAULT]' already exists"
───────────────────────────────────────────── */
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

/* ─────────────────────────────────────────────
   AUTH INSTANCE
   Persistence is set to LOCAL (default) so the
   session survives page refreshes and browser
   restarts — the user stays logged in until they
   explicitly sign out.

   Other options if you ever need them:
     firebase.auth.Auth.Persistence.SESSION → tab only
     firebase.auth.Auth.Persistence.NONE    → no persistence
───────────────────────────────────────────── */
const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(err => {
    /* Non-fatal — auth still works, just without guaranteed persistence */
    console.warn("[firebase-config] Auth persistence error:", err.message);
  });

/* ─────────────────────────────────────────────
   FIRESTORE INSTANCE
───────────────────────────────────────────── */
const db = firebase.firestore();

/*
  OFFLINE PERSISTENCE
  Enables Firestore's local IndexedDB cache so
  the app can read previously-fetched data while
  offline and queue writes that sync when
  connectivity is restored.

  enablePersistence() throws if:
    - Called in a third browser tab (multi-tab conflict)
    - The browser doesn't support IndexedDB
  Both are non-fatal — the app still works online.
*/
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === "failed-precondition") {
      /* Multiple tabs open — persistence only works in one tab at a time */
      console.warn("[firebase-config] Firestore persistence disabled: multiple tabs open.");
    } else if (err.code === "unimplemented") {
      /* Browser doesn't support IndexedDB */
      console.warn("[firebase-config] Firestore persistence not supported in this browser.");
    } else {
      console.warn("[firebase-config] Firestore persistence error:", err.message);
    }
  });

/* ─────────────────────────────────────────────
   EXPORTS
   Attached to window so all page scripts using
   the Firebase compat SDK can access them as
   globals without needing ES module imports.

   Usage in any page script:
     auth.signInWithEmailAndPassword(email, pw)
     db.collection("users").doc(uid).get()
───────────────────────────────────────────── */
window.auth = auth;
window.db   = db;