const AuthGuard = {

 requireAdmin(callback) {

  auth.onAuthStateChanged(async (user) => {

   if (!user) {
    window.location.href = "login.html";
    return;
   }

   const doc = await db.collection("users").doc(user.uid).get();

   if (doc.data().role !== "admin") {
    window.location.href = "member.html";
    return;
   }

   callback(user, doc.data());

  });

 }

};