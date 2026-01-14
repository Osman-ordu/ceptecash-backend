import { Router } from 'express';
import { buyAssetController } from './transaction.controller';

const router = Router();

router.post('/buy', buyAssetController);

export default router;
