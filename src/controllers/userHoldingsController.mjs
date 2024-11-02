import fs from 'fs';
import Holding from '../models/holding.mjs';

const scriptListPath = '../../data/common/scriptList.json';

const getHoldings = async (req, res) => {
    try {
        const holdingsData = await Holding.find({userId: req.user})
            .lean()
            .select('-_id -__v -createdAt -updatedAt -userId');
        if (!holdingsData || holdingsData.length === 0) {
            return res.status(404).json({message: 'No holdings found for this user.'});
        }
        res.json(holdingsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error while fetching holdings', error});
    }
};

const getUserHoldingsList = async (req, res) => {
    try {
        const holdingsData = await Holding.find({userId: req.user});
        if (!holdingsData || holdingsData.length === 0) {
            return res.status(404).json({message: 'No holdings found for this user.'});
        }
        const holdingsList = await getHoldingsList(holdingsData);
        res.json(holdingsList);
    } catch (error) {
        res.status(500).json(error);
    }
};

const addHolding = async (req, res) => {
    const {symbol, dateAdded, quantity, avgPrice, exchange, isGift, isIPO} = req.body;
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
        res.status(200).send(`Holding ${symbol} added successfully!`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Server error while adding holding, ${err}`);
    }
};

const getHoldingsListByExchange = (holdings, exchange) =>
    holdings
        .filter((holding) => holding.transactions.some((transaction) => transaction.exchange === exchange))
        .map((holding) => holding.symbol);

const getHoldingsList = async (holdings) => {
    const nseList = getHoldingsListByExchange(holdings, 'NSE');
    const bseList = getHoldingsListByExchange(holdings, 'BSE');
    return {
        nse: nseList,
        bse: await convertBseListToCodes(bseList)
    };
};

const convertBseListToCodes = async (bseList) => {
    const scriptListData = await readScriptList();
    return scriptListData
        .map((script) => {
            if (bseList.some((bseListItem) => bseListItem === script.nse)) {
                return script.bse !== 'N/A' ? script.bse : null;
            }
        })
        .filter((bseCode) => !!bseCode);
};

const readScriptList = async () => readFile(scriptListPath);

const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject({error: 'Error reading file'});
            }
            try {
                const res = JSON.parse(data);
                resolve(res);
            } catch (parseErr) {
                reject({error: 'Error parsing JSON'});
            }
        });
    });
};

export {getHoldings, getUserHoldingsList, addHolding};
