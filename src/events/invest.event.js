import { contract, provider } from '../utils/provider.js'
import axios from 'axios'
import { safeDecimal } from '../utils/validateDecimal.js';

const baseURL = 'http://localhost:5000' || process.env.BASE_URL;

const listenToInvest = async () => {
    contract.on ('Invest', async (investor, topicId, amount, position, nonce, event) => {
        try {
            const transactionHash = await event.log.transactionHash;
            const { chainId } = await provider.getNetwork();
            const decimalAmount = safeDecimal(amount);
            await axios.post(`${baseURL}/api/v1/topic/invest`, {
                investor,
                topicId: topicId.toString(),
                amount: decimalAmount,
                position: Number(position),
                nonce: nonce.toString(),
                transactionHash,
                chainId: chainId.toString(),
            });
        } catch (error) {
            console.error(
                'Error handling Invest event:',
                error.response ? error.response.data : error.message
            );
        }
    });
}

export default listenToInvest;