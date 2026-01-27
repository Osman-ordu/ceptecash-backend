import { Router } from 'express';
import { getUserProfile, deleteAccount } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// User profile endpoint'i authentication gerektirir
router.get('/', authMiddleware, getUserProfile);

// Delete account endpoint
// Kullanıcı sadece kendi hesabını silebilir (authMiddleware ile garanti edilir)
router.delete('/', authMiddleware, deleteAccount);

export default router;
