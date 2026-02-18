// app.js - Configuration & Core Logic
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 1. تسجيل عضو جديد
async function registerMember(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    btn.innerText = "Processing...";

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const data = {
        fullName: document.getElementById('regName').value,
        phone: document.getElementById('regPhone').value,
        level: document.getElementById('regLevel').value,
        department: document.querySelector('input[name="dept"]:checked').value,
        motivation: document.getElementById('regMotivation').value,
        role: "member", // افتراضياً عضو
        status: "pending", // ينتظر القبول
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection("users").doc(userCredential.user.uid).set(data);
        alert("Success! Your application is submitted. Wait for Admin approval.");
        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
        btn.innerText = "Submit Application";
    }
}

// 2. تسجيل الدخول والتوجيه الذكي
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
        
        if (userDoc.exists) {
            const user = userDoc.data();
            if (user.status === "pending") {
                alert("Your account is still under review.");
                auth.signOut();
            } else if (user.role === "admin") {
                window.location.href = "bureau-space.html";
            } else {
                window.location.href = "member-space.html";
            }
        }
    } catch (error) {
        alert("Invalid credentials or account issue.");
    }
}