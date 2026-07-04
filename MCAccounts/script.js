class AccountSearcher {
    constructor() {
        this.index = {};
        this.loaded = false;
        this.currentResults = [];
        this.displayedCount = 0;
        this.BATCH_SIZE = 50;
        this.MAX_RESULTS = 150;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDatabase();
    }

    async loadDatabase() {
        try {
            this.showLoading(true);
            this.updateFileInfo('🔄 Cargando base de datos...');

            const response = await fetch('db_indexed.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.index = await response.json();
            this.loaded = true;

            let total = 0;
            for (const key in this.index) total += this.index[key].length;
            this.updateFileInfo(`✅ Base de datos cargada: ${total.toLocaleString()} cuentas`);
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading database:', error);
            this.updateFileInfo('❌ Error cargando la base de datos. Verifica la consola.');
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearBtn');

        searchBtn.addEventListener('click', () => this.search());
        clearBtn.addEventListener('click', () => this.clearSearch());

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.search();
        });

        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);

            const value = e.target.value.trim();
            if (value.length === 0) {
                this.clearSearch();
                return;
            }

            timeout = setTimeout(() => {
                if (value.length >= 3) {
                    this.search();
                }
            }, 400);
        });

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking && this.displayedCount < this.currentResults.length) {
                ticking = true;
                requestAnimationFrame(() => {
                    const scrollBottom = window.innerHeight + window.scrollY;
                    const docHeight = document.documentElement.scrollHeight;
                    if (scrollBottom >= docHeight - 500) {
                        this.appendNextBatch();
                    }
                    ticking = false;
                });
            }
        });
    }

    updateFileInfo(message) {
        document.getElementById('fileInfo').innerHTML = `<i class="fas fa-database"></i> ${message}`;
    }

    search() {
        const searchTerm = document.getElementById('searchInput').value.trim();

        if (!searchTerm) {
            this.showError('Por favor, ingresa un nombre de usuario para buscar');
            return;
        }

        if (!this.loaded) {
            this.showError('La base de datos no está cargada todavía. Por favor, espera.');
            return;
        }

        const results = this.searchAccounts(searchTerm);
        this.currentResults = results;
        this.displayedCount = 0;
        this.displayResults(results, searchTerm);
    }

    searchAccounts(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const results = [];
        const MAX = this.MAX_RESULTS;

        if (searchLower.length >= 3) {
            const prefix = searchLower.substring(0, 3);
            const candidates = this.index[prefix];

            if (candidates) {
                for (let i = 0; i < candidates.length && results.length < MAX; i++) {
                    const [nick, password, ip] = candidates[i];
                    if (nick.toLowerCase().includes(searchLower)) {
                        results.push({ nick, password, ip });
                    }
                }
            }
        } else {
            for (const prefix in this.index) {
                const candidates = this.index[prefix];
                for (let i = 0; i < candidates.length && results.length < MAX; i++) {
                    const [nick, password, ip] = candidates[i];
                    if (nick.toLowerCase().includes(searchLower)) {
                        results.push({ nick, password, ip });
                    }
                }
            }
        }

        return results;
    }

    displayResults(results, searchTerm) {
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsCount = document.getElementById('resultsCount');

        resultsContainer.innerHTML = '';
        resultsCount.innerHTML = '';

        if (results.length === 0) {
            resultsCount.innerHTML = `
                <div class="error account-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    No se encontraron resultados para "<strong>${this.escapeHtml(searchTerm)}</strong>"
                </div>
            `;
            return;
        }

        let countMessage = `Se encontraron <strong>${results.length.toLocaleString()}</strong> resultado(s) para "<strong>${this.escapeHtml(searchTerm)}</strong>"`;
        if (results.length >= this.MAX_RESULTS) {
            countMessage = `Mostrando los primeros <strong>${this.MAX_RESULTS}</strong> resultados para "<strong>${this.escapeHtml(searchTerm)}</strong>". Por favor, sé más específico.`;
        }

        resultsCount.innerHTML = `
            <div class="success account-card-first">
                <i class="fas fa-check-circle"></i>
                ${countMessage}
            </div>
        `;

        this.appendNextBatch();
    }

    appendNextBatch() {
        const resultsContainer = document.getElementById('resultsContainer');
        const fragment = document.createDocumentFragment();
        const end = Math.min(this.displayedCount + this.BATCH_SIZE, this.currentResults.length);

        for (let i = this.displayedCount; i < end; i++) {
            const card = this.createAccountCard(this.currentResults[i], i);
            fragment.appendChild(card);
        }

        resultsContainer.appendChild(fragment);
        this.displayedCount = end;
    }

    createAccountCard(account, index) {
        const card = document.createElement('div');
        card.className = 'account-card';

        card.innerHTML = `
            <div class="account-field">
                <span class="field-label"><i class="fas fa-user"></i> Usuario</span>
                <span class="field-value">${this.escapeHtml(account.nick)}</span>
            </div>
            <div class="account-field">
                <span class="field-label"><i class="fas fa-key"></i> Contraseña</span>
                <span class="field-value">${this.escapeHtml(account.password)}</span>
            </div>
            <div class="account-field">
                <span class="field-label"><i class="fas fa-globe"></i> IP</span>
                <span class="field-value">${this.escapeHtml(account.ip)}</span>
            </div>
            <button class="copy-btn" onclick="accountSearcher.copyToClipboard(${index})">
                <i class="fas fa-copy"></i> Copiar
            </button>
        `;

        return card;
    }

    copyToClipboard(index) {
        if (this.currentResults && this.currentResults[index]) {
            const account = this.currentResults[index];
            const text = `Usuario: ${account.nick}\nContraseña: ${account.password || 'N/A'}\nIP: ${account.ip || 'N/A'}`;

            navigator.clipboard.writeText(text).then(() => {
                this.showToast('✅ Datos copiados al portapapeles');
            }).catch(err => {
                console.error('Error copying to clipboard:', err);
                this.fallbackCopyToClipboard(text);
            });
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('✅ Datos copiados al portapapeles');
        } catch (err) {
            this.showToast('❌ Error al copiar', 'error');
        }
        document.body.removeChild(textArea);
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('resultsContainer').innerHTML = '';
        document.getElementById('resultsCount').innerHTML = '';
        this.currentResults = [];
        this.displayedCount = 0;
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

let accountSearcher;
document.addEventListener('DOMContentLoaded', () => {
    accountSearcher = new AccountSearcher();
});
