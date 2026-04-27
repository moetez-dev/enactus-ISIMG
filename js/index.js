/* ================================================================ index.js — Enactus ISIMG Landing Page Handles: AOS init, navbar scroll, mobile menu, back-to-top, progress bar, team grids, project/member modals, Firestore events timeline, EOM display. Script load order (index.html): 1. tailwind play cdn 2. aos.css + aos.js 3. lucide 4. firebase sdks (app / auth / firestore) 5. firebase-config.js 6. toast.js 7. register.js 8. THIS FILE ================================================================ */ "use strict";
/* ── Project data ───────────────────────────────────────────────── */ var PROJECTS =
  {
    fytrlance: {
      name: "Fytrlance",
      tag: "Technology & Work",
      prob: "High unemployment rates among tech students in Gabès who lack access to professional freelance markets.",
      sol: "A specialised platform bridging ISIMG students and businesses, offering mentorship and real-world projects.",
      impact:
        "Reducing youth unemployment and building professional portfolios for 50+ students in the Gabès region.",
    },
    bioverto: {
      name: "Bioverto",
      tag: "Eco-Wellness",
      prob: "Chemical waste in household products and a lack of organic alternatives in the local market.",
      sol: "Producing sustainable, 100% organic household solutions using local resources from the Gabès region.",
      impact:
        "Promoting a healthy lifestyle and reducing toxic waste in 200+ households across Gabès.",
    },
    aeroflora: {
      name: "Aeroflora",
      tag: "Technology & Work",
      prob: "Limited access to modern agricultural techniques in urban areas.",
      sol: "Providing innovative greenhouse solutions for urban agriculture, enabling year-round cultivation.",
      impact:
        "Promoting a healthy lifestyle and reducing toxic waste in 200+ households across Gabès.",
    },
  };
