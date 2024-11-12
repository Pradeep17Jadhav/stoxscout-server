import cron from 'node-cron';
import Session from '../models/session.mjs';

cron.schedule('0 0 * * *', async () => {
    try {
        const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await Session.deleteMany({lastActivity: {$lt: threshold}});
        console.log(`${new Date().toISOString()} - Cleaned up ${result.deletedCount} expired sessions.`);
    } catch (error) {
        //todo: use winston
        console.error(`${new Date().toISOString()} - Error cleaning up expired sessions:`, error);
    }
});
