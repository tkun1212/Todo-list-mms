// ローカルストレージを安全に扱うラッパー
const Storage = {
  KEY: 'todo_items',
  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('データの読み込みに失敗しました', e);
      return [];
    }
  },
  save(todos) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('データの保存に失敗しました', e);
    }
  },
};

// DOM要素の取得
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');

// 状態管理
let todos = Storage.load();
let filter = 'all'; // 'all' | 'active' | 'completed'

// Todoリストの描画
function renderTodos() {
  todoList.innerHTML = '';
  let filteredTodos = todos;
  if (filter === 'active') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (filter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }
  filteredTodos.forEach((todo, index) => {
    const li = document.createElement('li');
    if (todo.completed) li.classList.add('completed');

    // チェックボックス
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(index));

    // テキスト or 編集用input
    if (todo.editing) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = todo.text;
      editInput.className = 'edit-input';
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEdit(index, editInput.value);
        if (e.key === 'Escape') cancelEdit(index);
      });
      editInput.addEventListener('blur', () => finishEdit(index, editInput.value));
      li.appendChild(checkbox);
      li.appendChild(editInput);
      setTimeout(() => editInput.focus(), 0);
    } else {
      const span = document.createElement('span');
      span.textContent = todo.text;
      span.className = 'todo-text';
      span.title = 'クリックで編集';
      span.addEventListener('dblclick', () => startEdit(index));
      li.appendChild(checkbox);
      li.appendChild(span);
    }

    // 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'このタスクを削除';
    deleteBtn.addEventListener('click', () => deleteTodo(index));

    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

// Todo追加
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ text, completed: false });
  todoInput.value = '';
  saveAndRender();
}

// 完了状態の切り替え
function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveAndRender();
}

// Todo削除
function deleteTodo(index) {
  todos.splice(index, 1);
  saveAndRender();
}

// 編集開始
function startEdit(index) {
  todos.forEach((t, i) => { if (i !== index) delete t.editing; });
  todos[index].editing = true;
  renderTodos();
}

// 編集確定
function finishEdit(index, newText) {
  const text = newText.trim();
  if (text) {
    todos[index].text = text;
  }
  delete todos[index].editing;
  saveAndRender();
}

// 編集キャンセル
function cancelEdit(index) {
  delete todos[index].editing;
  renderTodos();
}

// フィルター切り替え
function setFilter(newFilter) {
  filter = newFilter;
  [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(btn => btn.classList.remove('active'));
  if (filter === 'all') filterAllBtn.classList.add('active');
  if (filter === 'active') filterActiveBtn.classList.add('active');
  if (filter === 'completed') filterCompletedBtn.classList.add('active');
  renderTodos();
}

// 保存＆再描画
function saveAndRender() {
  Storage.save(todos);
  renderTodos();
}

// テーマ切り替え機能
const themeToggleBtn = document.getElementById('theme-toggle');
const THEME_KEY = 'todo_theme';

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '明';
    themeToggleBtn.title = 'ダークテーマに切替';
  } else {
    document.body.classList.remove('light-theme');
    themeToggleBtn.textContent = '暗';
    themeToggleBtn.title = 'ライトテーマに切替';
  }
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

themeToggleBtn.addEventListener('click', toggleTheme);

// 初期テーマ適用
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

// 初期描画
renderTodos();
