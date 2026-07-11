import { Router } from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// auth middleware is already applied at the app.use('/api/todos', auth, todoRoutes) level in index.ts
router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

// Example admin-only route — only reachable if req.user.role === 'admin'
// router.get('/admin/all', requireRole('admin'), getAllUsersTodos);

export default router;