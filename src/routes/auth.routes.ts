import express from 'express';
import multer from 'multer';
import { register, login, updatePhoto } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', register); // Sin foto
router.post('/login', login); // Solo email y password
router.post('/photo', authenticate, upload.single('photo'), updatePhoto);

export default router;
