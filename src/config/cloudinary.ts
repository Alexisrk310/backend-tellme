// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
const configCloudinary = (): void => {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
		api_key: process.env.CLOUDINARY_API_KEY!,
		api_secret: process.env.CLOUDINARY_API_SECRET!,
		secure: true,
	});
};

// Exportar la configuración
export { cloudinary, configCloudinary };
