/* ═══════════════════════════════════════════════════════════════
   login.js  —  Enactus ISIMG
   Handles sign-in, role/status routing, and password reset.

   Dependencies (load before this file):
     1. firebase-app-compat.js
     2. firebase-auth-compat.js
     3. firebase-firestore-compat.js
     4. firebase-config.js   ← exports `auth` and `db`
     5. toast.js             ← exports `Toast`
     6. lucide (CDN)
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

/** Firebase Auth error codes → user-friendly messages. */
const LOGIN_ERRORS = {
  "auth/user-not-found":        "No account found with this email address.",
  "auth/wrong-password":        "Incorrect password. Please try again.",
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/invalid-credential":    "Invalid email or password. Please check and try again.",
  "auth/too-many-requests":     "Too many failed attempts. Please wait a few minutes and try again.",
  "auth/user-disabled":         "This account has been disabled. Please contact the admin.",
  "auth/network-request-failed":"Network error. Please check your internet connection.",
};

/**
 * Maps user status → destination URL.
 * Keeping routes in one place makes them easy to update.
 */
const ROUTES = {
  admin:    "admin.html",
  approved: "member.html",
  interview:"member.html",
  // "pending" and "rejected" are handled separately (no redirect)
};

/* ─────────────────────────────────────────────
   BUTTON LOADING STATE
───────────────────────────────────────────── */
function setLoginLoading(isLoading) {
  const btn     = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");

  if (!btn) return;

  btn.disabled = isLoading;

  if (isLoading) {
    if (btnText) btnText.textContent = "Authenticating";
    /* Swap icon for a CSS spinner */
    if (btnIcon) {
      btnIcon.outerHTML = `<span
        id="btnIcon"
        style="
          display:inline-block;
          width:15px;height:15px;
          border:2px solid currentColor;
          border-top-color:transparent;
          border-radius:50%;
          animation:_spin 0.7s linear infinite;
        "
        aria-hidden="true"
      ></span>`;

      /* Inject keyframes once */
      if (!document.getElementById("_spin-style")) {
        const s = document.createElement("style");
        s.id = "_spin-style";
        s.textContent = "@keyframes _spin{to{transform:rotate(360deg)}}";
        document.head.appendChild(s);
      }
    }
  } else {
    /* Restore button */
    if (btnText) btnText.textContent = "Sign In";
    const spinner = document.getElementById("btnIcon");
    if (spinner) {
      const icon       = document.createElement("i");
      icon.id          = "btnIcon";
      icon.setAttribute("data-lucide", "log-in");
      icon.style.cssText = "width:15px;height:15px;";
      icon.setAttribute("aria-hidden", "true");
      spinner.replaceWith(icon);
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

/* ─────────────────────────────────────────────
   INLINE STATUS MESSAGE
   Shows a styled inline box for pending/rejected
   instead of a disruptive alert().
───────────────────────────────────────────── */
function showStatusMessage(type, html) {
  const el = document.getElementById("statusMsg");
  if (!el) return;
  el.className   = `status-msg ${type}`;
  el.innerHTML   = html;       /* Trusted — built by us, never from user input */
  el.style.display = "block";
}

function hideStatusMessage() {
  const el = document.getElementById("statusMsg");
  if (el) el.style.display = "none";
}

/* ─────────────────────────────────────────────
   LOGIN HANDLER
───────────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  hideStatusMessage();

  /* ── 1. Read + trim inputs ─────────────────── */
  const email    = (document.getElementById("loginEmail")?.value    ?? "").trim();
  const password = (document.getElementById("loginPassword")?.value ?? "");

  /* ── 2. Basic client-side guard ────────────── */
  if (!email || !password) {
    Toast.warning("Please enter your email and password.");
    return;
  }

  /* ── 3. Lock UI ────────────────────────────── */
  setLoginLoading(true);

  try {
    /* ── 4. Firebase Auth ──────────────────────── */
    const credential = await auth.signInWithEmailAndPassword(email, password);
    const uid        = credential.user.uid;

    /* ── 5. Fetch Firestore profile ────────────── */
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      /*
        Auth account exists but no Firestore document.
        Shouldn't happen normally — could be a deleted/incomplete registration.
      */
      Toast.error("Profile not found. Please contact the admin.");
      await auth.signOut();
      return;
    }

    const userData = userDoc.data();

    /* ── 6. Route by role + status ─────────────── */
    if (userData.role === "admin") {
      Toast.success("Welcome back, Admin! Redirecting…");
      setTimeout(() => { window.location.href = ROUTES.admin; }, 700);
      return;
    }

    switch (userData.status) {

      case "approved":
      case "interview": {
        const firstName = userData.fullName
          ? userData.fullName.split(" ")[0]
          : "Enactor";
        Toast.success(`Welcome back, ${firstName}! 🎉`);
        setTimeout(() => { window.location.href = ROUTES[userData.status]; }, 700);
        break;
      }

      case "pending":
        /*
          FIX: Original used alert("Your account is still under review.")
          Now: sign out silently + show an inline styled message.
        */
        await auth.signOut();
        showStatusMessage(
          "pending",
          "⏳ <strong>Application under review.</strong> " +
          "Our HR team will contact you soon. Hang tight!"
        );
        break;

      case "rejected":
        /*
          FIX: Original didn't handle this case at all —
          a rejected user would land on member.html.
        */
        await auth.signOut();
        showStatusMessage(
          "rejected",
          "❌ <strong>Application not approved.</strong> " +
          "Contact us at <a href='mailto:enactus.isimg@gmail.com' " +
          "style='text-decoration:underline;'>enactus.isimg@gmail.com</a>."
        );
        break;

      default:
        /*
          Unknown status — sign out and show a safe generic message.
        */
        await auth.signOut();
        showStatusMessage(
          "pending",
          "⏳ Your account status is being processed. Please try again later."
        );
        console.warn("[login.js] Unknown status:", userData.status);
        break;
    }

  } catch (err) {
    /*
      FIX: Original used alert("Invalid credentials or account issue.")
      — a single message for every possible error.
      Now: maps every Firebase error code to a clear message.
    */
    const message = LOGIN_ERRORS[err.code] ?? `Login failed: ${err.message}`;
    Toast.error(message);
    console.error("[handleLogin]", err.code, err.message);

  } finally {
    /* Always restore the button — even if login succeeded and page is redirecting */
    setLoginLoading(false);
  }
}

/* ─────────────────────────────────────────────
   FORGOT PASSWORD HANDLER
───────────────────────────────────────────── */
async function handleForgotPassword() {
  const email = (document.getElementById("loginEmail")?.value ?? "").trim();

  if (!email) {
    /*
      FIX: Original used alert("Please enter your email first…")
    */
    Toast.warning("Enter your email address above, then click \"Forgot password?\".");
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    /*
      FIX: Original used alert("Reset link sent! Check your inbox.")
    */
    Toast.success("Reset link sent! Check your inbox (and spam folder).");

  } catch (err) {
    /*
      FIX: Original used alert(err.message) — exposed raw Firebase error strings.
    */
    const isNotFound = ["auth/user-not-found", "auth/invalid-email"].includes(err.code);
    Toast.error(
      isNotFound
        ? "No account found with that email address."
        : "Could not send reset email. Please try again."
    );
    console.error("[handleForgotPassword]", err.code, err.message);
  }
}

/* ─────────────────────────────────────────────
   AUTO-REDIRECT IF ALREADY LOGGED IN
   If someone navigates to login.html while they
   already have an active session, skip the form
   and send them to the right page immediately.
───────────────────────────────────────────── */
function checkExistingSession() {
  auth.onAuthStateChanged(async user => {
    if (!user) return; /* Not logged in — stay on login page */

    try {
      const doc = await db.collection("users").doc(user.uid).get();
      if (!doc.exists) return;

      const data = doc.data();

      if (data.role === "admin") {
        window.location.href = ROUTES.admin;
      } else if (data.status === "approved" || data.status === "interview") {
        window.location.href = ROUTES.approved;
      }
      /* pending / rejected — let them see the login page normally */

    } catch (err) {
      console.warn("[checkExistingSession]", err.message);
    }
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  /* Check for existing session first */
  checkExistingSession();

  /* Login form */
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", handleLogin);

  /* Forgot password — supports both button and link */
  ["forgotPassword", "forgotBtn"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handleForgotPassword);
  });

  /* Password visibility toggle — if the toggle button exists */
  const pwToggle = document.getElementById("pwToggle");
  if (pwToggle) {
    pwToggle.addEventListener("click", () => {
      const field   = document.getElementById("loginPassword");
      const icon    = document.getElementById("pwIcon");
      if (!field) return;
      const isText  = field.type === "text";
      field.type    = isText ? "password" : "text";
      if (icon) {
        icon.setAttribute("data-lucide", isText ? "eye" : "eye-off");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }
      pwToggle.setAttribute("aria-label", isText ? "Show password" : "Hide password");
    });
  }
});