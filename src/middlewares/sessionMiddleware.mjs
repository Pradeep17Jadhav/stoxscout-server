import jwt from 'jsonwebtoken';
import Session from '../models/session.mjs';

const validateSession = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const errorRes = {error: true, type: 'unauthorized', message: 'Please log in.'};
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.username;
        const session = await Session.findOne({username});
        if (!session) {
            return res.status(401).json(errorRes);
        }
        const currentTime = new Date();
        const inactivityThreshold = 24 * 60 * 60 * 1000;
        if (currentTime - session.lastActivity > inactivityThreshold) {
            await Session.deleteOne({username});
            return res.status(401).json(errorRes);
        }
        session.lastActivity = currentTime;
        await session.save();
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json(errorRes);
    }
};

export {validateSession};
