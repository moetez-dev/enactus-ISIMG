document.addEventListener('DOMContentLoaded', function() {
    
    // 1. INITIALIZE LIBRARIES
    AOS.init({ duration: 800, offset: 100, once: true, easing: 'ease-out' });
    lucide.createIcons();

    // 2. DATA MANAGEMENT
    const projectData = {
        fytrlance: {
            name: "Fytrlance", tag: "Technology",
            prob: "High unemployment rates among tech students in Gabès...",
            sol: "A specialized platform bridging ISIMG students and businesses...",
            impact: "Reducing youth unemployment for 50+ students."
        },
        bioverto: {
            name: "Bioverto", tag: "Environment",
            prob: "Chemical waste in household products...",
            sol: "Producing 100% organic household solutions...",
            impact: "Promoting healthy lifestyle in 200+ households."
        }
    };

    // 3. UI RENDERING (Nav & Smooth Scroll)
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = "0.75rem 0";
            nav.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
        } else {
            nav.style.padding = "1.25rem 0";
            nav.style.boxShadow = "none";
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 4. MODAL SYSTEM
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

    window.closeModal = () => document.getElementById('unifiedModal').style.display = 'none';

    // 5. FIREBASE REGISTRATION
    const firebaseConfig = {
        apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
        authDomain: "enactus-isimg-99469.firebaseapp.com",
        projectId: "enactus-isimg-99469",
        storageBucket: "enactus-isimg-99469.firebasestorage.app",
        messagingSenderId: "348185800306",
        appId: "1:348185800306:web:31e228e4bb631e18a91ceb"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const regForm = document.getElementById('registrationForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const fullName = document.getElementById('regName').value;
            const department = document.querySelector('input[name="dept"]:checked').value;

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection("users").doc(userCredential.user.uid).set({
                    uid: userCredential.user.uid,
                    fullName: fullName,
                    email: email,
                    department: department,
                    status: "pending", 
                    role: "member",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Application Sent! Wait for your interview.");
                window.location.href = "login.html";
            } catch (error) { alert(error.message); }
        });
    }
});