// ==========================
// PROTECT + FETCH ONLY LOGGED IN STUDENT
// ==========================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;

  db.ref("Users/" + uid).on("value", snapshot => {
    const data = snapshot.val() || {};

    tableBody.innerHTML = `
      <tr>
        <th>Name</th>
        <td>${data.name || ""}</td>
      </tr>

      <tr>
        <th>Email</th>
        <td>${data.email || ""}</td>
      </tr>

      <tr>
        <th>UID</th>
        <td>${uid}</td>
      </tr>

      <tr>
        <th>Roll No</th>
        <td>${data.roll || ""}</td>
      </tr>
    `;

    // ==========================
    // FETCH ATTENDANCE FOR THIS STUDENT
    // ==========================
    const attendance = data.attendance || { totalClasses: 0, present: 0 };
    updateAttendanceUI(attendance);
  });
});


// ==========================
// CLOUDINARY CONFIG
// ==========================
const CLOUD_NAME = "db4q6emec";
const UPLOAD_PRESET = "ChatAppUsers";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  return data.secure_url;
}


// ==========================
// LOAD PROFILE SECTION DATA
// ==========================
auth.onAuthStateChanged(user => {
  if (!user) return;

  const uid = user.uid;

  // joined date
  const date = new Date(user.metadata.creationTime);
  document.getElementById("joinedDate").innerText = date.toDateString();

  // load profile data
  db.ref("Users/" + uid).once("value", snap => {
    const data = snap.val();
    if (!data) return;

    document.getElementById("name").value = data.name || "";
    document.getElementById("phone").value = data.phone || "";

    if (data.photo) {
      document.getElementById("profileImg").src = data.photo;
    }
  });
});


// ==========================
// IMAGE PREVIEW
// ==========================
document.getElementById("imgUpload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("profileImg").src = ev.target.result;
  };
  reader.readAsDataURL(file);
});


// ==========================
// UPDATE PROFILE
// ==========================
async function updateProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const file = document.getElementById("imgUpload").files[0];

  try {
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadToCloudinary(file);
    }

    await db.ref("Users/" + uid).update({
      name: name,
      phone: phone,
      photo: imageUrl || undefined
    });

    if (password) {
      await user.updatePassword(password);
    }

    alert("Profile Updated ✅");
  } catch (err) {
    alert(err.message);
  }
}


// ==========================
// UPDATE ATTENDANCE UI
// ==========================
function updateAttendanceUI(data) {
  const total = data.totalClasses || 0;
  const present = data.present || 0;
  const absent = total - present;
  const percent = total === 0 ? 0 : Math.round((present / total) * 100);

  document.getElementById("totalClasses").innerText = total;
  document.getElementById("presentCount").innerText = present;
  document.getElementById("absentCount").innerText = absent;
  document.getElementById("attendancePercent").innerText = percent + "%";

  // Update progress bar
  document.getElementById("attendanceProgress").style.width = percent + "%";
}
