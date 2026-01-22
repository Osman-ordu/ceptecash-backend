import { Router } from 'express';
import { getUserProfile } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// User profile endpoint'i authentication gerektirir
router.get('/', authMiddleware, getUserProfile);

export default router;
