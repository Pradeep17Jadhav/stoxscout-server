import mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    lastActivity: {
        type: Date,
        required: true
    },
    token: {
        type: String
    }
});
const Session = mongoose.model('Session', sessionSchema);
export default Session;
