/* =========================================
   Modern Agro — Dashboard Logic
   CRUD + Search + Filter + Charts + LocalStorage
   ========================================= */

const STORAGE_KEY = 'modernagro.products';

/* ---------- Sample seed data ---------- */
const SAMPLE_DATA = [
  { id: 1, name: 'Basmati Rice',     category: 'Grains',         unit: 'kg',  stock: 1250, price: 2.80, supplier: 'Sunrise Mills' },
  { id: 2, name: 'Organic Tomatoes', category: 'Vegetables',     unit: 'kg',  stock: 320,  price: 1.50, supplier: 'Green Valley' },
  { id: 3, name: 'Mangoes (Alphonso)',category:'Fruits',          unit: 'kg',  stock: 180,  price: 4.20, supplier: 'Orchard Co.' },
  { id: 4, name: 'Fresh Milk',       category: 'Dairy',          unit: 'kg',  stock: 45,   price: 1.10, supplier: 'Dairy Pure' },
  { id: 5, name: 'Wheat Flour',      category: 'Grains',         unit: 'kg',  stock: 890,  price: 1.20, supplier: 'Sunrise Mills' },
  { id: 6, name: 'Spinach',          category: 'Vegetables',     unit: 'kg',  stock: 25,   price: 2.00, supplier: 'Green Valley' },
  { id: 7, name: 'Sunflower Seeds',  category: 'Seeds',          unit: 'kg',  stock: 400,  price: 5.50, supplier: 'Seed Hub' },
  { id: 8, name: 'Corn Feed',        category: 'Livestock Feed', unit: 'kg',  stock: 600,  price: 0.80, supplier: 'Farm Supply' },
  { id: 9, name: 'Apples (Gala)',    category: 'Fruits',         unit: 'kg',  stock: 240,  price: 3.00, supplier: 'Orchard Co.' },
  { id:10, name: 'Yogurt',           category: 'Dairy',          unit: 'kg',  stock: 18,   price: 2.50, supplier: 'Dairy Pure' }
];

/* ---------- State ---------- */
let products = loadProducts();
let editingId = null;

/* ---------- Storage helpers ---------- */
function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // first time → seed
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
  return [...SAMPLE_DATA];
}
function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
function nextId() {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/* ---------- Sidebar nav ---------- */
const sideLinks = document.querySelectorAll('.side-link');
const pages = document.querySelectorAll('.page');

function gotoPage(pageKey) {
  sideLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageKey));
  pages.forEach(p => p.classList.toggle('hidden', p.id !== 'page-' + pageKey));
  if (pageKey === 'reports') renderReports();
  if (pageKey === 'categories') renderCategories();
  closeSidebarMobile();
}

sideLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    gotoPage(link.dataset.page);
  });
});
document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); gotoPage(el.dataset.nav); });
});

/* ---------- Mobile sidebar ---------- */
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
function openSidebarMobile() {
  sidebar.classList.remove('-translate-x-full');
  backdrop.classList.remove('hidden');
}
function closeSidebarMobile() {
  if (window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }
}
document.getElementById('openSidebar')?.addEventListener('click', openSidebarMobile);
document.getElementById('closeSidebar')?.addEventListener('click', closeSidebarMobile);
backdrop?.addEventListener('click', closeSidebarMobile);

/* ---------- Toast ---------- */
const toast = document.getElementById('toast');
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = 'fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl z-50 text-sm text-white show transition-all';
  toast.classList.add(type === 'error' ? 'bg-red-600' : 'bg-agro-800');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---------- Overview stats ---------- */
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

/* ---------- Recent activity ---------- */
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
        <div class="text-xs text-agro-800/60">${p.category} · ${p.stock} ${p.unit}</div>
      </div>
      <div class="text-sm font-semibold text-agro-700">$${p.price.toFixed(2)}</div>
    </div>
  `).join('');
}

/* ---------- Inventory table ---------- */
const invBody  = document.getElementById('invBody');
const invEmpty = document.getElementById('invEmpty');
const invSearch = document.getElementById('invSearch');
const invCategory = document.getElementById('invCategory');
const invSort = document.getElementById('invSort');
const globalSearch = document.getElementById('globalSearch');

function renderInventory() {
  const q = (invSearch?.value || globalSearch?.value || '').trim().toLowerCase();
  const cat = invCategory?.value || '';
  const sort = invSort?.value || 'name';

  let list = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.supplier?.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchQ && matchCat;
  });

  list.sort((a,b) => {
    if (sort === 'stock') return b.stock - a.stock;
    if (sort === 'price') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  if (!list.length) {
    invBody.innerHTML = '';
    invEmpty.classList.remove('hidden');
    return;
  }
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
        <td class="px-5 py-3"><span class="text-xs bg-agro-50 text-agro-700 font-semibold px-2.5 py-1 rounded-full">${p.category}</span></td>
        <td class="px-5 py-3 font-semibold">${p.stock} <span class="text-xs text-agro-800/50">${p.unit}</span></td>
        <td class="px-5 py-3 font-semibold">$${p.price.toFixed(2)}</td>
        <td class="px-5 py-3">${status}</td>
        <td class="px-5 py-3 text-right whitespace-nowrap">
          <button data-edit="${p.id}" class="w-9 h-9 rounded-lg bg-agro-50 hover:bg-agro-100 text-agro-700 transition"><i class="fa-solid fa-pen-to-square text-sm"></i></button>
          <button data-del="${p.id}"  class="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition ml-1"><i class="fa-solid fa-trash text-sm"></i></button>
        </td>
      </tr>`;
  }).join('');

  // bind row buttons
  invBody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModal(Number(btn.dataset.edit)));
  });
  invBody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.del)));
  });
}

