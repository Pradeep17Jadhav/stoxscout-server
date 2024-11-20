import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema(
    {
        visibleColumns: {
            type: [Number],
            default: []
        },
        sortColumn: {
            type: Number,
            default: 1
        },
        sortOrder: {
            type: Number,
            default: 1
        }
    },
    {_id: false}
);

const DevicePreferencesSchema = new mongoose.Schema(
    {
        dashboard: {
            type: DashboardSchema
        }
    },
    {_id: false}
);

const PreferenceSchema = new mongoose.Schema({
    mobile: {
        type: DevicePreferencesSchema
    },
    computer: {
        type: DevicePreferencesSchema
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

PreferenceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Preference = mongoose.model('Preference', PreferenceSchema);

export default Preference;