/* ── Team data ──────────────────────────────────────────────────── */ var LEADERSHIP =
  [
    {
      name: "Ghofran Chergui",
      role: "President",
      img: "enactuss/d7f00337-ee47-41ce-bc40-55ed692e535f.jpg",
      fb: "https://www.facebook.com/ghofrane.ch.482052",
      ig: "https://www.instagram.com/ghofranechergui/?utm_source=ig_web_button_share_sheet",
    },
    {
      name: "Azmi Ben Hassine",
      role: "Vice President",
      img: "enactuss/314f6417-cb4c-440a-9478-a02cb49d403e.jpg",
      fb: "https://www.facebook.com/share/18oC3pmxQx/?mibextid=wwXIfr",
      ig: "https://www.instagram.com/azmi_ben_hassine?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    {
      name: "Naceur Zidi",
      role: "Media Coord",
      img: "enactuss/9bd9521e-5ddf-413f-86f5-919e3a823d7d.jpg",
      fb: "https://www.facebook.com/naser.zidi.351",
      ig: "https://www.instagram.com/si_naceur02?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    {
      name: "Moetez Maraach",
      role: "Media Board",
      img: "enactuss/78151529-6349-4654-84ec-3240848135d5.jpg",
      fb: "https://www.facebook.com/moetez.maraach",
      ig: "https://www.instagram.com/moet_________ez?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D",
    },
    {
      name: "Jihen Hamdi",
      role: "HR Manager",
      img: "enactuss/276d56ca-8b5d-4f8d-b8c9-dab7edaf6997.jpg",
      fb: "https://www.facebook.com/hamdi.jihen.35",
      ig: "https://www.instagram.com/jihenhamdi_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    {
      name: "Hela Lakhdhar",
      role: "Project Manager",
      img: "enactuss/34f1e12e-5d8e-48a7-9a3f-b013ad32380f.jpg",
      fb: "https://www.facebook.com/hela.lakhdhar.2025",
      ig: "https://www.instagram.com/hela.lakhdhar?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    {
      name: "Mohamed Amin",
      role: "Graphic Design",
      img: "enactuss/78762702-a127-4b64-aba9-c74281e5ac52.jpg",
      fb: "https://www.facebook.com/amin.alouane.73",
      ig: "https://www.instagram.com/mohamed_al_amin71/?utm_source=ig_web_button_share_sheet",
    },
    {
      name: "Dhia Ben Salha",
      role: "Marketing",
      img: "enactuss/c64e3754-0679-4d72-8dc5-1a8e02362da0.jpg",
      fb: "https://www.facebook.com/dhia.ben.salha.2025",
      ig: "#",
    },
    {
      name: "Nahla Ben Yahya",
      role: "Event Manager",
      img: "enactuss/nahla.jpg",
      fb: "https://www.facebook.com/nhlt.bnyhy",
      ig: "https://www.instagram.com/nahla_benyahia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
    {
      name: "Oumayma Ben Salem",
      role: "Finance",
      img: "enactuss/481186204_1368665821238195_2840693725922138944_n.jpg",
      fb: "https://www.facebook.com/oumayma.salem.31",
      ig: "https://www.instagram.com/oumayma.sl.31?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    },
  ];
var ENACTORS = [
  {
    name: "Hamza Miled",
    role: "Active Member",
    img: "enactuss/e530bdbd-fa84-4d33-8ad1-afdae39da2d4.jpg",
    fb: "https://www.facebook.com/hamza.miled.3994",
    ig: "https://www.instagram.com/hamza.miled_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  },
 
  {
    name: "Ahlem Ben Moussa",
    role: "Active Member",
    img: "enactuss/482250112_1018968886956683_7822444058078388185_n.jpg",
    fb: "https://www.facebook.com/ahlam.benmoussa.904",
    ig: "https://www.instagram.com/ahlaam.benm/?utm_source=ig_web_button_share_sheet",
  },
  /* FIX: filename had spaces + apostrophe → renamed to khadija-samir.png */ {
    name: "Khadija Samir",
    role: "Active Member",
    img: "enactuss/khadija-samir.png",
    fb: "https://www.facebook.com/khadija.samir.9085",
    ig: "https://www.instagram.com/khadija_samiir?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  },
];
/* ── Helpers ────────────────────────────────────────────────────── */ function isSafeUrl(
  url,
) {
  return /^https?:\/\//i.test(url || "");
}
/* ── Navbar shrink on scroll ────────────────────────────────────── */ function initNavbar() {
  var nav = document.getElementById("navbar");
  if (!nav) return;
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
/* ── Mobile menu ────────────────────────────────────────────────── */ var _menuOpen = false;
function toggleMobileMenu() {
  var btn = document.getElementById("burgerBtn");
  var menu = document.getElementById("mobileMenu");
  var icon = document.getElementById("menuIcon");
  if (!btn || !menu) return;
  _menuOpen = !_menuOpen;
  menu.classList.toggle("open", _menuOpen);
  btn.setAttribute("aria-expanded", String(_menuOpen));
  if (icon) {
    icon.setAttribute("data-lucide", _menuOpen ? "x" : "menu");
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}
window.toggleMobileMenu = toggleMobileMenu;
function initMobileMenu() {
  var btn = document.getElementById("burgerBtn");
  if (btn) btn.addEventListener("click", toggleMobileMenu);
  /* Close menu when a nav link is clicked */ document
    .querySelectorAll("#mobileMenu a")
    .forEach(function (link) {
      link.addEventListener("click", function () {
        var menu = document.getElementById("mobileMenu");
        var icon = document.getElementById("menuIcon");
        if (menu) menu.classList.remove("open");
        var burgerBtn = document.getElementById("burgerBtn");
        if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "false");
        if (icon) {
          icon.setAttribute("data-lucide", "menu");
          if (typeof lucide !== "undefined") lucide.createIcons();
        }
        _menuOpen = false;
      });
    });
}
/* ── Scroll progress bar ────────────────────────────────────────── */ function initProgressBar() {
  var bar = document.getElementById("progress-bar");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    function () {
      var scrolled = window.scrollY;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width =
        (docHeight > 0 ? (scrolled / docHeight) * 100 : 0) + "%";
    },
    { passive: true },
  );
}
/* ── Back-to-top button ─────────────────────────────────────────── */ function initBackToTop() {
  var btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    function () {
      btn.classList.toggle("visible", window.scrollY > 400);
    },
    { passive: true },
  );
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
/* ── Build team / enactor grid ──────────────────────────────────── */ function fillGrid(
  data,
  gridId,
) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  data.forEach(function (member) {
    var article = document.createElement("article");
    article.className = "text-center cursor-pointer group";
    article.setAttribute("role", "button");
    article.setAttribute("tabindex", "0");
    article.setAttribute(
      "aria-label",
      "View " + member.name + ", " + member.role,
    );
    function activate() {
      showMember(member);
    }
    article.addEventListener("click", activate);
    article.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
    var imgWrapper = document.createElement("div");
    imgWrapper.className =
      "rounded-[2rem] overflow-hidden border-2 border-transparent group-hover:border-yellow group-hover:shadow-lg transition-all duration-300 mb-3 aspect-square";
    var img = document.createElement("img");
    img.src = member.img;
    img.loading = "lazy";
    img.className =
      "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500";
    img.alt = member.name;
    img.onerror = function () {
      img.src =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(member.name) +
        "&background=111&color=FFC222&size=200";
    };
    imgWrapper.appendChild(img);
    var nameEl = document.createElement("p");
    nameEl.className =
      "text-[9px] font-black uppercase tracking-widest truncate px-1 text-white";
    nameEl.textContent = member.name;
    var roleEl = document.createElement("p");
    roleEl.className =
      "text-[8px] font-semibold uppercase tracking-widest text-gray-400 truncate px-1 mt-0.5";
    roleEl.textContent = member.role;
    article.appendChild(imgWrapper);
    article.appendChild(nameEl);
    article.appendChild(roleEl);
    grid.appendChild(article);
  });
}
/* ── Modal helpers ──────────────────────────────────────────────── */ function openModal() {
  var modal = document.getElementById("unifiedModal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  var modal = document.getElementById("unifiedModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}
window.closeModal = closeModal;
/* ── Open project modal ─────────────────────────────────────────── */ function openProject(
  id,
) {
  var p = PROJECTS[id];
  if (!p) return;
  function setTxt(elId, val) {
    var el = document.getElementById(elId);
    if (el) el.textContent = val;
  }
  setTxt("projTag", p.tag);
  setTxt("projName", p.name);
  setTxt("projProb", p.prob);
  setTxt("projSol", p.sol);
  setTxt("projImpact", p.impact);
  var pc = document.getElementById("projectContent");
  var mc = document.getElementById("memberContent");
  if (pc) pc.classList.remove("hidden");
  if (mc) mc.classList.add("hidden");
  openModal();
  if (typeof lucide !== "undefined") lucide.createIcons();
}
window.openProject = openProject;
/* ── Open member modal ──────────────────────────────────────────── */ function showMember(
  m,
) {
  function setTxt(elId, val) {
    var el = document.getElementById(elId);
    if (el) el.textContent = val;
  }
  setTxt("mName", m.name);
  setTxt("mRole", m.role);
  var mImg = document.getElementById("mImg");
  if (mImg) {
    mImg.src = m.img;
    mImg.alt = m.name;
    mImg.onerror = function () {
      mImg.src =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(m.name) +
        "&background=111&color=FFC222&size=280";
    };
  }
  function setLink(elId, href) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.href = href && href !== "#" && isSafeUrl(href) ? href : "#";
  }
  setLink("mFB", m.fb);
  setLink("mIG", m.ig);
  var mc = document.getElementById("memberContent");
  var pc = document.getElementById("projectContent");
  if (mc) mc.classList.remove("hidden");
  if (pc) pc.classList.add("hidden");
  openModal();
  if (typeof lucide !== "undefined") lucide.createIcons();
}
window.showMember = showMember;
/* ── Toggle enactors list ───────────────────────────────────────── */ function toggleEnactors() {
  var list = document.getElementById("enactors-list");
  var btn = document.getElementById("toggleEnactorsBtn");
  if (!list) return;
  var isShown = list.style.display === "grid";
  list.style.display = isShown ? "none" : "grid";
  if (btn) {
    btn.setAttribute("aria-expanded", String(!isShown));
    var label = btn.querySelector("p");
    if (label)
      label.textContent = isShown ? "Show All Enactors" : "Hide Enactors";
  }
  if (!isShown) {
    setTimeout(function () {
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}
window.toggleEnactors = toggleEnactors;
/* ── Firestore: Enactor of the Month ───────────────────────────── */ function loadEOM() {
  db.collection("settings")
    .doc("eom")
    .onSnapshot(
      function (doc) {
        if (!doc.exists) return;
        var data = doc.data();
        var nameEl = document.getElementById("eom-name");
        var descEl = document.getElementById("eom-desc");
        var imgEl = document.getElementById("eom-img");
        if (nameEl && data.name) nameEl.textContent = data.name;
        if (descEl && data.desc) descEl.textContent = data.desc;
        if (imgEl && data.img && isSafeUrl(data.img)) imgEl.src = data.img;
      },
      function (err) {
        console.warn("[loadEOM]", err.message);
      },
    );
}
/* ── DOMContentLoaded init ──────────────────────────────────────── */ document.addEventListener(
  "DOMContentLoaded",
  function () {
    /* AOS animations */ if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 750,
        offset: 80,
        once: true,
        easing: "ease-out-cubic",
      });
    }
    /* Lucide icons */ if (typeof lucide !== "undefined") lucide.createIcons();
    /* UI */ initNavbar();
    initMobileMenu();
    initProgressBar();
    initBackToTop();
    /* Teams */ fillGrid(LEADERSHIP, "leadership-grid");
    fillGrid(ENACTORS, "enactors-list");
    /* Project card event listeners */ var projFytrlance =
      document.getElementById("proj-fytrlance");
    if (projFytrlance) {
      projFytrlance.addEventListener("click", function () {
        openProject("fytrlance");
      });
      projFytrlance.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject("fytrlance");
        }
      });
    }
    var projBioverto = document.getElementById("proj-bioverto");
    if (projBioverto) {
      projBioverto.addEventListener("click", function () {
        openProject("bioverto");
      });
      projBioverto.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject("bioverto");
        }
      });
    }
    var projAeroflora = document.getElementById("proj-aeroflora");
    if (projAeroflora) {
      projAeroflora.addEventListener("click", function () {
        openProject("aeroflora");
      });
      projAeroflora.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject("aeroflora");
        }
      });
    }
    /* Modal: close on overlay click or Escape key */ var modal =
      document.getElementById("unifiedModal");
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
    /* Firestore */ loadEOM();
    /* Footer year */ var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  },
);
