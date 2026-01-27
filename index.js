/* =========================
   FIREBASE AUTH
========================= */
const auth = firebase.auth();

/* =========================
   MESSAGE HELPER
========================= */
function showMessage(text, isError = true) {
  const msg = document.getElementById("message");
  msg.style.color = isError ? "red" : "green";
  msg.textContent = text;
}

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMessage("Email and password are required");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "app.html"; // ✅ habit page
  } catch (error) {
    showMessage(error.message);
  }
}

/* =========================
   SIGN UP
========================= */
async function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMessage("Email and password are required");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters");
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    showMessage("Account created successfully. You can login now.", false);
  } catch (error) {
    showMessage(error.message);
  }
}