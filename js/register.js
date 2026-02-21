async function registerUser() {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!fullName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    // إنشاء حساب في Authentication
    const userCred = await auth.createUserWithEmailAndPassword(email, password);

    // تخزين البيانات في Firestore
    await db.collection("users").doc(userCred.user.uid).set({
      fullName: fullName,
      email: email,
      role: "member",
      status: "pending",
      createdAt: new Date()
    });

    alert("Account created! Waiting for approval.");
  } catch (err) {
    alert(err.message);
  }
}
