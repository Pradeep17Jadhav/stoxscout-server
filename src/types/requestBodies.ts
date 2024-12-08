import {EditableTransaction} from './holdingTypes.js';
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
    emailOrUsername: string;
    otp: number;
};

export type MultiplyStockQuantityRequestBody = {
    symbol: string;
    multiplier: number;
};

export type EditHoldingRequestBody = {
    symbol: string;
    updatedTransactions: EditableTransaction[];
};

export type SetMarketDataRequestBody = MarketItem[];
export type SetIndicesDataRequestBody = IndexItem[];
export type UpdatePreferencesBody = Preferences;
