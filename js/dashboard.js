/* =========================================
   Modern Agro — Dashboard Logic
   ========================================= */

const STORAGE_KEY = 'modernagro.products';
const CAT_KEY = 'modernagro.categories';

const DEFAULT_CATEGORIES = [
  { name: 'Grains',         icon: 'fa-wheat-awn',   color: 'bg-amber-100 text-amber-700' },
  { name: 'Vegetables',     icon: 'fa-carrot',      color: 'bg-green-100 text-green-700' },
  { name: 'Fruits',         icon: 'fa-apple-whole', color: 'bg-red-100 text-red-700' },
  { name: 'Dairy',          icon: 'fa-cheese',      color: 'bg-blue-100 text-blue-700' },
  { name: 'Seeds',          icon: 'fa-seedling',    color: 'bg-agro-100 text-agro-700' },
  { name: 'Livestock Feed', icon: 'fa-cow',         color: 'bg-orange-100 text-orange-700' }
];

const SAMPLE_DATA = [
  { id: 1, name: 'Basmati Rice',     category: 'Grains',         unit: 'kg', stock: 1250, price: 2.80, supplier: 'Sunrise Mills' },
  { id: 2, name: 'Organic Tomatoes', category: 'Vegetables',     unit: 'kg', stock: 320,  price: 1.50, supplier: 'Green Valley' },
  { id: 3, name: 'Mangoes (Alphonso)',category:'Fruits',          unit: 'kg', stock: 180,  price: 4.20, supplier: 'Orchard Co.' },
  { id: 4, name: 'Fresh Milk',       category: 'Dairy',          unit: 'kg', stock: 45,   price: 1.10, supplier: 'Dairy Pure' },
  { id: 5, name: 'Wheat Flour',      category: 'Grains',         unit: 'kg', stock: 890,  price: 1.20, supplier: 'Sunrise Mills' },
  { id: 6, name: 'Spinach',          category: 'Vegetables',     unit: 'kg', stock: 25,   price: 2.00, supplier: 'Green Valley' },
  { id: 7, name: 'Sunflower Seeds',  category: 'Seeds',          unit: 'kg', stock: 400,  price: 5.50, supplier: 'Seed Hub' },
  { id: 8, name: 'Corn Feed',        category: 'Livestock Feed', unit: 'kg', stock: 600,  price: 0.80, supplier: 'Farm Supply' },
  { id: 9, name: 'Apples (Gala)',    category: 'Fruits',         unit: 'kg', stock: 240,  price: 3.00, supplier: 'Orchard Co.' },
  { id:10, name: 'Yogurt',           category: 'Dairy',          unit: 'kg', stock: 18,   price: 2.50, supplier: 'Dairy Pure' }
];

/* ---- State ---- */
let products = loadProducts();
let categories = loadCategories();
let editingId = null;

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
  return [...SAMPLE_DATA];
}
function saveProducts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }

function loadCategories() {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(CAT_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  return [...DEFAULT_CATEGORIES];
}
function saveCategories() { localStorage.setItem(CAT_KEY, JSON.stringify(categories)); }

function nextId() { return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1; }

/* ---- Sidebar nav ---- */
const sideLinks = document.querySelectorAll('.side-link');
const pages = document.querySelectorAll('.page');
// notification 

// -------
function gotoPage(pageKey) {
  sideLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageKey));
  pages.forEach(p => p.classList.toggle('hidden', p.id !== 'page-' + pageKey));
  if (pageKey === 'reports') renderReports();
  if (pageKey === 'categories') renderCategories();
  closeSidebarMobile();
}
sideLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); gotoPage(link.dataset.page); }));
document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); gotoPage(el.dataset.nav); }));

/* ---- Mobile sidebar ---- */
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
function openSidebarMobile() { sidebar.classList.remove('-translate-x-full'); backdrop.classList.remove('hidden'); }
function closeSidebarMobile() { if (window.innerWidth < 1024) { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); } }
document.getElementById('openSidebar')?.addEventListener('click', openSidebarMobile);
document.getElementById('closeSidebar')?.addEventListener('click', closeSidebarMobile);
backdrop?.addEventListener('click', closeSidebarMobile);

/* ---- Toast (top center) ---- */
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toast.className = type;
  toast.querySelector('.toast-icon').innerHTML =
    `<i class="fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-trash' : 'fa-circle-info'}"></i>`;
  toastMsg.textContent = msg;
  // force reflow to restart animation
  void toast.offsetWidth;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---- Custom Confirm Dialog ---- */
