// ===== INDEX PAGE (landing) =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 100, once: true, easing: 'ease-out' });
    }

    // Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Navbar shrink on scroll
    const nav = document.querySelector('.main-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.padding = '0.75rem 0';
                nav.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
            } else {
                nav.style.padding = '1.25rem 0';
                nav.style.boxShadow = 'none';
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ===== DATA =====
    const projects = {
        fytrlance: {
            name: "Fytrlance",
            tag: "Technology",
            prob: "High unemployment rates among tech students in Gabès who lack access to professional freelance markets.",
            sol: "A specialized platform that bridges the gap between ISIMG students and businesses, offering mentorship and real projects.",
            impact: "Reducing youth unemployment and creating a professional portfolio for over 50+ students."
        },
        bioverto: {
            name: "Bioverto",
            tag: "Environment",
            prob: "Chemical waste in household products and lack of organic alternatives in the local market.",
            sol: "Producing sustainable, 100% organic household solutions using local resources from the Gabès region.",
            impact: "Promoting a healthy lifestyle and reducing toxic waste in 200+ households."
        }
    };

    const leadership = [
        { name: "Ghofran Chergui", role: "President", img: "enactuss/d7f00337-ee47-41ce-bc40-55ed692e535f.jpg", fb: "#", ig: "#" },
        { name: "Azmi Ben Hassine", role: "Vice President", img: "enactuss/314f6417-cb4c-440a-9478-a02cb49d403e.jpg", fb: "#", ig: "#" },
        { name: "Naceur Zidi", role: "Media Coord", img: "enactuss/9bd9521e-5ddf-413f-86f5-919e3a823d7d.jpg", fb: "#", ig: "#" },
        { name: "Moetez Maraach", role: "Media Board", img: "enactuss/78151529-6349-4654-84ec-3240848135d5.jpg", fb: "#", ig: "#" },
        { name: "Jihen Hamdi", role: "HR Manager", img: "enactuss/276d56ca-8b5d-4f8d-b8c9-dab7edaf6997.jpg", fb: "#", ig: "#" },
        { name: "Hela Lakhdhar", role: "Project Manager", img: "enactuss/34f1e12e-5d8e-48a7-9a3f-b013ad32380f.jpg", fb: "#", ig: "#" },
        { name: "Mohamed Amin", role: "Graphic Design", img: "enactuss/78762702-a127-4b64-aba9-c74281e5ac52.jpg", fb: "#", ig: "#" },
        { name: "Dhia Ben Salha", role: "Marketing", img: "enactuss/c64e3754-0679-4d72-8dc5-1a8e02362da0.jpg", fb: "#", ig: "#" },
        { name: "Nahla Ben Yahya", role: "Event Manager", img: "enactuss/nahla.jpg", fb: "#", ig: "#" },
        { name: "Hamza Miled", role: "finance", img: "enactuss/e530bdbd-fa84-4d33-8ad1-afdae39da2d4.jpg", fb: "#", ig: "#" }
    ];

    const enactors = [
        { name: "Oumayma Ben Salem", role: "Active Member", img: "enactuss/481186204_1368665821238195_2840693725922138944_n.jpg", fb: "#", ig: "#" },
        { name: "Arij Ganfoudi", role: "Active Member", img: "enactuss/629262096_893302356808542_3688099736813211604_n.jpg", fb: "#", ig: "#" },
        { name: "Oussema Lbekri", role: "Active Member", img: "enactuss/a875a8f7-fd52-49fe-abe8-04fbacfc7b13.jpg", fb: "#", ig: "#" },
        { name: "Ahlem Ben Moussa", role: "Active Member", img: "enactuss/482250112_1018968886956683_7822444058078388185_n.jpg", fb: "#", ig: "#" },
        { name: "Khadija Samir", role: "Active Member", img: "enactuss/Capture d'écran 2026-02-21 010428.png", fb: "#", ig: "#" }
    ];

    // ===== RENDER TEAM GRIDS =====
    function fillGrid(data, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        data.forEach(m => {
            const div = document.createElement('div');
            div.className = "member-card";
            div.onclick = () => showMember(m);
            div.innerHTML = `
                <div class="member-avatar">
                    <img src="${m.img}" alt="${m.name}">
                </div>
                <p class="member-name">${m.name}</p>
            `;
            grid.appendChild(div);
        });
    }
    fillGrid(leadership, 'leadership-grid');
    fillGrid(enactors, 'enactors-list');

    // ===== MODAL FUNCTIONS =====
    window.openProject = function(id) {
        const p = projects[id];
        if (!p) return;
        document.getElementById('projName').innerText = p.name;
        document.getElementById('projTag').innerText = p.tag;
        document.getElementById('projProb').innerText = p.prob;
        document.getElementById('projSol').innerText = p.sol;
        document.getElementById('projImpact').innerText = p.impact;
        document.getElementById('projectContent').classList.remove('hidden');
        document.getElementById('memberContent').classList.add('hidden');
        document.getElementById('unifiedModal').style.display = 'flex';
    };

    window.showMember = function(m) {
        document.getElementById('mName').innerText = m.name;
        document.getElementById('mRole').innerText = m.role;
        document.getElementById('mImg').src = m.img;
        document.getElementById('mFB').href = m.fb;
        document.getElementById('mIG').href = m.ig;
        document.getElementById('memberContent').classList.remove('hidden');
        document.getElementById('projectContent').classList.add('hidden');
        document.getElementById('unifiedModal').style.display = 'flex';
        lucide.createIcons();
    };

    window.closeModal = function() {
        document.getElementById('unifiedModal').style.display = 'none';
    };

    window.toggleEnactors = function() {
        const list = document.getElementById('enactors-list');
        if (list.style.display === 'grid') {
            list.style.display = 'none';
        } else {
            list.style.display = 'grid';
            list.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ===== FIREBASE REGISTRATION =====
    const regForm = document.getElementById('registrationForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const fullName = document.getElementById('regName').value;
            const motivation = document.getElementById('regMotivation').value;
            const department = document.querySelector('input[name="dept"]:checked').value;

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection("users").doc(userCredential.user.uid).set({
                    uid: userCredential.user.uid,
                    fullName: fullName,
                    email: email,
                    department: department,
                    motivation: motivation,
                    status: "pending",
                    role: "member",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Application Sent Successfully! Wait for board approval.");
                regForm.reset();
                window.location.href = "login.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }
});