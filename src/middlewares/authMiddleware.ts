import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import ErrorCodes from '../types/errors.js';

const blacklistedTokens: string[] = [];

const blacklistToken = (token?: string) => {
    if (!token) return;
    blacklistedTokens.push(token);
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: true, type: 'unauthorized', message: 'Please log in.'});
    }
    if (blacklistedTokens.includes(token)) {
        return res.status(401).json({error: true, type: 'token_blacklisted'});
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({error: true, type: 'server_error', code: ErrorCodes.ENV_VARIABLE_NOT_DEFINED});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({error: true, type: 'token_expired'});
            }
            return res.status(401).json({error: true, type: 'invalid_token'});
        }
        if (!user || typeof user !== 'object' || !('username' in user)) {
            return res.status(401).json({error: true, type: 'invalid_token'});
        }
        req.user = user.username;
        next();
    });
};

export {authenticateToken, blacklistToken};
