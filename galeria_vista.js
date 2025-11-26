
const state = {
  items: [],
  pending: [],
  cart: [],
  currentItem: null
};

window.state = state;

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));


function showView(viewId){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewId);
  if(target) target.classList.add('active');

  $$('.nav-link').forEach(a=>{
    a.classList.toggle('active', a.dataset.link === viewId);
  });
}


function formatMoney(v){ return 'S/. ' + Number(v).toFixed(2); }

function escapeHtml(s){
  return (s+'').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}


function updateCartCount(){
  $('#cart-count').textContent = state.cart.length;
}


function renderFeatured(){
  const container = $('#featured-grid');
  if (!container) return;

  container.innerHTML = '';
  state.items.slice(0,3).forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img class="card-img" src="${it.img}" />
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">${escapeHtml(it.title)}</div>
            <div class="muted" style="font-size:13px">${escapeHtml(it.author)} · ${escapeHtml(it.category)}</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatMoney(it.price)}</div>
            <div class="stars">${(it.rating || 0).toFixed(1)} ★</div>
          </div>
        </div>
      </div>
    `;

    card.onclick = () => openDetail(it.id);
    container.appendChild(card);
  });
}


function renderGallery(){
  const grid = $('#gallery-grid');
  grid.innerHTML = '';

  let items = state.items.slice();
  const q = $('#search-input').value.trim().toLowerCase();
  const cat = $('#filter-cat').value;
  const sort = $('#filter-sort').value;

  if(q) items = items.filter(i =>
    (i.title + ' ' + i.author + ' ' + i.desc + ' ' + i.category)
      .toLowerCase().includes(q)
  );
  if(cat) items = items.filter(i => i.category === cat);

  if(sort === 'price-asc') items.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') items.sort((a,b)=>b.price-a.price);
  if(sort === 'popular') items.sort((a,b)=>b.rating-a.rating);
  if(sort === 'new') items.reverse();

  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img class="card-img" src="${it.img}" />
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="min-width:0">
            <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${escapeHtml(it.title)}
            </div>
            <div class="muted" style="font-size:13px">${escapeHtml(it.author)}</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatMoney(it.price)}</div>
            <div class="stars">${(it.rating || 0).toFixed(1)} ★</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
          <button class="btn btn-ghost" data-id="${it.id}" onclick="openDetailFromBtn(event)">Ver detalle</button>
          <button class="btn btn-primary" data-id="${it.id}" onclick="addToCartFromBtn(event)">Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}


function openDetail(id){
  const it = state.items.find(x => x.id === id);
  if(!it) return alert('Artículo no encontrado');

  state.currentItem = it;
  $('#detail-img').src = it.img;
  $('#detail-title').textContent = it.title;
  $('#detail-author').textContent = it.author + ' • ' + it.category;
  $('#detail-price').textContent = formatMoney(it.price);
  $('#detail-desc').textContent = it.desc;

  if (!state.currentItem.comments) state.currentItem.comments = [];
  renderComments();

  $('#add-to-cart').dataset.id = it.id;
  showView('detail');
}

function openDetailFromBtn(e){
  e.stopPropagation();
  openDetail(e.currentTarget.dataset.id);
}


// En galeria_vista.js

function addToCartFromBtn(e){
  e.stopPropagation();

  // --- CÓDIGO DE PROTECCIÓN (NUEVO) ---
  const usuario = firebase.auth().currentUser; // Preguntamos a Firebase quién está
  
  if (!usuario) {
    // Si no hay usuario, mostramos alerta y mandamos al login
    alert("🔒 Para comprar, necesitas iniciar sesión o registrarte.");
    window.location.href = "login.html";
    return; // ¡IMPORTANTE! Esto detiene la función aquí. No agrega nada.
  }
  // ------------------------------------

  // ... Aquí sigue tu código normal de agregar al carrito ...
  const id = e.currentTarget.dataset.id;
  const item = state.items.find(i => i.id === id);

  if (!item) return alert("No se encontró el producto");

  state.cart.push({ ...item });
  renderCart();
  updateCartCount();
  alert("Agregado al carrito");
}

function renderCart(){
  const list = $('#cart-list');
  list.innerHTML = '';

  let total = 0;
  state.cart.forEach((it, idx) => {
    total += Number(it.price);

    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${it.img}" />
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(it.title)}</div>
        <div class="muted" style="font-size:13px">${escapeHtml(it.author)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">${formatMoney(it.price)}</div>
        <button class="btn btn-ghost" data-idx="${idx}" onclick="removeFromCart(event)">Quitar</button>
      </div>
    `;
    list.appendChild(el);
  });

  $('#cart-total').textContent = formatMoney(total);
  $('#pay-total').textContent = formatMoney(total);
  updateCartCount();
}

function removeFromCart(e){
  const idx = Number(e.currentTarget.dataset.idx);
  state.cart.splice(idx,1);
  renderCart();
}


function renderComments(){
  const sec = $('#comments-section');
  sec.innerHTML = '';

  const comments = state.currentItem.comments || [];
  if(!comments.length){
    sec.innerHTML = '<div class="muted">Sé el primero en comentar.</div>';
    return;
  }

  comments.forEach(c=>{
    const d = document.createElement('div');
    d.className = "comment-box";
    d.innerHTML = `
      <div style="font-weight:700">${escapeHtml(c.author)}</div>
      <div class="muted">${'★'.repeat(c.stars)}</div>
      <div class="muted" style="margin-top:6px">${escapeHtml(c.text)}</div>
    `;
    sec.appendChild(d);
  });
}