const confirmModal = document.getElementById('confirmModal');
function showConfirm({ title = 'Are you sure?', message = 'This action cannot be undone.', okText = 'Delete', icon = 'fa-triangle-exclamation', danger = true } = {}) {
  return new Promise(resolve => {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmOk').textContent = okText;
    document.getElementById('confirmIcon').className = `fa-solid ${icon} ${danger ? 'text-red-600' : 'text-agro-700'} text-2xl`;
    document.querySelector('#confirmModal .w-16').className = `w-16 h-16 rounded-full ${danger ? 'bg-red-100' : 'bg-agro-100'} grid place-items-center mx-auto`;
    document.getElementById('confirmOk').className = `flex-1 ${danger ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25' : 'bg-agro-600 hover:bg-agro-700 shadow-agro-600/25'} text-white py-2.5 rounded-xl font-semibold transition shadow-lg`;

    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('flex');

    const cleanup = (val) => {
      confirmModal.classList.add('hidden');
      confirmModal.classList.remove('flex');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      confirmModal.removeEventListener('click', onBackdrop);
      resolve(val);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (e) => { if (e.target === confirmModal) cleanup(false); };

    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    confirmModal.addEventListener('click', onBackdrop);
  });
}

/* ---- Stats ---- */
function renderStats() {
  const total = products.length;
  const stock = products.reduce((s, p) => s + Number(p.stock), 0);
  const low = products.filter(p => p.stock < 50).length;
  const value = products.reduce((s, p) => s + p.stock * p.price, 0);
  animateNumber('statTotal', total);
  animateNumber('statStock', stock);
  animateNumber('statLow', low);
  animateNumber('statValue', Math.round(value));
  document.getElementById('invBadge').textContent = total;
}
function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g,'')) || 0;
  const duration = 600;
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---- Recent ---- */
function renderRecent() {
  const recent = [...products].slice(-5).reverse();
  const list = document.getElementById('recentList');
  if (!recent.length) { list.innerHTML = '<p class="text-sm text-agro-800/50">No activity yet.</p>'; return; }
  list.innerHTML = recent.map(p => `
    <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-agro-50 transition">
      <div class="w-10 h-10 rounded-xl ${categoryBg(p.category)} grid place-items-center">
        <i class="fa-solid ${categoryIcon(p.category)}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm truncate">${escapeHtml(p.name)}</div>
        <div class="text-xs text-agro-800/60">${escapeHtml(p.category)} · ${p.stock} ${p.unit}</div>
      </div>
      <div class="text-sm font-semibold text-agro-700">$${p.price.toFixed(2)}</div>
    </div>`).join('');
}

/* ---- Inventory ---- */
const invBody  = document.getElementById('invBody');
const invEmpty = document.getElementById('invEmpty');
const invSearch = document.getElementById('invSearch');
const invCategory = document.getElementById('invCategory');
const invSort = document.getElementById('invSort');
const globalSearch = document.getElementById('globalSearch');

function refillCategorySelects() {
  const opts = categories.map(c => `<option>${escapeHtml(c.name)}</option>`).join('');
  document.getElementById('pcategory').innerHTML = opts;
  invCategory.innerHTML = '<option value="">All Categories</option>' + opts;
}

function renderInventory() {
  const q = (invSearch?.value || globalSearch?.value || '').trim().toLowerCase();
  const cat = invCategory?.value || '';
  const sort = invSort?.value || 'name';

  let list = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchQ && matchCat;
  });

  list.sort((a,b) => {
    if (sort === 'stock') return b.stock - a.stock;
    if (sort === 'price') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  if (!list.length) { invBody.innerHTML = ''; invEmpty.classList.remove('hidden'); return; }
  invEmpty.classList.add('hidden');

  invBody.innerHTML = list.map(p => {
    const status = p.stock < 50
      ? '<span class="text-xs bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full">Low</span>'
      : p.stock < 200
        ? '<span class="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">Medium</span>'
        : '<span class="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">In Stock</span>';
    return `
      <tr class="row-in">
        <td class="px-5 py-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${categoryBg(p.category)} grid place-items-center flex-shrink-0">
              <i class="fa-solid ${categoryIcon(p.category)}"></i>
            </div>
            <div class="min-w-0">
              <div class="font-semibold truncate">${escapeHtml(p.name)}</div>
              <div class="text-xs text-agro-800/60 truncate">${escapeHtml(p.supplier || '—')}</div>
            </div>
          </div>
        </td>
        <td class="px-5 py-3"><span class="text-xs bg-agro-50 text-agro-700 font-semibold px-2.5 py-1 rounded-full">${escapeHtml(p.category)}</span></td>
        <td class="px-5 py-3 font-semibold">${p.stock} <span class="text-xs text-agro-800/50">${p.unit}</span></td>
        <td class="px-5 py-3 font-semibold">$${p.price.toFixed(2)}</td>
        <td class="px-5 py-3">${status}</td>
        <td class="px-5 py-3 text-right whitespace-nowrap">
          <button data-edit="${p.id}" class="w-9 h-9 rounded-lg bg-agro-50 hover:bg-agro-100 text-agro-700 transition"><i class="fa-solid fa-pen-to-square text-sm"></i></button>
          <button data-del="${p.id}"  class="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition ml-1"><i class="fa-solid fa-trash text-sm"></i></button>
        </td>
      </tr>`;
  }).join('');

  invBody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openModal(Number(btn.dataset.edit))));
  invBody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.del))));
}

