// Variables globales
let currentUserId = null;
let selectedQuizId = null;

// Initialisation principale
async function initDashboard() {
  const user = await checkAuthAndLoad();
  if (!user) return;
  
  currentUserId = user.id;
  displayUserInfo(user);
  initLogoutButton();
  initModals();
  initRouter();
}

// Charger les données du dashboard
async function loadDashboardData() {
  await Promise.all([
    loadStats(),
    loadDashboardDocuments(),
    loadDashboardQuiz(),
    loadDashboardEvents()
  ]);
}

// Stats
async function loadStats() {
  const { count: docsCount } = await supabaseClient
    .from('documents_meta')
    .select('id', { count: 'exact', head: true });
  document.getElementById('stat-docs').textContent = docsCount ?? '0';

  const { count: qCount } = await supabaseClient
    .from('quizzes')
    .select('id', { count: 'exact', head: true });
  document.getElementById('stat-quizzes').textContent = qCount ?? '0';
}

// Documents du dashboard
async function loadDashboardDocuments() {
  const { data: docs } = await supabaseClient
    .from('documents_meta')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);
  
  if (docs) await renderDocuments(document.getElementById('dashboard-docs'), docs);
}

// Tous les documents
async function loadAllDocuments() {
  const { data: docs } = await supabaseClient
    .from('documents_meta')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (docs) await renderDocuments(document.getElementById('all-docs'), docs);
}

// Quiz du dashboard
async function loadDashboardQuiz() {
  const { data: quizzes } = await supabaseClient
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);
  
  if (quizzes) renderQuiz(document.getElementById('dashboard-quiz'), quizzes, showQuizModal);
}

// Tous les quiz
async function loadAllQuiz() {
  const { data: quizzes } = await supabaseClient
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (quizzes) renderQuiz(document.getElementById('all-quiz'), quizzes, showQuizModal);
}

// Événements
async function loadDashboardEvents() {
  await renderEvents(document.getElementById('events-list'));
  
  // Ajouter les clics pour la modale
  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', function() {
      const title = this.querySelector('.event-title').textContent;
      const date = this.querySelector('.event-date').textContent;
      const locationEl = this.querySelector('.event-location');
      const location = locationEl ? locationEl.textContent.trim() : 'Non précisé';
      
      showEventModal({ title, event_date: date, location, description: '' });
    });
  });
}

// Modal Quiz
function showQuizModal(quiz) {
  selectedQuizId = quiz.id;
  
  let questionsCount = 0;
  try {
    const qs = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    questionsCount = Array.isArray(qs) ? qs.length : 0;
  } catch (e) { questionsCount = 0; }

  const estTime = Math.max(1, Math.round(questionsCount * 1));

  document.getElementById('modal-quiz-title').textContent = quiz.title || 'Quiz';
  document.getElementById('modal-quiz-description').textContent = quiz.description || 'Aucune description disponible.';
  document.getElementById('modal-quiz-questions').textContent = `${questionsCount} question${questionsCount>1?'s':''}`;
  document.getElementById('modal-quiz-time').textContent = `~${estTime} minute${estTime>1?'s':''}`;

  document.getElementById('quiz-modal').classList.add('active');
}

function closeQuizModal() {
  document.getElementById('quiz-modal').classList.remove('active');
  selectedQuizId = null;
}

// Modal Événement
function showEventModal(event) {
  let dateStr = event.event_date;
  
  // Si c'est une vraie date, la formater
  try {
    const date = new Date(event.event_date);
    if (!isNaN(date.getTime())) {
      dateStr = date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  } catch (e) {
    // Garder la date brute si erreur
  }

  document.getElementById('modal-event-title').textContent = event.title || 'Événement';
  document.getElementById('modal-event-description').textContent = event.description || 'Aucune description disponible.';
  document.getElementById('modal-event-datetime').textContent = dateStr;
  document.getElementById('modal-event-location').textContent = event.location || 'Non précisé';

  document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
  document.getElementById('event-modal').classList.remove('active');
}

// Initialiser les modales
function initModals() {
  // Quiz modal
  document.getElementById('btn-close-modal').addEventListener('click', closeQuizModal);

  document.getElementById('btn-start-quiz').addEventListener('click', async () => {
    if (!selectedQuizId) return;
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data } = await supabaseClient
      .from('live_sessions')
      .insert([{
        quiz_id: selectedQuizId,
        host_user_id: currentUserId,
        code: code,
        status: 'waiting'
      }])
      .select()
      .single();

    if (data) window.open(`host.html?session=${data.id}`, '_blank');
  });

  document.getElementById('quiz-modal').addEventListener('click', (e) => {
    if (e.target.id === 'quiz-modal') closeQuizModal();
  });

  // Event modal
  document.getElementById('btn-close-event-modal').addEventListener('click', closeEventModal);
  document.getElementById('btn-close-event').addEventListener('click', closeEventModal);

  document.getElementById('event-modal').addEventListener('click', (e) => {
    if (e.target.id === 'event-modal') closeEventModal();
  });
}

// Démarrer l'application
initDashboard();