import {Request, Response} from 'express';
import MarketData from '../models/marketData.js';
import {TypedRequest} from '../types/express.js';
import {MarketItem} from '../types/marketTypes.js';
import {SetMarketDataRequestBody} from '../types/requestBodies.js';

const setMarketData = async (req: TypedRequest<SetMarketDataRequestBody>, res: Response) => {
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

const setMarketDataInternally = async (marketData: MarketItem[]) => {
    try {
        await Promise.all(
            marketData.map(async (data) => {
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
        return true;
    } catch {
        return false;
    }
};

const getMarketData = async (req: Request, res: Response) => {
    try {
        const marketData = await MarketData.find({}).lean().select('-_id -__v -createdAt');
        const oldestRecord = marketData.reduce((earliest, current) => {
            return new Date(current.updatedAt) < new Date(earliest.updatedAt) ? current : earliest;
        });
        res.status(200).json({market: marketData, updatedAt: oldestRecord.updatedAt});
    } catch (error) {
        res.status(500).json({message: 'Error retrieving market data', error});
    }
};

export {setMarketDataInternally, setMarketData, getMarketData};
