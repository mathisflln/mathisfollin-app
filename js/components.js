// Fonctions utilitaires
function timeAgo(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return 'À l\'instant';
  const m = Math.floor(s/60);
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m/60);
  if (h < 24) return `Il y a ${h}h`;
  const days = Math.floor(h/24);
  if (days < 7) return `Il y a ${days}j`;
  return d.toLocaleDateString('fr-FR');
}

function getFileType(filename) {
  if (!filename) return '';
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'PDF';
  if (['doc','docx'].includes(ext)) return 'DOCX';
  if (['xls','xlsx','csv'].includes(ext)) return 'XLSX';
  return ext.toUpperCase();
}

function escapeHtml(unsafe) {
  if (!unsafe && unsafe !== 0) return '';
  return String(unsafe)
    .replace(/[&<>"'`=\/]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',
      "'":'&#39;','`':'&#x60;','/':'&#x2F;','=':'&#x3D;'
    })[s]);
}

// Afficher une liste de documents
async function renderDocuments(container, docs) {
  container.innerHTML = '';
  
  for (const doc of docs) {
    let filePath = doc.storage_path || doc.filepath || doc.filename || doc.file_path;
    if (!filePath) continue;

    const { data: signedData } = await supabaseClient.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);
    
    const signedUrl = signedData?.signedUrl || '';

    const card = document.createElement('div');
    card.className = 'document-card';
    card.innerHTML = `
      <div class="document-header">
        <div class="document-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="document-info">
          <div class="document-title">${escapeHtml(doc.title || doc.filename || 'Sans titre')}</div>
          <div class="document-meta">${timeAgo(doc.created_at)}</div>
        </div>
      </div>
      <div class="document-footer">
        <span class="document-type">${getFileType(filePath)}</span>
        <div class="document-actions">
          <button class="action-btn btn-download" title="Télécharger" data-filepath="${escapeHtml(filePath)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-download')) return;
      if (signedUrl) window.open(signedUrl, '_blank');
    });

    container.appendChild(card);
  }

  // Gérer les téléchargements
  container.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const filePath = btn.getAttribute('data-filepath');
      const { data } = await supabaseClient.storage
        .from('documents')
        .createSignedUrl(filePath, 60);
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    });
  });
}

// Afficher une liste de quiz
function renderQuiz(container, quizzes, onQuizClick) {
  container.innerHTML = '';
  
  quizzes.forEach(q => {
    let questionsCount = 0;
    try {
      const qs = typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions;
      questionsCount = Array.isArray(qs) ? qs.length : 0;
    } catch (e) { questionsCount = 0; }

    const estTime = Math.max(1, Math.round(questionsCount * 1));

    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="quiz-info">
          <div class="quiz-title">${escapeHtml(q.title || 'Quiz')}</div>
          <div class="quiz-meta">
            <span>${questionsCount} question${questionsCount>1?'s':''}</span>
            <span>•</span>
            <span>~${estTime} min</span>
          </div>
        </div>
      </div>
    `;
    
    if (onQuizClick) {
      card.addEventListener('click', () => onQuizClick(q));
    }
    
    container.appendChild(card);
  });
}

// Afficher les événements
async function renderEvents(container) {
  const { data: events, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Erreur Supabase:', error);
    container.innerHTML = '<div class="empty-events">Erreur de chargement</div>';
    return;
  }
  
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="empty-events">Aucun événement dans la base</div>';
    return;
  }

  const now = new Date();
  const futureEvents = events.filter(e => new Date(e.event_date) >= now);

  if (futureEvents.length === 0) {
    container.innerHTML = '<div class="empty-events">Aucun événement à venir</div>';
    return;
  }

  container.innerHTML = '';
  futureEvents.slice(0, 4).forEach(event => {
    const date = new Date(event.event_date);
    const dateStr = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-date">${dateStr}</div>
      <div class="event-title">${escapeHtml(event.title)}</div>
      ${event.location ? `<div class="event-location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${escapeHtml(event.location)}
      </div>` : ''}
    `;
    
    container.appendChild(card);
  });
}