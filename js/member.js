/* ================================================================
   member.js — Enactus ISIMG Member Portal
   Handles: auth guard, profile, leaderboard, EOM, feed,
            projects, events, missions, settings update.

   Script load order (member.html):
     firebase sdks → firebase-config.js → toast.js →
     auth-guard.js → THIS FILE → inline page script
   ================================================================ */

"use strict";

/* ── Level thresholds ───────────────────────────────────────────── */
var LEVELS = [
  { name: "Junior", min: 0   },
  { name: "Active", min: 100 },
  { name: "Expert", min: 300 },
  { name: "Legend", min: 600 }
];

function getLevel(pts) {
  var level = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (pts >= LEVELS[i].min) level = LEVELS[i];
  }
  return level;
}

function getNextThreshold(pts) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (pts < LEVELS[i].min) return LEVELS[i].min;
  }
  return null; /* already at max level */
}

/* ── Module state ───────────────────────────────────────────────── */
var _user       = null;
var _userData   = null;
var _profileSub = null; /* Firestore live listener unsubscribe fn */

/* ── Auth guard entry point ─────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  AuthGuard.requireMember(function (user, data) {
    _user     = user;
    _userData = data;
    _boot(user, data);
  });
});

/* ── Boot the portal ────────────────────────────────────────────── */
function _boot(user, data) {
  _renderProfile(user, data);
  _subscribeProfile(user); /* live updates */
  _loadEOM();
  _loadLeaderboard(user.uid);
  loadMissions("dash-missions-preview", 3);
  _loadFeedInto("dash-feed-preview", 3);
  if (typeof lucide !== "undefined") lucide.createIcons();
}

/* ── Render profile everywhere ──────────────────────────────────── */
function _renderProfile(user, data) {
  var pts   = data.points || 0;
  var level = getLevel(pts);
  var name  = data.fullName || user.displayName || "Enactor";
  var dept  = data.department || "";
  var pic   = (data.profilePic && /^https?:\/\//i.test(data.profilePic))
    ? data.profilePic
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) +
      "&background=111&color=FFC222&size=200";

  /* Sidebar */
  _setText("sidebar-name", name);
  _setText("sidebar-dept", dept);
  _setImg("sidebar-avatar", pic, name);

  /* XP bar */
  _setText("xp-level-label", level.name);
  _setText("xp-pts-label", pts + " pts");
  var next = getNextThreshold(pts);
  var pct  = next ? Math.min(100, Math.round((pts / next) * 100)) : 100;
  var fill = document.getElementById("xp-fill");
  if (fill) fill.style.width = pct + "%";

  /* Topbar */
  _setText("topbar-level", level.name);
  _setText("topbar-points", pts);
  _setImg("topbar-avatar", pic, name);

  /* Dashboard welcome card */
  _setText("welcomeName", name.split(" ")[0]);
  _setText("dash-points", pts);
  _setText("dash-level", level.name);
  _setText("dash-dept", dept || "—");

  /* Badges */
  _updateBadges(pts);

  /* Settings tab */
  _setText("settings-name-label", name);
  _setText("settings-dept-label", dept);
  _setText("settings-email", user.email || "—");
  _setText("settings-points", pts + " pts");
  _setText("settings-level", level.name);
  _setImg("settings-avatar-preview", pic, name);

  /* Dynamic status badge */
  var statusEl = document.getElementById("settings-status");
  if (statusEl) {
    var st = data.status || "unknown";
    var stLabel = st.charAt(0).toUpperCase() + st.slice(1);
    statusEl.textContent = stLabel;
    if (st === "approved" || st === "interview") {
      statusEl.style.color = "var(--green)";
      statusEl.style.background = "rgba(34,197,94,0.1)";
    } else if (st === "pending") {
      statusEl.style.color = "#b45309";
      statusEl.style.background = "rgba(255,194,34,0.15)";
    } else if (st === "rejected") {
      statusEl.style.color = "var(--red)";
      statusEl.style.background = "rgba(239,68,68,0.1)";
    }
  }

  var editName = document.getElementById("editName");
  if (editName && !editName.dataset.dirty) editName.value = name;

  var editPic = document.getElementById("editPic");
  if (editPic && !editPic.dataset.dirty &&
      data.profilePic && /^https?:\/\//i.test(data.profilePic)) {
    editPic.value = data.profilePic;
  }
}

