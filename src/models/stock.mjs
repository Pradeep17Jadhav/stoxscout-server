import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
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
    }
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
