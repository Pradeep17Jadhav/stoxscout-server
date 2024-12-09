import {Request, Response} from 'express';
import {validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {MongoError} from 'mongodb';
import User from '../models/user.js';
import {blacklistToken} from '../middlewares/authMiddleware.js';
import Session from '../models/session.js';
import {TypedRequest} from '../types/express.js';
import {RegisterRequestBody, VerifyOtpRequestBody} from '../types/requestBodies.js';
import logger from '../utils/logger.js';
import ErrorCodes from '../types/errors.js';
import {sendMail} from '../utils/email.js';
import {PENDING_OTP} from '../types/common.js';
import {sendWelcomeEmail} from './helpers.js';

let pendingOtp: PENDING_OTP[] = [];

setInterval(
    () => {
        const now = new Date();
        pendingOtp = pendingOtp.filter((entry) => entry.expires > now);
    },
    60 * 60 * 1000
);

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
        sendWelcomeEmail(name, email, username);
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
        const {emailOrUsername, password} = req.body;
        const isEmail = emailOrUsername.indexOf('@') !== -1 && emailOrUsername.indexOf('.') !== -1;
        const user = await User.findOne({...(isEmail ? {email: emailOrUsername} : {username: emailOrUsername})});
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({username: user.username}, process.env.JWT_SECRET, {expiresIn: '30d'});
            await Session.findOneAndUpdate(
                {username: user.username},
                {lastActivity: Date.now()},
                {upsert: true, new: true}
            );
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

const forgotPassword = async (req: Request, res: Response) => {
    const {emailOrUsername} = req.body;
    const isEmail = emailOrUsername.indexOf('@') !== -1 && emailOrUsername.indexOf('.') !== -1;
    const user = await User.findOne({...(isEmail ? {email: emailOrUsername} : {username: emailOrUsername})});
    if (!user) {
        return res.status(404).json({error: true, type: 'user_not_found'});
    }
    const email = user.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const subject = 'Your Password Reset Request';
    const body = `Use OTP ${otp} to update your login credentials at MagnyFire! The OTP expires in 15 minutes.`;
    try {
        await sendMail(email, subject, body);
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        pendingOtp.push({email, otp, expires});
        return res.status(200).json({success: true});
    } catch {
        return res.status(500).json({success: false, message: 'cannot_send_otp'});
    }
};

const verifyOtp = async (req: TypedRequest<VerifyOtpRequestBody>, res: Response) => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({error: true, type: 'server_error'});
    }
    const {emailOrUsername, otp} = req.body;
    const isEmail = emailOrUsername.indexOf('@') !== -1 && emailOrUsername.indexOf('.') !== -1;
    const user = await User.findOne({...(isEmail ? {email: emailOrUsername} : {username: emailOrUsername})});
    if (!user) {
        return res.status(404).json({error: true, type: 'user_not_found'});
    }
    const email = user.email;
    const otpEntryIndex = pendingOtp.findIndex((entry) => entry.email === email && entry.otp === otp);
    if (otpEntryIndex === -1) {
        return res.status(400).json({success: false, message: 'incorrect_otp'});
    }
    const otpEntry = pendingOtp[otpEntryIndex];
    if (new Date() > otpEntry.expires) {
        pendingOtp.splice(otpEntryIndex, 1);
        return res.status(400).json({success: false, message: 'otp_expired'});
    }
    pendingOtp.splice(otpEntryIndex, 1);
    const resetToken = jwt.sign({email, updatedAt: user.updatedAt}, process.env.JWT_SECRET, {expiresIn: '15m'});
    return res.status(200).json({success: true, resetToken});
};

const updatePassword = async (req: TypedRequest<{resetToken: string; newPassword: string}>, res: Response) => {
    const {resetToken, newPassword} = req.body;
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({error: true, type: 'server_error'});
    }
    try {
        const {email, updatedAt} = jwt.verify(resetToken, process.env.JWT_SECRET) as {
            email: string;
            updatedAt: string;
        };
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({success: false, message: 'user_not_found'});
        }
        if (user.updatedAt.toISOString() !== updatedAt) {
            return res.status(400).json({success: false, message: 'reset_token_expired'});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.updatedAt = new Date();
        await user.save();
        return res.status(200).json({success: true, message: 'password_updated'});
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
            if (error.name === 'MongoError') {
                return res.status(400).json({success: false, message: 'mongo_error'});
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({success: false, message: 'token_expired'});
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({success: false, message: 'invalid_token'});
            }
        }
        return res.status(400).json({success: false, message: 'invalid_or_expired_token'});
    }
};

export {login, logout, register, forgotPassword, verifyOtp, updatePassword};
