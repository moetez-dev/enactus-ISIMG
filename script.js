document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Initialize Animations & Icons
    AOS.init({ duration: 800, offset: 100, once: true, easing: 'ease-out' });
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. Project Data
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

    // 3. Navigation Scroll Effect
    const nav = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = "5px 0";
            nav.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
        } else {
            nav.style.padding = "20px 0";
            nav.style.boxShadow = "none";
        }
    });

    // 4. Modal System (Global functions for onclick)
    window.openProject = function(id) {
        const p = projectData[id];
        if(!p) return;
        
        document.getElementById('projName').innerText = p.name;
        document.getElementById('projTag').innerText = p.tag;
        document.getElementById('projProb').innerText = p.prob;
        document.getElementById('projSol').innerText = p.sol;
        document.getElementById('projImpact').innerText = p.impact;
        
        document.getElementById('projectContent').classList.remove('hidden');
        document.getElementById('unifiedModal').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Stop scrolling
    };

    window.closeModal = function() {
        document.getElementById('unifiedModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    };

    // 5. Firebase Setup (Replace with your actual config if needed)
    const firebaseConfig = {
        apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
        authDomain: "enactus-isimg-99469.firebaseapp.com",
        projectId: "enactus-isimg-99469",
        storageBucket: "enactus-isimg-99469.firebasestorage.app",
        messagingSenderId: "348185800306",
        appId: "1:348185800306:web:31e228e4bb631e18a91ceb"
    };

    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
});