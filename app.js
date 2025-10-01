// Feather app — без сборки, всё в одном
(function() {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const isLight = savedTheme ? savedTheme === 'light' : !prefersDark;
  if (isLight) root.classList.add('light');

  function setTheme(mode) {
    if (mode === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem('theme', mode);
  }

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.classList.contains('light') ? 'dark' : 'light';
    setTheme(next);
  });

  // Accent shuffle
  const shuffle = () => {
    const c1 = `oklch(0.75 0.16 ${Math.floor(Math.random()*360)} / 1)`;
    const c2 = `oklch(0.78 0.15 ${Math.floor(Math.random()*360)} / 1)`;
    root.style.setProperty('--accent-1', c1);
    root.style.setProperty('--accent-2', c2);
  };
  document.getElementById('shuffleAccent').addEventListener('click', shuffle);

  // Back to top
  document.getElementById('backToTop').addEventListener('click', (e) => {
    e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Simple TODO widget with localStorage
  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');
  const list = document.getElementById('todoList');
  const KEY = 'feather.todos';
  let currentFilter = 'all';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  let items = load();
  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    items.push({ id: crypto.randomUUID(), title, done: false });
    input.value='';
    save(items); render();
  });

  list.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      const id = e.target.closest('li').dataset.id;
      items = items.map(it => it.id === id ? { ...it, done: e.target.checked } : it);
      save(items);
    }
  });

  list.addEventListener('dblclick', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    const id = li.dataset.id;
    items = items.filter(it => it.id !== id);
    save(items); render();
  });

  // Очистить все выполненные задачи
  document.getElementById('clearCompleted').addEventListener('click', () => {
    items = items.filter(it => !it.done);
    save(items);
    render();
  });

  // Фильтры
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  function render() {
    let filtered = items;
    if (currentFilter === 'active') {
      filtered = items.filter(it => !it.done);
    } else if (currentFilter === 'done') {
      filtered = items.filter(it => it.done);
    }

    list.innerHTML = filtered.map(it => `
      <li data-id="${it.id}">
        <input type="checkbox" ${it.done ? 'checked' : ''} aria-label="Готово">
        <span>${escapeHtml(it.title)}</span>
      </li>
    `).join('');

    const done = items.filter(it => it.done).length;
    document.getElementById('todoCounter').textContent =
      `Выполнено: ${done} из ${items.length}`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
})();
