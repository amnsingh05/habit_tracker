/* =========================
   FIREBASE CONFIG
   (YOUR REAL CONFIG)
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyDxya7NM51dF2usm5nSrTUPYNsH1DHXCDA",
  authDomain: "habit-tracker-bbd32.firebaseapp.com",
  projectId: "habit-tracker-bbd32",
  storageBucket: "habit-tracker-bbd32.appspot.com",
  messagingSenderId: "803465972106",
  appId: "1:803465972106:web:17cf58a1bf65de73e8a073"
};

/* =========================
   INITIALIZE FIREBASE
========================= */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.style.color = "red";
  msg.innerText = "";

  if (!email || !password) {
    msg.innerText = "Email and password are required";
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "index.html";
  } catch (error) {
    msg.innerText = error.message;
  }
}

/* =========================
   SIGN UP
========================= */
async function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.style.color = "red";
  msg.innerText = "";

  if (!email || !password) {
    msg.innerText = "Email and password are required";
    return;
  }

  if (password.length < 6) {
    msg.innerText = "Password must be at least 6 characters";
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    msg.style.color = "green";
    msg.innerText = "Account created successfully! You can login now.";
  } catch (error) {
    msg.innerText = error.message;
  }
}