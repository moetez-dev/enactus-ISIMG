/* ═══════════════════════════════════════════════════════════════
   member.js  —  Enactus ISIMG Member Space
   Handles auth guard, profile rendering, leaderboard,
   news feed, and status-based UI for the member portal.

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
   LEVEL SYSTEM
   Must match the definition in member.html.
───────────────────────────────────────────── */
const LEVELS = [
  { name: "Junior",    min: 0   },
  { name: "Explorer",  min: 50  },
  { name: "Builder",   min: 150 },
  { name: "Innovator", min: 300 },
  { name: "Leader",    min: 500 },
  { name: "Champion",  min: 800 },
];

function computeLevel(pts) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (pts >= l.min) level = l;
  }
  return level.name;
}

function computeXpPercent(pts) {
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (pts >= LEVELS[i].min && pts < LEVELS[i + 1].min) {
      const range = LEVELS[i + 1].min - LEVELS[i].min;
      const prog  = pts - LEVELS[i].min;
      return Math.min(100, Math.round((prog / range) * 100));
    }
  }
  return 100; // max level reached
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/**
 * Safely sets element textContent.
 * @param {string} id  - Element ID
 * @param {string} val - Text value (never HTML)
 */
function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val ?? "");
}

/**
 * Safely sets an element's src attribute after
 * validating it is a http/https URL.
 * Falls back to a generated avatar if invalid.
 * @param {string} id      - Element ID
 * @param {string} url     - Image URL
 * @param {string} fallback - Fallback URL
 */
function setSrc(id, url, fallback = "") {
  const el = document.getElementById(id);
  if (!el) return;
  const safe = /^https?:\/\//i.test(url ?? "") ? url : fallback;
  el.src = safe;
}

/**
 * Returns a UI-Avatars fallback URL for a given name.
 * @param {string} name
 */
