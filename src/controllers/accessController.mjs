import AccessHeader from '../models/accessHeader.mjs';

const getAccessHeaders = async () => {
    try {
        const accessHeader = await AccessHeader.findOne({username: 'pradeep'});
        if (!accessHeader) {
            return false;
        }
        return JSON.parse(accessHeader.token);
    } catch (err) {
        return false;
    }
};

export {getAccessHeaders};
