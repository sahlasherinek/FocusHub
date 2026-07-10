const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

async function request(endpoint: string, options: RequestOptions = {}) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token && !options.skipAuth) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
        // Token missing/expired/invalid — clear session and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// --- Auth ---
export const loginOrRegister = (email: string, password: string) =>
    request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });

// --- Todos ---
export const getTodos = () => request('/todos');

export const createTodo = (title: string, priority: string) =>
    request('/todos', { method: 'POST', body: JSON.stringify({ title, priority }) });

export const updateTodo = (id: string, updates: Record<string, unknown>) =>
    request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const deleteTodo = (id: string) =>
    request(`/todos/${id}`, { method: 'DELETE' });

export const deleteAccount = () => request('/auth/account', { method: 'DELETE' });