import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
    {
        dateAdded: {
            type: Date,
            required: true,
            get: (v) => new Date(v)
        },
        quantity: {
            type: Number,
            required: true
        },
        avgPrice: {
            type: Number,
            required: true
        },
        exchange: {
            type: String,
            required: true,
            trim: true
        },
        isGift: {
            type: Boolean,
            required: false
        },
        isIPO: {
            type: Boolean,
            required: false
        }
    },
    {_id: false}
);

const HoldingSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        trim: true
    },
    transactions: {
        type: [TransactionSchema],
        required: true
    },
    userId: {
        type: String,
        required: true,
        trim: true
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

HoldingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Holding = mongoose.model('Holding', HoldingSchema, 'holdings');

export default Holding;
