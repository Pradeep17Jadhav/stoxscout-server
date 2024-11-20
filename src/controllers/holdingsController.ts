import {Request, Response} from 'express';
import Holding from '../models/holding';
import logger from '../utils/logger';

const getHoldings = async (req: Request, res: Response) => {
    try {
        const holdingsData = await Holding.find({userId: req.user})
            .lean()
            .select('-_id -__v -createdAt -updatedAt -userId');
        if (!holdingsData) {
            return res.status(404).json({message: 'No holdings found for this user.'});
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

const getUserHoldingsList = async (req: Request, res: Response): Promise<Response> => {
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

export {getHoldings, getUserHoldingsList, addHolding, uploadHoldings};