function avatarFallback(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "E")}&background=111&color=FFC222`;
}

/**
 * Creates a DOM element with optional className and textContent.
 * Using this instead of innerHTML prevents XSS.
 */
function el(tag, { className = "", text = "", style = "" } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text)      node.textContent = text;
  if (style)     node.style.cssText = style;
  return node;
}

/* ─────────────────────────────────────────────
   PENDING STATE UI
   Builds the "pending approval" screen using
   safe DOM methods — no innerHTML with user data.
───────────────────────────────────────────── */
function showPendingUI() {
  const main = document.querySelector(".member-main");
  if (!main) return;

  /* Clear existing content safely */
  while (main.firstChild) main.removeChild(main.firstChild);

  const wrapper = el("div", { style: "display:flex;align-items:center;justify-content:center;height:100%;padding:2rem;" });

  const card = el("div", {
    style: [
      "max-width:480px;width:100%;",
      "background:#fff;",
      "border-top:4px solid #FFC222;",
      "border-radius:2rem;",
      "padding:2.5rem;",
      "text-align:center;",
      "box-shadow:0 4px 32px rgba(0,0,0,0.06);",
    ].join(""),
  });

  const icon = el("div", {
    style: "font-size:3rem;margin-bottom:1rem;",
    text:  "⏳",
  });

  const title = el("h1", {
    style: "font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.75rem;text-transform:uppercase;margin-bottom:0.75rem;",
  });
  /* Build "Application PENDING" with a yellow span — safe DOM approach */
  title.append(
    document.createTextNode("Application "),
    Object.assign(el("span", { text: "Pending" }), { style: "color:#FFC222;" })
  );

  const desc = el("p", {
    style: "color:#6b7280;font-size:0.9rem;line-height:1.6;margin-bottom:1.5rem;",
    text:  "Your account has been created and is awaiting approval. Our HR team will contact you soon for an interview.",
  });

  const statusBox = el("div", {
    style: [
      "display:inline-flex;align-items:center;gap:0.625rem;",
      "background:#fffbeb;",
      "border:1px solid #fde68a;",
      "border-radius:999px;",
      "padding:0.5rem 1.25rem;",
      "font-size:0.72rem;font-weight:900;",
      "text-transform:uppercase;letter-spacing:0.1em;",
      "color:#92400e;",
    ].join(""),
  });

  const dot = el("span", {
    style: "width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0;",
  });
  const statusText = el("span", { text: "Waiting for Interview" });

  statusBox.appendChild(dot);
  statusBox.appendChild(statusText);

  const logoutBtn = el("button", {
    text:  "Sign Out",
    style: [
      "margin-top:1.5rem;",
      "display:block;width:100%;",
      "padding:0.875rem;",
      "background:#0a0a0a;color:#fff;",
      "border:none;border-radius:0.875rem;",
      "font-weight:900;font-size:0.72rem;",
      "text-transform:uppercase;letter-spacing:0.1em;",
      "cursor:pointer;",
    ].join(""),
  });
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => { window.location.href = "login.html"; });
  });

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(statusBox);
  card.appendChild(logoutBtn);
  wrapper.appendChild(card);
  main.appendChild(wrapper);
}

/* ─────────────────────────────────────────────
   REJECTED STATE UI
   Similar to pending — shown when status === "rejected".
───────────────────────────────────────────── */
function showRejectedUI() {
  const main = document.querySelector(".member-main");
  if (!main) return;

  while (main.firstChild) main.removeChild(main.firstChild);

  const wrapper = el("div", { style: "display:flex;align-items:center;justify-content:center;height:100%;padding:2rem;" });

  const card = el("div", {
    style: [
      "max-width:480px;width:100%;",
      "background:#fff;",
      "border-top:4px solid #ef4444;",
      "border-radius:2rem;",
      "padding:2.5rem;",
      "text-align:center;",
      "box-shadow:0 4px 32px rgba(0,0,0,0.06);",
    ].join(""),
  });

  const icon  = el("div", { style: "font-size:3rem;margin-bottom:1rem;", text: "❌" });

  const title = el("h1", {
    style: "font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.75rem;text-transform:uppercase;margin-bottom:0.75rem;color:#ef4444;",
    text:  "Application Rejected",
  });

  const desc = el("p", {
    style: "color:#6b7280;font-size:0.9rem;line-height:1.6;margin-bottom:1.5rem;",
    text:  "Unfortunately, your application was not approved. Please contact us for more information.",
  });

  /* Safe email link — href is hardcoded, not from user data */
  const contactLink = el("a", {
    style: "display:inline-block;color:#ef4444;font-weight:700;font-size:0.85rem;",
    text:  "enactus.isimg@gmail.com",
  });
  contactLink.href = "mailto:enactus.isimg@gmail.com";

  const logoutBtn = el("button", {
    text:  "Sign Out",
    style: [
      "margin-top:1.5rem;",
      "display:block;width:100%;",
      "padding:0.875rem;",
      "background:#ef4444;color:#fff;",
      "border:none;border-radius:0.875rem;",
      "font-weight:900;font-size:0.72rem;",
      "text-transform:uppercase;letter-spacing:0.1em;",
      "cursor:pointer;",
    ].join(""),
  });
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => { window.location.href = "login.html"; });
  });

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(contactLink);
  card.appendChild(logoutBtn);
  wrapper.appendChild(card);
  main.appendChild(wrapper);
}

/* ─────────────────────────────────────────────
   RENDER USER CARD
   Uses textContent / style assignments —
   NEVER innerHTML with user-supplied data.
───────────────────────────────────────────── */
function renderUserCard(userData) {
  const points  = userData.points  || 0;
  const level   = computeLevel(points);
  const xpPct   = computeXpPercent(points);
  const name    = userData.fullName || "Enactor";
  const firstName = name.split(" ")[0];

  /* Header greeting */
  setTxt("welcomeName",   firstName);
  setTxt("userNameDisplay", name);
  setTxt("userDept",      userData.department || "Member");

  /* Points + level */
  setTxt("userPointsDisplay", points);
  setTxt("dash-points",  points);
  setTxt("dash-level",   level);
  setTxt("topbar-level", level);
  setTxt("topbar-points", points);
  setTxt("xp-level-label", level);
  setTxt("xp-pts-label",  `${points} pts`);

  /* XP bar */
  const xpFill = document.getElementById("xp-fill");
  if (xpFill) setTimeout(() => { xpFill.style.width = `${xpPct}%`; }, 200);

  /* Avatar */
  const avatarUrl = /^https?:\/\//i.test(userData.profilePic || "")
    ? userData.profilePic
    : avatarFallback(name);

  ["userAvatar", "sidebar-avatar", "topbar-avatar", "settings-avatar-preview"].forEach(id => {
    setSrc(id, avatarUrl, avatarFallback(name));
  });

  /* Settings fields pre-fill */
  const editName = document.getElementById("editName");
  if (editName && !editName.value) editName.value = name;

  /* Badges */
  const toggleBadge = (id, earned) => {
    const badge = document.getElementById(id);
    if (badge) badge.classList.toggle("earned", earned);
  };
  toggleBadge("badge-active", points >= 50);
  toggleBadge("badge-expert", points >= 200);
  toggleBadge("badge-legend", points >= 500);
}

/* ─────────────────────────────────────────────
   RENDER LEADERBOARD
   Real-time listener — updates instantly when
   any user's points change in Firestore.
   Uses DOM construction — NO innerHTML.
───────────────────────────────────────────── */
let _leaderboardUnsub = null;

function renderLeaderboard() {
  const list = document.getElementById("leaderboardList") || document.getElementById("leaderboard-list");
  if (!list) return;

  /* Cancel previous listener if re-called */
  if (_leaderboardUnsub) _leaderboardUnsub();

  _leaderboardUnsub = db.collection("users")
    .orderBy("points", "desc")
    .limit(5)
    .onSnapshot(snapshot => {

      /* Clear list */
      while (list.firstChild) list.removeChild(list.firstChild);

      const medals = ["🥇", "🥈", "🥉"];
      let rank = 1;

      snapshot.forEach(doc => {
        const u    = doc.data();
        const isMe = doc.id === _currentUserUID;

        /* Row */
        const row  = el("div", {
          style: [
            "display:flex;align-items:center;gap:0.75rem;",
            "padding:0.625rem 0.875rem;",
            "border-radius:0.875rem;",
            "transition:background 0.2s;",
            isMe ? "background:rgba(255,194,34,0.12);" : "",
          ].join(""),
        });

        /* Rank */
        const rankEl = el("span", {
          text:  medals[rank - 1] ?? String(rank),
          style: `font-weight:900;font-size:0.75rem;width:24px;text-align:center;flex-shrink:0;color:${rank === 1 ? "#FFC222" : "#9ca3af"};`,
        });

        /* Avatar */
        const avatar     = document.createElement("img");
        avatar.src       = avatarFallback(u.fullName || "U");
        if (/^https?:\/\//i.test(u.profilePic || "")) avatar.src = u.profilePic;
        avatar.alt       = u.fullName || "";
        avatar.style.cssText = "width:32px;height:32px;border-radius:8px;object-fit:cover;flex-shrink:0;";

        /* Name */
        const nameEl = el("span", {
          text:  u.fullName || "Enactor",
          style: "font-weight:900;font-size:0.78rem;text-transform:uppercase;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
        });

        /* Points */
        const ptsEl = el("span", {
          text:  `${u.points || 0} pts`,
          style: `font-weight:900;font-size:0.72rem;flex-shrink:0;color:${rank === 1 ? "#FFC222" : "#9ca3af"};`,
        });

        row.appendChild(rankEl);
        row.appendChild(avatar);
        row.appendChild(nameEl);
        row.appendChild(ptsEl);
        list.appendChild(row);

        rank++;
      });

    }, err => {
      console.error("[renderLeaderboard]", err.message);
    });
}

/* ─────────────────────────────────────────────
   RENDER NEWS FEED
   Real-time listener.
   CRITICAL FIX: Original used innerHTML with
   item.title, item.desc, AND item.img directly
   from Firestore — a stored XSS vulnerability.
   All values now set via textContent / safe src.
───────────────────────────────────────────── */
let _feedUnsub = null;

function renderNewsFeed() {
  const feed = document.getElementById("newsFeed") ||
               document.getElementById("feed-list") ||
               document.getElementById("dash-feed-preview");
  if (!feed) return;

  if (_feedUnsub) _feedUnsub();

  _feedUnsub = db.collection("news")
    .orderBy("createdAt", "desc")
    .limit(10)
    .onSnapshot(snapshot => {

      while (feed.firstChild) feed.removeChild(feed.firstChild);

      if (snapshot.empty) {
        const empty = el("p", {
          text:  "No announcements yet.",
          style: "font-size:0.78rem;color:#9ca3af;font-style:italic;padding:1rem 0;",
        });
        feed.appendChild(empty);
        return;
      }

      snapshot.forEach(doc => {
        const item = doc.data();

        /* Card */
        const card = el("div", {
          style: [
            "background:#fff;",
            "border:1px solid #ececea;",
            "border-radius:1.25rem;",
            "padding:1.25rem 1.5rem;",
            "transition:border-color 0.2s;",
            "margin-bottom:0.875rem;",
          ].join(""),
        });

        /* Optional image — only shown if a valid https URL */
        if (/^https?:\/\//i.test(item.img || "")) {
          const img        = document.createElement("img");
          img.src          = item.img; // validated above
          img.alt          = "";       // decorative
          img.style.cssText = "width:100%;height:180px;object-fit:cover;border-radius:0.875rem;margin-bottom:1rem;display:block;";
          img.loading      = "lazy";
          /* Fallback: hide broken images */
          img.onerror      = () => { img.style.display = "none"; };
          card.appendChild(img);
        }

        /* Title */
        const title = el("h4", {
          text:  item.title || "",
          style: "font-weight:900;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:0.375rem;",
        });

        /* Body */
        const desc = el("p", {
          text:  item.desc || "",
          style: "font-size:0.8rem;color:#6b7280;font-weight:600;line-height:1.55;",
        });

        card.appendChild(title);
        card.appendChild(desc);
        feed.appendChild(card);
      });

    }, err => {
      console.error("[renderNewsFeed]", err.message);
      Toast.error("Could not load news feed. Please try again.");
    });
}

/* ─────────────────────────────────────────────
   CURRENT USER UID
   Stored at module level so renderers can
   use it (e.g. highlight "me" in leaderboard).
───────────────────────────────────────────── */
let _currentUserUID = null;

/* ─────────────────────────────────────────────
   AUTH GUARD + MAIN INIT
   onAuthStateChanged is the single entry point.
   All rendering only happens after role/status
   is confirmed from Firestore.
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  /* Logout button — multiple possible IDs */
  ["logoutBtn", "logout-btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        auth.signOut().then(() => { window.location.href = "login.html"; });
      });
    }
  });

  auth.onAuthStateChanged(async user => {

    /* ── Not logged in ───────────────────────── */
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    _currentUserUID = user.uid;

    /* Show auth email safely */
    setTxt("userMailDisplay", user.email || "");
    setTxt("settings-email",  user.email || "");

    try {
      /* ── Fetch Firestore profile ────────────── */
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (!userDoc.exists) {
        /* Auth account exists but no Firestore doc — edge case */
        Toast.error("Profile not found. Please contact the admin.");
        await auth.signOut();
        window.location.href = "login.html";
        return;
      }

      const userData = userDoc.data();

      /* ── Route by status ──────────────────── */
      switch (userData.status) {

        case "approved":
        case "interview":
          /* Approved — render full member portal */
          renderUserCard(userData);
          renderLeaderboard();
          renderNewsFeed();

          /* Real-time profile listener for points/level changes */
          db.collection("users").doc(user.uid).onSnapshot(snap => {
            if (snap.exists) renderUserCard(snap.data());
          }, err => console.warn("[profile listener]", err.message));

          break;

        case "pending":
          showPendingUI();
          break;

        case "rejected":
          showRejectedUI();
          break;

        default:
          /* Unknown status — treat as pending */
          console.warn("[member.js] Unknown status:", userData.status);
          showPendingUI();
          break;
      }

    } catch (err) {
      console.error("[member.js] Firestore fetch error:", err.message);
      Toast.error("Could not load your profile. Please refresh the page.");
    }
  });
});