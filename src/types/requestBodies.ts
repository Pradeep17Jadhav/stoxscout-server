import {IndexItem} from './indicesTypes.js';
import {MarketItem} from './marketTypes.js';
import {Preferences} from './userPreferences.js';

export type RegisterRequestBody = {
    username: string;
    password: string;
    email: string;
    name: string;
};

export type VerifyOtpRequestBody = {
    email: string;
    otp: number;
};

export type SetMarketDataRequestBody = MarketItem[];
export type SetIndicesDataRequestBody = IndexItem[];
export type UpdatePreferencesBody = Preferences;