function _updateBadges(pts) {
  function unlock(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("earned");
  }
  unlock("badge-member"); /* always earned */
  if (pts >= 1)   unlock("badge-active");
  if (pts >= 300) unlock("badge-expert");
  if (pts >= 600) unlock("badge-legend");
}

/* ── Live profile subscription ──────────────────────────────────── */
function _subscribeProfile(user) {
  if (_profileSub) _profileSub(); /* unsubscribe previous if any */
  _profileSub = db.collection("users").doc(user.uid).onSnapshot(
    function (doc) {
      if (!doc.exists) return;
      _userData = doc.data();
      _renderProfile(user, _userData);
    },
    function (err) { console.warn("[member] profile subscription:", err.message); }
  );
}

/* ── EOM ────────────────────────────────────────────────────────── */
function _loadEOM() {
  db.collection("settings").doc("eom").onSnapshot(
    function (doc) {
      if (!doc.exists) { _setText("eom-name", "TBA"); return; }
      var d = doc.data();
      _setText("eom-name", d.name || "TBA");
      _setText("eom-desc", d.desc || "");
      var imgEl = document.getElementById("eom-img");
      if (imgEl && d.img && /^https?:\/\//i.test(d.img)) imgEl.src = d.img;
    },
    function (err) { console.warn("[member] loadEOM:", err.message); }
  );
}

/* ── Leaderboard ────────────────────────────────────────────────── */
function _loadLeaderboard(currentUid) {
  db.collection("users")
    .where("status", "==", "approved")
    .orderBy("points", "desc")
    .limit(10)
    .onSnapshot(
      function (snap) {
        var list = document.getElementById("leaderboard-list");
        if (!list) return;
        list.innerHTML = "";
        var rank = 0;
        snap.forEach(function (doc) {
          rank++;
          var u   = doc.data();
          var pts = u.points || 0;
          var row = document.createElement("div");
          row.className = "lb-row" + (doc.id === currentUid ? " me" : "");

          var rankEl = document.createElement("span");
          rankEl.className   = "lb-rank";
          rankEl.textContent = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : String(rank);

          var avatar = document.createElement("img");
          avatar.className = "lb-avatar";
          avatar.alt       = u.fullName || "";
          avatar.src       = (u.profilePic && /^https?:\/\//i.test(u.profilePic))
            ? u.profilePic
            : "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.fullName || "U") +
              "&background=111&color=FFC222&size=64";

          var nameEl = document.createElement("span");
          nameEl.className   = "lb-name";
          nameEl.textContent = u.fullName || "Member";

          var ptsEl = document.createElement("span");
          ptsEl.className   = "lb-pts" + (rank <= 3 ? " top" : "");
          ptsEl.textContent = pts + " pts";

          row.appendChild(rankEl);
          row.appendChild(avatar);
          row.appendChild(nameEl);
          row.appendChild(ptsEl);
          list.appendChild(row);
        });
      },
      function (err) { console.warn("[member] leaderboard:", err.message); }
    );
}

/* ── Missions ───────────────────────────────────────────────────── */
function loadMissions(containerId, limit) {
  if (!_user) return;
  var container = document.getElementById(containerId);
  if (!container) return;

  var query = db.collection("tasks")
    .where("uid", "==", _user.uid)
    .orderBy("date", "desc");
  if (limit) query = query.limit(limit);

  query.onSnapshot(
    function (snap) {
      container.innerHTML = "";
      var liveCnt = 0;

      if (snap.empty) {
        container.innerHTML =
          '<div class="empty-state"><p>No missions assigned yet.</p></div>';
      } else {
        snap.forEach(function (doc) {
          var t    = doc.data();
          var done = t.completed;
          var rev  = !done && t.submitted;
          if (!done && !rev) liveCnt++;

          var card = document.createElement("div");
          card.className = "mission-card" + (done ? " done" : rev ? " reviewing" : "");

          var header = document.createElement("div");
          header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem;";

          var title = document.createElement("p");
          title.className   = "mission-title";
          title.textContent = t.text || "Mission";

          var badge = document.createElement("span");
          badge.className   = "mission-pts";
          badge.textContent = (t.points || 0) + " pts";

          header.appendChild(title);
          header.appendChild(badge);
          card.appendChild(header);

          if (done) {
            var doneEl = document.createElement("p");
            doneEl.style.cssText = "font-size:.72rem;color:var(--green);font-weight:900;";
            doneEl.textContent   = "✓ Completed & approved";
            card.appendChild(doneEl);
          } else if (rev) {
            var revEl = document.createElement("p");
            revEl.style.cssText = "font-size:.72rem;color:var(--orange);font-weight:900;";
            revEl.textContent   = "⏳ Under review…";
            card.appendChild(revEl);
          } else {
            var row   = document.createElement("div");
            row.style.cssText = "display:flex;gap:.5rem;margin-top:.625rem;";
            var input = document.createElement("input");
            input.type        = "url";
            input.className   = "link-input";
            input.placeholder = "Paste your work link (https://…)";
            var btn = document.createElement("button");
            btn.className   = "btn btn-primary";
            btn.style.cssText = "padding:.6rem 1rem;font-size:.6rem;white-space:nowrap;";
            btn.textContent = "Submit";
            (function (docId, inp) {
              btn.addEventListener("click", function () { _submitWork(docId, inp.value.trim()); });
            }(doc.id, input));
            row.appendChild(input);
            row.appendChild(btn);
            card.appendChild(row);
          }

          container.appendChild(card);
        });
      }

      /* Update sidebar badge */
      var badge = document.getElementById("badge-missions");
      if (badge) {
        badge.textContent = liveCnt;
        badge.classList.toggle("show", liveCnt > 0);
      }
    },
    function (err) { console.warn("[member] missions:", err.message); }
  );
}

/* ── Submit work ────────────────────────────────────────────────── */
async function _submitWork(taskId, link) {
  if (!link || !/^https?:\/\//i.test(link)) {
    Toast.warning("Please paste a valid URL starting with https://");
    return;
  }
  try {
    await db.collection("tasks").doc(taskId).update({
      submitted: true,
      status:    "pending_review",
      workLink:  link
    });
    Toast.success("Work submitted! The admin will review it soon.");
  } catch (err) {
    Toast.error("Could not submit work. Please try again.");
    console.error("[_submitWork]", err);
  }
}

/* ── Projects ───────────────────────────────────────────────────── */
function loadProjects() {
  var grid = document.getElementById("projects-grid");
  if (!grid || grid.dataset.loaded) return;
  grid.dataset.loaded = "1";

  db.collection("projects").onSnapshot(
    function (snap) {
      grid.innerHTML = "";
      if (snap.empty) {
        grid.innerHTML =
          '<div class="empty-state" style="grid-column:1/-1"><p>No projects yet.</p></div>';
        return;
      }
      snap.forEach(function (doc) {
        var p   = doc.data();
        var pct = Math.min(100, Math.max(0, p.progress || 0));
        var card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML =
          '<p class="project-name">' + _esc(p.name || doc.id) + "</p>" +
          '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
          '<p style="font-size:.65rem;color:#4b5563;font-weight:900;margin-top:.5rem;">' + pct + "% complete</p>";
        grid.appendChild(card);
      });
    },
    function (err) { console.warn("[member] projects:", err.message); }
  );
}

/* ── Events ─────────────────────────────────────────────────────── */
function loadEvents() {
  var list = document.getElementById("events-list");
  if (!list || list.dataset.loaded) return;
  list.dataset.loaded = "1";

  db.collection("events").orderBy("date", "desc").onSnapshot(
    function (snap) {
      list.innerHTML = "";
      if (snap.empty) {
        list.innerHTML = '<div class="empty-state"><p>No upcoming events yet.</p></div>';
        return;
      }
      snap.forEach(function (doc) {
        var ev    = doc.data();
        var parts = (ev.date || "").split(" ");
        var card  = document.createElement("div");
        card.className = "event-card";
        card.innerHTML =
          '<div class="event-date-box">' +
          '<p class="event-day">'   + _esc(parts[0] || "—") + "</p>" +
          '<p class="event-month">' + _esc(parts[1] || "")  + "</p>" +
          "</div>" +
          '<div><p class="event-title">' + _esc(ev.title || "") + "</p>" +
          '<p class="event-desc">'  + _esc(ev.description || "") + "</p></div>";
        list.appendChild(card);
      });
    },
    function (err) { console.warn("[member] events:", err.message); }
  );
}

/* ── Feed (announcements) ───────────────────────────────────────── */
function loadFeed() {
  var list = document.getElementById("feed-list");
  if (!list || list.dataset.loaded) return;
  list.dataset.loaded = "1";
  _loadFeedInto("feed-list", 50);
}

function _loadFeedInto(containerId, limit) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var query = db.collection("news").orderBy("date", "desc");
  if (limit) query = query.limit(limit);

  query.onSnapshot(
    function (snap) {
      container.innerHTML = "";
      if (snap.empty) {
        container.innerHTML = '<div class="empty-state"><p>No announcements yet.</p></div>';
        return;
      }
      snap.forEach(function (doc) {
        var n    = doc.data();
        var card = document.createElement("div");
        card.className = "feed-card";
        card.innerHTML =
          '<div style="display:flex;align-items:flex-start;gap:.875rem;">' +
          '<div class="feed-dot"></div>' +
          '<div><p style="font-weight:900;font-size:.85rem;text-transform:uppercase;letter-spacing:.04em;">' +
          _esc(n.title || "") + "</p>" +
          '<p style="font-size:.78rem;color:var(--text-muted);margin-top:.25rem;">' +
          _esc(n.desc || "") + "</p></div></div>";
        container.appendChild(card);
      });
    },
    function (err) { console.warn("[member] feed:", err.message); }
  );
}

/* ── Profile update (Settings tab) ─────────────────────────────── */
async function updateProfile() {
  if (!_user) return;

  var nameVal = (document.getElementById("editName")?.value || "").trim();
  var picVal  = (document.getElementById("editPic")?.value  || "").trim();

  if (!nameVal || nameVal.length < 2) {
    Toast.warning("Name must be at least 2 characters.");
    return;
  }
  if (picVal && !/^https?:\/\//i.test(picVal)) {
    Toast.warning("Avatar URL must start with https://");
    return;
  }

  var update = { fullName: nameVal };
  if (picVal) update.profilePic = picVal;

  try {
    await db.collection("users").doc(_user.uid).update(update);
    await _user.updateProfile({ displayName: nameVal });
    Toast.success("Profile updated!");
  } catch (err) {
    Toast.error("Could not update profile. Please try again.");
    console.error("[updateProfile]", err);
  }
}
window.updateProfile = updateProfile;

/* ── Avatar preview ─────────────────────────────────────────────── */
function previewAvatar(url) {
  var el = document.getElementById("settings-avatar-preview");
  if (el && /^https?:\/\//i.test(url)) el.src = url;
  /* Mark as dirty so _renderProfile doesn't overwrite it */
  var input = document.getElementById("editPic");
  if (input) input.dataset.dirty = "1";
}
window.previewAvatar = previewAvatar;

/* ── Logout ─────────────────────────────────────────────────────── */
function logout() {
  auth.signOut().then(function () { window.location.href = "index.html"; });
}
window.logout = logout;

/* ── DOM helpers ────────────────────────────────────────────────── */
function _setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _setImg(id, src, alt) {
  var el = document.getElementById(id);
  if (!el) return;
  el.src = src;
  if (alt !== undefined) el.alt = alt;
}

function _esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
