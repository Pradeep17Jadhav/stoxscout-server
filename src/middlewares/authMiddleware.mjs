import jwt from 'jsonwebtoken';

const blacklistedTokens = [];

const blacklistToken = (token) => {
    blacklistedTokens.push(token);
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized. Please log in.');

    if (blacklistedTokens.includes(token)) {
        return res.status(401).json({message: 'Unauthorized: Token is blacklisted'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user.username;
        next();
    });
};

export {authenticateToken, blacklistToken};
