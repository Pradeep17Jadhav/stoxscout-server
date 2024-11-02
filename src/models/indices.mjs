import mongoose from 'mongoose';

const IndexSchema = new mongoose.Schema({
    indexSymbol: {
        type: String,
        required: true,
        trim: true
    },
    current: {
        type: Number,
        required: true
    },
    percentChange: {
        type: Number,
        required: true
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

IndexSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Index = mongoose.model('Index', IndexSchema, 'indices');

export default Index;
