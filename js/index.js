/* ===== index.html — portada =====
   Contadores del hero y enlace de contacto.
   Depende de js/base.js (CHANNEL_ID, API_KEY, FALLBACK_STATS, observeReveal). */

/* ---- Contadores de las stats ---- */
const counters = document.querySelectorAll('.stats strong[data-stat]');
const stats = { ...FALLBACK_STATS };   // cifras vigentes, sin tope
const seen = new Set();                // los que ya entraron en pantalla

/* Formatea 77 -> "77", 1500 -> "1,5 mil", 2400000 -> "2,4 M" */
const format = (n) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '').replace('.', ',') + ' mil';
    return String(n);
};

const countUp = (el, target) => {
    const from = Number(el.dataset.current) || 0;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(from + (target - from) * eased));
        if (p < 1) requestAnimationFrame(step);
    };

    el.dataset.current = target;
    requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        seen.add(entry.target);
        countUp(entry.target, stats[entry.target.dataset.stat] ?? 0);
        statsObserver.unobserve(entry.target);
    });
}, { threshold: 1 });

counters.forEach(el => statsObserver.observe(el));

/* ---- Cifras reales del canal (YouTube Data API v3) ---- */
const refreshStats = async () => {
    if (!API_KEY || !counters.length) return;

    try {
        const data = await cached('yt:stats', CACHE_TTL.stats, () => ytApi('channels', {
            part: 'statistics',
            id: CHANNEL_ID
        }));

        const s = data.items?.[0]?.statistics;
        if (!s) throw new Error('sin datos del canal');

        stats.subscribers = Number(s.subscriberCount) || stats.subscribers;
        stats.videos = Number(s.videoCount) || stats.videos;

        /* Los que ya se animaron se reajustan a la cifra real */
        counters.forEach(el => {
            if (seen.has(el)) countUp(el, stats[el.dataset.stat]);
        });
    } catch (err) {
        console.warn('No se pudieron cargar las cifras del canal:', err.message);
    }
};

refreshStats();

/* ---- Contacto: abrir el redactor de Gmail ----
   En móvil se deja el mailto:, que abre la app de correo del teléfono.
   En escritorio mucha gente no tiene cliente configurado y el mailto:
   no hace nada, así que se abre Gmail en una pestaña nueva. */
const mailLink = document.getElementById('mailLink');

if (mailLink) {
    const SUBJECT = 'Hola gonver';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    mailLink.addEventListener('click', (e) => {
        if (isMobile) return;   // el mailto: del href se encarga

        e.preventDefault();
        const gmail = 'https://mail.google.com/mail/?view=cm&fs=1'
            + `&to=${encodeURIComponent(EMAIL)}`
            + `&su=${encodeURIComponent(SUBJECT)}`;

        window.open(gmail, '_blank', 'noopener');
    });
}

observeReveal();
