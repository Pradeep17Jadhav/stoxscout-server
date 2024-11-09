import Preference from '../models/preference.mjs';

const getPreferences = async (req, res) => {
    const userId = req.user;
    try {
        const preferences = await Preference.findOne({userId})
            ?.lean()
            .select('-_id -__v -createdAt -updatedAt -userId');
        if (!preferences) {
            return res.status(200).json({});
        }
        res.status(200).json(preferences);
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({error: true, type: 'invalid_user_id'});
        } else {
            return res.status(500).json({error: true, type: 'server_error'});
        }
    }
};

const updatePreferences = async (req, res) => {
    const {preference: newPreference} = req.body;
    const userId = req.user;
    try {
        let preferences = await Preference.findOne({userId});
        if (preferences) {
            preferences.set(newPreference);
            preferences.updatedAt = Date.now();
        } else {
            preferences = new Preference({
                userId,
                ...newPreference,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        await preferences.save();
        res.status(200).send({message: 'Preferences updated successfully!'});
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({error: true, type: 'invalid_data'});
        } else if (err.name === 'CastError') {
            return res.status(400).json({error: true, type: 'invalid_user_id'});
        } else if (err.code === 11000) {
            return res.status(409).json({error: true, type: 'duplicate_preferences'});
        } else {
            return res.status(500).json({error: true, type: 'server_error'});
        }
    }
};

export {getPreferences, updatePreferences};
