import {validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import {blacklistToken} from '../middlewares/authMiddleware.mjs';

const register = async (req, res) => {
    const {username, password, email, name} = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.errors.flatMap((err) => {
            if (err.msg.includes(',')) {
                return err.msg.split(',').map((type) => ({type}));
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
        res.status(201).json({token, success: true});
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({error: true});
        }
        res.status(500).json({error: true});
    }
};

const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({username: user.username}, process.env.JWT_SECRET, {expiresIn: '1d'});
            res.status(200).json({token});
        } else {
            return res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        await blacklistToken(token);
        return res.sendStatus(204);
    } catch (err) {
        return res.sendStatus(401);
    }
};

export {login, logout, register};
