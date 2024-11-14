import mongoose from 'mongoose';

const AccessHeaderSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true,
        unique: true
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

AccessHeaderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const AccessHeader = mongoose.model('AccessHeader', AccessHeaderSchema);

export default AccessHeader;
