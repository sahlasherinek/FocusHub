import { useState, useEffect, useMemo, FormEvent, KeyboardEvent } from 'react';
import { Search, Plus, Trash2, Pencil, X, Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/api';

type TodoStatus = 'Not Started' | 'In Progress' | 'Completed';
type TodoPriority = 'Low' | 'Medium' | 'High';

interface Todo {
    _id: string;
    title: string;
    status: TodoStatus;
    priority: TodoPriority;
}

interface TodoDashboardProps {
    userEmail: string;
    onLogout: () => void;
}

type Filter = 'All' | TodoStatus;

const STATUS_OPTIONS: TodoStatus[] = ['Not Started', 'In Progress', 'Completed'];

export default function TodoDashboard({ userEmail }: TodoDashboardProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState<TodoPriority>('Medium');
    const [newStatus, setNewStatus] = useState<TodoStatus>('Not Started');
    const [filter, setFilter] = useState<Filter>('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // --- Edit-in-place state ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editStatus, setEditStatus] = useState<TodoStatus>('Not Started');

    useEffect(() => {
        getTodos().then(setTodos).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const todo = await createTodo(newTitle.trim(), newPriority, newStatus);
        setTodos((prev) => [todo, ...prev]);
        setNewTitle('');
        setNewStatus('Not Started');
    };

    const handleDelete = async (id: string) => {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t._id !== id));
    };

    // --- Edit handlers ---
    const startEdit = (todo: Todo) => {
        setEditingId(todo._id);
        setEditValue(todo.title);
        setEditStatus(todo.status);
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

        const wasNotCompleted = todos.find((t) => t._id === id)?.status !== 'Completed';

        const updated = await updateTodo(id, { title: trimmed, status: editStatus });
        setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        cancelEdit();

        if (wasNotCompleted && editStatus === 'Completed') {
            const willAllBeComplete = todos
                .filter((t) => t._id !== id)
                .every((t) => t.status === 'Completed');
            if (willAllBeComplete) {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            }
        }
    };

    const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') cancelEdit();
    };

    const filteredTodos = useMemo(() => {
        return todos
            .filter((t) => filter === 'All' || t.status === filter)
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    }, [todos, filter, search]);

    const completedCount = todos.filter((t) => t.status === 'Completed').length;

    const priorityColor: Record<TodoPriority, string> = {
        Low: 'var(--status-success)',
        Medium: 'var(--status-pending)',
        High: 'var(--status-urgent)',
    };

    const statusIcon: Record<TodoStatus, JSX.Element> = {
        'Not Started': <Circle size={18} color="var(--text-secondary)" />,
        'In Progress': <CircleDot size={18} color="var(--status-pending)" />,
        Completed: <CheckCircle2 size={18} color="var(--status-success)" />,
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

            {/* --- Add task: title, priority, AND status all chosen up front --- */}
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
                    onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
                    className="input-field"
                    style={{ flex: '0 0 110px' }}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TodoStatus)}
                    className="input-field"
                    style={{ flex: '0 0 140px' }}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
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
                {(['All', ...STATUS_OPTIONS] as Filter[]).map((f) => (
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
                            style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                        >
                            <span style={{ display: 'flex', flexShrink: 0 }} title={todo.status}>
                                {statusIcon[todo.status]}
                            </span>

                            {editingId === todo._id ? (
                                <>
                                    <input
                                        autoFocus
                                        className="input-field"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => handleEditKeyDown(e, todo._id)}
                                        style={{ flex: 1, padding: '6px 10px', minWidth: 120 }}
                                    />
                                    {/* --- Explicit status selector while editing --- */}
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value as TodoStatus)}
                                        className="input-field"
                                        style={{ flex: '0 0 140px', padding: '6px 10px' }}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <span
                                    onDoubleClick={() => startEdit(todo)}
                                    style={{
                                        flex: 1,
                                        textDecoration: todo.status === 'Completed' ? 'line-through' : 'none',
                                        color: todo.status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
                                        cursor: 'text',
                                    }}
                                    title="Double-click to edit"
                                >
                                    {todo.title}
                                </span>
                            )}

                            <span
                                style={{
                                    fontSize: 11, padding: '3px 8px', borderRadius: 20,
                                    background: 'var(--input-bg)',
                                    color: priorityColor[todo.priority],
                                    border: `1px solid ${priorityColor[todo.priority]}`,
                                }}
                            >
                                {todo.priority}
                            </span>

                            {editingId === todo._id ? (
                                <>
                                    <button
                                        onClick={() => saveEdit(todo._id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-success)' }}
                                        title="Save"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                        title="Cancel"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
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