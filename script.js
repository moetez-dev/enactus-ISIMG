document.addEventListener('DOMContentLoaded', function() {
    
    // 1. INITIALIZE LIBRARIES
    AOS.init({
        duration: 800,
        offset: 100,
        once: true,
        easing: 'ease-out'
    });
    lucide.createIcons();

    // 2. DATA MANAGEMENT (Moved from HTML to JS)
    const projectData = {
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
        { name: "Ghofran Chergui", role: "President", img: "enactuss/d7f00337-ee47-41ce-bc40-55ed692e535f.jpg" },
        { name: "Azmi Ben Hassine", role: "Vice President", img: "enactuss/314f6417-cb4c-440a-9478-a02cb49d403e.jpg" },
        { name: "Naceur Zidi", role: "Media Coord", img: "enactuss/9bd9521e-5ddf-413f-86f5-919e3a823d7d.jpg" },
        { name: "Moetez Maraach", role: "Media Board", img: "enactuss/78151529-6349-4654-84ec-3240848135d5.jpg" },
        { name: "Jihen Hamdi", role: "HR Manager", img: "enactuss/276d56ca-8b5d-4f8d-b8c9-dab7edaf6997.jpg" },
        { name: "Hela Lakhdhar", role: "Project Manager", img: "enactuss/34f1e12e-5d8e-48a7-9a3f-b013ad32380f.jpg" },
        { name: "Mohamed Amin", role: "Graphic Design", img: "enactuss/78762702-a127-4b64-aba9-c74281e5ac52.jpg" },
        { name: "Dhia Ben Salha", role: "Marketing", img: "enactuss/c64e3754-0679-4d72-8dc5-1a8e02362da0.jpg" }
    ];

    // Dummy data for other enactors
    const enactors = Array(12).fill({ 
        name: "Enactor Member", 
        role: "Active Member", 
        img: "enactuss/558811326_122142516362674747_1770264375635943538_n.jpg" 
    });

    // 3. UI RENDERING FUNCTIONS
    function renderTeam(data, targetId) {
        const grid = document.getElementById(targetId);
        if (!grid) return;
        
        data.forEach(m => {
            const card = document.createElement('div');
            card.className = "member-card"; // Make sure to add this class to your CSS for better styling
            card.style.textAlign = 'center';
            card.style.cursor = 'pointer';
            card.onclick = () => showMember(m);
            
            card.innerHTML = `
                <div class="member-img-wrapper" style="border-radius: 2rem; overflow: hidden; margin-bottom: 1rem; border: 2px solid transparent; transition: 0.3s;">
                    <img src="${m.img}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
                </div>
                <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">${m.name}</p>
            `;
            grid.appendChild(card);
        });
    }

    renderTeam(leadership, 'leadership-grid');
    renderTeam(enactors, 'enactors-list');

    // 4. NAVBAR BEHAVIOR
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.style.padding = "0.75rem 0";
            nav.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
        } else {
            nav.style.padding = "1.25rem 0";
            nav.style.boxShadow = "none";
        }
    });

    // 5. SMOOTH SCROLLING
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 6. MODAL SYSTEM LOGIC
    window.openProject = function(id) {
        const p = projectData[id];
        if(!p) return;

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
        list.classList.toggle('hidden');
        if(!list.classList.contains('hidden')) {
            list.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 7. FIREBASE INTEGRATION
    const firebaseConfig = {
        apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
        authDomain: "enactus-isimg-99469.firebaseapp.com",
        projectId: "enactus-isimg-99469",
        storageBucket: "enactus-isimg-99469.firebasestorage.app",
        messagingSenderId: "348185800306",
        appId: "1:348185800306:web:31e228e4bb631e18a91ceb"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

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
                const user = userCredential.user;

                await db.collection("users").doc(user.uid).set({
                    uid: user.uid,
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
});// Function Reset Password
const forgotPasswordLink = document.getElementById('forgotPassword');

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value; // Yeched el email elli ktebou el user

        if (!email) {
            alert("Please enter your email address first!");
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Reset link sent! Check your email (and spam folder).");
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}
// Fil registrationForm event listener
await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    fullName: fullName,
    email: email,
    department: department,
    status: "pending", // <--- Hadha houwa el muftah
    role: "member",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
// Badel hadha b el email mte3ek el s7i7
const ADMIN_EMAIL = "admin.enactus@isimg.tn"; 

auth.onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "login.html"; return; }

    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    if (user.email === ADMIN_EMAIL) {
        showAdminPanel();
    } else if (userData.status === "pending") {
        showTimeline(); 
    } else {
        showMemberContent(userData);
    }
});

async function showAdminPanel() {
    const adminDiv = document.getElementById('adminPanel');
    const listDiv = document.getElementById('pendingList');
    adminDiv.classList.remove('hidden');

    const snapshot = await db.collection("users").where("status", "==", "pending").get();
    
    listDiv.innerHTML = "";
    snapshot.forEach(doc => {
        const u = doc.data();
        const card = document.createElement('div');
        card.className = "bento-card card-light"; // Nesta3mlou el styles elli 3anna
        card.style.padding = "1.5rem";
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                <div>
                    <h4 style="font-weight:900">${u.fullName}</h4>
                    <p style="font-size:0.8rem">${u.email} | Dept: ${u.department}</p>
                </div>
                <button onclick="approveUser('${doc.id}')" style="background:var(--yellow); padding:0.5rem 1rem; border-radius:10px; font-weight:800">Approve</button>
            </div>
        `;
        listDiv.appendChild(card);
    });
}

window.approveUser = async (uid) => {
    await db.collection("users").doc(uid).update({ status: "approved" });
    alert("Member Approved!");
    location.reload();
};