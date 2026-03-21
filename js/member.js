/* ═══════════════════════════════════════════════════════════════
   member.js  —  Enactus ISIMG Member Portal
   Handles: auth guard, profile rendering, leaderboard, EOM,
            feed, projects, events, missions, settings update.

   FIX: Original member.js upload was actually a copy of register.js.
        This is the correct member portal logic.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   LEVEL SYSTEM
───────────────────────────────────────────── */
var LEVELS = [
  { name: "Junior",   min: 0   },
  { name: "Active",   min: 100 },
  { name: "Expert",   min: 300 },
  { name: "Legend",   min: 600 },
];

function getLevel(pts) {
  var level = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (pts >= LEVELS[i].min) level = LEVELS[i];
  }
  return level;
}

function getNextLevelPts(pts) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (pts < LEVELS[i].min) return LEVELS[i].min;
  }
  return null; // max level
}

/* ─────────────────────────────────────────────
   GLOBAL STATE
───────────────────────────────────────────── */
var _currentUser = null;
var _currentData = null;
var _listenersAttached = false;

/* ─────────────────────────────────────────────
   AUTH GUARD — init on DOMContentLoaded
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  AuthGuard.requireMember(function (user, data) {
    _currentUser = user;
    _currentData = data;
    initMemberPortal(user, data);
  });
});

/* ─────────────────────────────────────────────
   INIT MEMBER PORTAL
───────────────────────────────────────────── */
function initMemberPortal(user, data) {
  renderProfile(user, data);
  loadEOM();
  loadLeaderboard(user.uid);
  loadMissions("dash-missions-preview", 3);
  loadFeedPreview();
  // Full tabs loaded lazily by switchTab in HTML
}

