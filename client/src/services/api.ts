import axiosInstance from './axiosInstance';

// --- Auth ---
export const loginOrRegister = async (email: string, password: string) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    return data;
};

export const deleteAccount = async () => {
    const { data } = await axiosInstance.delete('/auth/account');
    return data;
};

// --- Todos ---
export const getTodos = async () => {
    const { data } = await axiosInstance.get('/todos');
    return data;
};

export const createTodo = async (title: string, priority: string, status: string) => {
    const { data } = await axiosInstance.post('/todos', { title, priority, status });
    return data;
};

export const updateTodo = async (id: string, updates: Record<string, unknown>) => {
    const { data } = await axiosInstance.put(`/todos/${id}`, updates);
    return data;
};

export const deleteTodo = async (id: string) => {
    const { data } = await axiosInstance.delete(`/todos/${id}`);
    return data;
};