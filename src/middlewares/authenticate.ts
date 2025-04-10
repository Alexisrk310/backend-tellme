import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
	userId?: string;
}

export const authenticate = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	const token = req.header('Authorization')?.split(' ')[1];

	if (!token) {
		res
			.status(401)
			.json({ message: 'Acceso denegado. Token no proporcionado.' });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			id: string;
		};
		req.userId = decoded.id;
		next();
	} catch (err) {
		res.status(401).json({ message: 'Token inválido.' });
	}
};
