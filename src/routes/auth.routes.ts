import express from 'express';

import { register, login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register); // Sin foto
router.post('/login', login); // Solo email y password

export default router;
