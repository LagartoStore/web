

const firebaseConfig = {
  apiKey: "AIzaSyDM0MRXzVUNheHAh4IlT2lppAi2JEpSZ_A",
  authDomain: "marketplace-lagartosotre.firebaseapp.com",
  projectId: "marketplace-lagartosotre",
  storageBucket: "marketplace-lagartosotre.firebasestorage.app",
  messagingSenderId: "736972459338",
  appId: "1:736972459338:web:df908b0407e9c823a7c5b3",
  measurementId: "G-6K0J2Q6BPC"
};

// Inicializar Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


///Autenticación

// --- CÓDIGO NUEVO ---
// En galeria_firebase.js

auth.onAuthStateChanged(user => {
  const btnLogout = document.getElementById("btn-logout");

  if (!user) {
    // 1. SI ES INVITADO (NO LOGUEADO):
    console.log("Modo visitante");
    window.userEmail = null; 
    
    // Cambiamos el botón de "Cerrar sesión" a "Iniciar sesión"
    if(btnLogout) {
      btnLogout.textContent = "Iniciar sesión";
      btnLogout.style.background = "#66c0f4"; // Azul para iniciar
      // Al hacer click, lo mandamos al login
      btnLogout.onclick = () => window.location.href = "login.html";
    }

  } else {
    // 2. SI ESTÁ LOGUEADO:
    console.log("✅ Usuario autenticado:", user.email);
    window.userEmail = user.email;

    // Restauramos el botón de Cerrar Sesión (Rojo)
    if(btnLogout) {
      btnLogout.textContent = "Cerrar sesión";
      btnLogout.style.background = ""; // Usar el gradiente rojo del CSS
      // Al hacer click, cierra sesión (usando tu lógica actual)
      btnLogout.onclick = async () => {
        await auth.signOut();
        window.location.href = "login.html";
      };
    }
  }
});

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


if (!window.state) {
  window.state = {
    items: [],
    cart: []
  };
}

////Agregar al carrito

window.addToCart = function (itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return alert("Error: item no encontrado");

  state.cart.push({ ...item });
  console.log("🛒 Agregado al carrito:", item);
  alert("Producto agregado al carrito ✔");
};




 ////Cargar items  Firestore

async function cargarItemsDesdeFirestore() {
  try {
    const snapshot = await db.collection("items").get();

    const items = snapshot.docs.map(doc => {
      const d = doc.data();

  
      return {
        id: doc.id,
        img: d.img || d.imagen || "",
        title: d.title || d.titulo || "Sin título",
        desc: d.desc || d.descripcion || "",
        price: d.price || d.precio || 0,
        author: d.author || d.autor || "desconocido",
        category: d.category || d.categoria || "General",
        rating: d.rating || 4.5
      };
    });

    console.log("✅ Items cargados desde Firestore (normalizados):", items);

    state.items = items;

    if (typeof renderFeatured === "function") renderFeatured();
    if (typeof renderGallery === "function") renderGallery();

  } catch (error) {
    console.error("❌ Error al cargar items desde Firestore:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarItemsDesdeFirestore);

 ///Render pendientes

window.renderPending = renderPending;

setTimeout(() => {
  if (typeof renderPending === "function") renderPending();
}, 800);
