import { NextFunction, Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import cloudinary from '../utils/cloudinary';
import { OAuth2Client } from 'google-auth-library';

interface RegisterRequest extends Request {
	body: {
		name: string;
		email: string;
		password: string;
		image?: string;
	};
}

export interface AuthRequest extends Request {
	userId?: string;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!); // Asegúrate de tener el CLIENT_ID correcto

export const register = async (
	req: RegisterRequest,
	res: Response
): Promise<void> => {
	try {
		const { name, email, password, image } = req.body;

		if (!name || !email || !password) {
			res
				.status(400)
				.json({ message: 'Nombre, correo y contraseña son obligatorios' });
			return;
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({ message: 'El usuario ya existe' });
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Si hay una imagen, la subimos a Cloudinary
		let photoUrl = '';
		if (image) {
			const uploadResult = await cloudinary.uploader.upload(image, {
				folder: 'profile_pics',
			});
			photoUrl = uploadResult.secure_url;
		}

		// Creamos el nuevo usuario
		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
			photo: photoUrl, // Guardamos la URL de la imagen en el campo photo
		});

		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
			expiresIn: '1d',
		});

		res.status(201).json({
			id: newUser._id,
			email: newUser.email,
			name: newUser.name,
			photo: newUser.photo || '', // Devolvemos la URL de la imagen si existe
			token,
		});
	} catch (error) {
		console.error('Error en register:', error);
		res.status(500).json({ message: 'Error en el servidor' });
	}
};
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
			return;
		}

		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({ message: 'Usuario no encontrado' });
			return;
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(401).json({ message: 'Contraseña incorrecta' });
			return;
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
			expiresIn: '1d',
		});

		res.status(200).json({
			id: user._id,
			name: user.name,
			email: user.email,
			photo: user.photo || '', // Devolvemos la URL de la foto si existe
			token,
		});
	} catch (error) {
		console.error('Error en login:', error);
		res.status(500).json({ message: 'Error en el servidor' });
	}
};
export const updatePhoto: RequestHandler = async (
	req: AuthRequest,
	res,
	next
) => {
	try {
		const userId = req.userId;
		const { image } = req.body;

		if (!userId) {
			res.status(401).json({ message: 'No autorizado' });
			return;
		}

		if (!image) {
			res.status(400).json({ message: 'No se proporcionó la imagen' });
			return;
		}

		const uploadResult = await cloudinary.uploader.upload(image, {
			folder: 'profile_pics',
		});

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ photo: uploadResult.secure_url },
			{ new: true }
		);

		if (!updatedUser) {
			res.status(404).json({ message: 'Usuario no encontrado' });
			return;
		}

		res.status(200).json({
			message: 'Foto de perfil actualizada',
			photo: updatedUser.photo,
		});
	} catch (error) {
		next(error);
	}
};

export const googleLogin = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { tokenId } = req.body;

		// Verifica el tokenId con Google
		const ticket = await client.verifyIdToken({
			idToken: tokenId,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const userId = payload?.sub; // Usamos el sub que es el ID único del usuario en Google

		// Si el usuario ya existe en la base de datos, genera un JWT
		const user = await User.findOne({ googleId: userId });
		if (!user) {
			// Si el usuario no existe, crea uno nuevo
			const newUser = new User({
				googleId: userId,
				name: payload?.name,
				email: payload?.email,
				photo: payload?.picture,
			});
			await newUser.save();
		}

		// Generar un JWT para el usuario
		const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
			expiresIn: '1d',
		});

		res.status(200).json({
			id: userId,
			name: payload?.name,
			email: payload?.email,
			photo: payload?.picture,
			token,
		});
	} catch (error) {
		console.error('Error en login con Google:', error);
		res.status(500).json({ message: 'Error en el servidor' });
	}
};
