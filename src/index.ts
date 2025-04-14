import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import { cloudinary, configCloudinary } from './config/cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

configCloudinary(); // 👉 Inicializar Cloudinary

app.use(cors());
app.use(express.json());
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

// verificar si la conexión es exitosa de cloudinary
cloudinary.api
	.ping()
	.then(() => {
		console.log('Cloudinary conectado');
	})
	.catch((err) => {
		console.error('Error al conectar con Cloudinary:', err);
	});
