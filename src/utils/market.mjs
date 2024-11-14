import axios from 'axios';
import Holding from '../models/holding.mjs';
import {setMarketDataInternally} from '../controllers/marketDataController.mjs';
import {getAccessHeaders} from '../controllers/accessController.mjs';

const fetchAndSaveMarketData = async (holdingsList, accessHeader) => {
    console.log(Date.now());

    try {
        // const fetchDataPromises = holdingsList.map((symbol) => {
        //     const api = `${process.env.MARKET_FETCHER_API}=${symbol}`;
        //     console.log('api', api, accessHeader);
        const api = `${process.env.MARKET_FETCHER_API}=HDFCBANK`;
        console.log('api', api);
        console.log('accessHeader', accessHeader);
        const res = await axios.get(api, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...accessHeader,
                accept: '*/*',
                referer: api,
                Cookie: accessHeader.cookie
            }
        });
        // });
        console.log('res', res);
        console.log('res', formatPriceInfo(res.data));
        // const results = await Promise.all(fetchDataPromises);
        // console.log('results.length', results.length);
        // const userHoldingsData = results.map((stockResponse) => {
        //     return formatPriceInfo(stockResponse.data);
        // });
        // const saveResult = await setMarketDataInternally(userHoldingsData);
        // if (saveResult) {
        //     console.log('Market data successfully saved');
        //     return true;
        // } else {
        //     console.error('Could not save market data');
        //     return false;
        // }
    } catch (e) {
        console.error('Error: Could not save market data');
        return false;
    }
};

const loadMarketData = () => {
    let fetchCount = 0;
    let holdingsList = [];
    let accessHeader = null;
    console.log('interval set');
    setInterval(async () => {
        console.log('interval executed');
        try {
            if (!holdingsList.length) {
                holdingsList = await Holding.distinct('symbol');
                if (!holdingsList || holdingsList.length === 0) {
                    console.error('No holdings found for the user');
                    return;
                }
            }
            if (!accessHeader) {
                accessHeader = await getAccessHeaders();
                if (!accessHeader) {
                    console.error('No access headers');
                    return;
                }
            }
            const success = await fetchAndSaveMarketData(holdingsList, accessHeader);
            fetchCount += 1;
            if (!success || fetchCount === 30) {
                holdingsList = [];
                fetchCount = 0;
                accessHeader = null;
            }
        } catch (e) {
            console.error('Could not save market data', accessHeader, holdingsList.length);
            accessHeader = null;
            holdingsList = [];
            fetchCount = 0;
        }
    }, 20000);
};

const formatPriceInfo = (apiResponse) => {
    if (!apiResponse.priceInfo) return defaultPriceInfo;
    const {info, priceInfo} = apiResponse;
    const {symbol} = info;
    const {lastPrice, change, pChange, previousClose, open, close, basePrice} = priceInfo;
    return {
        symbol,
        lastPrice,
        change,
        pChange,
        previousClose,
        open,
        close,
        basePrice
    };
};

export {loadMarketData};
