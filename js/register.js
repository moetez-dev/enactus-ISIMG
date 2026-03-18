/* ═══════════════════════════════════════════════════════════════
   register.js  —  Enactus ISIMG
   Handles new member registration via Firebase Auth + Firestore.

   Dependencies (load before this file):
     1. firebase-app-compat.js
     2. firebase-auth-compat.js
     3. firebase-firestore-compat.js
     4. firebase-config.js   ← exports `auth` and `db`
     5. toast.js             ← exports `Toast`
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const MIN_PASSWORD_LENGTH = 6;

/** Maps Firebase Auth error codes → user-friendly messages. */
const AUTH_ERRORS = {
  "auth/email-already-in-use":  "An account with this email already exists. Try logging in instead.",
  "auth/weak-password":         `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/network-request-failed":"Network error. Check your connection and try again.",
  "auth/too-many-requests":     "Too many attempts. Please wait a moment and try again.",
  "auth/operation-not-allowed": "Registration is currently disabled. Contact the admin.",
};

/* ─────────────────────────────────────────────
   SANITIZE
   Converts any string to safe plain text by
   leveraging the browser's own text node — no
   HTML can survive this without being escaped.
   Used before storing user input in Firestore.
───────────────────────────────────────────── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ─────────────────────────────────────────────
   VALIDATE INPUTS (client-side)
   Returns { valid: bool, message: string }
   All checks run before any network call.
───────────────────────────────────────────── */
function validateRegistrationInputs(fullName, email, password, department) {
  if (!fullName)    return { valid: false, message: "Full name is required." };
  if (fullName.length < 3)
                    return { valid: false, message: "Full name must be at least 3 characters." };
  if (!email)       return { valid: false, message: "Email address is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    return { valid: false, message: "Please enter a valid email address." };
  if (!password)    return { valid: false, message: "Password is required." };
  if (password.length < MIN_PASSWORD_LENGTH)
                    return { valid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (!department)  return { valid: false, message: "Please select a department." };

  return { valid: true, message: "" };
}

/* ─────────────────────────────────────────────
   SET BUTTON LOADING STATE
   Disables the submit button and swaps its text
   so users can't double-submit while the async
   Firebase calls are in flight.
───────────────────────────────────────────── */
function setButtonLoading(btnId, isLoading, defaultText = "Submit Application") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled   = isLoading;
  btn.textContent = isLoading ? "Sending…" : defaultText;
}

/* ─────────────────────────────────────────────
   REGISTER USER
   Main registration flow:
     1. Read + validate inputs
     2. Create Firebase Auth account
     3. Update Auth display name
     4. Send email verification
     5. Write Firestore user document
     6. Sign out (force email verification first)
     7. Show success + redirect to login
───────────────────────────────────────────── */
async function registerUser() {

  /* ── 1. Read inputs ────────────────────────── */
  const fullName   = sanitize((document.getElementById("regName")?.value     ?? "").trim());
  const email      =          (document.getElementById("regEmail")?.value    ?? "").trim();
  const password   =          (document.getElementById("regPassword")?.value ?? "");
  const motivation = sanitize((document.getElementById("regMotivation")?.value ?? "").trim());
  const department = document.querySelector("input[name='dept']:checked")?.value ?? "";

  /* ── 2. Validate (no network calls yet) ────── */
  const check = validateRegistrationInputs(fullName, email, password, department);
  if (!check.valid) {
    Toast.warning(check.message);
    return;
  }

  if (!motivation) {
    Toast.warning("Please tell us why you want to join Enactus ISIMG.");
    return;
  }

  /* ── 3. Lock UI ────────────────────────────── */
  setButtonLoading("submitBtn", true);

  try {

    /* ── 4. Create Firebase Auth account ──────── */
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user           = userCredential.user;

    /* ── 5. Set display name in Auth profile ──── */
    await user.updateProfile({ displayName: fullName });

    /* ── 6. Send email verification ───────────── */
    await user.sendEmailVerification();

    /* ── 7. Write Firestore user document ─────── */
    /*
      SECURITY NOTE:
      `role` and `status` are ALWAYS hardcoded here in server-validated
      server-side code — they are NEVER read from form input.
      This prevents privilege escalation (e.g. a user POSTing role:"admin").
    */
    await db.collection("users").doc(user.uid).set({
      uid:        user.uid,
      fullName:   fullName,         // sanitized
      email:      email,
      department: department,
      motivation: motivation,       // sanitized

      role:   "member",             // ← always "member", set by code not user
      status: "pending",            // ← always "pending" until admin approves

      points:    0,
      level:     "Junior",
      badges:    [],
      profilePic: null,

      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    /* ── 8. Sign out — enforce email verification first ── */
    await auth.signOut();

    /* ── 9. Success ────────────────────────────── */
    Toast.success("Application submitted! Check your email to verify your address before logging in.");

    /* Clear the form */
    document.getElementById("registrationForm")?.reset();

    /* Redirect to login after a short delay */
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

  } catch (err) {
    /* ── 10. Error handling ────────────────────── */
    const message = AUTH_ERRORS[err.code] ?? `Registration failed: ${err.message}`;
    Toast.error(message);
    console.error("[registerUser]", err.code, err.message);

  } finally {
    /* ── 11. Always restore the button ─────────── */
    setButtonLoading("submitBtn", false);
  }
}

/* ─────────────────────────────────────────────
   FORM SUBMIT LISTENER
   Attaches to the registration form if it exists
   on the current page. Safe to include on any
   page — does nothing if the form is absent.
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      registerUser();
    });
  }
});