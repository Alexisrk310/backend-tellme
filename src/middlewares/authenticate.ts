import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extiende la interfaz Request para incluir el userId
interface AuthRequest extends Request {
	userId?: string; // Este será el ID del usuario decodificado
}

export const authenticate = (
	req: AuthRequest, // Usamos nuestra interfaz extendida
	res: Response,
	next: NextFunction
): void => {
	// Obtenemos el token desde el encabezado Authorization
	const token = req.header('Authorization')?.split(' ')[1];

	// Si no se proporciona token, devolvemos un error 401
	if (!token) {
		res
			.status(401)
			.json({ message: 'Acceso denegado. Token no proporcionado.' });
		return;
	}

	try {
		// Decodificamos el token y extraemos el ID del usuario
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			id: string;
		};

		// Asignamos el ID decodificado al objeto req
		req.userId = decoded.id;

		// Continuamos con el siguiente middleware o controlador
		next();
	} catch (err) {
		// Si ocurre un error al verificar el token (por ejemplo, token expirado o inválido)
		res.status(401).json({ message: 'Token inválido.' });
	}
};
