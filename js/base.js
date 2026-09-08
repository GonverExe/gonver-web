/* ===== gonver — base compartida =====
   Datos del canal, acceso a la API de YouTube, navbar,
   aparición al scroll y año del footer.
   Se carga en las tres páginas, antes del script propio de cada una. */

/* ---- Datos del canal ---- */
const CHANNEL = 'https://www.youtube.com/@gonverYT';
const CHANNEL_ID = 'UCmtrcdUj1xxc_CwrnDi2ZQQ';
const EMAIL = 'gonveryt.contacto@gmail.com';

/* La lista de subidas de un canal es su ID cambiando UC... por UU... */
const UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID.slice(2);

/* ---- Clave de la YouTube Data API v3 ----
   PEGA AQUÍ TU CLAVE y la web se actualizará sola: suscriptores,
   número de vídeos, últimos vídeos y listas de reproducción.
   Mientras esté vacía se usan los datos guardados en cada página. */
const API_KEY = 'AIzaSyB4IA7oTdzKbFLrF2WnLgrnTyaw-Nz3Kqk';

/* Cifras de respaldo (última comprobación: 08/09/2026) */
const FALLBACK_STATS = { subscribers: 7, videos: 78 };

/* ---- Llamada a la API ----
   Devuelve el JSON, o lanza si la respuesta no es correcta. */
const ytApi = async (endpoint, params) => {
    const qs = new URLSearchParams({ ...params, key: API_KEY });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`);

    if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error?.message || `HTTP ${res.status}`);
    }

    return res.json();
};

/* ---- Caché en el navegador ----
   Evita gastar cuota en cada recarga. Cada dato dura lo que cuesta
   pedirlo: las cifras y los vídeos son 1 unidad de cuota, así que se
   refrescan enseguida; las listas gastan una unidad por lista, así
   que aguantan más tiempo guardadas.
   Si localStorage no está disponible se pide siempre a la API. */
const CACHE_TTL = {
    stats: 10 * 60 * 1000,        // 10 minutos
    videos: 10 * 60 * 1000,       // 10 minutos
    series: 6 * 60 * 60 * 1000    // 6 horas
};

const cached = async (key, ttl, loader) => {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const { t, v } = JSON.parse(raw);
            if (Date.now() - t < ttl) return v;
        }
    } catch (err) {
        /* modo privado o almacenamiento bloqueado: seguimos sin caché */
    }

    const value = await loader();

    try {
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
    } catch (err) {
        /* si no se puede guardar, no pasa nada */
    }

    return value;
};

/* ---- Navbar con fondo al hacer scroll ---- */
const nav = document.getElementById('nav');

if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Aparición de elementos al hacer scroll ----
   Cada página llama a observeReveal() después de pintar su
   contenido, para que las tarjetas generadas también entren. */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

const observeReveal = () => {
    document.querySelectorAll('.reveal:not([data-observed])').forEach((el, i) => {
        el.dataset.observed = 'true';
        el.style.transitionDelay = `${(i % 3) * 90}ms`;
        revealObserver.observe(el);
    });
};

/* ---- Año del footer ---- */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
