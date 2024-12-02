/* eslint-disable no-unused-vars */
export enum SORT_ORDER {
    ASC = 1,
    DESC = 2
}

export enum DEFAULT_COLUMNS {
    SYMBOL = 1,
    QUANTITY = 2,
    AVG_PRICE = 3,
    LTP = 4,
    INVESTED = 5,
    CURRENT_VALUE = 6,
    NET_PNL = 7,
    NET_PNL_PERCENT = 8,
    DAY_PNL = 9,
    DAY_PNL_PERCENT = 10,
    DAY_PNL_PERCENT_INV = 11,
    MAX_DAYS = 12
}

export const COLUMNS = {
    [DEFAULT_COLUMNS.SYMBOL]: 'SYMBOL',
    [DEFAULT_COLUMNS.QUANTITY]: 'QTY',
    [DEFAULT_COLUMNS.AVG_PRICE]: 'AVG PRICE',
    [DEFAULT_COLUMNS.LTP]: 'LTP',
    [DEFAULT_COLUMNS.INVESTED]: 'INVESTED',
    [DEFAULT_COLUMNS.CURRENT_VALUE]: 'CURRENT',
    [DEFAULT_COLUMNS.NET_PNL]: 'P&L',
    [DEFAULT_COLUMNS.NET_PNL_PERCENT]: 'P&L %',
    [DEFAULT_COLUMNS.DAY_PNL]: 'DAY P&L',
    [DEFAULT_COLUMNS.DAY_PNL_PERCENT]: 'DAY P&L %',
    [DEFAULT_COLUMNS.DAY_PNL_PERCENT_INV]: 'DAY P&L % INV',
    [DEFAULT_COLUMNS.MAX_DAYS]: 'MAX DAYS'
};

export type PENDING_OTP = {
    email: string;
    otp: number;
    expires: Date;
};
