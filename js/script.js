const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('list');
const clearBtn = document.getElementById('clearBtn');
const filterDateInput = document.getElementById('filterDate');
const resetFilterBtn = document.getElementById('resetFilter');

const STORAGE_KEY = 'avo_todos';

function loadTodos() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
}
function saveTodos(todos) { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }

function humanDate(dt) {
    if (!dt) return 'No deadline';
    const d = new Date(dt);
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const datePart = d.toLocaleDateString(undefined, opts);
    const timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${datePart} — ${timePart}`;
}

function render() {
    const todos = loadTodos();
    listEl.innerHTML = '';

    let filteredTodos = todos;
    if (filterDateInput.value) {
        const selected = new Date(filterDateInput.value);
        filteredTodos = todos.filter(t => {
        if (!t.deadline) return false;
        const d = new Date(t.deadline);
        return d.toDateString() === selected.toDateString();
        });
    }

    if (todos.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'p-6 text-center text-[#cda989] border border-dashed border-white/10 rounded-xl';
        empty.textContent = "You’re free for now — add something to your list ✨";
        listEl.appendChild(empty);
        return;
    }

    if (filteredTodos.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'p-6 text-center text-[#cda989] border border-dashed border-white/10 rounded-xl';
        empty.textContent = "No to-dos match this filter 🔍";
        listEl.appendChild(empty);
        return;
    }

    filteredTodos.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    filteredTodos.forEach((t) => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:shadow-lg transition';

        const bullet = document.createElement('div');
        bullet.className = 'w-3 h-3 rounded-full bg-gradient-to-b from-[#4a7337] to-[#6b8c21] shadow-inner';

        const content = document.createElement('div');
        content.className = 'flex-1';
        const title = document.createElement('div');
        title.className = 'font-semibold text-[#ddd48f]';
        title.textContent = t.text;

        const meta = document.createElement('div');
        meta.className = 'text-xs text-[#cda989] mt-1';

        const now = new Date();
        let metaText = humanDate(t.deadline);
        if (t.deadline) {
        const d = new Date(t.deadline);
        if (d < now) metaText += ' • expired';
        }
        meta.textContent = metaText;

        content.appendChild(title);
        content.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-2';
        const del = document.createElement('button');
        del.className = 'px-2 py-1 text-sm rounded-lg bg-white/10 hover:bg-white/20 border border-white/10';
        del.innerHTML = '🗑️';
        del.addEventListener('click', () => {
        const todos = loadTodos();
        const newTodos = todos.filter(x => x.index !== t.index);
        saveTodos(newTodos.map((x, i) => ({ ...x, index: i })));
        render();
        });

        actions.appendChild(del);
        item.appendChild(bullet);
        item.appendChild(content);
        item.appendChild(actions);

        listEl.appendChild(item);
    });
}

function addTodo() {
    const text = taskInput.value.trim();
    const deadline = deadlineInput.value ? new Date(deadlineInput.value).toISOString() : null;
    if (!text) return taskInput.focus();

    const todos = loadTodos();
    todos.push({ text, deadline, index: todos.length, created: new Date().toISOString() });
    saveTodos(todos);
    taskInput.value = '';
    deadlineInput.value = '';
    render();
    taskInput.focus();
}

clearBtn.addEventListener('click', () => {
    const todos = loadTodos();
    const now = new Date();
    const filtered = todos.filter(t => !(t.deadline && new Date(t.deadline) < now));
    saveTodos(filtered.map((x, i) => ({ ...x, index: i })));
    render();
});

addBtn.addEventListener('click', addTodo);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });
filterDateInput.addEventListener('change', render);
resetFilterBtn.addEventListener('click', () => {
    filterDateInput.value = '';
    render();
});

render();