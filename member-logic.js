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

const ADMIN_EMAIL = "admin.enactus@isimg.tn"; // Khallih kima t7eb

auth.onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "login.html"; return; }

    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    if (user.email === ADMIN_EMAIL) {
        showAdminPanel();
    } else if (userData && userData.status === "pending") {
        showTimeline(); 
    } else {
        showMemberContent(userData);
    }
});

function showTimeline() {
    const main = document.querySelector('.member-main');
    main.innerHTML = `
        <div class="welcome-card">
            <h1 class="welcome-title">Status: <br><span class="highlight">Interview</span></h1>
            <p class="welcome-desc">Your application is received! We will contact you soon.</p>
            <div class="stepper">
                <div class="step active"><div class="circle">1</div><span>Applied</span></div>
                <div class="line active"></div>
                <div class="step current"><div class="circle">2</div><span>Interview</span></div>
                <div class="line"></div>
                <div class="step"><div class="circle">3</div><span>Approved</span></div>
            </div>
        </div>
    `;
}

function showMemberContent(u) {
    document.getElementById('userStatusText').innerText = "Logged in as: " + u.fullName;
    // Houni t7ot l-content mta3 l-members el approved
}

async function showAdminPanel() {
    const adminDiv = document.getElementById('adminPanel');
    const listDiv = document.getElementById('pendingList');
    adminDiv.classList.remove('hidden');
    document.querySelector('.member-main').classList.add('hidden');

    const snapshot = await db.collection("users").where("status", "==", "pending").get();
    listDiv.innerHTML = "";
    snapshot.forEach(doc => {
        const u = doc.data();
        const card = document.createElement('div');
        card.className = "app-card"; // Testa3mel el style elli f-style.css
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:1rem; border-radius:15px; margin-bottom:1rem; border:1px solid #eee">
                <div>
                    <h4 style="font-weight:900">${u.fullName}</h4>
                    <p style="font-size:0.8rem">${u.email} | ${u.department}</p>
                </div>
                <button onclick="approveUser('${doc.id}')" style="background:var(--yellow); padding:0.5rem 1rem; border-radius:10px; font-weight:800">Approve</button>
            </div>
        `;
        listDiv.appendChild(card);
    });
}

window.approveUser = async (uid) => {
    if(confirm("Approve this member?")) {
        await db.collection("users").doc(uid).update({ status: "approved" });
        alert("Member Approved!");
        location.reload();
    }
};

document.getElementById('logoutBtn').onclick = () => auth.signOut();

// Reset Password Logic (Bech yemchi fil Login Page)
const forgotLink = document.getElementById('forgotPassword');
if (forgotLink) {
    forgotLink.onclick = (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        if (!email) return alert("Enter your email first!");
        auth.sendPasswordResetEmail(email).then(() => alert("Reset mail sent!"));
    };
}
// Fil member-logic.js (dakhel showAdminPanel)
card.innerHTML = `
    <div class="admin-user-card">
        <div class="info">
            <h4>${u.fullName} (${u.department})</h4>
            <p>"${u.motivation}"</p> </div>
        <button onclick="approveUser('${doc.id}')">Approve</button>
    </div>
`;