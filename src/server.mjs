import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {signupValidation} from './validators/signupValidation.mjs';
import {authenticateToken} from './middlewares/authMiddleware.mjs';
import {validateSession} from './middlewares/sessionMiddleware.mjs';
import {getIndicesData, setIndicesData} from './controllers/indicesController.mjs';
import {getMarketData, setMarketData} from './controllers/marketDataController.mjs';
import {getHoldings, getUserHoldingsList, addHolding, uploadHoldings} from './controllers/holdingsController.mjs';
import {getPreferences, updatePreferences, getUser} from './controllers/userController.mjs';
import {updateAccessHeader} from './controllers/accessAdminController.mjs';
import {login, logout, register} from './controllers/authController.mjs';
import {loadMarketData} from './utils/market.mjs';
import './cron/sessionCleanup.mjs';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        loadMarketData();
    })
    .catch((err) => console.log(err));

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
app.put('/api/access', authenticateToken, updateAccessHeader);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
