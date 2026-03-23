// ==========================
// Protect Page
// ==========================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

const tableBody = document.getElementById("tableBody");
const attendanceTableBody = document.getElementById("attendanceTableBody"); // admin attendance table


// ==========================
// FETCH USERS (Students)
// ==========================
db.ref("Users").on("value", snapshot => {
  tableBody.innerHTML = "";
  attendanceTableBody.innerHTML = ""; // clear attendance table

  snapshot.forEach(child => {
    const data = child.val();
    const uid = child.key;

    // --- Student Management Table ---
    const row = `
      <tr>
        <td>${data.name || ""}</td>
        <td>${data.email || ""}</td>
        <td>${uid}</td>

        <td>
          <input type="text" id="roll-${uid}" value="${data.roll || ""}" placeholder="Assign roll" />
          <button onclick="saveRoll('${uid}')">Save</button>
        </td>

        <td>
          <button onclick="editStudent('${uid}')">Edit</button>
          <button onclick="deleteStudent('${uid}')">Delete</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;

    // --- Attendance Table ---
    const total = data.attendance?.totalClasses || 0;
    const present = data.attendance?.present || 0;
    const absent = total - present;
    const percent = total === 0 ? 0 : Math.round((present / total) * 100);

    const attendanceRow = `
      <tr>
        <td>${data.name || ""}</td>
        <td id="total-${uid}">${total}</td>
        <td id="present-${uid}">${present}</td>
        <td id="absent-${uid}">${absent}</td>
        <td id="percent-${uid}">${percent}%</td>
        <td>
          <div class="progress-container">
            <div class="progress-bar" id="progress-${uid}" style="width: ${percent}%;"></div>
          </div>
        </td>
        <td>
          <button onclick="markPresent('${uid}')">Mark Present</button>
          <button onclick="markAbsent('${uid}')">Mark Absent</button>
          <button onclick="editAttendance('${uid}')">Edit</button>
        </td>
      </tr>
    `;
    attendanceTableBody.innerHTML += attendanceRow;

  });
});


// ==========================
// SAVE ROLL NUMBER
// ==========================
function saveRoll(uid) {
  const rollInput = document.getElementById(`roll-${uid}`);
  const roll = rollInput.value.trim();

  if (!roll) {
    alert("Enter roll number");
    return;
  }

  db.ref("Users/" + uid).update({
    roll: roll
  });
  alert("Student Roll Number Updated ✅");
}


// ==========================
// DELETE STUDENT
// ==========================
function deleteStudent(uid) {
  if (confirm("Delete this student?")) {
    db.ref("Users/" + uid).remove();
  }
}


// ==========================
// EDIT STUDENT
// ==========================
function editStudent(uid) {
  const newName = prompt("Enter new name:");
  const newEmail = prompt("Enter new email:");

  if (!newName || !newEmail) {
    alert("All fields required");
    return;
  }

  db.ref("Users/" + uid).update({
    name: newName,
    email: newEmail
  });
}


// ==========================
// MARK PRESENT / ABSENT
// ==========================
function markPresent(uid) {
  const userRef = db.ref("Users/" + uid + "/attendance");
  userRef.transaction(current => {
    if (current === null) return { totalClasses: 1, present: 1 };
    return {
      totalClasses: (current.totalClasses || 0) + 1,
      present: (current.present || 0) + 1
    };
  }, () => updateAttendanceUI(uid));
}

function markAbsent(uid) {
  const userRef = db.ref("Users/" + uid + "/attendance");
  userRef.transaction(current => {
    if (current === null) return { totalClasses: 1, present: 0 };
    return {
      totalClasses: (current.totalClasses || 0) + 1,
      present: (current.present || 0)
    };
  }, () => updateAttendanceUI(uid));
}

function updateAttendanceUI(uid) {
  db.ref("Users/" + uid + "/attendance").once("value", snap => {
    const data = snap.val() || { totalClasses: 0, present: 0 };
    const total = data.totalClasses;
    const present = data.present;
    const absent = total - present;
    const percent = total === 0 ? 0 : Math.round((present / total) * 100);

    document.getElementById(`total-${uid}`).innerText = total;
    document.getElementById(`present-${uid}`).innerText = present;
    document.getElementById(`absent-${uid}`).innerText = absent;
    document.getElementById(`percent-${uid}`).innerText = percent + "%";
    document.getElementById(`progress-${uid}`).style.width = percent + "%";
  });
}
function editAttendance(uid) {
  db.ref("Users/" + uid + "/attendance").once("value", snap => {
    const data = snap.val() || { totalClasses: 0, present: 0 };
    const newTotal = parseInt(prompt("Enter total classes:", data.totalClasses)) || 0;
    const newPresent = parseInt(prompt("Enter present classes:", data.present)) || 0;

    db.ref("Users/" + uid + "/attendance").update({
      totalClasses: newTotal,
      present: newPresent
    }, () => updateAttendanceUI(uid));
  });
}


// Marks table
const marksTableBody = document.getElementById("marksTableBody");

db.ref("Users").on("value", snapshot => {

  marksTableBody.innerHTML = "";

  snapshot.forEach(child => {

    const data = child.val();
    const uid = child.key;

    const python = data.marks?.python || 0;
    const dld = data.marks?.dld || 0;
    const ml = data.marks?.ml || 0;
    const os = data.marks?.os || 0;
    const dbms = data.marks?.dbms || 0;

    const total = python + dld + ml + os + dbms;
    const percent = Math.round(total / 5);

    const row = `
      <tr>
        <td>${data.name || ""}</td>
        <td>${data.roll || ""}</td>
        <td id="python-${uid}">${python}</td>
        <td id="dld-${uid}">${dld}</td>
        <td id="ml-${uid}">${ml}</td>
        <td id="os-${uid}">${os}</td>
        <td id="dbms-${uid}">${dbms}</td>

        <td>
          <button onclick="editMarks('${uid}')">Edit</button>
        </td>
      </tr>
    `;

    marksTableBody.innerHTML += row;

  });

});
function editMarks(uid){

  db.ref("Users/" + uid + "/marks").once("value", snap => {

    const data = snap.val() || {};

    const python = parseInt(prompt("Python:", data.python || 0)) || 0;
    const dld = parseInt(prompt("DLD:", data.dld || 0)) || 0;
    const ml = parseInt(prompt("ML:", data.ml || 0)) || 0;
    const os = parseInt(prompt("OS:", data.os || 0)) || 0;
    const dbms = parseInt(prompt("DBMS:", data.dbms || 0)) || 0;

    db.ref("Users/" + uid + "/marks").update({
      python,
      dld,
      ml,
      os,
      dbms
    });

  });

}
