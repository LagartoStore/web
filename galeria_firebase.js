/***********************
 * Firebase congig :DDD
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyDhwQEzzvntZljPn9L4G47ZnSaDysbU400",
  authDomain: "galeriavt-66369.firebaseapp.com",
  projectId: "galeriavt-66369",
  storageBucket: "galeriavt-66369.firebasestorage.app",
  messagingSenderId: "153916747029",
  appId: "1:153916747029:web:3427ccfccdbbf4dcb9cd1c",
  measurementId: "G-ND3JPYNMHS"
};

// grdo
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

/***********************
 * Autenticacion
 ***********************/
auth.onAuthStateChanged(user => {
  if (!user) {
    // No autenticado → redirigir al login
    window.location.href = "login.html";
  } else {
    console.log("✅ Usuario autenticado:", user.email);
  }
  // Guardar el correo globalmente
    window.userEmail = user.email;
});


/***********************
 * Cerrar sesión
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await auth.signOut();
        window.location.href = "login.html";
      } catch (err) {
        console.error("❌ Error al cerrar sesión:", err);
      }
    });
  }
});

/***********************
 * Cargar Items desde Base de datos (firebase)
 ***********************/
async function cargarItemsDesdeFirestore() {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("✅ Items cargados desde Firestore:", items);

    // Actualizar el estado global si ya existe
    if (window.state && Array.isArray(state.items)) {
      state.items = items;
      if (typeof renderFeatured === "function") renderFeatured();
      if (typeof renderGallery === "function") renderGallery();
    } else {
      console.warn("⚠️ Galería aún no lista, reintentando...");
      setTimeout(cargarItemsDesdeFirestore, 1000);
    }
  } catch (error) {
    console.error("❌ Error al cargar items desde Firestore:", error);
  }
}

// Ejecutar carga al iniciar
document.addEventListener("DOMContentLoaded", cargarItemsDesdeFirestore);

