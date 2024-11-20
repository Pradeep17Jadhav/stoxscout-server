import {Request, Response} from 'express';
import {MongoError} from 'mongodb';
import Preference from '../models/preference';
import User from '../models/user';
import {TypedRequest} from '../types/express';
import {UpdatePreferencesBody} from '../types/requestBodies';
import ErrorCodes from '../types/errors';
import logger from '../utils/logger';

const getUser = async (req: Request, res: Response) => {
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
        logger.error(err);
        return res.status(500).json({error: true, type: 'server_error'});
    }
};

const getPreferences = async (req: Request, res: Response) => {
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
        logger.error(err);
        if (err instanceof MongoError && err.name === 'CastError') {
            return res.status(400).json({error: true, type: 'invalid_user_id'});
        } else {
            return res.status(500).json({error: true, type: 'server_error'});
        }
    }
};

const updatePreferences = async (req: TypedRequest<UpdatePreferencesBody>, res: Response) => {
    const newPreference = req.body;
    const userId = req.user;
    try {
        let preferences = await Preference.findOne({userId});
        if (preferences) {
            preferences.set(newPreference);
            preferences.updatedAt = new Date();
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
        logger.error(err);
        if (err instanceof MongoError) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({error: true, type: 'invalid_data', code: ErrorCodes.MONGO_ERROR});
            } else if (err.name === 'CastError') {
                return res.status(400).json({error: true, type: 'invalid_user_id', code: ErrorCodes.MONGO_ERROR});
            } else if (err.code === 11000) {
                return res.status(409).json({error: true, type: 'duplicate_preferences', code: ErrorCodes.MONGO_ERROR});
            }
        }
        return res.status(500).json({error: true, type: 'server_error'});
    }
};

export {getUser, getPreferences, updatePreferences};
