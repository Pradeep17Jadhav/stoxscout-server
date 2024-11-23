import {Request, Response} from 'express';
import {validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {MongoError} from 'mongodb';
import User from '../models/user.js';
import {blacklistToken} from '../middlewares/authMiddleware.js';
import Session from '../models/session.js';
import {TypedRequest} from '../types/express.js';
import {RegisterRequestBody} from '../types/requestBodies.js';
import logger from '../utils/logger.js';
import ErrorCodes from '../types/errors.js';

const register = async (req: TypedRequest<RegisterRequestBody>, res: Response) => {
    const {username, password, email, name} = req.body;
    const valResult = validationResult(req);

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({error: true, type: 'server_error', code: ErrorCodes.ENV_VARIABLE_NOT_DEFINED});
    }
    if (!valResult.isEmpty()) {
        const formattedErrors = valResult.array().flatMap((err) => {
            if (err.msg.includes(',')) {
                return err.msg.split(',').map((type: string) => ({type}));
            }
            return [{type: err.msg}];
        });
        return res.status(400).json({error: true, type: 'validation', errors: formattedErrors});
    }

    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({error: true, type: 'username_taken'});
        }
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({error: true, type: 'email_taken'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username, password: hashedPassword, email, name});
        await newUser.save();
        const token = jwt.sign({username}, process.env.JWT_SECRET, {expiresIn: '1d'});
        await Session.findOneAndUpdate({username}, {lastActivity: Date.now()}, {upsert: true, new: true});
        res.status(201).json({token, success: true});
    } catch (err) {
        if (err instanceof MongoError && err.code === 11000) {
            return res.status(409).json({error: true});
        }
        res.status(500).json({error: true});
    }
};

const login = async (req: Request, res: Response): Promise<Response> => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({error: true, type: 'server_error', code: ErrorCodes.ENV_VARIABLE_NOT_DEFINED});
    }
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({username: user.username}, process.env.JWT_SECRET, {expiresIn: '30d'});
            await Session.findOneAndUpdate({username}, {lastActivity: Date.now()}, {upsert: true, new: true});
            user.lastActivity = new Date();
            user.lastLogin = new Date();
            await user.save();
            return res.status(200).json({token});
        } else {
            return res.status(401).json({error: true, type: 'invalid_credentials'});
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).send('Server error');
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        await blacklistToken(token);
        return res.sendStatus(204);
    } catch (err) {
        let errorMessage = 'Server error';
        if (err instanceof Error) {
            errorMessage += err.message;
        }
        logger.error(errorMessage);
        return res.sendStatus(401).json({error: true, type: 'server_error', code: ErrorCodes.INTERNAL_SERVER_ERROR});
    }
};

export {login, logout, register};
