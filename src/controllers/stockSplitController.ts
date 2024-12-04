import mongoose from 'mongoose';
import {Response} from 'express';
import logger from '../utils/logger.js';
import {MultiplyStockQuantityRequestBody} from '../types/requestBodies.js';
import {TypedRequest} from '../types/express.js';

const updateTransactionQuantities = async (symbol: string, multiplier: number): Promise<void> => {
    if (!symbol || multiplier <= 0) {
        throw new Error('Invalid symbol or multiplier');
    }
    await mongoose.connection.collection('holdings').updateMany({symbol}, [
        {
            $set: {
                transactions: {
                    $map: {
                        input: '$transactions',
                        as: 'transaction',
                        in: {
                            dateAdded: '$$transaction.dateAdded',
                            quantity: {$multiply: ['$$transaction.quantity', multiplier]},
                            avgPrice: {$divide: ['$$transaction.avgPrice', multiplier]},
                            exchange: '$$transaction.exchange',
                            isGift: '$$transaction.isGift',
                            isIPO: '$$transaction.isIPO'
                        }
                    }
                }
            }
        }
    ]);
    logger.info(`Successfully updated holdings of symbol ${symbol} with multiplier ${multiplier}`);
};

const multiplyStockQuantity = async (req: TypedRequest<MultiplyStockQuantityRequestBody>, res: Response) => {
    const {symbol, multiplier} = req.body;
    try {
        await updateTransactionQuantities(symbol, multiplier);
        res.status(200).json({success: true, symbol, multiplier});
    } catch (error) {
        res.status(500).json({success: false, message: error});
    }
};

export {multiplyStockQuantity};