async function publishNew(){
  const title = $('#pub-title').value.trim();
  const desc = $('#pub-desc').value.trim();
  const category = $('#pub-category').value.trim();
  const price = parseFloat($('#pub-price').value) || 0;
  const image = $('#pub-image').value.trim();

  if(!title || !desc || !category || !image){
    alert("Completa todos los campos");
    return;
  }

  const newPost = {
    titulo: title,
    descripcion: desc,
    categoria: category,
    precio: price,
    imagen: image,
    autor: window.userEmail || "desconocido",
    estado: "pendiente",
    fecha: new Date().toISOString()
  };

  try{
    await db.collection("pendientes").add(newPost);
    alert("Enviado a revisión");

    $('#pub-title').value = "";
    $('#pub-desc').value = "";
    $('#pub-category').value = "";
    $('#pub-price').value = "";
    $('#pub-image').value = "";

  } catch(err){
    console.error(err);
    alert("Error al publicar");
  }
}


function renderPending(){
  const container = $('#pending-list');
  if(!container) return;

  container.innerHTML = "";
  if(!state.pending.length){
    container.innerHTML = '<div class="muted">No hay publicaciones pendientes.</div>';
    return;
  }

  state.pending.forEach((item, idx)=>{
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <img src="${item.imagen}" class="admin-img" />
      <div class="admin-info">
        <h3>${item.titulo}</h3>
        <p>${item.descripcion}</p>
        <p><strong>Categoría:</strong> ${item.categoria}</p>
        <p><strong>Precio:</strong> S/. ${item.precio}</p>
        <p><strong>Autor:</strong> ${item.autor}</p>
      </div>
      <div class="admin-actions">
        <button class="btn btn-primary" data-idx="${idx}" onclick="approve(event)">Aprobar</button>
        <button class="btn btn-ghost" data-idx="${idx}" onclick="reject(event)">Rechazar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function approve(e){
  const idx = e.currentTarget.dataset.idx;
  const item = state.pending.splice(idx,1)[0];

  state.items.unshift({
    id: 'i'+Date.now(),
    img: item.imagen,
    title: item.titulo,
    desc: item.descripcion,
    category: item.categoria,
    price: item.precio,
    author: item.autor,
    rating: 4.5
  });

  renderPending();
  renderGallery();
  renderFeatured();
  alert("Aprobado");
}

function reject(e){
  const idx = e.currentTarget.dataset.idx;
  state.pending.splice(idx,1);
  renderPending();
  alert("Rechazado");
}


document.addEventListener('DOMContentLoaded', ()=>{
  $$('.nav-link').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      showView(a.dataset.link);
    });
  });

  $('#btn-explore').addEventListener('click', ()=>showView('gallery'));
  $('#home-explore').addEventListener('click', ()=>showView('gallery'));

    // ICONO CARRITO redirige a carrito.html
  $('#btn-cart').addEventListener('click', ()=>{
    // Guardar el carrito actual en localStorage
    localStorage.setItem('cart', JSON.stringify(state.cart));

    // Redirigir a la página del carrito
    window.location.href = 'carrito.html';
  });


  $('#search-input').addEventListener('input', ()=> renderGallery());
  $('#filter-cat').addEventListener('change', ()=> renderGallery());
  $('#filter-sort').addEventListener('change', ()=> renderGallery());

  $('#add-to-cart').addEventListener('click', ()=>{
    const id = $('#add-to-cart').dataset.id;
    if(id) addToCartFromBtn({currentTarget:{dataset:{id}}, stopPropagation(){ }});
  });

  $('#post-comment').addEventListener('click', ()=>{
    const text = $('#comment-text').value.trim();
    const stars = Number($('#comment-stars').value);
    if(!text) return alert("Escribe un comentario");

    state.currentItem.comments.push({
      author: window.userEmail || "Usuario",
      text,
      stars
    });

    $('#comment-text').value = "";
    renderComments();
  });

  $('#btn-publish').addEventListener('click', publishNew);

  // PAGO – botones
  $('#btn-checkout').addEventListener('click', ()=>{
    updatePaymentTotal();
    showView('payment');
  });

  $$('input[name="pay-method"]').forEach(radio=>{
  radio.addEventListener('change', ()=>{
    const val = $('input[name="pay-method"]:checked').value;
    $('#card-form').style.display = val==='card'?'block':'none';
    $('#yape-form').style.display = val==='yape'?'block':'none';
  });
});


  $('#btn-pay').addEventListener('click', ()=>{
    alert("Pago simulado exitoso!");
    state.cart = [];
    renderCart();
    showView('confirm');
  });

  $('#btn-pay-cancel').addEventListener('click', ()=>showView('cart'));

  renderFeatured();
  renderGallery();
  renderCart();
  renderPending();
});

////Total pago

function updatePaymentTotal(){
  const total = state.cart.reduce((acc,it)=>acc+Number(it.price),0);
  $('#pay-total').textContent = formatMoney(total);
}

/////funciones

window.openDetail = openDetail;
window.openDetailFromBtn = openDetailFromBtn;
window.addToCartFromBtn = addToCartFromBtn;
window.removeFromCart = removeFromCart;
window.approve = approve;
window.reject = reject;
window.renderPending = renderPending;
