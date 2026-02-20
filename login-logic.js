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