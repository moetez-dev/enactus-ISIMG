/* ================================================================
   firebase-config.js — Enactus ISIMG
   Single Firebase initialization point shared by all pages.

   Required load order in every HTML page:
     1. firebase-app-compat.js
     2. firebase-auth-compat.js
     3. firebase-firestore-compat.js
     4. THIS FILE  ← exposes window.auth and window.db
     5. toast.js
     6. auth-guard.js
     7. Page-specific JS
   ================================================================ */

"use strict";

var firebaseConfig = {
  apiKey:            "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
  authDomain:        "enactus-isimg-99469.firebaseapp.com",
  projectId:         "enactus-isimg-99469",
  storageBucket:     "enactus-isimg-99469.firebasestorage.app",
  messagingSenderId: "348185800306",
  appId:             "1:348185800306:web:31e228e4bb631e18a91ceb"
};

/* Guard against duplicate initialisation (e.g. HMR / multiple script loads) */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/* ── Auth ──────────────────────────────────────────────────────── */
var auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (err) {
  /* Non-fatal — session will still work without persistence */
  console.warn("[firebase-config] Auth persistence unavailable:", err.code);
});

/* ── Firestore ─────────────────────────────────────────────────── */
var db = firebase.firestore();

/*
  NOTE ON OFFLINE PERSISTENCE:
  enablePersistence() / enableMultiTabIndexedDbPersistence() are deprecated
  in Firebase 10.x and produce console warnings. They have been removed.
  The compat SDK still caches recent reads in memory automatically.
  If you need offline-first support, upgrade to the modular SDK and use
  initializeFirestore() with persistentLocalCache().
*/

/* ── Expose globals ────────────────────────────────────────────── */
window.auth = auth;
window.db   = db;