/* ═══════════════════════════════════════════════════════════════
   firebase-config.js  —  Enactus ISIMG
   Single initialization point for Firebase.

   Load order in every HTML page:
     1. firebase-app-compat.js
     2. firebase-auth-compat.js
     3. firebase-firestore-compat.js
     4. THIS FILE
     5. toast.js
     6. auth-guard.js
     7. Page logic (login.js / index.js / member.js)

   Exports: window.auth, window.db
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ── Replace these with your real Firebase project values ── */
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

/* Guard against duplicate initialization */
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

/* Auth */
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(err => console.warn("[firebase-config] Auth persistence:", err.message));

/* Firestore */
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === "failed-precondition") {
      console.warn("[firebase-config] Persistence disabled: multiple tabs.");
    } else if (err.code === "unimplemented") {
      console.warn("[firebase-config] Persistence not supported.");
    }
  });

/* Expose as globals */
window.auth = auth;
window.db   = db;