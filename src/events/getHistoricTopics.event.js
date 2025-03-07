import axios from "axios";
import { provider, contract } from "../utils/provider.js";
import { safeDecimal } from "../utils/validateDecimal.js";

const MAX_BLOCK_RANGE = 50000;
const baseURL = process.env.BASE_URL || "http://localhost:5000";

async function processHistoricTopics() {
  const eventName = "CreateTopic";
    try {
      const getResponse = await axios.get(`${baseURL}/api/v1/event/getEventSync?eventName=${eventName}`);
      const lastBlock = getResponse.data.lastBlock;
      
      const currentBlock = await provider.getBlockNumber();
      
      let fromBlock = BigInt(lastBlock) + 1n;
      const toBlock = BigInt(currentBlock);
      
      while (fromBlock <= toBlock) {
        const blockRange = BigInt(MAX_BLOCK_RANGE);
        const candidate = fromBlock + blockRange - 1n;
        const endBlock = candidate < toBlock ? candidate : toBlock;
        
        const filter = contract.filters[eventName](null, null, null, null, null, null);
        const events = await contract.queryFilter(filter, fromBlock, endBlock);
        
        for (const e of events) {
          const { promoter, topicId, investment, position, tokenAddress, nonce} = e.args;
          try {
            const { chainId } = await provider.getNetwork();
            const transactionHash = e.transactionHash || e.log.transactionHash;
            const decimalInvestment = safeDecimal(investment);
      
            await axios.post(`${baseURL}/api/v1/topic/createTopic`, {
              promoter,
              topicId: topicId.toString(),
              investment: decimalInvestment,
              position: Number(position),
              tokenAddress,
              nonce: nonce.toString(),
              transactionHash,
              chainId: chainId.toString(),
            });
          } catch (error) {
            console.error(`Error processing event:`, error.response ? error.response.data : error.message);
          }
        }
        
        try {
          await axios.post(`${baseURL}/api/v1/event/updateEventSync?eventName=${eventName}`, {
            blockNumber: BigInt(endBlock),
          });
        } catch (error) {
          console.error("Error updating event sync:", error.response ? error.response.data : error.message);
        }
        
        fromBlock = BigInt(endBlock) + 1n;
      }
    } catch (error) {
      console.error("Error processing historic topics:", error.response ? error.response.data : error.message);
    }
}
  

export default processHistoricTopics;
