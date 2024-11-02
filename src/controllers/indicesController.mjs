import Index from '../models/indices.mjs';

const getIndicesData = async (req, res) => {
    const allowedIndices = ['NIFTY 50', 'NIFTY BANK'];
    try {
        const filteredIndices = await Index.find({
            indexSymbol: {$in: allowedIndices}
        })
            .lean()
            .select('-_id -__v -createdAt -updatedAt');

        res.status(200).json(filteredIndices);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const setIndicesData = async (req, res) => {
    const newFetchedParsed = req.body;
    try {
        await Promise.all(
            newFetchedParsed.map(async (data) => {
                await Index.updateOne(
                    {indexSymbol: data.indexSymbol},
                    {
                        $set: {
                            current: data.current,
                            percentChange: data.percentChange,
                            updatedAt: Date.now()
                        },
                        $setOnInsert: {createdAt: Date.now()}
                    },
                    {upsert: true}
                );
            })
        );

        res.status(200).json({message: 'Indices data saved successfully!'});
    } catch (err) {
        return res.status(500).json({message: 'Error saving indices data', error: err.message});
    }
};

export {getIndicesData, setIndicesData};
