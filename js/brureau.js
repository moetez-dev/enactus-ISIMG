// ===== BUREAU SPACE (Admin) =====
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Check if admin (you can implement admin check via email or role)
        // For simplicity, we'll allow all but you can add a condition
        loadPendingApplications();
    });

    function loadPendingApplications() {
        db.collection("users").where("status", "==", "pending").onSnapshot(snap => {
            const list = document.getElementById('applicationsList');
            list.innerHTML = "";
            snap.forEach(doc => {
                const u = doc.data();
                list.innerHTML += `
                    <div class="app-card">
                        <div>
                            <p class="font-black text-lg uppercase">${u.fullName}</p>
                            <p class="text-xs font-bold text-[#FFC222] uppercase tracking-widest">${u.department}</p>
                            <p class="text-gray-400 text-sm mt-1 italic">"${u.motivation || ''}"</p>
                        </div>
                        <button onclick="approve('${doc.id}')" class="approve-btn">Approve</button>
                    </div>
                `;
            });
        });
    }

    window.approve = async function(userId) {
        await db.collection("users").doc(userId).update({ status: "approved" });
        alert("Member Approved! Now they can access the portal.");
    };

    // Publish news (if admin section exists)
    window.publishNews = async () => {
        const title = document.getElementById('postTitle').value;
        const img = document.getElementById('postImg').value;
        const desc = document.getElementById('postDesc').value;

        if (!title || !img || !desc) return alert("Fill everything!");

        await db.collection("news").add({
            title, img, desc,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("News Published!");
        location.reload();
    };

    document.getElementById('logoutBtn').onclick = () => auth.signOut();
});