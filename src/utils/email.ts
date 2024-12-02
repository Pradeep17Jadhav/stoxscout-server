import nodemailer, {Transporter} from 'nodemailer';
import logger from './logger.js';

let transporter: Transporter | undefined;
let isReady = false;

const setupEmailServer = () => {
    if (process.env.GMAIL_ID && process.env.GMAIL_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASSWORD
            }
        });
        transporter.verify((error) => {
            if (error) {
                logger.error('Error verifying transporter:', error);
            } else {
                isReady = true;
                logger.info('Transporter is ready to send emails');
            }
        });
    }
};

const sendMail = async (to: string, subject: string, body: string) => {
    if (!transporter || !isReady) {
        throw new Error('Transporter is not ready');
    }
    const mailOptions = {
        from: process.env.GMAIL_ID,
        to,
        subject,
        text: body
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.log('Error sending OTP:', error);
        throw error;
    }
};

export {setupEmailServer, sendMail};