[invSearch, invCategory, invSort].forEach(el => el?.addEventListener('input', renderInventory));
globalSearch?.addEventListener('input', () => {
  if (invSearch) invSearch.value = globalSearch.value;
  renderInventory();
  if (document.getElementById('page-inventory').classList.contains('hidden')) gotoPage('inventory');
});

/* ---- Category helpers ---- */
function categoryIcon(catName) {
  const c = categories.find(x => x.name === catName);
  return c?.icon || 'fa-leaf';
}
function categoryBg(catName) {
  const c = categories.find(x => x.name === catName);
  return c?.color || 'bg-agro-100 text-agro-700';
}
function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ---- Product Modal ---- */
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
function openModal(id = null) {
  editingId = id;
  form.reset();
  refillCategorySelects();
  if (id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('pid').value = p.id;
    document.getElementById('pname').value = p.name;
    document.getElementById('pcategory').value = p.category;
    document.getElementById('punit').value = p.unit;
    document.getElementById('pstock').value = p.stock;
    document.getElementById('pprice').value = p.price;
    document.getElementById('psupplier').value = p.supplier || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Add Product';
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); editingId = null; }

document.querySelectorAll('.add-product-btn').forEach(b => b.addEventListener('click', () => openModal()));
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    name: document.getElementById('pname').value.trim(),
    category: document.getElementById('pcategory').value,
    unit: document.getElementById('punit').value,
    stock: Number(document.getElementById('pstock').value),
    price: Number(document.getElementById('pprice').value),
    supplier: document.getElementById('psupplier').value.trim()
  };
  if (editingId) {
    products = products.map(p => p.id === editingId ? { ...p, ...data } : p);
    showToast('Product updated', 'success');
  } else {
    products.push({ id: nextId(), ...data });
    showToast('Product added', 'success');
  }
  saveProducts();
  refreshAll();
  closeModal();
});

/* ---- Delete with custom confirm ---- */
async function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const ok = await showConfirm({
    title: 'Delete Product?',
    message: `"${p.name}" will be permanently removed from your inventory.`,
    okText: 'Delete',
    icon: 'fa-trash'
  });
  if (!ok) return;
  products = products.filter(x => x.id !== id);
  saveProducts();
  refreshAll();
  showToast(`"${p.name}" deleted`, 'error');
}

/* ---- Categories page ---- */
function renderCategories() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = categories.map((c, idx) => {
    const items = products.filter(p => p.category === c.name);
    const stock = items.reduce((s,p)=>s+p.stock,0);
    const value = items.reduce((s,p)=>s+p.stock*p.price,0);
    const isCustom = !DEFAULT_CATEGORIES.find(d => d.name === c.name);
    return `
      <div class="bg-white p-6 rounded-2xl border border-agro-100 hover:-translate-y-1 transition shadow-sm relative group">
        ${isCustom ? `<button data-delcat="${idx}" class="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
        <div class="w-12 h-12 rounded-xl ${c.color} grid place-items-center text-xl"><i class="fa-solid ${c.icon}"></i></div>
        <h3 class="mt-4 font-bold text-lg">${escapeHtml(c.name)}</h3>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">${items.length}</div><div class="text-xs text-agro-800/60">Items</div></div>
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">${stock}</div><div class="text-xs text-agro-800/60">Stock</div></div>
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">$${Math.round(value)}</div><div class="text-xs text-agro-800/60">Value</div></div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('[data-delcat]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = Number(btn.dataset.delcat);
      const c = categories[idx];
      const used = products.some(p => p.category === c.name);
      if (used) {
        showToast('Category in use — remove products first', 'info');
        return;
      }
      const ok = await showConfirm({
        title: 'Delete Category?',
        message: `"${c.name}" will be removed.`,
        okText: 'Delete',
        icon: 'fa-trash'
      });
      if (!ok) return;
      categories.splice(idx, 1);
      saveCategories();
      refillCategorySelects();
      renderCategories();
      showToast(`Category "${c.name}" deleted`, 'error');
    });
  });
}

