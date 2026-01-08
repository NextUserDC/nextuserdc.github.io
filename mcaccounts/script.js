class AccountSearcher {
    constructor() {
        this.accounts = [];
        this.currentResults = [];
        this.init();
    }

    async init() {
        await this.loadDatabase();
        this.setupEventListeners();
    }

    async loadDatabase() {
        try {
            this.showLoading(true);
            this.updateFileInfo('🔄 Cargando base de datos...');
            
            const response = await fetch('db_processed.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.accounts = await response.json();
            
            console.log(`✅ Base de datos cargada: ${this.accounts.length.toLocaleString()} cuentas`);
            this.updateFileInfo(`✅ Base de datos cargada: ${this.accounts.length.toLocaleString()} cuentas disponibles`);
            this.showLoading(false);
            
        } catch (error) {
            console.error('❌ Error cargando la base de datos:', error);
            this.updateFileInfo('❌ Error cargando la base de datos. Asegúrate de que db_processed.json esté en el mismo directorio.');
            this.showError('Error cargando la base de datos. Verifica la consola para más detalles.');
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearBtn');

        searchBtn.addEventListener('click', () => this.search());
        clearBtn.addEventListener('click', () => this.clearSearch());
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // Búsqueda en tiempo real con debounce
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (e.target.value.trim().length >= 2) {
                    this.search();
                }
            }, 300);
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

        if (this.accounts.length === 0) {
            this.showError('La base de datos no está cargada todavía. Por favor, espera.');
            return;
        }

        this.showLoading(true);
        
        // Usar setTimeout para permitir que la UI se actualice
        setTimeout(() => {
            const results = this.searchAccounts(searchTerm);
            this.displayResults(results, searchTerm);
            this.showLoading(false);
        }, 100);
    }

    searchAccounts(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return this.accounts.filter(account => 
            account.nick && account.nick.toLowerCase().includes(searchLower)
        );
    }

    displayResults(results, searchTerm) {
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsCount = document.getElementById('resultsCount');

        this.currentResults = results;
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsCount.innerHTML = `
                <div class="error account-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    No se encontraron resultados para "<strong>${this.escapeHtml(searchTerm)}</strong>"
                </div>
            `;
            return;
        }

        resultsCount.innerHTML = `
            <div class="success account-card-first">
                <i class="fas fa-check-circle"></i>
                Se encontraron <strong>${results.length.toLocaleString()}</strong> resultado(s) para "<strong>${this.escapeHtml(searchTerm)}</strong>"
            </div>
        `;

        results.forEach((account, index) => {
            const accountCard = this.createAccountCard(account, index);
            resultsContainer.appendChild(accountCard);
        });
    }

    createAccountCard(account, index) {
        const card = document.createElement('div');
        card.className = 'account-card';
        
        card.innerHTML = `
            <div class="account-field">
                <span class="field-label"><i class="fas fa-user"></i> Usuario</span>
                <span class="field-value">${this.escapeHtml(account.nick || 'N/A')}</span>
            </div>
            <div class="account-field">
                <span class="field-label"><i class="fas fa-key"></i> Contraseña</span>
                <span class="field-value">${this.escapeHtml(account.password || 'No disponible')}</span>
            </div>
            <div class="account-field">
                <span class="field-label"><i class="fas fa-globe"></i> IP</span>
                <span class="field-value">${this.escapeHtml(account.ip || 'No disponible')}</span>
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
                // Fallback para navegadores antiguos
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
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar la aplicación cuando se carga la página
let accountSearcher;
document.addEventListener('DOMContentLoaded', () => {
    accountSearcher = new AccountSearcher();
});