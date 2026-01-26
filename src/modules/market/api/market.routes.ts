import { Router } from 'express';
import { getMarketStatus } from './market.controller';

const router = Router();

// Market status endpoint (no auth required for debugging)
router.get('/status', getMarketStatus);

export default router;
