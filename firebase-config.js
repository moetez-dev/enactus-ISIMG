const firebaseConfig = {
  apiKey: "AIzaSyDL5ZWW6ofy9SFXw7tMSVxM34k9BDecrjI",
  authDomain: "enactus-isimg-99469.firebaseapp.com",
  projectId: "enactus-isimg-99469",
  storageBucket: "enactus-isimg-99469.firebasestorage.app",
  messagingSenderId: "348185800306",
  appId: "1:348185800306:web:31e228e4bb631e18a91ceb"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
