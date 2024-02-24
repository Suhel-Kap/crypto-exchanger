import axios from 'axios'
import { COINGECKO_URL, MUMBAI_PROVIDER } from './constants'
import Logging from '../library/Logging'

/*
  * Function to get the current price of ARB from coingecko
  When going over blocks that were skipped due to downtime, we'll need to provide the block number to
  get the price at that point in time when the transaction occurred
  Now, for historical data, coingecko stores data in such a format
    1 day from current time = 5 minute interval data
    2 - 90 days of date range = hourly data
    above 90 days of date range = daily data (00:00 UTC)
  so, from the block number, we can calculate the time difference and depending on how old the block is,
  we can calculate the start and end time to fetch the price from coingecko
  Coingecko would provide an array of timestamps and prices, and we will have to find the closest price just before the block time
  and use that as the price for the transaction
  We can't use the closest price after the block time, because the transaction would have occurred before that time
  *
  * @param blockNumber - The block number at which the transaction occurred, if not provided, the current price is fetched
  * @returns The price of ARB, either at the current time or at the block number provided
*/
const getArbPrice = async (blockNumber?: number): Promise<number> => {
  // Default price is 0
  // If the API call fails for some reason, we'll return 0
  // This will cause a divide by zero error in the main function, which will be caught and logged
  // This is to ensure that a false price doesn't get used in the transaction
  let price = 0
  try {
    // If block number is not provided, fetch the current price
    if (blockNumber === undefined) {
      const arbPrice = await axios.get(COINGECKO_URL)
      price = arbPrice.data.arbitrum.usd as number
      // If block number is provided, fetch the price at that point in time
    } else if (blockNumber !== undefined) {
      // Fetch the block details
      const block = await MUMBAI_PROVIDER.getBlock(blockNumber)
      if (block !== null) {
        const blockTimestamp = block.timestamp
        const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
        const timeDifference = currentTime - blockTimestamp // Time difference in seconds

        let queryStartTime = 0
        let queryEndTime = 0

        if (timeDifference <= 24 * 60 * 60) {
          // Within the past 24 hours (1 day)
          queryStartTime = blockTimestamp - 5 * 60 // Subtract 5 minutes
          queryEndTime = blockTimestamp + 5 * 60 // Add 5 minutes
        } else if (timeDifference <= 90 * 24 * 60 * 60) {
          // Between 2 and 90 days
          queryStartTime = blockTimestamp - 1 * 60 * 60 // Subtract 1 hour
          queryEndTime = blockTimestamp + 1 * 60 * 60 // Add 1 hour
        } else {
          // Above 90 days
          queryStartTime = blockTimestamp - 1 * 24 * 60 * 60 // Subtract 1 day
          queryEndTime = blockTimestamp + 1 * 24 * 60 * 60 // Add 1 day
        }

        const COINGECKO_URL_HISTORY = `https://api.coingecko.com/api/v3/coins/arbitrum/market_chart/range?vs_currency=usd&from=${queryStartTime}&to=${queryEndTime}&precision=6`
        // Fetch the price history
        const arbPrice = await axios.get(COINGECKO_URL_HISTORY)
        const coingeckoResponse = arbPrice.data.prices

        let closestPrice = 0
        // We start from the end of the array and go backwards to find the closest price just before the block time
        for (let i = coingeckoResponse.length - 1; i >= 0; i--) {
          const timestamp = coingeckoResponse[i][0]

          const price = coingeckoResponse[i][1]

          if (timestamp <= blockTimestamp * 1000) {
            closestPrice = price
            break
          }
        }

        // If we found a price, set it as the price which will be returned
        price = closestPrice
      }
    }
  } catch (error) {
    Logging.error(error)
  }
  return price
}

export default getArbPrice
