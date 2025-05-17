import {Request, Response} from 'express';
import Holding from '../models/holding.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import {EditHoldingRequestBody} from '@src/types/requestBodies.js';

const getHoldings = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({username: req.user});
        if (!user) {
            return res.status(500).json({error: true, type: 'user_not_found'});
        }
        user.lastActivity = new Date();
        await user.save();
        const holdingsData = await Holding.find({userId: req.user})
            .lean()
            .select('-_id -__v -createdAt -updatedAt -userId');
        if (!holdingsData) {
            return res.status(404).json({error: true, type: 'holdings_not_found'});
        }
        if (holdingsData.length === 0) {
            return res.status(200).json([]);
        }
        const convertedHoldingsData = holdingsData.map((holding) => ({
            ...holding,
            transactions: holding.transactions.map((transaction) => ({
                ...transaction,
                dateAdded: new Date(transaction.dateAdded).getTime()
            }))
        }));

        res.json(convertedHoldingsData);
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Server error while fetching holdings', error});
    }
};

const getFullHoldingsList = async (req: Request, res: Response): Promise<Response> => {
    try {
        const holdingsData = await Holding.distinct('symbol');
        if (!holdingsData || holdingsData.length === 0) {
            return res.status(200).json({nse: []});
        }
        const holdingsList = {
            nse: holdingsData
        };
        return res.json(holdingsList);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const addHolding = async (req: Request, res: Response) => {
    const {symbol, dateAdded, quantity, avgPrice, exchange = 'NSE', isGift = false, isIPO = false} = req.body;
    try {
        const newTransaction = {
            dateAdded: new Date(dateAdded),
            quantity,
            avgPrice,
            exchange,
            isGift,
            isIPO
        };
        let holding = await Holding.findOne({symbol, userId: req.user});
        if (holding) {
            holding.transactions.push(newTransaction);
        } else {
            holding = new Holding({
                symbol,
                transactions: [newTransaction],
                userId: req.user
            });
        }
        await holding.save();
        res.status(200).send({message: `Holding ${symbol} added successfully!`});
    } catch (err) {
        logger.error(err);
        res.status(500).send(`Server error while adding holding, ${err}`);
    }
};

const uploadHoldings = async (req: Request, res: Response) => {
    const holdings = req.body;

    if (!Array.isArray(holdings) || holdings.length === 0) {
        return res.status(400).send('Invalid data. Expected an array of holdings.');
    }

    const bulkOps = holdings.map((holding) => {
        const {symbol, dateAdded, quantity, avgPrice, exchange = 'NSE', isGift = false, isIPO = false} = holding;

        return {
            updateOne: {
                filter: {symbol, userId: req.user},
                update: {
                    $setOnInsert: {symbol, userId: req.user, createdAt: Date.now()},
                    $push: {
                        transactions: {
                            dateAdded: new Date(dateAdded),
                            quantity,
                            avgPrice,
                            exchange,
                            isGift,
                            isIPO
                        }
                    },
                    $set: {updatedAt: Date.now()}
                },
                upsert: true
            }
        };
    });

    try {
        const result = await Holding.bulkWrite(bulkOps);
        res.status(200).json({
            message: `Holdings uploaded successfully! Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`
        });
    } catch (err) {
        logger.error(err);
        res.status(500).send(`Server error while uploading holdings, ${err}`);
    }
};
const editHolding = async (req: Request, res: Response) => {
    const {symbol, updatedTransactions}: EditHoldingRequestBody = req.body;
    if (!symbol || !updatedTransactions) {
        return res.status(500).json({error: true, message: 'incorrect_payload'});
    }
    const userId = req.user;
    let updatedCount = 0;
    let deletedCount = 0;

    try {
        const holding = await Holding.findOne({symbol, userId});
        if (!holding) {
            return res.status(404).json({error: true, message: 'holding_not_found'});
        }
        for (const {transaction, deleted} of updatedTransactions) {
            const transactionIndex = holding.transactions.findIndex((t) => t._id.toString() === transaction._id);
            if (transactionIndex === -1) {
                continue;
            }
            if (deleted) {
                holding.transactions.splice(transactionIndex, 1);
                deletedCount += 1;
            } else {
                holding.transactions[transactionIndex].set({
                    dateAdded: new Date(transaction.dateAdded),
                    quantity: transaction.quantity,
                    avgPrice: transaction.avgPrice,
                    exchange: transaction.exchange,
                    isGift: transaction.isGift,
                    isIPO: transaction.isIPO
                });
                updatedCount += 1;
            }
        }

        if (holding.transactions.length === 0) {
            await holding.deleteOne();
            return res.status(200).json({
                error: false,
                message: 'holding_deleted',
                deletedCount,
                updatedCount
            });
        }

        holding.updatedAt = new Date();
        await holding.save();

        res.status(200).json({
            error: false,
            message: 'holding_updated',
            deletedCount,
            updatedCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: true});
    }
};

export {getHoldings, getFullHoldingsList, addHolding, uploadHoldings, editHolding};
