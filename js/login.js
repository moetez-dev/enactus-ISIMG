// ===== LOGIN PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const userDoc = await db.collection("users").doc(user.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        if (userData.status === "pending") {
                            alert("Your account is still under review.");
                            auth.signOut();
                        } else if (userData.role === "admin") {
                            window.location.href = "bureau-space.html";
                        } else {
                            window.location.href = "member-space.html";
                        }
                    }
                })
                .catch((error) => {
                    alert("Invalid credentials or account issue.");
                });
        });
    }

    // Forgot password
    const forgotLink = document.getElementById('forgotPassword');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            if (!email) {
                alert("Please enter your email first to receive a reset link.");
                return;
            }
            auth.sendPasswordResetEmail(email)
                .then(() => alert("Reset link sent! Check your inbox."))
                .catch(err => alert(err.message));
        });
    }
});