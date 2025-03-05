import axios from "axios";
import { provider, contract } from "../utils/provider.js";
import { Decimal } from "@prisma/client/runtime/library";

const MAX_BLOCK_RANGE = 50000;
const baseURL = process.env.BASE_URL || "http://localhost:5000";

async function processHistoricInvestEvents() {
  const eventName = "Invest";
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
      
      const filter = contract.filters[eventName](null, null, null, null, null);
      const events = await contract.queryFilter(filter, fromBlock, endBlock);
      
      for (const e of events) {
        const { investor, topicId, amount, position, nonce } = e.args;
        try {
          console.log (investor, topicId, amount, position, nonce);
          const { chainId } = await provider.getNetwork();
          const transactionHash = e.transactionHash || e.log.transactionHash;
          
          await axios.post(`${baseURL}/api/v1/topic/invest`, {
            investor,
            topicId: topicId.toString(),
            amount: Decimal(amount),
            position: Number(position),
            nonce: nonce.toString(),
            transactionHash,
            chainId: chainId.toString(),
          });
        } catch (error) {
          console.error(
            "Error processing invest event:",
            error.response ? error.response.data : error.message
          );
        }
      }
      
      try {
        await axios.post(`${baseURL}/api/v1/event/updateEventSync?eventName=${eventName}`, {
          blockNumber: BigInt(endBlock),
        });
      } catch (error) {
        console.error(
          "Error updating event sync:",
          error.response ? error.response.data : error.message
        );
      }
      
      fromBlock = BigInt(endBlock) + 1n;
    }
  } catch (error) {
    console.error(
      "Error processing historic invest events:",
      error.response ? error.response.data : error.message
    );
  }
}

export default processHistoricInvestEvents;
