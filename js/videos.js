/* ===== videos.html — últimos vídeos =====
   Con API_KEY puesta se piden los 6 últimos vídeos a YouTube.
   Sin clave (o si la llamada falla) se usan los de abajo.
   Depende de js/base.js. */

/* Últimos vídeos guardados (08/09/2026). Las miniaturas se piden
   a los servidores de YouTube, que no gastan cuota de la API. */
const VIDEOS = [
    { id: '6RuyKjPmqd8', title: 'Hades Ep5, HIDRA CALAVÉRICA', serie: 'Hades', thumb: 'https://i.ytimg.com/vi/6RuyKjPmqd8/hqdefault.jpg' },
    { id: '-hRDk6z_ZIg', title: 'Halo 2: Anniversary Ep5, EL ORÁCULO', serie: 'Halo 2', thumb: 'https://i.ytimg.com/vi/-hRDk6z_ZIg/hqdefault.jpg' },
    { id: 'm8cZHLMNy3U', title: 'Hades Ep4', serie: 'Hades', thumb: 'https://i.ytimg.com/vi/m8cZHLMNy3U/hqdefault.jpg' },
    { id: 's25mumRuzM0', title: 'Halo 2: Anniversary Ep4, EL INQUISIDOR', serie: 'Halo 2', thumb: 'https://i.ytimg.com/vi/s25mumRuzM0/hqdefault.jpg' },
    { id: 'VpZNvHvNNrA', title: 'Hades Ep3, PRIMER JEFE', serie: 'Hades', thumb: 'https://i.ytimg.com/vi/VpZNvHvNNrA/hqdefault.jpg' },
    { id: 'wEa2TtFX_M0', title: 'Hades Ep2, ESCUDO ÉGIDA', serie: 'Hades', thumb: 'https://i.ytimg.com/vi/wEa2TtFX_M0/hqdefault.jpg' }
];

const videoGrid = document.getElementById('videoGrid');

/* La API no dice a qué serie pertenece un vídeo, así que se saca
   del propio título: lo que va antes de "Ep" o antes de la coma. */
const serieFromTitle = (title) => {
    const match = title.match(/^(.+?)\s+Ep\.?\s*(?:\d+|FINAL)/i) || title.match(/^([^,]+),/);
    return match ? match[1].trim() : '';
};

const renderVideos = (list) => {
    videoGrid.innerHTML = list.map(v => `
        <a class="card card--media card--video reveal" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
            <div class="thumb">
                <img src="${v.thumb}" alt="${esc(v.title)}" loading="lazy" width="480" height="360" />
                <span class="play">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>
                </span>
            </div>
            <div class="meta">
                ${v.serie ? `<span class="tag">${esc(v.serie)}</span>` : ''}
                <h3>${esc(v.title)}</h3>
            </div>
        </a>
    `).join('');

    observeReveal();
};

/* ---- Últimos vídeos desde YouTube ---- */
const loadVideos = async () => {
    if (!API_KEY) return;

    try {
        const data = await cached('yt:videos', CACHE_TTL.videos, () => ytApi('playlistItems', {
            part: 'snippet',
            playlistId: UPLOADS_PLAYLIST,
            maxResults: 6
        }));

        const list = (data.items || []).map(item => {
            const s = item.snippet;
            const thumbs = s.thumbnails || {};
            return {
                id: s.resourceId.videoId,
                title: s.title,
                serie: serieFromTitle(s.title),
                thumb: (thumbs.high || thumbs.medium || thumbs.default).url
            };
        });

        if (list.length) renderVideos(list);
    } catch (err) {
        console.warn('No se pudieron cargar los vídeos:', err.message);
    }
};

if (videoGrid) {
    renderVideos(VIDEOS);   // se pinta al instante con lo guardado
    loadVideos();           // y se sustituye si la API responde
}
