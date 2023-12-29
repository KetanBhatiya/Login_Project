import jwt from 'jsonwebtoken';
import ENV from '../config.js';

export default async function Auth(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);
        
        // Ensure the decoded token has required fields (e.g., userId, username)
        if (!decodedToken.userId || !decodedToken.username) {
            throw new Error('Invalid token format');
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError' || error.message === 'Invalid token format') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Handle other errors as needed
        res.status(401).json({ error: 'Authentication Failed!' });
    }
}
