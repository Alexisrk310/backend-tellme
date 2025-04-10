// src/config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI!, {
			dbName: 'tellme',
		});
		console.log('🟢 Conexión a MongoDB exitosa');
	} catch (error) {
		console.error('🔴 Error al conectar con MongoDB:', error);
		process.exit(1);
	}
};

export default connectDB;
