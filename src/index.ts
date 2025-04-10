import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);

// Conexión a MongoDB
mongoose.set('strictQuery', true);
mongoose
	.connect(process.env.MONGO_URI!)
	.then(() => {
		console.log('MongoDB conectado');
		app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
	})
	.catch((err) => {
		console.error('Error al conectar con MongoDB:', err);
	});
