import { type Log, ethers } from 'ethers'
import Logging from '../library/Logging'
import { GENESIS, MUMBAI_PROVIDER, USDC_ADDRESS } from './constants'
import {
  fetchLatestBlockNumber,
  fetchTransactionByIncomingHash
} from '../database'
import { type Event } from './schemas'
// had to use this package instead of p-map because of TS issues
// js requires the package to be imported dynamically, but I couldn't get it to work with TS
import pMap from '@cjs-exporter/p-map'

// function to fetch lost transactions
export const fetchLostTransactions = async (): Promise<Event[] | undefined> => {
  try {
    let lastFetchedBlock = await fetchLatestBlockNumber()
    if (lastFetchedBlock === 0) lastFetchedBlock = GENESIS // Set the genesis block as the default value
    Logging.warn(`Fetching logs from block ${lastFetchedBlock}`)
    const blockNumber = await MUMBAI_PROVIDER.getBlockNumber()
    const logs = await MUMBAI_PROVIDER.getLogs({
      // Fetch logs from the USDC contract
      address: USDC_ADDRESS,
      fromBlock: BigInt(lastFetchedBlock),
      toBlock: blockNumber,
      topics: [ethers.id('Transfer(address,address,uint256)')] // Filter logs by the Transfer event
    })
    Logging.warn(`Fetched ${logs.length} logs`)
    if (logs.length > 0) {
      // We proceed only if we have logs
      const finalTransactions: Event[] = [] // Array to store the transactions

      const transactions = await pMap(
        logs,
        async (log: Log) => {
          const exists = await fetchTransactionByIncomingHash(
            // Check if the transaction already exists in the database
            log.transactionHash
          )

          if (exists.length === 0) {
            // If the transaction doesn't exist, we proceed
            return {
              log,
              blockNumber: log.blockNumber
            }
          }

          return null // Return null for skipped transactions
        },
        { concurrency: 3 } // Set the concurrency to 3 to avoid rate limiting from Alchemy Provider
      )

      finalTransactions.push(
        ...(transactions.filter(
          (transaction) => transaction !== null // Filter out the skipped transactions
        ) as Event[])
      )

      Logging.warn(`Fetched ${finalTransactions.length} transactions`)

      return finalTransactions
    } else {
      return undefined
    }
  } catch (err) {
    Logging.error(err)
    return undefined
  }
}
