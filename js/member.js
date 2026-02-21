// ===== MEMBER SPACE =====
document.addEventListener('DOMContentLoaded', async function() {
    lucide.createIcons();

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        document.getElementById('userMailDisplay').innerText = user.email;
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data();

        if (userData.status === "pending") {
            // Show pending UI
            document.querySelector('.member-main').innerHTML = `
                <div class="welcome-card" style="border-top: 5px solid var(--enactus-yellow);">
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
            renderUserCard(userData);
            renderLeaderboard();
            renderNewsFeed();
        }
    });

    function renderUserCard(u) {
        const card = document.getElementById('userCard');
        if (!card) return;
        card.innerHTML = `
            <h2 class="text-2xl font-black">Hi, ${u.fullName.split(' ')[0]}!</h2>
            <div class="mt-4">
                <div class="flex justify-between text-xs font-bold mb-1">
                    <span>LEVEL: ${u.level || 'Junior'}</span>
                    <span>${u.points || 0} XP</span>
                </div>
                <div class="xp-bar"><div class="xp-progress" style="width: ${(u.points || 0) % 100}%"></div></div>
            </div>
        `;
    }

    async function renderLeaderboard() {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        const snapshot = await db.collection("users").orderBy("points", "desc").limit(5).get();
        list.innerHTML = "";
        snapshot.forEach((doc, i) => {
            const u = doc.data();
            list.innerHTML += `
                <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                    <div class="flex items-center gap-3">
                        <span class="font-black text-gray-300">#${i+1}</span>
                        <span class="font-bold text-sm">${u.fullName}</span>
                    </div>
                    <span class="bg-yellow-400 text-[10px] font-black px-2 py-1 rounded-md">${u.points || 0} XP</span>
                </div>
            `;
        });
    }

    async function renderNewsFeed() {
        const feed = document.getElementById('newsFeed');
        if (!feed) return;
        const snapshot = await db.collection("news").orderBy("createdAt", "desc").get();
        feed.innerHTML = "";
        snapshot.forEach(doc => {
            const item = doc.data();
            feed.innerHTML += `
                <div class="post-card bg-white p-4 rounded-[2rem] shadow-sm border border-gray-50">
                    <img src="${item.img}" class="w-full h-48 object-cover rounded-[1.5rem] mb-4">
                    <h4 class="font-black text-lg leading-tight">${item.title}</h4>
                    <p class="text-sm text-gray-500 mt-2">${item.desc}</p>
                </div>
            `;
        });
    }

    document.getElementById('logoutBtn').onclick = () => auth.signOut();
});
