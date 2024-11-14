import Preference from '../models/preference.mjs';
import User from '../models/user.mjs';

const getUser = async (req, res) => {
    const username = req.user;
    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({error: true, type: 'user_not_found'});
        }
        res.status(200).json({
            name: user.name
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: true, type: 'server_error'});
    }
};

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

export {getUser, getPreferences, updatePreferences};