/* ─────────────────────────────────────────────
   RENDER PROFILE
───────────────────────────────────────────── */
function renderProfile(user, data) {
  var pts   = data.points || 0;
  var level = getLevel(pts);
  var name  = data.fullName || user.displayName || "Enactor";
  var dept  = data.department || "";
  var pic   = (data.profilePic && /^https?:\/\//i.test(data.profilePic))
    ? data.profilePic
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=111&color=FFC222&size=200";

  // Sidebar
  setEl("sidebar-name", name);
  setEl("sidebar-dept", dept);
  setImg("sidebar-avatar", pic, name);
  setImg("topbar-avatar", pic, name);
  setEl("xp-level-label", level.name);
  setEl("xp-pts-label", pts + " pts");

  // XP bar
  var nextPts = getNextLevelPts(pts);
  var pct = nextPts ? Math.min(100, Math.round((pts / nextPts) * 100)) : 100;
  var fill = document.getElementById("xp-fill");
  if (fill) fill.style.width = pct + "%";

  // Topbar
  setEl("topbar-level", level.name);
  setEl("topbar-points", pts);

  // Dashboard welcome
  setEl("welcomeName", name.split(" ")[0]);
  setEl("dash-points", pts);
  setEl("dash-level", level.name);
  setEl("dash-dept", dept || "—");

  // Badges
  updateBadges(pts, data.badges || []);

  // Settings tab
  setEl("settings-name-label", name);
  setEl("settings-dept-label", dept);
  setEl("settings-email", user.email || "—");
  setEl("settings-points", pts + " pts");
  setEl("settings-level", level.name);
  setImg("settings-avatar-preview", pic, name);

  var editName = document.getElementById("editName");
  if (editName) editName.value = name;
  var editPic = document.getElementById("editPic");
  if (editPic && data.profilePic && /^https?:\/\//i.test(data.profilePic)) {
    editPic.value = data.profilePic;
  }

  // Listen for live updates
  if (!_listenersAttached) {
    _listenersAttached = true;
    db.collection("users").doc(user.uid).onSnapshot(function (doc) {
      if (!doc.exists) return;
      var d = doc.data();
      _currentData = d;
      renderProfile(user, d);
    });
  }
}

function updateBadges(pts, earnedBadges) {
  // Active badge: 1+ completed task
  var activeBadge = document.getElementById("badge-active");
  if (activeBadge && (pts >= 1 || earnedBadges.includes("active"))) {
    activeBadge.classList.add("earned");
  }
  var expertBadge = document.getElementById("badge-expert");
  if (expertBadge && pts >= 300) expertBadge.classList.add("earned");
  var legendBadge = document.getElementById("badge-legend");
  if (legendBadge && pts >= 600) legendBadge.classList.add("earned");
}

/* ─────────────────────────────────────────────
   LOAD EOM
───────────────────────────────────────────── */
function loadEOM() {
  db.collection("settings").doc("eom").onSnapshot(function (doc) {
    if (!doc.exists) {
      setEl("eom-name", "TBA");
      setEl("eom-desc", "");
      return;
    }
    var d = doc.data();
    setEl("eom-name", d.name || "TBA");
    setEl("eom-desc", d.desc || "");
    var imgEl = document.getElementById("eom-img");
    if (imgEl && d.img && /^https?:\/\//i.test(d.img)) imgEl.src = d.img;
  }, function (err) {
    console.warn("[member] loadEOM:", err.message);
  });
}

/* ─────────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────────── */
function loadLeaderboard(currentUid) {
  db.collection("users")
    .where("status", "==", "approved")
    .orderBy("points", "desc")
    .limit(10)
    .onSnapshot(function (snap) {
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
        rankEl.className = "lb-rank";
        rankEl.textContent = rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank;

        var avatar = document.createElement("img");
        avatar.className = "lb-avatar";
        avatar.src = (u.profilePic && /^https?:\/\//i.test(u.profilePic))
          ? u.profilePic
          : "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.fullName || "U") + "&background=111&color=FFC222&size=64";
        avatar.alt = u.fullName || "";

        var nameEl = document.createElement("span");
        nameEl.className = "lb-name";
        nameEl.textContent = u.fullName || "Member";

        var ptsEl = document.createElement("span");
        ptsEl.className = "lb-pts" + (rank <= 3 ? " top" : "");
        ptsEl.textContent = pts + " pts";

        row.appendChild(rankEl);
        row.appendChild(avatar);
        row.appendChild(nameEl);
        row.appendChild(ptsEl);
        list.appendChild(row);
      });
    }, function (err) {
      console.warn("[member] loadLeaderboard:", err.message);
    });
}

/* ─────────────────────────────────────────────
   LOAD MISSIONS
   containerId: 'missions-list' (full) or 'dash-missions-preview' (preview)
───────────────────────────────────────────── */
function loadMissions(containerId, limit) {
  if (!_currentUser) return;
  var container = document.getElementById(containerId);
  if (!container) return;

  var query = db.collection("tasks")
    .where("uid", "==", _currentUser.uid)
    .orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);

  query.onSnapshot(function (snap) {
    container.innerHTML = "";
    if (snap.empty) {
      container.innerHTML = '<div class="empty-state"><p>No missions assigned yet.</p></div>';
      return;
    }

    var badge = document.getElementById("badge-missions");
    var liveCnt = 0;

    snap.forEach(function (doc) {
      var t    = doc.data();
      var card = document.createElement("div");
      var statusClass = t.completed ? "done" : (t.submitted ? "reviewing" : "");
      card.className = "mission-card " + statusClass;

      var header = document.createElement("div");
      header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:0.625rem;";

      var title = document.createElement("p");
      title.className = "mission-title";
      title.textContent = t.text || "Mission";

      var ptsBadge = document.createElement("span");
      ptsBadge.className = "mission-pts";
      ptsBadge.textContent = (t.points || 0) + " pts";

      header.appendChild(title);
      header.appendChild(ptsBadge);
      card.appendChild(header);

      if (t.completed) {
        var done = document.createElement("p");
        done.style.cssText = "font-size:0.72rem;color:var(--green);font-weight:900;";
        done.textContent = "✓ Completed & approved";
        card.appendChild(done);
      } else if (t.submitted) {
        var rev = document.createElement("p");
        rev.style.cssText = "font-size:0.72rem;color:var(--orange);font-weight:900;";
        rev.textContent = "⏳ Under review...";
        card.appendChild(rev);
      } else {
        liveCnt++;
        // Submit work input
        var submitRow = document.createElement("div");
        submitRow.style.cssText = "display:flex;gap:0.5rem;margin-top:0.625rem;";

        var input = document.createElement("input");
        input.type = "url";
        input.className = "link-input";
        input.placeholder = "Paste your work link (https://...)";

        var btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.style.cssText = "padding:0.6rem 1rem;font-size:0.6rem;white-space:nowrap;";
        btn.textContent = "Submit";

        (function (docId, inputEl) {
          btn.addEventListener("click", function () {
            submitWork(docId, inputEl.value.trim());
          });
        })(doc.id, input);

        submitRow.appendChild(input);
        submitRow.appendChild(btn);
        card.appendChild(submitRow);
      }

      container.appendChild(card);
    });

    if (badge) {
      badge.textContent = liveCnt;
      badge.classList.toggle("show", liveCnt > 0);
    }
  }, function (err) {
    console.warn("[member] loadMissions:", err.message);
  });
}

/* ─────────────────────────────────────────────
   SUBMIT WORK
───────────────────────────────────────────── */
async function submitWork(taskId, link) {
  if (!link || !/^https?:\/\//i.test(link)) {
    Toast.warning("Please paste a valid URL starting with https://");
    return;
  }
  try {
    await db.collection("tasks").doc(taskId).update({
      submitted: true,
      status: "pending_review",
      workLink: link,
    });
    Toast.success("Work submitted! The admin will review it soon.");
  } catch (err) {
    Toast.error("Could not submit work. Please try again.");
    console.error("[submitWork]", err);
  }
}

