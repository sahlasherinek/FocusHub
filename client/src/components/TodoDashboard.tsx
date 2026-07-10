import { useState, useEffect, useMemo, type FormEvent, type KeyboardEvent } from 'react';
import { Search, Plus, Trash2, Check, Pencil, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/api';

interface Todo {
    _id: string;
    title: string;
    completed: boolean;
    priority: 'Low' | 'Medium' | 'High';
}

interface TodoDashboardProps {
    userEmail: string;
    onLogout: () => void;
}

type Filter = 'All' | 'Active' | 'Completed';

export default function TodoDashboard({ userEmail }: TodoDashboardProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [filter, setFilter] = useState<Filter>('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // --- Edit-in-place state ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        getTodos().then(setTodos).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const todo = await createTodo(newTitle.trim(), newPriority);
        setTodos((prev) => [todo, ...prev]);
        setNewTitle('');
    };

    const handleToggle = async (todo: Todo) => {
        const updated = await updateTodo(todo._id, { completed: !todo.completed });
        setTodos((prev) => prev.map((t) => (t._id === todo._id ? updated : t)));

        const willAllBeComplete =
            !todo.completed && todos.filter((t) => t._id !== todo._id).every((t) => t.completed);
        if (willAllBeComplete) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
    };

    const handleDelete = async (id: string) => {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t._id !== id));
    };

    // --- Edit handlers ---
    const startEdit = (todo: Todo) => {
        setEditingId(todo._id);
        setEditValue(todo.title);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (id: string) => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            cancelEdit();
            return;
        }
        const updated = await updateTodo(id, { title: trimmed });
        setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        cancelEdit();
    };

    const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') cancelEdit();
    };

    const filteredTodos = useMemo(() => {
        return todos
            .filter((t) => {
                if (filter === 'Active') return !t.completed;
                if (filter === 'Completed') return t.completed;
                return true;
            })
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    }, [todos, filter, search]);

    const completedCount = todos.filter((t) => t.completed).length;

    const priorityColor = {
        Low: 'var(--status-success)',
        Medium: 'var(--status-pending)',
        High: 'var(--status-urgent)',
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
            <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                    {completedCount} of {todos.length} tasks completed
                </p>
                <div style={{ height: 6, background: 'var(--input-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: todos.length ? `${(completedCount / todos.length) * 100}%` : '0%',
                            background: 'var(--accent)',
                            transition: 'width 0.3s ease',
                        }}
                    />
                </div>
            </div>

            <form onSubmit={handleAdd} className="glass-card" style={{ padding: 16, display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    className="input-field"
                    placeholder="Add a new task..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ flex: '1 1 200px' }}
                />
                <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="input-field"
                    style={{ flex: '0 0 120px' }}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> Add
                </button>
            </form>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                    <input
                        className="input-field"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                {(['All', 'Active', 'Completed'] as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={filter === f ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '8px 14px', fontSize: 13 }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
            ) : filteredTodos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 32 }}>No tasks here yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredTodos.map((todo) => (
                        <div
                            key={todo._id}
                            className="glass-card todo-item"
                            style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                            <button
                                onClick={() => handleToggle(todo)}
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    flexShrink: 0,
                                    border: `2px solid ${todo.completed ? 'var(--status-success)' : 'var(--text-secondary)'}`,
                                    background: todo.completed ? 'var(--status-success)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                {todo.completed && <Check size={14} color="var(--accent-contrast)" />}
                            </button>

                            {editingId === todo._id ? (
                                <input
                                    autoFocus
                                    className="input-field"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => handleEditKeyDown(e, todo._id)}
                                    onBlur={() => saveEdit(todo._id)}
                                    style={{ flex: 1, padding: '6px 10px' }}
                                />
                            ) : (
                                <span
                                    onDoubleClick={() => startEdit(todo)}
                                    style={{
                                        flex: 1,
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                        color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                                        cursor: 'text',
                                    }}
                                    title="Double-click to edit"
                                >
                                    {todo.title}
                                </span>
                            )}

                            <span
                                style={{
                                    fontSize: 11,
                                    padding: '3px 8px',
                                    borderRadius: 20,
                                    background: 'var(--input-bg)',
                                    color: priorityColor[todo.priority],
                                    border: `1px solid ${priorityColor[todo.priority]}`,
                                }}
                            >
                                {todo.priority}
                            </span>

                            {editingId === todo._id ? (
                                <button
                                    onClick={cancelEdit}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                    <X size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => startEdit(todo)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                    <Pencil size={15} />
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(todo._id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}