/* ═══════════════════════════════════════════════════════════════
   register.js  —  Enactus ISIMG
   Handles new member registration via Firebase Auth + Firestore.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

var MIN_PASSWORD_LENGTH = 6;

var AUTH_ERRORS = {
  "auth/email-already-in-use":  "An account with this email already exists. Try logging in.",
  "auth/weak-password":         "Password must be at least 6 characters.",
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/network-request-failed":"Network error. Check your connection and try again.",
  "auth/too-many-requests":     "Too many attempts. Please wait a moment and try again.",
  "auth/operation-not-allowed": "Registration is currently disabled. Contact the admin.",
};

/* Sanitize user input before storing in Firestore */
function sanitize(str) {
  if (typeof str !== "string") return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* Validate inputs before any network call */
function validateInputs(fullName, email, password, department) {
  if (!fullName || fullName.length < 3)
    return { valid: false, message: "Full name must be at least 3 characters." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { valid: false, message: "Please enter a valid email address." };
  if (!password || password.length < MIN_PASSWORD_LENGTH)
    return { valid: false, message: "Password must be at least " + MIN_PASSWORD_LENGTH + " characters." };
  if (!department)
    return { valid: false, message: "Please select a department." };
  return { valid: true, message: "" };
}

function setButtonLoading(btnId, isLoading) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled    = isLoading;
  btn.textContent = isLoading ? "Sending…" : "Submit Application →";
}

async function registerUser() {
  var fullName   = sanitize((document.getElementById("regName")?.value       ?? "").trim());
  var email      =          (document.getElementById("regEmail")?.value      ?? "").trim();
  var password   =          (document.getElementById("regPassword")?.value   ?? "");
  var motivation = sanitize((document.getElementById("regMotivation")?.value ?? "").trim());
  var department = document.querySelector("input[name='dept']:checked")?.value ?? "";

  var check = validateInputs(fullName, email, password, department);
  if (!check.valid) { Toast.warning(check.message); return; }

  if (!motivation) {
    Toast.warning("Please tell us why you want to join Enactus ISIMG.");
    return;
  }

  setButtonLoading("submitBtn", true);

  try {
    var userCredential = await auth.createUserWithEmailAndPassword(email, password);
    var user           = userCredential.user;

    await user.updateProfile({ displayName: fullName });
    await user.sendEmailVerification();

    await db.collection("users").doc(user.uid).set({
      uid:        user.uid,
      fullName:   fullName,
      email:      email,
      department: department,
      motivation: motivation,
      role:       "member",   /* ALWAYS set by code, never from user input */
      status:     "pending",  /* ALWAYS pending until admin approves */
      points:     0,
      level:      "Junior",
      badges:     [],
      profilePic: null,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
    });

    await auth.signOut();

    Toast.success("Application submitted! Check your email to verify your address.");
    document.getElementById("registrationForm")?.reset();
    setTimeout(function () { window.location.href = "login.html"; }, 3000);

  } catch (err) {
    var message = AUTH_ERRORS[err.code] || ("Registration failed: " + err.message);
    Toast.error(message);
    console.error("[registerUser]", err.code, err.message);
  } finally {
    setButtonLoading("submitBtn", false);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("registrationForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      registerUser();
    });
  }
});