import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import {authenticateToken} from './middlewares/authMiddleware.js';
import {signupValidation} from './validators/signupValidation.js';
import {validateSession} from './middlewares/sessionMiddleware.js';
import {getIndicesData, setIndicesData} from './controllers/indicesController.js';
import {getMarketData, setMarketData} from './controllers/marketDataController.js';
import {
    getHoldings,
    getFullHoldingsList,
    addHolding,
    uploadHoldings,
    editHolding
} from './controllers/holdingsController.js';
import {getPreferences, updatePreferences, getUser} from './controllers/userController.js';
import {multiplyStockQuantity} from './controllers/stockSplitController.js';
import {forgotPassword, login, logout, register, updatePassword, verifyOtp} from './controllers/authController.js';
import logger from './utils/logger.js';
import {setupEmailServer} from './utils/email.js';
import './cron/sessionCleanup.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
setupEmailServer();

const PORT = process.env.PORT || 4000;
if (process.env.MONGODB_URI) {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            logger.info('MongoDB connected');
        })
        .catch((err) => logger.error(err));
} else {
    logger.info('MONGODB_URI not defined in env');
}

app.get('/userHoldingsList', getFullHoldingsList);

app.get('/api/holdings', authenticateToken, validateSession, getHoldings);
app.post('/api/holdings', authenticateToken, validateSession, addHolding);
app.post('/api/editHolding', authenticateToken, validateSession, editHolding);
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
app.post('/api/forgotPassword', forgotPassword);
app.post('/api/verifyOtp', verifyOtp);
app.post('/api/updatePassword', updatePassword);
app.post('/api/multiplyQuantity', multiplyStockQuantity);

app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
