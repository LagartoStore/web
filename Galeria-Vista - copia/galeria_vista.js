/***********************
 * Datos iniciales
 ***********************/
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
  const el = document.getElementById('view-' + viewId.replace(/^view-/, '').replace('-',''));
 
  const map = {
    'home':'view-home','gallery':'view-gallery','detail':'view-detail','publish':'view-publish','cart':'view-cart',
    'payment':'view-payment','confirm':'view-confirm','admin':'view-admin'
  };

  Object.values(map).forEach(id => {
    const node = document.getElementById(id);
    if(node) node.classList.remove('active');
  });
  const target = document.getElementById('view-' + viewId);
  if(target) target.classList.add('active');

  $$('.nav-link').forEach(a=>{
    a.classList.toggle('active', a.dataset.link === viewId);
  });
}


function formatMoney(v){ return 'S/. ' + Number(v).toFixed(2); }

function renderFeatured(){
  const container = $('#featured-grid');
  container.innerHTML = '';
  state.items.slice(0,3).forEach(it => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img class="card-img" src="${it.img}" alt="${escapeHtml(it.title)}" />
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
    card.onclick = ()=> openDetail(it.id);
    container.appendChild(card);
  });
}

function renderGallery(filter=''){
  const grid = $('#gallery-grid');
  grid.innerHTML = '';
  let items = state.items.slice();


  const q = $('#search-input').value.trim().toLowerCase();
  const cat = $('#filter-cat').value;
  const sort = $('#filter-sort').value;

  if(q) items = items.filter(i => (i.title + ' ' + i.author + ' ' + i.desc + ' ' + i.category).toLowerCase().includes(q));
  if(cat) items = items.filter(i => i.category === cat);

  if(sort === 'price-asc') items.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') items.sort((a,b)=>b.price-a.price);
  if(sort === 'popular') items.sort((a,b)=>b.rating-a.rating);
  if(sort === 'new') items.reverse();

  items.forEach(it => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img class="card-img" src="${it.img}" alt="${escapeHtml(it.title)}" />
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="min-width:0">
            <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(it.title)}</div>
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


function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }


function openDetail(id){
  const it = state.items.find(x => x.id === id);
  if(!it) return alert('Artículo no encontrado');
  state.currentItem = it;
  $('#detail-img').src = it.img;
  $('#detail-title').textContent = it.title;
  $('#detail-author').textContent = it.author + ' • ' + it.category;
  $('#detail-price').textContent = formatMoney(it.price);
  $('#detail-desc').textContent = it.desc;
  renderComments();
  showView('detail');
}
function openDetailFromBtn(e){ e.stopPropagation(); const id = e.currentTarget.dataset.id; openDetail(id); }
function addToCartFromBtn(e){ e.stopPropagation(); const id = e.currentTarget.dataset.id; const it = state.items.find(x=>x.id===id); if(it){ state.cart.push({...it}); renderCart(); alert('Agregado al carrito'); } }


function renderComments(){
  const sec = $('#comments-section');
  sec.innerHTML = '';
  const comments = state.currentItem.comments || [];
  if(comments.length === 0) sec.innerHTML = '<div class="muted">Sé el primero en comentar.</div>';
  else comments.forEach(c=>{
    const d = document.createElement('div');
    d.style.padding='8px'; d.style.borderRadius='8px'; d.style.background='#fff'; d.style.marginBottom='8px';
    d.innerHTML = `<div style="display:flex;justify-content:space-between"><div style="font-weight:700">${escapeHtml(c.author||'Anon')}</div><div class="muted">${'★'.repeat(c.stars)}</div></div><div class="muted" style="margin-top:6px">${escapeHtml(c.text)}</div>`;
    sec.appendChild(d);
  });
}


function renderCart(){
  const list = $('#cart-list');
  list.innerHTML = '';
  let total = 0;
  state.cart.forEach((it, idx) => {
    total += Number(it.price);
    const el = document.createElement('div'); el.className = 'cart-item';
    el.innerHTML = `<img src="${it.img}" alt="${escapeHtml(it.title)}" />
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(it.title)}</div>
        <div class="muted" style="font-size:13px">${escapeHtml(it.author)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">${formatMoney(it.price)}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="btn btn-ghost" data-idx="${idx}" onclick="removeFromCart(event)">Quitar</button>
        </div>
      </div>`;
    list.appendChild(el);
  });
  $('#cart-total').textContent = formatMoney(total);
  $('#pay-total').textContent = formatMoney(total);
}
function removeFromCart(e){
  const idx = Number(e.currentTarget.dataset.idx);
  state.cart.splice(idx,1);
  renderCart();
}


