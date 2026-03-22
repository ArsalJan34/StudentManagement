const firebaseConfig = {
  apiKey: "AIzaSyCEjeRcGtjpyR9aexzfdirGhEooq3UFlyo",
  authDomain: "studentmanagement-fa128.firebaseapp.com",
  databaseURL: "https://studentmanagement-fa128-default-rtdb.firebaseio.com",
  projectId: "studentmanagement-fa128",
  storageBucket: "studentmanagement-fa128.firebasestorage.app",
  messagingSenderId: "233360477619",
  appId: "1:233360477619:web:92da9abded2b91f1994fc6"
};
firebase.initializeApp(firebaseConfig);


const auth = firebase.auth();
const db = firebase.database();
// optional but good
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
