import { Router } from 'express';
import { firebaseAuth, registerProfile, refreshToken } from './auth.controller';

const router = Router();

router.post('/firebase', firebaseAuth);
router.post('/register-profile', registerProfile);
router.post('/refreshToken', refreshToken);
router.post('/Auth/refreshToken', refreshToken); // Case sensitivity için alternatif route

export default router;
