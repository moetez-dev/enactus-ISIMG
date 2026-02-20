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
const db = firebase.firestore();

const ADMIN_EMAIL = "admin.enactus@isimg.tn"; // BADEL HADHA

auth.onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "login.html"; return; }
    
    document.getElementById('userMailDisplay').innerText = user.email;
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    if (user.email === ADMIN_EMAIL) {
        document.getElementById('adminPostSection').classList.remove('hidden');
    }

    renderUserCard(userData);
    renderLeaderboard();
    renderNewsFeed();
});

// 1. RENDER USER CARD (XP & Info)
function renderUserCard(u) {
    const card = document.getElementById('userCard');
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

// 2. RENDER NEWS FEED
async function renderNewsFeed() {
    const feed = document.getElementById('newsFeed');
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

// 3. RENDER LEADERBOARD
async function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
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

// 4. ADMIN: PUBLISH NEWS
window.publishNews = async () => {
    const title = document.getElementById('postTitle').value;
    const img = document.getElementById('postImg').value;
    const desc = document.getElementById('postDesc').value;

    if(!title || !img || !desc) return alert("Fill everything!");

    await db.collection("news").add({
        title, img, desc,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert("News Published!");
    location.reload();
};

document.getElementById('logoutBtn').onclick = () => auth.signOut();