import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import fs from 'fs';
import path from 'path';

// Extendemos Request para incluir userId
interface AuthRequest extends Request {
	userId?: string;
}

// Registro de usuario
// Registro de usuario (sin foto)
// ✅ OK
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password } = req.body;

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
		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
			expiresIn: '1d',
		});

		res.status(201).json({
			id: newUser._id,
			name: newUser.name,
			photo: newUser.photo
				? `${req.protocol}://${req.get('host')}/uploads/${newUser.photo}`
				: '',
			token,
		});
	} catch (error) {
		console.error('Error en register:', error);
		res.status(500).json({ message: 'Error en el servidor' });
	}
};

// Inicio de sesión
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
			photo: user.photo
				? `${req.protocol}://${req.get('host')}/uploads/${user.photo}`
				: '',
			token,
		});
	} catch (error) {
		console.error('Error en login:', error);
		res.status(500).json({ message: 'Error en el servidor' });
	}
};

// Actualizar foto de perfil
export const updatePhoto = async (req: AuthRequest, res: Response) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.userId,
			{ photo: req.file?.filename },
			{ new: true }
		);
		res.json({ message: 'Foto actualizada', user });
	} catch (error) {
		console.error('Error al actualizar la foto:', error);
		res.status(500).json({ error: 'Error del servidor' });
	}
};
