// Vérifier si l'utilisateur est connecté et rediriger si besoin
async function checkAuthAndLoad() {
  try {
    const { data } = await supabaseClient.auth.getUser();
    
    if (!data.user) {
      window.location.href = "/login.html";
      return null;
    }
    
    // Masquer le loader et afficher le contenu
    document.body.classList.remove('auth-checking');
    const loader = document.getElementById('auth-loader');
    if (loader) loader.classList.add('hide');

    return data.user;
  } catch (err) {
    console.error('Auth error', err);
    window.location.href = "/login.html";
    return null;
  }
}

// Récupérer les infos de l'utilisateur pour l'affichage
function getUserDisplayInfo(user) {
  const email = user.email || '';
  const name = email.split('@')[0] || 'Membre';
  const initials = name.charAt(0).toUpperCase();
  
  return { name, initials, email };
}

// Afficher les infos utilisateur dans la sidebar
function displayUserInfo(user) {
  const { name, initials } = getUserDisplayInfo(user);
  
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');
  const welcomeName = document.getElementById('welcome-name');
  
  if (userName) userName.textContent = name;
  if (userAvatar) userAvatar.textContent = initials;
  if (welcomeName) welcomeName.textContent = name;
}

// Déconnexion
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "/login.html";
}

// Initialiser le bouton de déconnexion
function initLogoutButton() {
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}