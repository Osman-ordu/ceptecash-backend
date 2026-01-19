import { Router } from 'express';
import { getPortfolio } from './portfolio.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Portfolio endpoint'i authentication gerektirir
router.get('/', authMiddleware, getPortfolio);

export default router;
