// js/resources.js - Dynamic resource loading and management

const ResourcesManager = {
    apiUrl: 'resources.json',
    resources: [],

    async loadResources() {
        try {
            const response = await fetch(this.apiUrl + '?t=' + Date.now());
            if (!response.ok) throw new Error('Failed to load resources');
            const data = await response.json();
            this.resources = data.resources || [];
            this.renderResources();
            this.renderSubjectItems();
            this.renderAdminTable();
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    },

    renderResources() {
        const container = document.getElementById('resource-container');
        if (!container) return;
        container.innerHTML = this.resources.map(r => this.createResourceCard(r)).join('');
    },

    createResourceCard(r) {
        const type = r.type || r.category || 'pdf';
        const typeClass = type;
        const typeLabel = type.toUpperCase();

        let metaHtml = '';
        if (type === 'pdf' || type === 'doc') {
            metaHtml = `<span><i class="fas fa-book"></i> ${r.pages || 'N/A'}</span>
                        <span><i class="fas fa-file-pdf"></i> ${r.size || 'N/A'}</span>`;
        } else if (type === 'video') {
            metaHtml = `<span><i class="fas fa-clock"></i> ${r.duration || 'N/A'}</span>
                        <span><i class="fas fa-play-circle"></i> ${r.lessons || 'N/A'}</span>`;
        } else if (type === 'link') {
            metaHtml = `<span><i class="fas fa-external-link-alt"></i> ${r.external || 'Externo'}</span>
                        ${r.recommended ? `<span><i class="fas fa-star"></i> ${r.recommended}</span>` : ''}`;
        }

        return `
        <div class="resource-card" data-category="${type}" data-id="${r.id}">
            <span class="resource-type ${typeClass}">${typeLabel}</span>
            <h3>${r.title}</h3>
            <p>${r.description}</p>
            <div class="resource-meta">
                ${metaHtml}
            </div>
            <div class="resource-actions">
                <a href="${r.viewUrl}" class="resource-link" target="_blank"><i class="fas fa-eye"></i> Ver</a>
                ${r.downloadUrl ? `<a href="${r.downloadUrl}" class="resource-link" target="_blank"><i class="fas fa-download"></i> Download</a>` : ''}
            </div>
        </div>`;
    },

    renderSubjectItems() {
        const container = document.getElementById('subject-container');
        if (!container) return;

        const subjects = {
            math: ['Álgebra Lineal - Unidad 1', 'Trigonometría - Fórmulas Clave', 'Geometria Analitica'],
            prog: ['Introducción a la Programación', 'Estructuras de Datos', 'Desarrollo Web Completo'],
            networks: ['Configuración de Routers', 'Protocolos de Red'],
            db: ['Consultas SQL Avanzadas', 'MySQL - Base de Datos']
        };

        let html = '';
        Object.entries(subjects).forEach(([key, items]) => {
            items.forEach(item => {
                html += `<div class="subject-item" data-subject="${key}">
                    <a href="#" target="_blank"><i class="fas fa-book" style="color:var(--primary);"></i> ${item}</a>
                    <span class="subject-count">PDF</span>
                </div>`;
            });
        });
        container.innerHTML = html;
    },

    // Admin: Load resources into table
    renderAdminTable() {
        const tbody = document.getElementById('resources-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.resources.map(r => `
            <tr data-id="${r.id}">
                <td>${r.title}</td>
                <td>${r.type || r.category || 'N/A'}</td>
                <td>${r.subject || 'N/A'}</td>
                <td>
                    <button onclick="ResourcesManager.editResource('${r.id}')" class="btn" style="background:#2563eb;color:white;padding:4px 8px;border-radius:4px;font-size:11px;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="ResourcesManager.deleteResource('${r.id}')" class="btn" style="background:#ef4444;color:white;padding:4px 8px;border-radius:4px;font-size:11px;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    },

    editResource(id) {
        const resource = this.resources.find(r => r.id === id);
        if (!resource) return;

        document.getElementById('edit-resource-id').value = resource.id;
        document.getElementById('edit-title').value = resource.title;
        document.getElementById('edit-description').value = resource.description;
        document.getElementById('edit-type').value = resource.type || resource.category;
        document.getElementById('edit-subject').value = resource.subject || '';
        document.getElementById('edit-view-url').value = resource.viewUrl || '';
        document.getElementById('edit-download-url').value = resource.downloadUrl || '';
        document.getElementById('edit-pages').value = resource.pages || '';
        document.getElementById('edit-size').value = resource.size || '';

        document.getElementById('edit-resource-modal').classList.add('active');
    },

    saveEditedResource() {
        const id = document.getElementById('edit-resource-id').value;
        const isNew = !id;
        const resource = {
            id: isNew ? this.generateId() : id,
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            type: document.getElementById('edit-type').value,
            subject: document.getElementById('edit-subject').value,
            viewUrl: document.getElementById('edit-view-url').value,
            downloadUrl: document.getElementById('edit-download-url').value,
            pages: document.getElementById('edit-pages').value,
            size: document.getElementById('edit-size').value
        };

        if (isNew) {
            this.resources.push(resource);
        } else {
            const index = this.resources.findIndex(r => r.id === id);
            if (index !== -1) {
                this.resources[index] = resource;
            }
        }

        this.downloadUpdatedJson();
        document.getElementById('edit-resource-modal').classList.remove('active');
        this.renderAdminTable();
        this.renderResources();
    },

    deleteResource(id) {
        if (!confirm('¿Estás seguro de eliminar este recurso?')) return;
        this.resources = this.resources.filter(r => r.id !== id);
        this.downloadUpdatedJson();
        this.renderAdminTable();
        this.renderResources();
    },

    generateId() {
        return Date.now().toString();
    },

    downloadUpdatedJson() {
        const data = { resources: this.resources };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resources.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Archivo resources.json actualizado descargado. Reemplaza el archivo original con este.');
    }
};

// Agregar recurso nuevo desde el botón principal
document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('add-resource-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            // Reset form for new resource
            document.getElementById('edit-resource-form').reset();
            document.getElementById('edit-resource-id').value = '';
            document.getElementById('edit-title').value = '';
            document.getElementById('edit-description').value = '';
            document.getElementById('edit-type').value = '';
            document.getElementById('edit-subject').value = '';
            document.getElementById('edit-view-url').value = '';
            document.getElementById('edit-download-url').value = '';
            document.getElementById('edit-pages').value = '';
            document.getElementById('edit-size').value = '';
            document.getElementById('edit-resource-modal').classList.add('active');
        });
    }

    const closeModal = document.getElementById('close-edit-resource');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('edit-resource-modal').classList.remove('active');
        });
    }

    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'resources.html') {
        ResourcesManager.loadResources();

        // Setup search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const cards = document.querySelectorAll('.resource-card');
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // Setup category filters
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const category = this.dataset.category;
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                const cards = document.querySelectorAll('.resource-card');
                cards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    if (currentPage === 'admin.html') {
        setTimeout(() => {
            ResourcesManager.loadResources();
        }, 500);
    }
});

// Export for global access
window.ResourcesManager = ResourcesManager;