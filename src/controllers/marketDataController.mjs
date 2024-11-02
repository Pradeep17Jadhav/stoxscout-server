import MarketData from '../models/marketData.mjs';

const setMarketData = async (req, res) => {
    const newMarketData = req.body;
    try {
        await Promise.all(
            newMarketData.map(async (data) => {
                await MarketData.updateOne(
                    {symbol: data.symbol},
                    {
                        $set: {
                            lastPrice: data.lastPrice,
                            change: data.change,
                            pChange: data.pChange,
                            previousClose: data.previousClose,
                            open: data.open,
                            close: data.close,
                            basePrice: data.basePrice,
                            updatedAt: Date.now()
                        },
                        $setOnInsert: {createdAt: Date.now()}
                    },
                    {upsert: true}
                );
            })
        );
        res.status(200).json({message: 'Data saved successfully!'});
    } catch (err) {
        return res.status(500).json({message: 'Error saving data', error: err});
    }
};

const getMarketData = async (req, res) => {
    try {
        const marketData = await MarketData.find({}).lean().select('-_id -__v -createdAt -updatedAt');
        res.status(200).json(marketData);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving market data', error});
    }
};

export {setMarketData, getMarketData};