async function publishNew() {
  const title = $('#pub-title').value.trim();
  const desc = $('#pub-desc').value.trim();
  const category = $('#pub-category').value.trim();
  const price = parseFloat($('#pub-price').value.trim()) || 0;
  const image = $('#pub-image').value.trim();
  const author = window.userEmail || "desconocido";

  if (!title || !desc || !category || !image) {
    alert("Por favor, completa todos los campos requeridos.");
    return;
  }

  const newPost = {
    titulo: title,
    descripcion: desc,
    categoria: category,
    precio: price,
    imagen: image,
    autor: author,
    estado: "pendiente",
    fecha: new Date().toISOString()
  };

  try {
    await db.collection("pendientes").add(newPost);
    alert("✅ Publicación enviada para revisión del administrador.");
    
    // Limpiar formulario
    $('#pub-title').value = "";
    $('#pub-desc').value = "";
    $('#pub-category').value = "";
    $('#pub-price').value = "";
    $('#pub-image').value = "";
    
  } catch (err) {
    console.error("❌ Error al publicar:", err);
    alert("Ocurrió un error al enviar tu publicación.");
  }
}



function approve(e){
  const idx = Number(e.currentTarget.dataset.idx);
  const item = state.pending.splice(idx,1)[0];

  state.items.unshift({...item, id: 'i' + Date.now()}); // add new id
  renderPending(); renderGallery(); renderFeatured();
  alert('Publicación aprobada y visible en la galería.');
}
function reject(e){
  const idx = Number(e.currentTarget.dataset.idx);
  state.pending.splice(idx,1);
  renderPending();
  alert('Publicación rechazada.');
}


function processPayment(){
  if(state.cart.length === 0){ alert('Carrito vacío'); return; }

  state.cart = [];
  renderCart();
  showView('confirm');
}


document.addEventListener('DOMContentLoaded', ()=>{

  $$('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const v = a.dataset.link;
      showView(v);
    });
  });


  $('#btn-explore').addEventListener('click', ()=> showView('gallery'));
  $('#home-explore').addEventListener('click', ()=> showView('gallery'));


  $('#search-input').addEventListener('input', ()=> renderGallery());
  $('#filter-cat').addEventListener('change', ()=> renderGallery());
  $('#filter-sort').addEventListener('change', ()=> renderGallery());
  $('#load-more').addEventListener('click', ()=> alert('Cargar más (simulado)'));


  $('#go-to-gallery').addEventListener('click', ()=> showView('gallery'));
  $('#add-to-cart').addEventListener('click', ()=>{
    if(state.currentItem) { state.cart.push({...state.currentItem}); renderCart(); alert('Agregado al carrito'); }
  });
  $('#post-comment').addEventListener('click', ()=>{
    const text = $('#comment-text').value.trim();
    const stars = Number($('#comment-stars').value);
    if(!text) return alert('Escribe un comentario');
    state.currentItem.comments.push({ author: 'Usuario', text, stars });
    $('#comment-text').value = '';
    renderComments();
  });


  $('#btn-publish').addEventListener('click', publishNew);


  $('#btn-checkout').addEventListener('click', ()=> showView('payment'));
  $('#continue-shopping').addEventListener('click', ()=> showView('gallery'));


  $$('input[name="pay-method"]').forEach(r => r.addEventListener('change', (e)=>{
    const v = e.target.value;
    $('#card-form').style.display = v === 'card' ? 'block' : 'none';
    $('#yape-form').style.display = v === 'yape' ? 'block' : 'none';
  }));

  $('#btn-pay').addEventListener('click', processPayment);
  $('#btn-pay-cancel').addEventListener('click', ()=> showView('cart'));

  $('#confirm-to-gallery').addEventListener('click', ()=> showView('gallery'));
  $('#confirm-to-home').addEventListener('click', ()=> showView('home'));


  document.addEventListener('keydown', (e)=> {
    if(e.ctrlKey && e.key === 'a'){ showView('admin'); renderPending(); }
  });


  renderFeatured();
  renderGallery();
  renderCart();
  renderPending();
});


window.openDetail = openDetail;
window.openDetailFromBtn = openDetailFromBtn;
window.addToCartFromBtn = addToCartFromBtn;
window.removeFromCart = removeFromCart;
window.approve = approve;
window.reject = reject;



