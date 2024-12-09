import {sendMail} from '../utils/email';

const sendWelcomeEmail = async (name: string, email: string, username: string) => {
    const subject = 'Welcome to MagnyFire! 🎉';
    const body = `Hi ${name},

Welcome to **MagnyFire**! We're super excited to have you join our community. 🙌

At MagnyFire, we're all about making your financial journey smooth and efficient. Here's what you can explore:  
- 💼 **Portfolio Management:** Keep track of and manage your investments easily.  
- 📊 **Financial Tools:** Unlock powerful tools to plan and optimize your finances.  
- 💰 **Income Tax Calculators:** Accurately calculate your taxes and save time.  

Your registered details:  
- Username: ${username}
- Email: ${email}

We can't wait for you to explore all the amazing features MagnyFire has to offer! If you need help, feel free to reach out to our support team at contact@pradeepjadhav.com .  

Thank you for choosing MagnyFire. Let’s work together to build your financial future! 🚀  

Warm regards,  
The MagnyFire Team`;

    await sendMail(email, subject, body);
};

export {sendWelcomeEmail};
