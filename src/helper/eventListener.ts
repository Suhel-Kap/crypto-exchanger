import { ContractEventPayload, type ContractEventName } from 'ethers'
import 'dotenv/config'
import calculateAmount from './calculateAmount'
import {
  deleteFailedTransaction,
  fetchFailedTransactions,
  insertFailedTransaction,
  insertTransaction
} from '../database'
import Logging from '../library/Logging'
import {
  ARB_ADDRESS,
  LISTENER_ADDRESS,
  ARB_CONTRACT,
  USDC_CONTRACT,
  WALLET,
  USDC_INTERFACE
} from './constants'
import getArbPrice from './arbPrice'
import { type Event } from './schemas'
import { fetchLostTransactions } from './fetchLostTransactions'

// mutex lock to prevent concurrent transaction processing
// if lock is not present, multiple send transactions would be initiated
// by the same account, which would result in nonce errors and failed transactions
let isProcessing = false

// queue to store incoming events
// if we encounter any valid event, we first add it to the queue and then process it
const eventQueue: Event[] = []

// function to process the event
async function processEvent (event: Event): Promise<void> {
  try {
    const parsedLog = USDC_INTERFACE.parseLog(event.log)
    // extracts the sender and the amount received from the event
    const sender = parsedLog?.args[0] as string
    const amountReceived = parsedLog?.args[2] as bigint

    // fetches current price of ARB on coingecko upto 6 decimal places
    let arbPrice
    if (event.blockNumber !== undefined) {
      arbPrice = await getArbPrice(event.blockNumber)
    } else {
      arbPrice = await getArbPrice()
    }

    // calculates the equivalent amount of ARB to send to the sender
    const { arbAmount, fee } = calculateAmount(amountReceived, arbPrice)

    // send the equivalent amount of ARB to the sender
    const tx = await WALLET.sendTransaction({
      to: ARB_ADDRESS,
      value: BigInt(0),
      data: ARB_CONTRACT.interface.encodeFunctionData('transfer', [
        sender,
        arbAmount
      ])
    })
    // wait for the transaction to be confirmed
    const receipt = await tx.wait()
    Logging.info(`${receipt?.hash}, confirmed`)
    // insert the transaction details into the database
    await insertTransaction({
      sender,
      usdcReceived: amountReceived,
      arbAmount,
      arbPrice,
      fee,
      blockNumber: event.log.blockNumber,
      incomingTransactionHash: event.log.transactionHash,
      outgoingTransactionHash: receipt?.hash ?? ''
    })
    Logging.info('Data inserted into the database')
  } catch (error: any) {
    Logging.error(error)
    event.blockNumber = event.log.blockNumber
    // if the event processing fails, we store the event in the database along with the error message
    insertFailedTransaction(
      JSON.stringify(event),
      error.message as string
    ).catch(Logging.error)
  } finally {
    // process the next event in the queue if any
    if (eventQueue.length > 0) {
      // extract the first event from the queue
      const nextEvent = eventQueue.shift()
      // if the event is valid, process it
      nextEvent !== undefined && (await processEvent(nextEvent))
    }
  }
}

// listening to only Transfer events returns the receiver address only
// so we listen to all events and filter out the Transfer events
export const listenToAllEvents = (): void => {
  USDC_CONTRACT
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .on('*', async (event: ContractEventName) => {
      // here we check if the event is a Transfer event and the receiver is the listener address
      if (
        event instanceof ContractEventPayload &&
        event.fragment.name === 'Transfer' &&
        event.args[1] === LISTENER_ADDRESS
      ) {
        // if the event is valid, add it to the queue
        eventQueue.push({ log: event.log })
        Logging.warn('Event added to the queue')
        // If not processing any event, start processing
        if (!isProcessing) {
          // before processing the event, acquire the mutex lock
          isProcessing = true
          // extract the first event from the queue
          const nextEvent = eventQueue.shift()
          // if the event is valid, process it, else release the lock
          nextEvent !== undefined && (await processEvent(nextEvent))
          isProcessing = false
        }
      }
    })
    .catch(Logging.error)
}

// function to process the pending events which were lost due to server downtime
export const processPendingEvents = async (): Promise<void> => {
  try {
    const txns = await fetchLostTransactions()
    Logging.warn(`Fetched ${txns?.length} lost transactions`)
    if (txns === undefined) return
    // add the lost transactions to the queue
    for (const txn of txns) {
      eventQueue.push(txn)
    }
    if (!isProcessing) {
      isProcessing = true
      const nextEvent = eventQueue.shift()
      nextEvent !== undefined && (await processEvent(nextEvent))
      isProcessing = false
    }
  } catch (error) {
    Logging.error(error)
  }
}

// function to process the failed transactions which were not processed due to some error like coingecko, rpc error etc
export const processFailedTransactions = async (): Promise<void> => {
  try {
    const failedTxns = await fetchFailedTransactions()
    Logging.warn(`Fetched ${failedTxns?.length} failed transactions`)
    if (failedTxns === undefined || failedTxns.length === 0) return
    // add the failed transactions to the queue
    for (const txn of failedTxns) {
      eventQueue.push(JSON.parse(txn.log) as Event)
    }
    // now since we have added the failed transactions to the queue, we can delete them from the database
    await deleteFailedTransaction()
    if (!isProcessing) {
      isProcessing = true
      const nextEvent = eventQueue.shift()
      nextEvent !== undefined && (await processEvent(nextEvent))
      isProcessing = false
    }
  } catch (error) {
    Logging.error(error)
  }
}
