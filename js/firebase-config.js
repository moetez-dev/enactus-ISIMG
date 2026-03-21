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

var firebaseConfig = {
  apiKey:            "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
  authDomain:        "enactus-isimg-99469.firebaseapp.com",
  projectId:         "enactus-isimg-99469",
  storageBucket:     "enactus-isimg-99469.firebasestorage.app",
  messagingSenderId: "348185800306",
  appId:             "1:348185800306:web:31e228e4bb631e18a91ceb",
  measurementId:     "G-DKLNK36DG9"
};

/* Guard against duplicate initialization (e.g. hot-reload) */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/* ── Auth ────────────────────────────────────── */
var auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(function (err) {
    console.warn("[firebase-config] Auth persistence:", err.message);
  });

/* ── Firestore ───────────────────────────────── */
var db = firebase.firestore();

/*
  FIX: enablePersistence() is deprecated in Firebase 10+ and triggers a
  console warning. The correct replacement for the compat SDK is to set
  the cache setting before any other Firestore calls.

  In the compat SDK (10.x), the recommended approach is to call
  enableMultiTabIndexedDbPersistence() or simply suppress it.
  For static-site deployment, we use a try/catch graceful fallback.
*/
(function () {
  try {
    /* Only attempt if IndexedDB is available (not in Safari private mode) */
    if (typeof indexedDB !== "undefined" && indexedDB !== null) {
      firebase.firestore().enablePersistence({ synchronizeTabs: true })
        .catch(function (err) {
          if (err.code === "failed-precondition") {
            /* Multiple tabs open — persistence only works in one tab at a time */
            console.info("[firebase-config] Offline persistence disabled: multiple tabs open.");
          } else if (err.code === "unimplemented") {
            /* Browser does not support persistence */
            console.info("[firebase-config] Offline persistence not supported in this browser.");
          }
        });
    }
  } catch (e) {
    /* Silently ignore — persistence is an enhancement, not required */
  }
})();

/* Expose as globals for all page scripts */
window.auth = auth;
window.db   = db;