[invSearch, invCategory, invSort].forEach(el => el?.addEventListener('input', renderInventory));
globalSearch?.addEventListener('input', () => {
  if (invSearch) invSearch.value = globalSearch.value;
  renderInventory();
  if (document.getElementById('page-inventory').classList.contains('hidden')) gotoPage('inventory');
});

/* ---------- Category / icon helpers ---------- */
function categoryIcon(cat) {
  return {
    'Grains': 'fa-wheat-awn',
    'Vegetables': 'fa-carrot',
    'Fruits': 'fa-apple-whole',
    'Dairy': 'fa-cheese',
    'Seeds': 'fa-seedling',
    'Livestock Feed': 'fa-cow'
  }[cat] || 'fa-leaf';
}
function categoryBg(cat) {
  return {
    'Grains': 'bg-amber-100 text-amber-700',
    'Vegetables': 'bg-green-100 text-green-700',
    'Fruits': 'bg-red-100 text-red-700',
    'Dairy': 'bg-blue-100 text-blue-700',
    'Seeds': 'bg-agro-100 text-agro-700',
    'Livestock Feed': 'bg-orange-100 text-orange-700'
  }[cat] || 'bg-agro-100 text-agro-700';
}
function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ---------- Modal (Add / Edit) ---------- */
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

function openModal(id = null) {
  editingId = id;
  form.reset();
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
function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  editingId = null;
}

document.querySelectorAll('.add-product-btn').forEach(b => b.addEventListener('click', () => openModal()));
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', (e) => {
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
    showToast('Product updated');
  } else {
    products.push({ id: nextId(), ...data });
    showToast('Product added');
  }
  saveProducts();
  refreshAll();
  closeModal();
});

/* ---------- Delete ---------- */
function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
  products = products.filter(x => x.id !== id);
  saveProducts();
  refreshAll();
  showToast('Product deleted', 'error');
}

/* ---------- Categories page ---------- */
function renderCategories() {
  const cats = ['Grains','Vegetables','Fruits','Dairy','Seeds','Livestock Feed'];
  const grid = document.getElementById('catGrid');
  grid.innerHTML = cats.map(c => {
    const items = products.filter(p => p.category === c);
    const stock = items.reduce((s,p)=>s+p.stock,0);
    const value = items.reduce((s,p)=>s+p.stock*p.price,0);
    return `
      <div class="bg-white p-6 rounded-2xl border border-agro-100 hover:-translate-y-1 transition shadow-sm">
        <div class="w-12 h-12 rounded-xl ${categoryBg(c)} grid place-items-center text-xl"><i class="fa-solid ${categoryIcon(c)}"></i></div>
        <h3 class="mt-4 font-bold text-lg">${c}</h3>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">${items.length}</div><div class="text-xs text-agro-800/60">Items</div></div>
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">${stock}</div><div class="text-xs text-agro-800/60">Stock</div></div>
          <div class="bg-agro-50 rounded-xl py-2"><div class="font-bold">$${Math.round(value)}</div><div class="text-xs text-agro-800/60">Value</div></div>
        </div>
      </div>`;
  }).join('');
}

/* ---------- Reports page ---------- */
let distChartInstance = null;
function renderReports() {
  // distribution chart
  const cats = ['Grains','Vegetables','Fruits','Dairy','Seeds','Livestock Feed'];
  const data = cats.map(c => products.filter(p=>p.category===c).reduce((s,p)=>s+p.stock,0));
  const ctx = document.getElementById('distChart')?.getContext('2d');
  if (ctx) {
    if (distChartInstance) distChartInstance.destroy();
    distChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{
          data,
          backgroundColor: ['#3b7730','#70b05d','#D97706','#2563eb','#9dcd8f','#8B5E34'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
        cutout: '65%'
      }
    });
  }

  // top 5 by value
  const top = [...products].sort((a,b)=>(b.stock*b.price)-(a.stock*a.price)).slice(0,5);
  const max = top[0] ? top[0].stock*top[0].price : 1;
  document.getElementById('topList').innerHTML = top.map(p => {
    const v = p.stock*p.price;
    const pct = (v/max)*100;
    return `
      <div>
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="font-semibold">${escapeHtml(p.name)}</span>
          <span class="text-agro-700 font-semibold">$${Math.round(v).toLocaleString()}</span>
        </div>
        <div class="h-2 bg-agro-50 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-agro-500 to-agro-700 rounded-full transition-all" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('') || '<p class="text-sm text-agro-800/50">No data yet.</p>';

  // summary
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

/* ---------- Static main chart (Overview) ---------- */
let yieldChartInstance = null;
function renderYieldChart() {
  const ctx = document.getElementById('yieldChart')?.getContext('2d');
  if (!ctx) return;
  if (yieldChartInstance) yieldChartInstance.destroy();

  // static sample monthly data
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
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#e3f1df' }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

/* ---------- Settings actions ---------- */
document.getElementById('resetData')?.addEventListener('click', () => {
  if (!confirm('Reset all inventory data? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  products = [];
  saveProducts();
  refreshAll();
  showToast('All data reset', 'error');
});
document.getElementById('seedData')?.addEventListener('click', () => {
  products = [...SAMPLE_DATA];
  saveProducts();
  refreshAll();
  showToast('Sample data loaded');
});

/* ---------- Refresh ---------- */
function refreshAll() {
  renderStats();
  renderRecent();
  renderInventory();
  renderYieldChart();
  // re-render visible reports/categories if active
  if (!document.getElementById('page-categories').classList.contains('hidden')) renderCategories();
  if (!document.getElementById('page-reports').classList.contains('hidden')) renderReports();
}

/* ---------- Init ---------- */
refreshAll();
