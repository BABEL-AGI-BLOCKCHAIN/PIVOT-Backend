import { Decimal } from '@prisma/client/runtime/library';
import { contract, provider } from '../utils/provider.js';
import axios from 'axios';

const baseURL = process.env.BASE_URL || 'http://localhost:5000';

const listenToCreateTopic = async () => {
  contract.on('CreateTopic', async (promoter, topicId, investment, position, tokenAddress, nonce, event) => {
    try {
      const { chainId } = await provider.getNetwork();
      const transactionHash = await event.log.transactionHash;

      await axios.post(`${baseURL}/api/v1/topic/createTopic`, {
        promoter,
        topicId: topicId.toString(),
        investment: Decimal(investment),
        position: Number(position),
        tokenAddress,
        nonce: nonce.toString(),
        transactionHash,
        chainId: chainId.toString(),
      });
    } catch (error) {
      console.error(
        'Error handling CreateTopic event:',
        error.response ? error.response.data : error.message
      );
    }
  });
};

export default listenToCreateTopic;
