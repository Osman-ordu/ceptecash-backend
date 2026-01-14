import { Router } from 'express';
import { firebaseAuth, registerProfile } from './auth.controller';

const router = Router();

router.post('/firebase', firebaseAuth);
router.post('/register-profile', registerProfile);

export default router;
