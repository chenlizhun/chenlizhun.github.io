document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('category-list');
    const effectsGrid = document.getElementById('effects-grid');
    const searchInput = document.getElementById('search-input');
    const emptyState = document.getElementById('empty-state');
    const modal = document.getElementById('preview-modal');
    const modalTitle = document.getElementById('modal-title');
    const previewFrame = document.getElementById('preview-frame');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnViewSource = document.getElementById('btn-view-source');

    let currentCategory = 'all';
    let searchQuery = '';

    // Initialize
    renderCategories();
    renderEffects();

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderEffects();
    });

    btnCloseModal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Functions
    function renderCategories() {
        categoryList.innerHTML = CATEGORIES.map(cat => `
            <li>
                <button class="category-btn ${cat.id === currentCategory ? 'active' : ''}" 
                        data-id="${cat.id}">
                    ${cat.name}
                </button>
            </li>
        `).join('');

        // Bind events
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCategory = btn.dataset.id;
                // Update UI
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderEffects();
            });
        });
    }

    function renderEffects() {
        const filtered = EFFECTS.filter(effect => {
            const matchCategory = currentCategory === 'all' || effect.category === currentCategory;
            const matchSearch = effect.title.toLowerCase().includes(searchQuery) || 
                                effect.description.toLowerCase().includes(searchQuery) ||
                                effect.tags.some(t => t.toLowerCase().includes(searchQuery));
            return matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            effectsGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            effectsGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            effectsGrid.innerHTML = filtered.map(effect => `
                <div class="effect-card" onclick="openDemo('${effect.id}')">
                    <div class="card-preview">
                        <iframe src="${effect.path}" loading="lazy" scrolling="no"></iframe>
                    </div>
                    <div class="card-info">
                        <div class="card-header">
                            <h3 class="card-title">${effect.title}</h3>
                            <span class="card-badge">${getCategoryName(effect.category)}</span>
                        </div>
                        <p class="card-desc">${effect.description}</p>
                        <div class="card-actions">
                            <button class="btn-demo">查看详情</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function getCategoryName(id) {
        const cat = CATEGORIES.find(c => c.id === id);
        return cat ? cat.name : id;
    }

    // Global function for onclick
    window.openDemo = function(id) {
        const effect = EFFECTS.find(e => e.id === id);
        if (!effect) return;

        modalTitle.textContent = effect.title;
        previewFrame.src = effect.path;
        btnViewSource.href = `view-source:${window.location.origin}/project/demo/${effect.path}`; // Rough idea
        // Better: just open the file directly in new tab or use a real code viewer
        // For now, let's point to the file itself so they can View Source
        btnViewSource.href = effect.path;
        
        modal.classList.add('active');
    };

    function closeModal() {
        modal.classList.remove('active');
        previewFrame.src = ''; // Stop video/animation
    }
});
