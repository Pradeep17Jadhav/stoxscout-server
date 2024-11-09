import jwt from 'jsonwebtoken';

const blacklistedTokens = [];

const blacklistToken = (token) => {
    blacklistedTokens.push(token);
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: true, type: 'unauthorized', message: 'Please log in.'});
    }
    if (blacklistedTokens.includes(token)) {
        return res.status(401).json({error: true, type: 'token_blacklisted'});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({error: true, type: 'token_expired'});
            }
            return res.status(401).json({error: true, type: 'invalid_token'});
        }
        req.user = user.username;
        next();
    });
};

export {authenticateToken, blacklistToken};
