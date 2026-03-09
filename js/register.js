async function registerUser() {

  const fullName = sanitize(document.getElementById("fullName").value.trim());
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!fullName || !email || !password) {
    Toast.warning("Please fill all fields");
    return;
  }

  try {

    // إنشاء الحساب
    const userCred = await auth.createUserWithEmailAndPassword(email, password);

    const user = userCred.user;

    // تحديث الاسم في profile
    await user.updateProfile({
      displayName: fullName
    });

    // إرسال email verification
    await user.sendEmailVerification();

    // تخزين البيانات في Firestore
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      fullName: fullName,
      email: email,

      role: "member",      // لا يمكن للمستخدم تغييره
      status: "pending",   // admin لازم يقبله

      points: 0,
      level: "Junior",
      badges: [],

      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // تسجيل الخروج حتى يثبت الإيميل
    await auth.signOut();

    Toast.success("Account created! Please verify your email.");

  } catch (err) {

    const errors = {
      "auth/email-already-in-use": "This email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Invalid email address."
    };

    Toast.error(errors[err.code] || err.message);
  }
}
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}