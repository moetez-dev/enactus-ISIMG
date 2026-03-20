/* ═══════════════════════════════════════════════════════════════
   auth-guard.js  —  Enactus ISIMG
   Route protection utilities.

   AuthGuard.requireAdmin(cb)    → use in admin.html
   AuthGuard.requireMember(cb)   → use in member.html
   AuthGuard.redirectIfLoggedIn()→ use in login.html
   ═══════════════════════════════════════════════════════════════ */

"use strict";

var AuthGuard = {

  /* ── Admin guard: blocks everyone except role==="admin" ── */
  requireAdmin: function (callback) {
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      db.collection("users").doc(user.uid).get().then(function (doc) {
        if (!doc.exists || doc.data().role !== "admin") {
          window.location.href = "member.html";
          return;
        }
        callback(user, doc.data());
      }).catch(function (err) {
        console.error("[AuthGuard.requireAdmin]", err.message);
        window.location.href = "login.html";
      });
    });
  },

  /* ── Member guard: blocks guests; redirects admins to admin.html ── */
  requireMember: function (callback) {
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      db.collection("users").doc(user.uid).get().then(function (doc) {
        if (!doc.exists) {
          auth.signOut().then(function () {
            window.location.href = "login.html";
          });
          return;
        }
        var data = doc.data();
        if (data.role === "admin") {
          window.location.href = "admin.html";
          return;
        }
        callback(user, data);
      }).catch(function (err) {
        console.error("[AuthGuard.requireMember]", err.message);
        window.location.href = "login.html";
      });
    });
  },

  /* ── Login guard: if already logged in, skip the form ── */
  redirectIfLoggedIn: function () {
    auth.onAuthStateChanged(function (user) {
      if (!user) return;
      db.collection("users").doc(user.uid).get().then(function (doc) {
        if (!doc.exists) return;
        var data = doc.data();
        if (data.role === "admin") {
          window.location.href = "admin.html";
        } else if (data.status === "approved" || data.status === "interview") {
          window.location.href = "member.html";
        }
      }).catch(function (err) {
        console.warn("[AuthGuard.redirectIfLoggedIn]", err.message);
      });
    });
  },
};