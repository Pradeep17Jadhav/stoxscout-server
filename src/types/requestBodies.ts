import { IndexItem } from './indicesTypes';
import {MarketItem} from './marketTypes';
import { Preferences } from './userPreferences';

export type RegisterRequestBody = {
    username: string;
    password: string;
    email: string;
    name: string;
};

export type SetMarketDataRequestBody = MarketItem[];
export type SetIndicesDataRequestBody = IndexItem[];
export type UpdatePreferencesBody = Preferences;
