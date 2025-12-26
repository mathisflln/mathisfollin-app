// Gestion du routing côté client
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  init() {
    // Gérer les clics sur les liens de navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigateTo(route);
      }
    });

    // Gérer le bouton retour du navigateur
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Charger la route initiale
    this.handleRoute(window.location.pathname);
  }

  navigateTo(path) {
    // Changer l'URL sans recharger la page
    history.pushState(null, '', path);
    this.handleRoute(path);
  }

  handleRoute(path) {
    // Normaliser le path
    if (path === '/') path = '/dashboard';
    
    // Trouver la route correspondante
    const route = this.routes[path] || this.routes['/dashboard'];
    
    // Cacher toutes les vues
    document.querySelectorAll('.view-section').forEach(v => 
      v.classList.remove('active')
    );
    
    // Retirer active de tous les nav items
    document.querySelectorAll('.nav-item').forEach(item => 
      item.classList.remove('active')
    );
    
    // Afficher la vue correspondante
    const viewElement = document.getElementById(route.view);
    if (viewElement) {
      viewElement.classList.add('active');
    }
    
    // Activer le bon nav item
    const activeNav = document.querySelector(`[data-route="${path}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Exécuter la fonction de chargement de la vue
    if (route.onLoad && typeof route.onLoad === 'function') {
      route.onLoad();
    }
    
    // Mettre à jour le titre de la page
    document.title = route.title || 'FAH Marie-Curie';
  }
}

// Configuration des routes
const routes = {
  '/dashboard': {
    view: 'view-dashboard',
    title: 'Tableau de bord - FAH Marie-Curie',
    onLoad: () => {
      if (window.loadDashboardData) window.loadDashboardData();
    }
  },
  '/quiz': {
    view: 'view-quiz',
    title: 'Quiz - FAH Marie-Curie',
    onLoad: () => {
      if (window.loadAllQuiz) window.loadAllQuiz();
    }
  },
  '/documents': {
    view: 'view-documents',
    title: 'Documents - FAH Marie-Curie',
    onLoad: () => {
      if (window.loadAllDocuments) window.loadAllDocuments();
    }
  }
};

// Initialiser le router
let router;
function initRouter() {
  router = new Router(routes);
}