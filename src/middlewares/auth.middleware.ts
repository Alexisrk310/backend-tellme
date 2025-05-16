import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware para verificar el token
export const authenticatea = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'No token provided' });

	try {
		// Si el token es de Google, verificarlo usando el cliente de Google
		if (token.startsWith('google_')) {
			const ticket = await client.verifyIdToken({
				idToken: token.replace('google_', ''), // El token de Google sin el prefijo
				audience: process.env.GOOGLE_CLIENT_ID,
			});

			const payload = ticket.getPayload();
			if (!payload || !payload.email) {
				return res.status(401).json({ message: 'Invalid Google token' });
			}

			(req as any).userId = payload.sub; // Usamos el 'sub' de Google como el ID del usuario
			return next();
		}

		// Si no es un token de Google, asumir que es un JWT normal y verificarlo
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			id: string;
		};
		(req as any).userId = decoded.id;
		next();
	} catch {
		return res.status(403).json({ message: 'Invalid token' });
	}
};
