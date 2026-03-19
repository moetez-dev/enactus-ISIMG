/* ═══════════════════════════════════════════════════════════════
   index.js  —  Enactus ISIMG Landing Page
   Handles: AOS init, navbar scroll, team grids, modals,
            Firestore events/EOM, and registration form.

   Dependencies (load before this file):
     1. aos.js               ← AOS animations
     2. lucide (CDN)
     3. firebase-app-compat.js
     4. firebase-auth-compat.js
     5. firebase-firestore-compat.js
     6. firebase-config.js   ← exports `auth` and `db`
     7. toast.js             ← exports `Toast`
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const MIN_PASSWORD_LENGTH = 6;

const AUTH_ERRORS = {
  "auth/email-already-in-use":   "An account with this email already exists. Try logging in instead.",
  "auth/weak-password":          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  "auth/invalid-email":          "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/too-many-requests":      "Too many attempts. Please wait a moment and try again.",
};

/* ─────────────────────────────────────────────
   DATA — Projects / Leadership / Enactors
───────────────────────────────────────────── */
const PROJECTS = {
  fytrlance: {
    name:   "Fytrlance",
    tag:    "Technology & Work",
    prob:   "High unemployment rates among tech students in Gabès who lack access to professional freelance markets.",
    sol:    "A specialized platform bridging the gap between ISIMG students and businesses, offering mentorship and real-world projects.",
    impact: "Reducing youth unemployment and building professional portfolios for 50+ students in the Gabès region.",
  },
  bioverto: {
    name:   "Bioverto",
    tag:    "Eco-Wellness",
    prob:   "Chemical waste in household products and a lack of organic alternatives in the local market.",
    sol:    "Producing sustainable, 100% organic household solutions using local resources from the Gabès region.",
    impact: "Promoting a healthy lifestyle and reducing toxic waste in 200+ households across Gabès.",
  },
};

const LEADERSHIP = [
  { name: "Ghofran Chergui",  role: "President",       img: "enactuss/d7f00337-ee47-41ce-bc40-55ed692e535f.jpg",  fb: "#", ig: "#" },
  { name: "Azmi Ben Hassine", role: "Vice President",   img: "enactuss/314f6417-cb4c-440a-9478-a02cb49d403e.jpg",  fb: "#", ig: "#" },
  { name: "Naceur Zidi",      role: "Media Coord",      img: "enactuss/9bd9521e-5ddf-413f-86f5-919e3a823d7d.jpg",  fb: "#", ig: "#" },
  { name: "Moetez Maraach",   role: "Media Board",      img: "enactuss/78151529-6349-4654-84ec-3240848135d5.jpg",  fb: "#", ig: "#" },
  { name: "Jihen Hamdi",      role: "HR Manager",       img: "enactuss/276d56ca-8b5d-4f8d-b8c9-dab7edaf6997.jpg", fb: "#", ig: "#" },
  { name: "Hela Lakhdhar",    role: "Project Manager",  img: "enactuss/34f1e12e-5d8e-48a7-9a3f-b013ad32380f.jpg",  fb: "#", ig: "#" },
  { name: "Mohamed Amin",     role: "Graphic Design",   img: "enactuss/78762702-a127-4b64-aba9-c74281e5ac52.jpg",  fb: "#", ig: "#" },
  { name: "Dhia Ben Salha",   role: "Marketing",        img: "enactuss/c64e3754-0679-4d72-8dc5-1a8e02362da0.jpg",  fb: "#", ig: "#" },
  { name: "Nahla Ben Yahya",  role: "Event Manager",    img: "enactuss/nahla.jpg",                                 fb: "#", ig: "#" },
  { name: "Hamza Miled",      role: "Finance",          img: "enactuss/e530bdbd-fa84-4d33-8ad1-afdae39da2d4.jpg",  fb: "#", ig: "#" },
];

