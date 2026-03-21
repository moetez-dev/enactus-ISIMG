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
const firebaseConfig = {
  apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
  authDomain: "enactus-isimg-99469.firebaseapp.com",
  projectId: "enactus-isimg-99469",
  storageBucket: "enactus-isimg-99469.firebasestorage.app",
  messagingSenderId: "348185800306",
  appId: "1:348185800306:web:31e228e4bb631e18a91ceb",
  measurementId: "G-DKLNK36DG9"
};

/* Guard against duplicate initialization */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
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