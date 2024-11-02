import mongoose from 'mongoose';

const MarketDataSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        trim: true
    },
    lastPrice: {
        type: Number,
        required: true
    },
    change: {
        type: Number,
        required: true
    },
    pChange: {
        type: Number,
        required: true
    },
    previousClose: {
        type: Number,
        required: true
    },
    open: {
        type: Number,
        required: true
    },
    close: {
        type: Number,
        required: true
    },
    basePrice: {
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

MarketDataSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const MarketData = mongoose.model('MarketData', MarketDataSchema, 'marketdata');

export default MarketData;