/* ---- Add Category Modal ---- */
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');

const ICON_OPTIONS = ['fa-leaf','fa-pepper-hot','fa-fish','fa-egg','fa-mug-hot','fa-bread-slice','fa-drumstick-bite','fa-bottle-water','fa-jar','fa-tree','fa-lemon','fa-bacon'];
const COLOR_OPTIONS = [
  { sw:'bg-agro-500',  cls:'bg-agro-100 text-agro-700' },
  { sw:'bg-amber-500', cls:'bg-amber-100 text-amber-700' },
  { sw:'bg-green-500', cls:'bg-green-100 text-green-700' },
  { sw:'bg-red-500',   cls:'bg-red-100 text-red-700' },
  { sw:'bg-blue-500',  cls:'bg-blue-100 text-blue-700' },
  { sw:'bg-orange-500',cls:'bg-orange-100 text-orange-700' },
  { sw:'bg-purple-500',cls:'bg-purple-100 text-purple-700' },
  { sw:'bg-pink-500',  cls:'bg-pink-100 text-pink-700' },
  { sw:'bg-teal-500',  cls:'bg-teal-100 text-teal-700' },
  { sw:'bg-yellow-500',cls:'bg-yellow-100 text-yellow-700' },
  { sw:'bg-indigo-500',cls:'bg-indigo-100 text-indigo-700' },
  { sw:'bg-stone-500', cls:'bg-stone-100 text-stone-700' }
];

function buildIconPicker() {
  const wrap = document.getElementById('iconPicker');
  wrap.innerHTML = ICON_OPTIONS.map((ic, i) => `
    <button type="button" data-icon="${ic}" class="icon-opt aspect-square rounded-xl border-2 grid place-items-center transition ${i===0 ? 'border-agro-500 bg-agro-50' : 'border-transparent bg-agro-50 hover:border-agro-300'}">
      <i class="fa-solid ${ic} text-agro-700"></i>
    </button>`).join('');
  wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    wrap.querySelectorAll('button').forEach(x => x.className = 'icon-opt aspect-square rounded-xl border-2 border-transparent bg-agro-50 hover:border-agro-300 grid place-items-center transition');
    b.className = 'icon-opt aspect-square rounded-xl border-2 border-agro-500 bg-agro-50 grid place-items-center transition';
    document.getElementById('catIcon').value = b.dataset.icon;
  }));
}

function buildColorPicker() {
  const wrap = document.getElementById('colorPicker');
  wrap.innerHTML = COLOR_OPTIONS.map((c, i) => `
    <button type="button" data-color="${c.cls}" class="color-opt aspect-square rounded-xl border-2 transition ${i===0 ? 'border-agro-700' : 'border-transparent'} ${c.sw}"></button>`).join('');
  wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    wrap.querySelectorAll('button').forEach(x => x.classList.remove('border-agro-700'));
    wrap.querySelectorAll('button').forEach(x => x.classList.add('border-transparent'));
    b.classList.remove('border-transparent');
    b.classList.add('border-agro-700');
    document.getElementById('catColor').value = b.dataset.color;
  }));
}

document.getElementById('addCategoryBtn').addEventListener('click', () => {
  categoryForm.reset();
  document.getElementById('catIcon').value = 'fa-leaf';
  document.getElementById('catColor').value = 'bg-agro-100 text-agro-700';
  buildIconPicker();
  buildColorPicker();
  categoryModal.classList.remove('hidden');
  categoryModal.classList.add('flex');
});
document.getElementById('closeCategoryModal').addEventListener('click', () => {
  categoryModal.classList.add('hidden'); categoryModal.classList.remove('flex');
});
categoryModal.addEventListener('click', e => { if (e.target === categoryModal) { categoryModal.classList.add('hidden'); categoryModal.classList.remove('flex'); }});

categoryForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  if (!name) return;
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    showToast('Category already exists', 'error');
    return;
  }
  categories.push({
    name,
    icon: document.getElementById('catIcon').value,
    color: document.getElementById('catColor').value
  });
  saveCategories();
  refillCategorySelects();
  renderCategories();
  categoryModal.classList.add('hidden'); categoryModal.classList.remove('flex');
  showToast(`Category "${name}" created`, 'success');
});

