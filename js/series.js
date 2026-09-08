/* ===== series.html — listas de reproducción =====
   Con API_KEY puesta se piden las listas a YouTube, se descartan
   las que solo tienen vídeos privados y se ordenan por último
   vídeo añadido. Sin clave se usan las de abajo.
   Depende de js/base.js. */

/* Listas guardadas (08/09/2026), ordenadas por último vídeo añadido.
   `count` cuenta solo los vídeos visibles para el público:
   Hades y Halo 2 tienen además episodios privados.
   `updated` = fecha en que se añadió el último vídeo. Las miniaturas
   salen de los servidores de YouTube, que no gastan cuota. */
const PLAYLISTS = [
    { id: 'PLLuMoN0wTAYE', title: 'Hades', count: 5, thumb: 'https://i.ytimg.com/vi/6RuyKjPmqd8/hqdefault.jpg', updated: '2026-09-07' },
    { id: 'PLXmNr2rFZhbI', title: 'Halo 2: Anniversary', count: 5, thumb: 'https://i.ytimg.com/vi/-hRDk6z_ZIg/hqdefault.jpg', updated: '2026-08-28' },
    { id: 'PLweq8_0eVzE2LyytXi07ktzgwQ_KavB_w', title: 'Survival Single Player [SSP] 1.14', count: 5, thumb: 'https://i.ytimg.com/vi/cXO41NqHXOk/hqdefault.jpg', updated: '2026-08-04' },
    { id: 'PLweq8_0eVzE24dTIEd5Ns-keRAJepkI_z', title: 'Halo: Combat Evolved', count: 9, thumb: 'https://i.ytimg.com/vi/yS_g1CNZWxk/hqdefault.jpg', updated: '2026-07-12' },
    { id: 'PLweq8_0eVzE1ejVih9ngOuqi9c38Fe2yQ', title: 'Primeras impresiones', count: 3, thumb: 'https://i.ytimg.com/vi/ILaI4iLS3t4/hqdefault.jpg', updated: '2026-06-07' },
    { id: 'PLweq8_0eVzE3T3oVNm2t5OpauHpBXIV4t', title: 'Hitman: Blood Money', count: 1, thumb: 'https://i.ytimg.com/vi/w4uxzJbbXaA/hqdefault.jpg', updated: '2026-06-04' },
    { id: 'PLweq8_0eVzE3aBWY7aybTE4oRXlVunqDH', title: 'Subnautica 2', count: 8, thumb: 'https://i.ytimg.com/vi/o7XorA_2T8Q/hqdefault.jpg', updated: '2026-06-01' },
    { id: 'PLweq8_0eVzE1AHpg1hTbzFIglJuqDx924', title: 'Mierdi Cosos', count: 1, thumb: 'https://i.ytimg.com/vi/2e7qTeihtAo/hqdefault.jpg', updated: '2026-05-22' },
    { id: 'PLweq8_0eVzE2OoOgLVinRNDqN1RdWugfV', title: '🔵 Stream', count: 2, thumb: 'https://i.ytimg.com/vi/m9pbqmEgu14/hqdefault.jpg', updated: '2026-05-14' },
    { id: 'PLweq8_0eVzE3sQ_KCthFh5CETvHYvn0Mz', title: 'Counter Strike 2', count: 2, thumb: 'https://i.ytimg.com/vi/FHcvxG6KEkI/hqdefault.jpg', updated: '2026-04-29' },
    { id: 'PLweq8_0eVzE1D2yow4mqfuDEgkzM1myzd', title: 'Uncharted 4: Una década después', count: 15, thumb: 'https://i.ytimg.com/vi/pfRVunBS1vg/hqdefault.jpg', updated: '2026-04-26' },
    { id: 'PLweq8_0eVzE2LP3pf58ynLNKIFnriCG4R', title: 'Level Devil', count: 3, thumb: 'https://i.ytimg.com/vi/-qRBgvuqGNs/hqdefault.jpg', updated: '2026-04-05' },
    { id: 'PLweq8_0eVzE0NqFJQiUXiIsJjpbSZrTNb', title: 'Minecraft: One Block', count: 3, thumb: 'https://i.ytimg.com/vi/tbOaqBltaHI/hqdefault.jpg', updated: '2026-04-04' },
    { id: 'PLweq8_0eVzE0q8eeOJ-cxEi0QlLZ2w8av', title: 'Crimson Desert', count: 13, thumb: 'https://i.ytimg.com/vi/koP1DkkQJlg/hqdefault.jpg', updated: '2026-03-28' },
    { id: 'PLweq8_0eVzE1MZt3w0sC6rJJenk237J1A', title: 'Crisol: Theater of Idols', count: 4, thumb: 'https://i.ytimg.com/vi/4eGmygsI0WY/hqdefault.jpg', updated: '2026-03-07' }
];