/* ─────────────────────────────────────────────
   LOAD PROJECTS
───────────────────────────────────────────── */
function loadProjects() {
  var grid = document.getElementById("projects-grid");
  if (!grid || grid.dataset.loaded) return;
  grid.dataset.loaded = "1";

  db.collection("projects").onSnapshot(function (snap) {
    grid.innerHTML = "";
    if (snap.empty) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>No projects yet.</p></div>';
      return;
    }
    snap.forEach(function (doc) {
      var p    = doc.data();
      var card = document.createElement("div");
      card.className = "project-card";

      var pct = Math.min(100, Math.max(0, p.progress || 0));

      card.innerHTML =
        '<p class="project-name">' + escHtml(p.name || doc.id) + '</p>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<p style="font-size:0.65rem;color:#4b5563;font-weight:900;margin-top:0.5rem;">' + pct + '% complete</p>';

      grid.appendChild(card);
    });
  }, function (err) {
    console.warn("[member] loadProjects:", err.message);
  });
}

/* ─────────────────────────────────────────────
   LOAD EVENTS
───────────────────────────────────────────── */
function loadEvents() {
  var list = document.getElementById("events-list");
  if (!list || list.dataset.loaded) return;
  list.dataset.loaded = "1";

  db.collection("events")
    .orderBy("createdAt", "desc")
    .onSnapshot(function (snap) {
      list.innerHTML = "";
      if (snap.empty) {
        list.innerHTML = '<div class="empty-state"><p>No upcoming events yet.</p></div>';
        return;
      }
      snap.forEach(function (doc) {
        var ev   = doc.data();
        var card = document.createElement("div");
        card.className = "event-card";

        var dateParts = (ev.date || "").split(" ");
        var day   = dateParts[0] || "—";
        var month = dateParts[1] || "";

        card.innerHTML =
          '<div class="event-date-box"><p class="event-day">' + escHtml(day) + '</p>' +
          '<p class="event-month">' + escHtml(month) + '</p></div>' +
          '<div><p class="event-title">' + escHtml(ev.title || "") + '</p>' +
          '<p class="event-desc">' + escHtml(ev.description || "") + '</p></div>';

        list.appendChild(card);
      });
    }, function (err) {
      console.warn("[member] loadEvents:", err.message);
    });
}

/* ─────────────────────────────────────────────
   LOAD FEED (announcements)
───────────────────────────────────────────── */
function loadFeed() {
  var list = document.getElementById("feed-list");
  if (!list || list.dataset.loaded) return;
  list.dataset.loaded = "1";
  _loadFeedInto(list, 50);
}

function loadFeedPreview() {
  var list = document.getElementById("dash-feed-preview");
  if (!list) return;
  _loadFeedInto(list, 3);
}

function _loadFeedInto(container, limit) {
  var query = db.collection("news").orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);

  query.onSnapshot(function (snap) {
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
        '<div style="display:flex;align-items:flex-start;gap:0.875rem;">' +
        '<div class="feed-dot"></div>' +
        '<div><p style="font-weight:900;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;">' + escHtml(n.title || "") + '</p>' +
        '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.25rem;">' + escHtml(n.desc || "") + '</p></div></div>';
      container.appendChild(card);
    });
  }, function (err) {
    console.warn("[member] loadFeed:", err.message);
  });
}

/* ─────────────────────────────────────────────
   UPDATE PROFILE (Settings tab)
   Exposed as window._updateProfile so the HTML
   inline onclick can delegate here.
───────────────────────────────────────────── */
async function _updateProfile() {
  if (!_currentUser) return;
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
    await db.collection("users").doc(_currentUser.uid).update(update);
    await _currentUser.updateProfile({ displayName: nameVal });
    Toast.success("Profile updated successfully!");
    if (picVal) {
      var previews = document.querySelectorAll("#settings-avatar-preview,#sidebar-avatar,#topbar-avatar");
      previews.forEach(function (el) { el.src = picVal; });
    }
    setEl("settings-name-label", nameVal);
    setEl("sidebar-name", nameVal);
  } catch (err) {
    Toast.error("Could not update profile. Please try again.");
    console.error("[_updateProfile]", err);
  }
}

window._updateProfile = _updateProfile;

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
function logout() {
  auth.signOut().then(function () { window.location.href = "index.html"; });
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function setEl(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setImg(id, src, alt) {
  var el = document.getElementById(id);
  if (!el) return;
  el.src = src;
  if (alt) el.alt = alt;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}