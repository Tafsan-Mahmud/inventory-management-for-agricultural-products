/* ===== Modern Agro — Landing / main.js ===== */

if (window.AOS) AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });

const navbar = document.getElementById('navbar');
const handleScroll = () => {
  if (window.scrollY > 20) navbar?.classList.add('scrolled');
  else navbar?.classList.remove('scrolled');
};
window.addEventListener('scroll', handleScroll);
handleScroll();

/* Mobile menu */
const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('hidden');
  const icon = mobileBtn.querySelector('i');
  icon?.classList.toggle('fa-bars');
  icon?.classList.toggle('fa-xmark');
});
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    const icon = mobileBtn?.querySelector('i');
    icon?.classList.add('fa-bars');
    icon?.classList.remove('fa-xmark');
  });
});

/* Contact form demo */
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Sent!';
  btn.classList.remove('bg-agro-600','hover:bg-agro-700');
  btn.classList.add('bg-green-600');
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.add('bg-agro-600','hover:bg-agro-700');
    btn.classList.remove('bg-green-600');
    contactForm.reset();
  }, 2200);
});
