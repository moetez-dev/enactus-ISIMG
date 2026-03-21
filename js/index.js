// =====================
// PROJECTS
// =====================
var PROJECTS = {
  fytrlance: {
    name: "Fytrlance",
    tag: "Technology & Work",
    img: "enactuss/8439c2ad-e88c-4f4b-84ef-c9282ffa9e41.jpg",
    prob: "High unemployment rates among tech students in Gabès who lack access to professional freelance markets.",
    sol: "A specialised platform bridging ISIMG students and businesses, offering mentorship and real-world projects.",
    impact: "Reducing youth unemployment and building professional portfolios for 50+ students in the Gabès region."
  },
  bioverto: {
    name: "Bioverto",
    tag: "Eco-Wellness",
    img: "enactuss/f67a7f6d-ea98-4995-b4f4-49a903c03b98.jpg",
    prob: "Chemical waste in household products and a lack of organic alternatives in the local market.",
    sol: "Producing sustainable, 100% organic household solutions using local resources from the Gabès region.",
    impact: "Promoting a healthy lifestyle and reducing toxic waste in 200+ households across Gabès."
  }
};


// =====================
// LEADERSHIP TEAM
// =====================
var LEADERSHIP = [
  { name: "Ghofran Chergui", img: "enactuss/d7f00337-ee47-41ce-bc40-55ed692e535f.jpg", role: "President", fb: "#", ig: "#" },
  { name: "Azmi Ben Hassine", img: "enactuss/314f6417-cb4c-440a-9478-a02cb49d403e.jpg", role: "Vice President", fb: "#", ig: "#" },
  { name: "Naceur Zidi", img: "enactuss/9bd9521e-5ddf-413f-86f5-919e3a823d7d.jpg", role: "Media Coord", fb: "#", ig: "#" },
  { name: "Moetez Maraach", img: "enactuss/78151529-6349-4654-84ec-3240848135d5.jpg", role: "Media Board", fb: "#", ig: "#" },
  { name: "Jihen Hamdi", img: "enactuss/276d56ca-8b5d-4f8d-b8c9-dab7edaf6997.jpg", role: "HR Manager", fb: "#", ig: "#" },
  { name: "Hela Lakhdhar", img: "enactuss/34f1e12e-5d8e-48a7-9a3f-b013ad32380f.jpg", role: "Project Manager", fb: "#", ig: "#" },
  { name: "Mohamed Amin", img: "enactuss/78762702-a127-4b64-aba9-c74281e5ac52.jpg", role: "Graphic Design", fb: "#", ig: "#" },
  { name: "Dhia Ben Salha", img: "enactuss/c64e3754-0679-4d72-8dc5-1a8e02362da0.jpg", role: "Marketing", fb: "#", ig: "#" },
  { name: "Nahla Ben Yahya", img: "enactuss/nahla.jpg", role: "Event Manager", fb: "#", ig: "#" },
  { name: "Hamza Miled", img: "enactuss/e530bdbd-fa84-4d33-8ad1-afdae39da2d4.jpg", role: "Finance", fb: "#", ig: "#" }
];


// =====================
// ACTIVE MEMBERS
// =====================
var ENACTORS = [
  { name: "Oumayma Ben Salem", img: "enactuss/481186204_1368665821238195_2840693725922138944_n.jpg", role: "Active Member", fb: "#", ig: "#" },
  { name: "Arij Ganfoudi", img: "enactuss/629262096_893302356808542_3688099736813211604_n.jpg", role: "Active Member", fb: "#", ig: "#" },
  { name: "Oussema Lbekri", img: "enactuss/a875a8f7-fd52-49fe-abe8-04fbacfc7b13.jpg", role: "Active Member", fb: "#", ig: "#" },
  { name: "Ahlem Ben Moussa", img: "enactuss/482250112_1018968886956683_7822444058078388185_n.jpg", role: "Active Member", fb: "#", ig: "#" },
  { name: "Khadija Samir", img: "enactuss/khadija-samir.png", role: "Active Member", fb: "#", ig: "#" }
];


// =====================
// HERO IMAGE + LOGO
// =====================
const LOGO = "enactuss/557778581_122142310376674747_6015000820039650429_n.jpg";
const HERO_IMG = "enactuss/558811326_122142516362674747_1770264375635943538_n.jpg";


// =====================
// RENDER FUNCTIONS
// =====================

function createCard(person) {
  return `
    <div class="bg-white rounded-2xl shadow p-4 text-center">
      <img src="${person.img}" class="w-24 h-24 mx-auto rounded-full object-cover mb-3" onerror="this.src='https://via.placeholder.com/150'">
      <h3 class="font-semibold">${person.name}</h3>
      <p class="text-sm text-gray-500">${person.role}</p>
    </div>
  `;
}

function fillGrid() {
  const teamGrid = document.getElementById("teamGrid");
  const enactorsGrid = document.getElementById("enactorsGrid");

  if (teamGrid) {
    teamGrid.innerHTML = LEADERSHIP.map(createCard).join("");
  }

  if (enactorsGrid) {
    enactorsGrid.innerHTML = ENACTORS.map(createCard).join("");
  }
}


// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  fillGrid();

  // Logo
  const logoEl = document.getElementById("logo");
  if (logoEl) logoEl.src = LOGO;

  // Hero image
  const heroEl = document.getElementById("heroImg");
  if (heroEl) heroEl.src = HERO_IMG;
});