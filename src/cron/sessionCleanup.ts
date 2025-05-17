import cron from 'node-cron';
import Session from '../models/session.js';
import logger from '../utils/logger.js';

cron.schedule('0 0 * * *', async () => {
    try {
        const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await Session.deleteMany({lastActivity: {$lt: threshold}});
        logger.info(`${new Date().toISOString()} - Cleaned up ${result.deletedCount} expired sessions.`);
    } catch (error) {
        logger.error(`${new Date().toISOString()} - Error cleaning up expired sessions:`, error);
    }
});