const ENACTORS = [
  { name: "Oumayma Ben Salem", role: "Active Member", img: "enactuss/481186204_1368665821238195_2840693725922138944_n.jpg", fb: "#", ig: "#" },
  { name: "Arij Ganfoudi",     role: "Active Member", img: "enactuss/629262096_893302356808542_3688099736813211604_n.jpg",  fb: "#", ig: "#" },
  { name: "Oussema Lbekri",    role: "Active Member", img: "enactuss/a875a8f7-fd52-49fe-abe8-04fbacfc7b13.jpg",             fb: "#", ig: "#" },
  { name: "Ahlem Ben Moussa",  role: "Active Member", img: "enactuss/482250112_1018968886956683_7822444058078388185_n.jpg", fb: "#", ig: "#" },
  { name: "Khadija Samir",     role: "Active Member", img: "enactuss/Capture d'écran 2026-02-21 010428.png",               fb: "#", ig: "#" },
];

/* ─────────────────────────────────────────────
   SANITIZE
───────────────────────────────────────────── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ─────────────────────────────────────────────
   VALIDATE URL
───────────────────────────────────────────── */
function isSafeUrl(url) {
  return /^https?:\/\//i.test(url ?? "");
}

/* ─────────────────────────────────────────────
   NAVBAR — shrink on scroll
───────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ─────────────────────────────────────────────
   MOBILE MENU TOGGLE
   FIX: Exposed as window.toggleMobileMenu so the
   burger button's onclick attribute can call it.
───────────────────────────────────────────── */
let _menuOpen = false;

