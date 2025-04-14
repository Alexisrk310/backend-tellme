import express from 'express';

import { register, login, updatePhoto } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.post('/register', register); // Sin foto
router.post('/login', login); // Solo email y password
router.put('/profile/photo', authenticate, updatePhoto); // nueva ruta protegida

export default router;
