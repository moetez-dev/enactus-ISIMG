const firebaseConfig = {
 apiKey: "...",
 authDomain: "...",
 projectId: "...",
 storageBucket: "...",
 messagingSenderId: "...",
 appId: "..."
};

if (!firebase.apps.length) {
 firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();