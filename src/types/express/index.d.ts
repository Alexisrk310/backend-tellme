import { Express } from 'express';

declare global {
	namespace Express {
		interface Request {
			file?: Express.Multer.File;
			userId?: string;
		}
	}
}