/* ---- Reports ---- */
let distChartInstance = null;
function renderReports() {
  const cats = categories.map(c => c.name);
  const data = cats.map(c => products.filter(p=>p.category===c).reduce((s,p)=>s+p.stock,0));
  const palette = ['#3b7730','#70b05d','#D97706','#2563eb','#9dcd8f','#8B5E34','#dc2626','#7c3aed','#0d9488','#eab308','#4f46e5','#78716c'];

  const ctx = document.getElementById('distChart')?.getContext('2d');
  if (ctx) {
    if (distChartInstance) distChartInstance.destroy();
    distChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: cats, datasets: [{ data, backgroundColor: cats.map((_,i) => palette[i % palette.length]), borderWidth: 0 }]},
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
        cutout: '65%'
      }
    });
  }

  const top = [...products].sort((a,b)=>(b.stock*b.price)-(a.stock*a.price)).slice(0,5);
  const max = top[0] ? top[0].stock*top[0].price : 1;
  document.getElementById('topList').innerHTML = top.map(p => {
    const v = p.stock*p.price;
    return `
      <div>
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="font-semibold">${escapeHtml(p.name)}</span>
          <span class="text-agro-700 font-semibold">$${Math.round(v).toLocaleString()}</span>
        </div>
        <div class="h-2 bg-agro-50 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-agro-500 to-agro-700 rounded-full transition-all" style="width:${(v/max)*100}%"></div>
        </div>
      </div>`;
  }).join('') || '<p class="text-sm text-agro-800/50">No data yet.</p>';

  const totalValue = products.reduce((s,p)=>s+p.stock*p.price, 0);
  const avgPrice = products.length ? (products.reduce((s,p)=>s+p.price,0)/products.length) : 0;
  const lowCount = products.filter(p => p.stock < 50).length;
  const topCat = cats.map(c => ({c, n:products.filter(p=>p.category===c).length})).sort((a,b)=>b.n-a.n)[0];
  document.getElementById('summaryGrid').innerHTML = `
    <div class="p-4 rounded-xl bg-agro-50"><div class="text-xs text-agro-800/60">Inventory Value</div><div class="text-xl font-bold mt-1">$${Math.round(totalValue).toLocaleString()}</div></div>
    <div class="p-4 rounded-xl bg-agro-50"><div class="text-xs text-agro-800/60">Avg Price</div><div class="text-xl font-bold mt-1">$${avgPrice.toFixed(2)}</div></div>
    <div class="p-4 rounded-xl bg-agro-50"><div class="text-xs text-agro-800/60">Low Stock</div><div class="text-xl font-bold mt-1">${lowCount}</div></div>
    <div class="p-4 rounded-xl bg-agro-50"><div class="text-xs text-agro-800/60">Top Category</div><div class="text-xl font-bold mt-1">${topCat?.c || '—'}</div></div>
  `;
}

/* ---- Yield chart ---- */
let yieldChartInstance = null;
function renderYieldChart() {
  const ctx = document.getElementById('yieldChart')?.getContext('2d');
  if (!ctx) return;
  if (yieldChartInstance) yieldChartInstance.destroy();
  yieldChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: 'Grains',     data: [420,450,510,560,620,690,750,720,680,600,540,490], backgroundColor: '#3b7730', borderRadius: 6 },
        { label: 'Vegetables', data: [320,340,380,410,460,500,530,510,480,440,400,360], backgroundColor: '#D97706', borderRadius: 6 },
        { label: 'Fruits',     data: [180,200,230,260,290,320,340,330,310,280,240,210], backgroundColor: '#8B5E34', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#e3f1df' }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

/* ---- Settings ---- */
document.getElementById('resetData')?.addEventListener('click', async () => {
  const ok = await showConfirm({
    title: 'Reset all data?',
    message: 'All products and custom categories will be permanently removed.',
    okText: 'Reset',
    icon: 'fa-arrow-rotate-left'
  });
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CAT_KEY);
  products = [];
  categories = [...DEFAULT_CATEGORIES];
  saveProducts(); saveCategories();
  refillCategorySelects();
  refreshAll();
  showToast('All data reset', 'error');
});
document.getElementById('seedData')?.addEventListener('click', () => {
  products = [...SAMPLE_DATA];
  saveProducts();
  refreshAll();
  showToast('Sample data loaded', 'success');
});

/* ---- Refresh ---- */
function refreshAll() {
  renderStats();
  renderRecent();
  renderInventory();
  renderYieldChart();
  if (!document.getElementById('page-categories').classList.contains('hidden')) renderCategories();
  if (!document.getElementById('page-reports').classList.contains('hidden')) renderReports();
}

/* ---- Init ---- */
refillCategorySelects();
refreshAll();


      
 