// Activer le bon élément de navigation selon la page actuelle
function initNavigation(currentPage) {
  // Retirer la classe active de tous les items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Activer l'item correspondant à la page actuelle
  const activeItem = document.querySelector(`[data-page="${currentPage}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// Créer le HTML de la sidebar (pour éviter de le dupliquer dans chaque page)
function createSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="https://mathisfollin.fr" class="sidebar-logo">
          <img src="https://mathisfollin.fr/assets/logos/fah.png" alt="FAH Marie-Curie" />
        </a>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">Navigation</div>
          <a href="/index.html" class="nav-item" data-page="dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Tableau de bord</span>
          </a>
          <a href="/documents.html" class="nav-item" data-page="documents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Documents</span>
          </a>
          <a href="/quiz.html" class="nav-item" data-page="quiz">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Quiz</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar" id="user-avatar">M</div>
          <div class="user-details">
            <div class="user-name" id="user-name">Membre</div>
            <div class="user-role">Membre actif</div>
          </div>
        </div>
        <button class="btn-logout" id="logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Se déconnecter
        </button>
      </div>
    </aside>
  `;
}