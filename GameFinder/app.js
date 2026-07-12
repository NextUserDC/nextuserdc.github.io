document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const otherSitesContainer = document.getElementById('other-sites-container');
    const otherEmptyState = document.getElementById('other-empty-state');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const officialStoresContainer = document.getElementById('official-stores-container');

    // ==========================================
    // CONFIGURACIÓN DE RUTAS DE LA API
    // ==========================================
    const API_BASE = 'https://www.cheapshark.com/api/1.0';
    const DEALS_API = `${API_BASE}/deals`;
    const STORES_API = `${API_BASE}/stores`;
    const REDIRECT_BASE = 'https://www.cheapshark.com/redirect?dealID=';

    // ==========================================
    // SITIOS NO OFICIALES
    // ==========================================
    const OTHER_SITES = [
        { name: 'Eneba', baseUrl: 'https://www.eneba.com/store?text=', color: '#17c964', icon: 'En' },
        { name: 'G2A', baseUrl: 'https://www.g2a.com/search?query=', color: '#ff5722', icon: 'G2' },
        { name: 'EldoradoGG', baseUrl: 'https://www.eldorado.gg/search?q=', color: '#6c5ce7', icon: 'EG' },
        { name: 'Instant Gaming', baseUrl: 'https://www.instant-gaming.com/en/search/?query=', color: '#d63aff', icon: 'IG' },
        { name: 'SteamRIP', baseUrl: 'https://steamrip.com/?s=', color: '#e74c3c', icon: 'SR' },
        { name: 'ElAmigos', baseUrl: 'https://elamigos.site/?s=', color: '#3498db', icon: 'EA' },
        { name: 'PiviGames', baseUrl: 'https://pivigames.blog/?s=', color: '#2ecc71', icon: 'PG' },
        { name: 'ElEnemigos', baseUrl: 'https://elenemigos.com/?g_name=', color: '#9b59b6', icon: 'EL', extraParams: '&order=last_update' },
        { name: 'BlizzboyGames', baseUrl: 'https://www.blizzboygames.net/?s=', color: '#f39c12', icon: 'BB' },
        { name: 'JuegosDePCFull', baseUrl: 'https://juegosdepcfull.com/?s=', color: '#c0392b', icon: 'JF' }
    ];

    // ==========================================
    // TIENDAS OFICIALES
    // ==========================================
    const OFFICIAL_STORES = [
        { name: 'Steam', baseUrl: 'https://store.steampowered.com/search/?term=', color: '#1b2838', icon: 'S' },
        { name: 'Epic Games', baseUrl: 'https://store.epicgames.com/en-US/browse?q=', color: '#2f2f2f', icon: 'E' },
        { name: 'Ubisoft', baseUrl: 'https://store.ubi.com/search?query=', color: '#0066cc', icon: 'U' },
        { name: 'GOG', baseUrl: 'https://www.gog.com/games?text=', color: '#a929b5', icon: 'G' }
    ];

    // ==========================================
    // DICCIONARIO DE ABREVIACIONES
    // ==========================================
    const GAME_ALIASES = {
        'gta': 'Grand Theft Auto',
        'gta v': 'Grand Theft Auto V',
        'gta 5': 'Grand Theft Auto V',
        'gta iv': 'Grand Theft Auto IV',
        'gta 4': 'Grand Theft Auto IV',
        'gta sa': 'Grand Theft Auto San Andreas',
        'cod': 'Call of Duty',
        'cod mw': 'Call of Duty Modern Warfare',
        'cod bo': 'Call of Duty Black Ops',
        'cod warzone': 'Call of Duty Warzone',
        'cod ghosts': 'Call of Duty Ghosts',
        'tlou': 'The Last of Us',
        'tlou2': 'The Last of Us Part II',
        'tlou 2': 'The Last of Us Part II',
        'rdr': 'Red Dead Redemption',
        'rdr2': 'Red Dead Redemption 2',
        'rdr 2': 'Red Dead Redemption 2',
        'ac': "Assassin's Creed",
        'ac odyssey': "Assassin's Creed Odyssey",
        'ac valhalla': "Assassin's Creed Valhalla",
        'ac unity': "Assassin's Creed Unity",
        'ac origins': "Assassin's Creed Origins",
        'ac mirage': "Assassin's Creed Mirage",
        'ac shadows': "Assassin's Creed Shadows",
        'fc': 'Far Cry',
        'fc3': 'Far Cry 3',
        'fc4': 'Far Cry 4',
        'fc5': 'Far Cry 5',
        'fc6': 'Far Cry 6',
        'nfs': 'Need for Speed',
        'nfs mw': 'Need for Speed Most Wanted',
        'nfs hp': 'Need for Speed Hot Pursuit',
        'nfs uc': 'Need for Speed Underground',
        'nfs un': 'Need for Speed Unbound',
        'mk': 'Mortal Kombat',
        'mk1': 'Mortal Kombat 1',
        'mk11': 'Mortal Kombat 11',
        'gow': 'God of War',
        'gow ragnarok': 'God of War Ragnarok',
        'gow asc': 'God of War Ascension',
        'ff': 'Final Fantasy',
        'ff7': 'Final Fantasy VII',
        'ff7r': 'Final Fantasy VII Remake',
        'ff7 rebirth': 'Final Fantasy VII Rebirth',
        'ff14': 'Final Fantasy XIV',
        'ff15': 'Final Fantasy XV',
        'ff16': 'Final Fantasy XVI',
        'tes': 'The Elder Scrolls',
        'tes v skyrim': 'The Elder Scrolls V Skyrim',
        'tes online': 'The Elder Scrolls Online',
        'eso': 'The Elder Scrolls Online',
        'botw': 'The Legend of Zelda Breath of the Wild',
        'totk': 'The Legend of Zelda Tears of the Kingdom',
        'loz': 'The Legend of Zelda',
        'mhw': 'Monster Hunter World',
        'mhr': 'Monster Hunter Rise',
        'mh wilds': 'Monster Hunter Wilds',
        'p5': 'Persona 5',
        'p5r': 'Persona 5 Royal',
        'p5s': 'Persona 5 Strikers',
        'p4': 'Persona 4',
        'p4g': 'Persona 4 Golden',
        'p3': 'Persona 3',
        'p3r': 'Persona 3 Reload',
        'cs': 'Counter-Strike',
        'cs2': 'Counter-Strike 2',
        'csgo': 'Counter-Strike Global Offensive',
        'lol': 'League of Legends',
        'wow': 'World of Warcraft',
        'wow tww': 'World of Warcraft The War Within',
        'd2': 'Destiny 2',
        'bg3': "Baldur's Gate 3",
        'hzd': 'Horizon Zero Dawn',
        'hfw': 'Horizon Forbidden West',
        'fh5': 'Forza Horizon 5',
        'fm': 'Forza Motorsport',
        're': 'Resident Evil',
        're2': 'Resident Evil 2',
        're3': 'Resident Evil 3',
        're4': 'Resident Evil 4',
        're7': 'Resident Evil 7',
        're8': 'Resident Evil Village',
        're8 village': 'Resident Evil Village',
        'sf': 'Street Fighter',
        'sf6': 'Street Fighter 6',
        'sh': 'Silent Hill',
        'sh2': 'Silent Hill 2',
        'sh2r': 'Silent Hill 2 Remake',
        'sm': 'Super Mario',
        'sm odyssey': 'Super Mario Odyssey',
        'sm wonder': 'Super Mario Bros Wonder',
        'smw': 'Super Mario World',
        'smt': 'Shin Megami Tensei',
        'smt5': 'Shin Megami Tensei V',
        'tw3': 'The Witcher 3 Wild Hunt',
        'witcher 3': 'The Witcher 3 Wild Hunt',
        'uc': 'Uncharted',
        'uc4': 'Uncharted 4',
        'uc lt': 'Uncharted The Lost Legacy',
        'me': 'Mass Effect',
        'me2': 'Mass Effect 2',
        'me3': 'Mass Effect 3',
        'me andromeda': 'Mass Effect Andromeda',
        'da': 'Dragon Age',
        'dai': 'Dragon Age Inquisition',
        'dav': 'Dragon Age Veilguard',
        'sc': 'StarCraft',
        'sc2': 'StarCraft II',
        'l4d': 'Left 4 Dead',
        'l4d2': 'Left 4 Dead 2',
        'lis': 'Life is Strange',
        'lis2': 'Life is Strange 2',
        'lis tc': 'Life is Strange True Colors',
        'bf': 'Battlefield',
        'bf1': 'Battlefield 1',
        'bf4': 'Battlefield 4',
        'bfv': 'Battlefield V',
        'bf2042': 'Battlefield 2042',
        'kcd': 'Kingdom Come Deliverance',
        'kcd2': 'Kingdom Come Deliverance 2',
        'kh': 'Kingdom Hearts',
        'nms': 'No Man\'s Sky',
        'gt7': 'Gran Turismo 7',
        'poe': 'Path of Exile',
        'poe2': 'Path of Exile 2',
        'sot': 'Sea of Thieves',
        'wwe': 'WWE 2K',
        'wwe 2k': 'WWE 2K',
        'doom': 'DOOM',
        'doom et': 'DOOM Eternal',
        'dishonored': 'Dishonored',
        'dish2': 'Dishonored 2',
        'cyberpunk': 'Cyberpunk 2077',
        'cp2077': 'Cyberpunk 2077',
        'elden ring': 'Elden Ring',
        'er': 'Elden Ring',
        'ds': 'Dark Souls',
        'ds1': 'Dark Souls',
        'ds2': 'Dark Souls II',
        'ds3': 'Dark Souls III',
        'demons souls': 'Demon\'s Souls',
        'sekiro': 'Sekiro Shadows Die Twice',
        'starfield': 'Starfield',
        'sf starfield': 'Starfield',
        'hogwarts lg': 'Hogwarts Legacy',
        'hp': 'Hogwarts Legacy',
        'diablo': 'Diablo',
        'd3': 'Diablo III',
        'd4': 'Diablo IV',
        'star wars jedi fallen order': 'Star Wars Jedi Fallen Order',
        'swjfo': 'Star Wars Jedi Fallen Order',
        'swjs': 'Star Wars Jedi Survivor',
        'bg': "Baldur's Gate",
        'aoe': 'Age of Empires',
        'aoe2': 'Age of Empires II',
        'aoe4': 'Age of Empires IV',
        'nw': 'New World',
        'titanfall': 'Titanfall',
        'tf2': 'Team Fortress 2',
        'apex': 'Apex Legends',
        'ow': 'Overwatch',
        'ow2': 'Overwatch 2',
        'pubg': 'PUBG Battlegrounds',
        'fortnite': 'Fortnite',
        'valorant': 'Valorant',
        'rainbow six': 'Rainbow Six Siege',
        'r6': 'Rainbow Six Siege',
        'r6s': 'Rainbow Six Siege',
        'splatoon': 'Splatoon',
        'splatoon3': 'Splatoon 3',
        'metroid': 'Metroid',
        'metroid d': 'Metroid Dread',
        'kirby': 'Kirby',
        'kirby dl': 'Kirby and the Forgotten Land',
        'pokemon': 'Pokemon',
        'pokemon sv': 'Pokemon Scarlet Violet',
        'palworld': 'Palworld'
    };

    // ==========================================
    // EXPANDIR ABREVIACIONES
    // ==========================================
    function expandQuery(query) {
        const lower = query.toLowerCase().trim();
        return GAME_ALIASES[lower] || query;
    }

    let storesCache = {};
    let lastQuery = '';
    let activeTab = 'deals';
    let searchTimeout = null;

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // LÓGICA DE PESTAÑAS
    // ==========================================
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === activeTab) return;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');

            activeTab = tab;
        });
    });

    // ==========================================
    // OBTENER INFORMACIÓN DE LAS TIENDAS
    // ==========================================
    async function fetchStores() {
        try {
            const response = await fetch(STORES_API);
            if (!response.ok) throw new Error('Error al cargar tiendas');
            const stores = await response.json();

            stores.forEach(store => {
                storesCache[store.storeID] = {
                    name: store.storeName,
                    logo: `https://www.cheapshark.com${store.images.logo}`
                };
            });
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    }

    fetchStores();

    // ==========================================
    // BÚSQUEDA PRINCIPAL
    // ==========================================
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (searchTimeout) return;
        searchTimeout = setTimeout(() => { searchTimeout = null; }, 1000);

        const rawQuery = searchInput.value.trim();
        if (!rawQuery) return;

        const query = expandQuery(rawQuery);
        lastQuery = query;

        resultsContainer.innerHTML = '';
        otherSitesContainer.innerHTML = '';
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        otherEmptyState.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        otherSitesContainer.classList.add('hidden');

        // Renderizar otros sitios inmediatamente (no dependen de API)
        renderOtherSites(query);
        renderOfficialStores(query);

        // Si la pestaña activa es "Otros Sitios", ocultar loading
        if (activeTab === 'other') {
            loadingState.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`${DEALS_API}?title=${encodeURIComponent(query)}&exact=0`);

            if (!response.ok) {
                throw new Error('Error en la respuesta de la red');
            }

            const deals = await response.json();

            loadingState.classList.add('hidden');

            if (deals && deals.length > 0) {
                renderResults(deals);
                resultsContainer.classList.remove('hidden');
            } else {
                renderEmptyState(query);
            }
        } catch (error) {
            console.error('Search error:', error);
            loadingState.classList.add('hidden');
            renderEmptyState(query, true);
        }
    });

    // ==========================================
    // RENDERIZADO DE TIENDAS OFICIALES
    // ==========================================
    function renderOfficialStores(query) {
        officialStoresContainer.innerHTML = '';

        OFFICIAL_STORES.forEach((store, index) => {
            const searchUrl = `${store.baseUrl}${encodeURIComponent(query)}`;

            const card = document.createElement('a');
            card.className = 'official-store-card';
            card.href = searchUrl;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.style.animationDelay = `${index * 0.07}s`;

            card.innerHTML = `
                <div class="official-store-icon" style="background: ${store.color};">${store.icon}</div>
                <span class="official-store-name">${store.name}</span>
            `;

            officialStoresContainer.appendChild(card);
        });
    }

    // ==========================================
    // RENDERIZADO DE OFERTAS (CheapShark)
    // ==========================================
    function renderResults(deals) {
        const validDeals = deals.slice(0, 12);

        validDeals.forEach((deal, index) => {
            const storeInfo = storesCache[deal.storeID] || { name: 'Tienda Desconocida', logo: '' };
            const savingsPercent = parseFloat(deal.savings).toFixed(0);

            const card = document.createElement('article');
            card.className = 'game-card';
            card.style.animationDelay = `${index * 0.05}s`;

            const hasSavings = savingsPercent > 0;
            const savingsHTML = hasSavings ? `<span class="savings">-${escapeHtml(String(savingsPercent))}%</span>` : '';

            const imgSrc = escapeHtml(deal.thumb || 'https://via.placeholder.com/400x150/161623/f8fafc?text=No+Image');

            card.innerHTML = `
                <img src="${imgSrc}" alt="${escapeHtml(deal.title)}" class="card-image" loading="lazy">
                <div class="card-content">
                    <h3 class="game-title" title="${escapeHtml(deal.title)}">${escapeHtml(deal.title)}</h3>
                    <div class="store-info">
                        ${storeInfo.logo ? `<img src="${escapeHtml(storeInfo.logo)}" alt="${escapeHtml(storeInfo.name)}" class="store-logo">` : ''}
                        <span>${escapeHtml(storeInfo.name)}</span>
                    </div>
                    <div class="price-container">
                        <span class="sale-price">$${escapeHtml(String(deal.salePrice))}</span>
                        <span class="normal-price">$${escapeHtml(String(deal.normalPrice))}</span>
                        ${savingsHTML}
                    </div>
                    <a href="${REDIRECT_BASE}${escapeHtml(deal.dealID)}" target="_blank" rel="noopener noreferrer" class="get-deal-btn">
                        Ver Oferta
                    </a>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // ==========================================
    // RENDERIZADO DE ESTADO VACÍO + GOOGLE
    // ==========================================
    function renderEmptyState(query, isError = false) {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const message = isError
            ? '<p>Ocurrió un error al buscar. Intenta nuevamente más tarde.</p>'
            : '<p>No se encontraron resultados en tiendas oficiales.</p>';

        emptyState.innerHTML = `
            ${message}
            <a href="${googleUrl}" target="_blank" rel="noopener noreferrer" class="google-search-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Buscar "${query}" en Google
            </a>
        `;
        emptyState.classList.remove('hidden');
    }

    // ==========================================
    // RENDERIZADO DE OTROS SITIOS
    // ==========================================
    function renderOtherSites(query) {
        otherSitesContainer.innerHTML = '';

        OTHER_SITES.forEach((site, index) => {
            const searchUrl = `${site.baseUrl}${encodeURIComponent(query)}${site.extraParams || ''}`;

            const card = document.createElement('article');
            card.className = 'site-card';
            card.style.animationDelay = `${index * 0.07}s`;

            card.innerHTML = `
                <div class="site-icon" style="background: ${site.color};">${site.icon}</div>
                <span class="site-name">${site.name}</span>
                <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="site-search-btn">
                    Buscar en ${site.name}
                </a>
            `;

            otherSitesContainer.appendChild(card);
        });

        otherSitesContainer.classList.remove('hidden');
    }
});
