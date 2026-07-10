import { Router } from 'express';
import { unifiedLogin, deleteAccount } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/login', unifiedLogin);           // public
router.delete('/account', auth, deleteAccount); // protected — must be logged in

export default router;