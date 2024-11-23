import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.model('User', UserSchema);

export default User;
