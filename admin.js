
const firebaseConfig = {
  apiKey: "AIzaSyDM0MRXzVUNheHAh4IlT2lppAi2JEpSZ_A",
  authDomain: "marketplace-lagartosotre.firebaseapp.com",
  projectId: "marketplace-lagartosotre",
  storageBucket: "marketplace-lagartosotre.firebasestorage.app",
  messagingSenderId: "736972459338",
  appId: "1:736972459338:web:df908b0407e9c823a7c5b3",
  measurementId: "G-6K0J2Q6BPC"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Admin permitido ---
const adminEmails = ["moisespare009@gmail.com"];

// --- Verificar sesión ---
auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = "login.html";
  if (!adminEmails.includes(user.email)) {
    alert("No tienes permisos de administrador.");
    return window.location.href = "galeria_vista.html";
  }

  loadPendingPosts();
  loadApprovedPosts();
});

// --- Logout ---
document.getElementById("btnLogout").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "login.html");
});


// PENDIENTES

const pendingList = document.getElementById("pendingList");

function loadPendingPosts() {
  db.collection("pendientes").onSnapshot(snapshot => {
    pendingList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${data.imagen}">
        <h3>${data.titulo}</h3>
        <p class="info"><strong>${data.categoria}</strong> | $${data.precio}</p>
        <p class="desc">${data.descripcion || "(Sin descripción)"}</p>

        <button class="btn-approve">Aprobar</button>
        <button class="btn-reject">Rechazar</button>
      `;

      card.querySelector(".btn-approve").onclick = () => approvePost(doc.id, data);
      card.querySelector(".btn-reject").onclick = () => rejectPost(doc.id);

      pendingList.appendChild(card);
    });
  });
}


// APROBAR
function approvePost(id, data) {
  db.collection("items").add({
    title: data.titulo,
    desc: data.descripcion,
    category: data.categoria,
    price: data.precio,
    img: data.imagen,
    author: data.autor,
    rating: 0,
    comments: [],
    createdAt: new Date().toISOString()
  })
  .then(() => db.collection("pendientes").doc(id).delete())
  .then(() => alert("✔ Publicación aprobada"))
  .catch(err => console.error(err));
}


// RECHAZAR

function rejectPost(id) {
  db.collection("pendientes").doc(id).delete()
    .then(() => alert("❌ Publicación rechazada"));
}



// APROBADOS

const approvedList = document.getElementById("approvedList");

function loadApprovedPosts() {
  db.collection("items").onSnapshot(snapshot => {
    approvedList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${data.img}">
        <h3>${data.title}</h3>
        <p class="info"><strong>${data.category}</strong> | $${data.price}</p>
        <p class="desc">${data.desc || "(Sin descripción)"}</p>

        <button class="btn-delete">Eliminar</button>
      `;

      card.querySelector(".btn-delete").onclick = () => deleteApproved(doc.id);

      approvedList.appendChild(card);
    });
  });
}

// ELIMINAR APROBADA

function deleteApproved(id) {
  if (!confirm("¿Eliminar esta publicación?")) return;

  db.collection("items").doc(id).delete()
    .then(() => alert("🗑 Publicación eliminada"))
    .catch(err => console.error(err));
}
