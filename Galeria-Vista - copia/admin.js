// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhwQEzzvntZljPn9L4G47ZnSaDysbU400",
  authDomain: "galeriavt-66369.firebaseapp.com",
  projectId: "galeriavt-66369",
  storageBucket: "galeriavt-66369.firebasestorage.app",
  messagingSenderId: "153916747029",
  appId: "1:153916747029:web:3427ccfccdbbf4dcb9cd1c",
  measurementId: "G-ND3JPYNMHS"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/***********************
 * Administrador
 ***********************/
const adminEmails = [
  "juandiegoaimar7932@gmail.com" 
];

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!adminEmails.includes(user.email)) {
    alert("No tienes permisos de administrador");
    window.location.href = "galeria_vista.html";
    return;
  }

  loadPendingPosts();
  loadApprovedPosts();
});

/***********************
 * Boton de cerrar sesión
 ***********************/
document.getElementById("btnLogout").addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
  });
});

/***********************
 * Publicaciones pendientes
 ***********************/
const pendingList = document.getElementById("pendingList");
const approvedList = document.getElementById("approvedList");

function loadPendingPosts() {
  db.collection("publicaciones_pendientes").onSnapshot(snapshot => {
    pendingList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${data.imagen}" alt="imagen">
        <p class="desc">${data.descripcion || "(Sin descripción)"}</p>
        <button class="btn-approve">Aprobar ✅</button>
        <button class="btn-reject">Rechazar ❌</button>
      `;

      card.querySelector(".btn-approve").addEventListener("click", () => approvePost(doc.id, data));
      card.querySelector(".btn-reject").addEventListener("click", () => rejectPost(doc.id));

      pendingList.appendChild(card);
    });
  });
}

/***********************
 * Cargar publicaciones aprobadas
 ***********************/
function loadPendingPosts() {
  db.collection("pendientes").onSnapshot(snapshot => {
    pendingList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${data.imagen}" alt="imagen">
        <h3>${data.titulo}</h3>
        <p><strong>Categoría:</strong> ${data.categoria}</p>
        <p><strong>Precio:</strong> ${data.precio}</p>
        <p><strong>Autor:</strong> ${data.autor}</p>
        <p class="desc">${data.descripcion || "(Sin descripción)"}</p>
        <button class="btn-approve">Aprobar ✅</button>
        <button class="btn-reject">Rechazar ❌</button>
      `;

      card.querySelector(".btn-approve").addEventListener("click", () => approvePost(doc.id, data));
      card.querySelector(".btn-reject").addEventListener("click", () => rejectPost(doc.id));

      pendingList.appendChild(card);
    });
  });
}

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
  .then(() => alert("✅ Publicación aprobada y enviada a la galería."))
  .catch(err => console.error("❌ Error al aprobar:", err));
}

function rejectPost(id) {
  db.collection("pendientes").doc(id).delete()
    .then(() => alert("❌ Publicación rechazada."))
    .catch(err => console.error("Error al rechazar:", err));
}
