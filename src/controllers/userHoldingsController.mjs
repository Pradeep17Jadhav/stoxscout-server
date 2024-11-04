import Holding from '../models/holding.mjs';

const getHoldings = async (req, res) => {
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
        console.error(error);
        res.status(500).json({message: 'Server error while fetching holdings', error});
    }
};

const getUserHoldingsList = async (req, res) => {
    try {
        const holdingsData = await Holding.distinct('symbol');
        if (!holdingsData) {
            return res.status(404).json({message: 'No holdings found for this user.'});
        }
        if (holdingsData.length === 0) {
            return res.status(200).json([]);
        }
        const holdingsList = {
            nse: holdingsData
        };
        res.json(holdingsList);
    } catch (error) {
        res.status(500).json(error);
    }
};

const addHolding = async (req, res) => {
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
        console.error(err);
        res.status(500).send(`Server error while adding holding, ${err}`);
    }
};

const uploadHoldings = async (req, res) => {
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
        console.error(err);
        res.status(500).send(`Server error while uploading holdings, ${err}`);
    }
};

export {getHoldings, getUserHoldingsList, addHolding, uploadHoldings};