function toggleMobileMenu() {
  const btn  = document.getElementById("burgerBtn");
  const menu = document.getElementById("mobileMenu");
  const icon = document.getElementById("menuIcon");
  if (!btn || !menu) return;

  _menuOpen = !_menuOpen;
  menu.classList.toggle("open", _menuOpen);
  btn.setAttribute("aria-expanded", _menuOpen);
  if (icon) {
    icon.setAttribute("data-lucide", _menuOpen ? "x" : "menu");
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

/* Expose globally so HTML onclick="toggleMobileMenu()" works */
window.toggleMobileMenu = toggleMobileMenu;

function initMobileMenu() {
  const btn = document.getElementById("burgerBtn");
  if (!btn) return;
  btn.addEventListener("click", toggleMobileMenu);
}

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
function initProgressBar() {
  const bar = document.getElementById("progress-bar");
  if (!bar) return;

  window.addEventListener("scroll", () => {
    const scrolled  = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (docHeight > 0 ? (scrolled / docHeight) * 100 : 0) + "%";
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   BACK TO TOP
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ─────────────────────────────────────────────
   FILL TEAM GRID
───────────────────────────────────────────── */
function fillGrid(data, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  data.forEach(member => {
    const article = document.createElement("article");
    article.className = "text-center cursor-pointer group";
    article.setAttribute("role", "button");
    article.setAttribute("tabindex", "0");
    article.setAttribute("aria-label", `View ${member.name}, ${member.role}`);

    const activate = () => showMember(member);
    article.addEventListener("click", activate);
    article.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-yellow group-hover:border-yellow group-hover:shadow-lg transition-all duration-300 mb-3 aspect-square";

    const img     = document.createElement("img");
    img.src       = member.img;
    img.loading   = "lazy";
    img.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500";
    img.alt       = "";
    img.onerror   = () => {
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=111&color=FFC222`;
    };
    imgWrapper.appendChild(img);

    const nameEl       = document.createElement("p");
    nameEl.className   = "text-[9px] font-black uppercase tracking-widest truncate px-1";
    nameEl.textContent = member.name;

    const roleEl       = document.createElement("p");
    roleEl.className   = "text-[8px] font-semibold uppercase tracking-widest text-gray-400 truncate px-1 mt-0.5";
    roleEl.textContent = member.role;

    article.appendChild(imgWrapper);
    article.appendChild(nameEl);
    article.appendChild(roleEl);
    grid.appendChild(article);
  });
}

/* ─────────────────────────────────────────────
   MODAL — open / close
───────────────────────────────────────────── */
function openModal() {
  const modal = document.getElementById("unifiedModal");
  if (!modal) return;
  modal.classList.add("active");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("unifiedModal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

/* Expose globally */
window.closeModal = closeModal;

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* ─────────────────────────────────────────────
   OPEN PROJECT MODAL
───────────────────────────────────────────── */
function openProject(id) {
  const p = PROJECTS[id];
  if (!p) return;

  const setTxt = (elId, val) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = val;
  };

  setTxt("projTag",    p.tag);
  setTxt("projName",   p.name);
  setTxt("projProb",   p.prob);
  setTxt("projSol",    p.sol);
  setTxt("projImpact", p.impact);

  document.getElementById("projectContent")?.classList.remove("hidden");
  document.getElementById("memberContent")?.classList.add("hidden");

  openModal();
  if (typeof lucide !== "undefined") lucide.createIcons();
}

/* Expose globally */
window.openProject = openProject;

/* ─────────────────────────────────────────────
   SHOW MEMBER MODAL
───────────────────────────────────────────── */
function showMember(m) {
  const setTxt = (elId, val) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = val;
  };

  setTxt("mName", m.name);
  setTxt("mRole", m.role);

  const mImg = document.getElementById("mImg");
  if (mImg) {
    mImg.src = m.img;
    mImg.alt = m.name;
    mImg.onerror = () => {
      mImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=111&color=FFC222`;
    };
  }

  const setLink = (elId, href) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.href = (href && href !== "#" && isSafeUrl(href)) ? href : "#";
  };

  setLink("mFB", m.fb);
  setLink("mIG", m.ig);

  document.getElementById("memberContent")?.classList.remove("hidden");
  document.getElementById("projectContent")?.classList.add("hidden");

  openModal();
  if (typeof lucide !== "undefined") lucide.createIcons();
}

window.showMember = showMember;

/* ─────────────────────────────────────────────
   TOGGLE ENACTORS LIST
───────────────────────────────────────────── */
function toggleEnactors() {
  const list = document.getElementById("enactors-list");
  const btn  = document.getElementById("toggleEnactorsBtn");
  if (!list) return;

  const isShown = list.style.display === "grid";
  list.style.display = isShown ? "none" : "grid";

  if (btn) {
    btn.setAttribute("aria-expanded", !isShown);
    const label = btn.querySelector("p");
    if (label) label.textContent = isShown ? "Show All Enactors" : "Hide Enactors";
  }

  if (!isShown) {
    setTimeout(() => list.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
}

window.toggleEnactors = toggleEnactors;

/* ─────────────────────────────────────────────
   FIRESTORE — ENACTOR OF THE MONTH
───────────────────────────────────────────── */
function loadEOM() {
  db.collection("settings").doc("eom").onSnapshot(doc => {
    if (!doc.exists) return;
    const data = doc.data();

    const nameEl = document.getElementById("eom-name");
    const descEl = document.getElementById("eom-desc");
    const imgEl  = document.getElementById("eom-img");

    if (nameEl) nameEl.textContent = data.name || "";
    if (descEl) descEl.textContent = data.desc || "";
    if (imgEl && data.img && isSafeUrl(data.img)) imgEl.src = data.img;

  }, err => {
    console.warn("[loadEOM]", err.message);
  });
}

/* ─────────────────────────────────────────────
   FIRESTORE — EVENTS TIMELINE
───────────────────────────────────────────── */
function loadTimeline() {
  const container = document.getElementById("events-container");
  if (!container) return;

  db.collection("events")
    .orderBy("date", "asc")
    .onSnapshot(snapshot => {

      while (container.firstChild) container.removeChild(container.firstChild);

      if (snapshot.empty) {
        const empty       = document.createElement("div");
        empty.className   = "text-center text-gray-400 uppercase tracking-widest text-xs py-12";
        empty.textContent = "No upcoming events scheduled yet. Check back soon!";
        container.appendChild(empty);
        return;
      }

      snapshot.forEach((doc, index) => {
        const ev     = doc.data();
        const isEven = index % 2 === 0;

        const row       = document.createElement("div");
        row.className   = `relative flex items-center ${isEven ? "md:flex-row-reverse justify-end" : "justify-start"} group`;
        row.setAttribute("role", "listitem");

        const dot       = document.createElement("div");
        dot.className   = "absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-yellow rounded-full border-4 border-white shadow-md z-10 hidden md:block";
        dot.setAttribute("aria-hidden", "true");
        row.appendChild(dot);

        const card      = document.createElement("div");
        card.className  = "w-full md:w-[45%] p-8 bg-white rounded-[2.5rem] border-2 border-gray-100 hover:border-yellow hover:shadow-xl transition-all duration-300 cursor-default";
        card.setAttribute("data-aos", isEven ? "fade-left" : "fade-right");

        const dateEl        = document.createElement("time");
        dateEl.className    = "text-[9px] font-black uppercase tracking-widest text-yellow";
        dateEl.textContent  = ev.date || "";

        const titleEl       = document.createElement("h4");
        titleEl.className   = "text-xl font-black font-heading mt-2 uppercase";
        titleEl.textContent = ev.title || "";

        const descEl        = document.createElement("p");
        descEl.className    = "mt-3 text-sm text-gray-500 leading-relaxed";
        descEl.textContent  = ev.description || "";

        card.appendChild(dateEl);
        card.appendChild(titleEl);
        card.appendChild(descEl);
        row.appendChild(card);
        container.appendChild(row);
      });

      if (typeof AOS !== "undefined") AOS.refresh();

    }, err => {
      while (container.firstChild) container.removeChild(container.firstChild);

      const errEl       = document.createElement("div");
      errEl.className   = "text-center text-gray-400 text-xs py-10";
      errEl.textContent = "Could not load events. Please try again later.";
      container.appendChild(errEl);

      console.error("[loadTimeline]", err.message);
    });
}

/* ─────────────────────────────────────────────
   REGISTRATION FORM
───────────────────────────────────────────── */
function initRegistrationForm() {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const fullName   = sanitize((document.getElementById("regName")?.value     ?? "").trim());
    const email      =          (document.getElementById("regEmail")?.value    ?? "").trim();
    const password   =          (document.getElementById("regPassword")?.value ?? "");
    const motivation = sanitize((document.getElementById("regMotivation")?.value ?? "").trim());
    const department = document.querySelector("input[name='dept']:checked")?.value ?? "";

    if (!fullName || fullName.length < 3) {
      Toast.warning("Please enter your full name (at least 3 characters).");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.warning("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      Toast.warning(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!department) {
      Toast.warning("Please select a department.");
      return;
    }
    if (!motivation) {
      Toast.warning("Please tell us why you want to join Enactus ISIMG.");
      return;
    }

    const btn = document.getElementById("submitBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user           = userCredential.user;

      await user.updateProfile({ displayName: fullName });
      await user.sendEmailVerification();

      await db.collection("users").doc(user.uid).set({
        uid:        user.uid,
        fullName:   fullName,
        email:      email,
        department: department,
        motivation: motivation,

        role:      "member",
        status:    "pending",

        points:    0,
        level:     "Junior",
        badges:    [],
        profilePic: null,

        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await auth.signOut();

      Toast.success("Application submitted! Check your email to verify your address before logging in.");
      form.reset();

      setTimeout(() => { window.location.href = "login.html"; }, 3000);

    } catch (err) {
      const message = AUTH_ERRORS[err.code] ?? `Registration failed: ${err.message}`;
      Toast.error(message);
      console.error("[registrationForm]", err.code, err.message);

    } finally {
      if (btn) {
        btn.disabled    = false;
        btn.textContent = "Submit Application →";
      }
    }
  });
}

/* ─────────────────────────────────────────────
   INIT — runs after DOM is ready
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS    !== "undefined") AOS.init({ duration: 750, offset: 80, once: true, easing: "ease-out-cubic" });
  if (typeof lucide !== "undefined") lucide.createIcons();

  initNavbar();
  initMobileMenu();
  initProgressBar();
  initBackToTop();

  fillGrid(LEADERSHIP, "leadership-grid");
  fillGrid(ENACTORS,   "enactors-list");

  /* Modal — close on overlay click */
  const modal = document.getElementById("unifiedModal");
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }

  loadEOM();
  loadTimeline();

  initRegistrationForm();

  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});