

function SignUp() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields required");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.ref("Users/" + cred.user.uid).set({
        name: name,
        email: email,
        isAdmin: false
      });
    })
    .then(() => {
      alert("Sign Up successful");
      window.location.href = "login.html";
    })
    .catch((err) => {
      alert(err.message);
    });
}

const provider = new firebase.auth.GoogleAuthProvider();

function googleAuth() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      const uid = user.uid;
      const userRef = db.ref("Users/" + uid);

      return userRef.once("value").then(snapshot => {
        if (!snapshot.exists()) {
          return userRef.set({
            name: user.displayName,
            email: user.email,
            isAdmin: false,
            provider: "google"
          });
        }
      });
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((err) => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.ref("Users/" + cred.user.uid).once("value");
    })
    .then((snapshot) => {
      const data = snapshot.val();

      if (!data) throw new Error("User not found");

      if (data.isAdmin) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "studentdashboard.html";
      }
    })
    .catch((err) => {
      console.error(err);
      alert(err.message);
    });
}
