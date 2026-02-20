// Initialize Icons
lucide.createIcons();

const firebaseConfig = {
    apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
    authDomain: "enactus-isimg-99469.firebaseapp.com",
    projectId: "enactus-isimg-99469",
    storageBucket: "enactus-isimg-99469.firebasestorage.app",
    messagingSenderId: "348185800306",
    appId: "1:348185800306:web:31e228e4bb631e18a91ceb"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            window.location.href = "member-space.html";
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Reset Password Logic
document.getElementById('forgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    if(!email) {
        alert("Please enter your email first to receive a reset link.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => alert("Reset link sent! Check your inbox."))
        .catch(err => alert(err.message));
});
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        // Njibou el data mta3 el user mel Firestore
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data();

        if (userData.status === "pending") {
            // Kenou pending, nbadlou l-content mta3 l-page
            document.querySelector('.member-main').innerHTML = `
                <div class="welcome-card" style="border-top: 5px solid var(--yellow);">
                    <h1 class="welcome-title">Application <br><span class="highlight">Pending</span></h1>
                    <p class="welcome-desc">Your account is created but needs approval. <br> 
                    Our HR team will contact you soon for an <strong>interview</strong>.</p>
                    <div class="user-status-box" style="background: #fffbeb;">
                        <span class="status-dot" style="background: #f59e0b;"></span>
                        <span>Status: Waiting for Interview</span>
                    </div>
                </div>
            `;
        } else if (userData.status === "approved") {
            document.getElementById('userStatusText').innerText = "Member: " + userData.fullName;
            // Houni t7ot el content el 7a9i9i mta3 el members
        }
    }
});