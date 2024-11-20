import {Request, Response, NextFunction} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import Session from '../models/session';
import ErrorCodes from '../types/errors';
import logger from '../utils/logger';

const validateSession = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({errror: true, type: 'unauthorized', code: ErrorCodes.MISSING_JWT_SECRET});
    }
    if (!process.env.JWT_SECRET) {
        return res.status(401).json({errror: true, type: 'unauthorized', code: ErrorCodes.ENV_VARIABLE_NOT_DEFINED});
    }
    const errorRes = {error: true, type: 'server_error'};
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        const username = decoded.username;
        const session = await Session.findOne({username});
        if (!session) {
            return res.status(401).json({...errorRes, code: ErrorCodes.SESSION_UNAVAILABLE});
        }
        const currentTime = new Date();
        const inactivityThreshold = 24 * 60 * 60 * 1000;
        if (currentTime.getTime() - session.lastActivity.getTime() > inactivityThreshold) {
            await Session.deleteOne({username});
            return res.status(401).json({...errorRes, code: ErrorCodes.SESSION_EXPIRED});
        }
        session.lastActivity = currentTime;
        await session.save();
        next();
    } catch (error) {
        logger.error(error);
        return res.status(401).json({errorRes, code: ErrorCodes.INTERNAL_SERVER_ERROR});
    }
};

export {validateSession};
