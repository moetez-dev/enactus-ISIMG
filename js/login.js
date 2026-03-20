/* ═══════════════════════════════════════════════════════════════
   login.js  —  Enactus ISIMG
   Handles sign-in, role/status routing, forgot password,
   and existing session redirect.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

var LOGIN_ERRORS = {
  "auth/user-not-found":         "No account found with this email address.",
  "auth/wrong-password":         "Incorrect password. Please try again.",
  "auth/invalid-email":          "Please enter a valid email address.",
  "auth/invalid-credential":     "Invalid email or password. Please check and try again.",
  "auth/too-many-requests":      "Too many failed attempts. Please wait a few minutes.",
  "auth/user-disabled":          "This account has been disabled. Contact the admin.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
};

var ROUTES = {
  admin:    "admin.html",
  approved: "member.html",
  interview:"member.html",
};

/* ── Button loading state ── */
function setLoginLoading(isLoading) {
  var btn     = document.getElementById("loginBtn");
  var btnText = document.getElementById("btnText");
  var btnIcon = document.getElementById("btnIcon");
  if (!btn) return;
  btn.disabled = isLoading;

  if (isLoading) {
    if (btnText) btnText.textContent = "Authenticating";
    if (btnIcon) {
      btnIcon.outerHTML =
        '<span id="btnIcon" aria-hidden="true" style="display:inline-block;width:15px;height:15px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:_spin 0.7s linear infinite;"></span>';
      if (!document.getElementById("_spin-style")) {
        var s = document.createElement("style");
        s.id = "_spin-style";
        s.textContent = "@keyframes _spin{to{transform:rotate(360deg)}}";
        document.head.appendChild(s);
      }
    }
  } else {
    if (btnText) btnText.textContent = "Sign In";
    var spinner = document.getElementById("btnIcon");
    if (spinner && spinner.tagName !== "I") {
      var icon = document.createElement("i");
      icon.id = "btnIcon";
      icon.setAttribute("data-lucide", "log-in");
      icon.style.cssText = "width:15px;height:15px;";
      icon.setAttribute("aria-hidden", "true");
      spinner.replaceWith(icon);
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

/* ── Status message (pending / rejected) ── */
function showStatusMessage(type, html) {
  var el = document.getElementById("statusMsg");
  if (!el) return;
  el.className     = "status-msg " + type;
  el.innerHTML     = html;
  el.style.display = "block";
}
function hideStatusMessage() {
  var el = document.getElementById("statusMsg");
  if (el) el.style.display = "none";
}

/* ── Login handler ── */
async function handleLogin(e) {
  e.preventDefault();
  hideStatusMessage();

  var email    = (document.getElementById("loginEmail")?.value    ?? "").trim();
  var password = (document.getElementById("loginPassword")?.value ?? "");

  if (!email || !password) {
    Toast.warning("Please enter your email and password.");
    return;
  }

  setLoginLoading(true);

  try {
    var credential = await auth.signInWithEmailAndPassword(email, password);
    var uid        = credential.user.uid;
    var userDoc    = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      Toast.error("Profile not found. Please contact the admin.");
      await auth.signOut();
      return;
    }

    var userData = userDoc.data();

    if (userData.role === "admin") {
      Toast.success("Welcome back, Admin! Redirecting…");
      setTimeout(function () { window.location.href = ROUTES.admin; }, 700);
      return;
    }

    switch (userData.status) {

      case "approved":
      case "interview": {
        var firstName = userData.fullName ? userData.fullName.split(" ")[0] : "Enactor";
        Toast.success("Welcome back, " + firstName + "! 🎉");
        setTimeout(function () { window.location.href = ROUTES[userData.status]; }, 700);
        break;
      }

      case "pending":
        await auth.signOut();
        showStatusMessage("pending",
          "⏳ <strong>Application under review.</strong> Our HR team will contact you soon. Hang tight!");
        break;

      case "rejected":
        await auth.signOut();
        showStatusMessage("rejected",
          "❌ <strong>Application not approved.</strong> " +
          "Contact us at <a href='mailto:enactus.isimg@gmail.com' style='text-decoration:underline;'>enactus.isimg@gmail.com</a>.");
        break;

      default:
        await auth.signOut();
        showStatusMessage("pending",
          "⏳ Your account status is being processed. Please try again later.");
        break;
    }

  } catch (err) {
    var message = LOGIN_ERRORS[err.code] || ("Login failed: " + err.message);
    Toast.error(message);
    console.error("[handleLogin]", err.code, err.message);
  } finally {
    setLoginLoading(false);
  }
}

/* ── Forgot password ── */
async function handleForgotPassword() {
  var email = (document.getElementById("loginEmail")?.value ?? "").trim();
  if (!email) {
    Toast.warning("Enter your email address first, then click \"Forgot password?\".");
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    Toast.success("Reset link sent! Check your inbox (and spam folder).");
  } catch (err) {
    var isNotFound = ["auth/user-not-found", "auth/invalid-email"].includes(err.code);
    Toast.error(isNotFound
      ? "No account found with that email address."
      : "Could not send reset email. Please try again.");
    console.error("[handleForgotPassword]", err.code, err.message);
  }
}

/* ── Auto-redirect if already logged in ── */
function checkExistingSession() {
  AuthGuard.redirectIfLoggedIn();
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof lucide !== "undefined") lucide.createIcons();

  checkExistingSession();

  var form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", handleLogin);

  ["forgotPassword", "forgotBtn"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", handleForgotPassword);
  });

  var pwToggle = document.getElementById("pwToggle");
  if (pwToggle) {
    pwToggle.addEventListener("click", function () {
      var field  = document.getElementById("loginPassword");
      var icon   = document.getElementById("pwIcon");
      if (!field) return;
      var isText = field.type === "text";
      field.type = isText ? "password" : "text";
      if (icon) {
        icon.setAttribute("data-lucide", isText ? "eye" : "eye-off");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }
      pwToggle.setAttribute("aria-label", isText ? "Show password" : "Hide password");
    });
  }
});