document.addEventListener('DOMContentLoaded', () => {
  const loginFormContainer = document.getElementById('login-form-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  
  const usernameInput = document.getElementById('username');
  const errorMessage = document.getElementById('error-message');
  
  const loginAdminBtn = document.getElementById('login-admin-btn');
  const loginViewerBtn = document.getElementById('login-viewer-btn');
  
  const userDisplay = document.getElementById('user-display');
  const roleDisplay = document.getElementById('role-display');
  
  const postInput = document.getElementById('post-input');
  const addPostBtn = document.getElementById('add-post-btn');
  const postsList = document.getElementById('posts-list');
  const logoutBtn = document.getElementById('logout-btn');

  let currentRole = null;
  let currentUserId = null;

  // Load saved posts or fallback to initial sample post
  const defaultPosts = [
    { id: 1, content: 'Welcome to the role-based platform sample post!', author: 'System' }
  ];
  let posts = JSON.parse(localStorage.getItem('portal_posts')) || defaultPosts;

  function savePosts() {
    localStorage.setItem('portal_posts', JSON.stringify(posts));
  }

  function saveSession(userId, role) {
    localStorage.setItem('portal_session', JSON.stringify({ userId, role }));
  }

  function clearSession() {
    localStorage.removeItem('portal_session');
  }

  function loadSession() {
    const sessionData = localStorage.getItem('portal_session');
    if (sessionData) {
      try {
        const { userId, role } = JSON.parse(sessionData);
        if (userId && role) {
          showDashboard(userId, role);
        }
      } catch (e) {
        clearSession();
      }
    }
  }

  function renderPosts() {
    postsList.innerHTML = '';

    if (posts.length === 0) {
      postsList.innerHTML = '<div class="empty-feed">No content available. Add a new post above!</div>';
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement('div');
      item.className = 'post-item';

      const contentBox = document.createElement('div');
      contentBox.className = 'post-body';

      const p = document.createElement('p');
      p.className = 'post-content';
      p.textContent = post.content;

      const meta = document.createElement('span');
      meta.className = 'post-meta';
      meta.textContent = `Posted by ${post.author}`;

      contentBox.appendChild(p);
      contentBox.appendChild(meta);
      item.appendChild(contentBox);

      // Admin can Delete, Viewer cannot delete
      if (currentRole === 'Admin') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          deletePost(post.id);
        });
        item.appendChild(deleteBtn);
      }

      postsList.appendChild(item);
    });
  }

  function showDashboard(userId, role) {
    currentUserId = userId;
    currentRole = role;

    userDisplay.textContent = userId;
    roleDisplay.textContent = role;

    renderPosts();

    loginFormContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
  }

  function handleLogin(role) {
    const userId = usernameInput.value.trim();
    if (!userId) {
      errorMessage.textContent = 'Please enter a User ID / Username.';
      usernameInput.focus();
      return;
    }

    errorMessage.textContent = '';
    saveSession(userId, role);
    showDashboard(userId, role);
  }

  function handleAddPost() {
    const text = postInput.value.trim();
    if (!text) return;

    const newPost = {
      id: Date.now(),
      content: text,
      author: currentUserId || 'User'
    };

    posts.unshift(newPost);
    savePosts();
    postInput.value = '';
    renderPosts();
  }

  function deletePost(id) {
    if (currentRole !== 'Admin') return;
    posts = posts.filter(post => post.id !== id);
    savePosts();
    renderPosts();
  }

  function handleLogout() {
    clearSession();
    usernameInput.value = '';
    errorMessage.textContent = '';
    postInput.value = '';
    currentRole = null;
    currentUserId = null;

    dashboardContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
    usernameInput.focus();
  }

  loginAdminBtn.addEventListener('click', () => handleLogin('Admin'));
  loginViewerBtn.addEventListener('click', () => handleLogin('Viewer'));
  addPostBtn.addEventListener('click', handleAddPost);
  logoutBtn.addEventListener('click', handleLogout);

  postInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddPost();
  });

  // Automatically restore active session if user was logged in
  loadSession();
});
