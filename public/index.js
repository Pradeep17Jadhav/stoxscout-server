import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { signupValidation } from './validators/signupValidation.js';
import { validateSession } from './middlewares/sessionMiddleware.js';
import { getIndicesData, setIndicesData } from './controllers/indicesController.js';
import { getMarketData, setMarketData } from './controllers/marketDataController.js';
import { getHoldings, getUserHoldingsList, addHolding, uploadHoldings } from './controllers/holdingsController.js';
import { getPreferences, updatePreferences, getUser } from './controllers/userController.js';
import { login, logout, register } from './controllers/authController.js';
import logger from './utils/logger.js';
import './cron/sessionCleanup.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 4000;
if (process.env.MONGODB_URI) {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
        logger.info('MongoDB connected');
    })
        .catch((err) => logger.log(err));
}
else {
    logger.info('MONGODB_URI not defined in env');
}
app.get('/userHoldingsList', getUserHoldingsList);
app.get('/api/holdings', authenticateToken, validateSession, getHoldings);
app.post('/api/holdings', authenticateToken, validateSession, addHolding);
app.post('/api/upload', authenticateToken, validateSession, uploadHoldings);
app.post('/api/indices', setIndicesData);
app.get('/api/indices', authenticateToken, getIndicesData);
app.get('/api/market', authenticateToken, getMarketData);
app.post('/api/market', setMarketData);
app.post('/api/register', signupValidation, register);
app.post('/api/login', login);
app.post('/api/logout', logout);
app.get('/api/preference', authenticateToken, validateSession, getPreferences);
app.put('/api/preference', authenticateToken, validateSession, updatePreferences);
app.get('/api/user', authenticateToken, validateSession, getUser);
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