const seriesGrid = document.getElementById('seriesGrid');

const renderSeries = (list) => {
    /* Solo las 6 más recientes; el resto, en el botón "Ver más series" */
    seriesGrid.innerHTML = list.slice(0, 6).map(p => `
        <a class="card card--media card--playlist reveal" href="https://www.youtube.com/playlist?list=${p.id}" target="_blank" rel="noopener">
            <div class="thumb">
                <img src="${p.thumb}" alt="${esc(p.title)}" loading="lazy" width="480" height="360" />
                <span class="badge">${p.count} ${p.count === 1 ? 'vídeo' : 'vídeos'}</span>
                <span class="play">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>
                </span>
            </div>
            <div class="meta">
                <h3>${esc(p.title)}</h3>
            </div>
        </a>
    `).join('');

    observeReveal();
};

/* Datos que la llamada `playlists` no da: cuándo se añadió el último
   vídeo, cuántos son visibles y una miniatura fiable.
   Los vídeos privados llegan sin miniaturas, y así se detectan: no
   cuentan, y una lista donde todos lo son no llega a mostrarse.
   (Se leen hasta 50 vídeos por lista; de sobra para este canal.) */
const playlistMeta = async (playlistId) => {
    try {
        const data = await ytApi('playlistItems', {
            part: 'snippet',
            playlistId,
            maxResults: 50
        });

        const visibles = (data.items || []).filter(i => (
            Object.keys(i.snippet.thumbnails || {}).length > 0
        ));

        const fechas = visibles.map(i => i.snippet.publishedAt).sort();
        const thumbs = visibles[0]?.snippet.thumbnails || {};

        return {
            count: visibles.length,
            updated: fechas[fechas.length - 1] || '',
            thumb: (thumbs.high || thumbs.medium || thumbs.default)?.url || ''
        };
    } catch (err) {
        return { count: 0, updated: '', thumb: '' };
    }
};

/* ---- Listas desde YouTube ---- */
const loadSeries = async () => {
    if (!API_KEY) return;

    try {
        const list = await cached('yt:series', CACHE_TTL.series, async () => {
            const data = await ytApi('playlists', {
                part: 'snippet',
                channelId: CHANNEL_ID,
                maxResults: 50
            });

            const items = data.items || [];

            /* Los detalles de cada lista se piden en paralelo */
            const metas = await Promise.all(items.map(p => playlistMeta(p.id)));

            return items
                .map((p, i) => ({
                    id: p.id,
                    title: p.snippet.title,
                    count: metas[i].count,
                    thumb: metas[i].thumb,
                    updated: metas[i].updated
                }))
                .filter(p => p.count > 0 && p.thumb)
                .sort((a, b) => b.updated.localeCompare(a.updated));
        });

        if (list.length) renderSeries(list);
    } catch (err) {
        console.warn('No se pudieron cargar las listas:', err.message);
    }
};

if (seriesGrid) {
    renderSeries(PLAYLISTS);   // se pinta al instante con lo guardado
    loadSeries();              // y se sustituye si la API responde
}
