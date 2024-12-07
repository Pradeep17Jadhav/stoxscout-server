export type Transaction = {
    _id: string;
    dateAdded: number;
    quantity: number;
    avgPrice: number;
    isGift?: boolean;
    isIPO?: boolean;
    exchange?: string;
};

export type EditableTransaction = {
    transaction: Transaction;
    deleted?: boolean;
};
