import { ContractEventPayload, ethers } from 'ethers'
import type { ContractEventName } from 'ethers'
import 'dotenv/config'
import ERC20 from './abi/ERC20.abi.json'
import axios from 'axios'
import calculateAmount from './calculateAmount'
import { insertTransaction } from '../database'
import Logging from '../library/Logging'
import { ARB_ADDRESS, LISTENER_ADDRESS, USDC_ADDRESS } from './addresses'

// mutex lock to prevent concurrent transaction processing
// if lock is not present, multiple send transactions would be initiated
// by the same account, which would result in nonce errors and failed transactions
let isProcessing = false

// queue to store incoming events
// if we encounter any valid event, we first add it to the queue and then process it
const eventQueue: ContractEventPayload[] = []

// providers for the two networks
const optimismProvider = new ethers.AlchemyProvider(
  10,
  process.env.OPTIMISM_API_KEY
)
const arbitrumProvider = new ethers.AlchemyProvider(
  42161,
  process.env.ARBITRUM_API_KEY
)

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=arbitrum&vs_currencies=usd&precision=6'

// contracts for USDC and ARB
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20, optimismProvider)
const arb = new ethers.Contract(ARB_ADDRESS, ERC20, arbitrumProvider)

// wallet for sending ARB
const wallet = new ethers.Wallet(process.env.PVT_KEY ?? '', arbitrumProvider)

// function to process the event
async function processEvent (event: ContractEventPayload): Promise<void> {
  try {
    // extracts the sender and the amount received from the event
    const sender = event.args[0]
    const amountReceived = BigInt(event.args[2] as number)

    // fetches current price of ARB on coingecko upto 6 decimal places
    const arbPrice = await axios.get(COINGECKO_URL)

    // calculates the equivalent amount of ARB to send to the sender
    const { arbAmount, fee } = calculateAmount(
      amountReceived,
      arbPrice.data.arbitrum.usd as number
    )

    // send the equivalent amount of ARB to the sender
    const tx = await wallet.sendTransaction({
      to: ARB_ADDRESS,
      value: BigInt(0),
      data: arb.interface.encodeFunctionData('transfer', [sender, arbAmount])
    })
    // wait for the transaction to be confirmed
    await tx.wait()
    // fetch the transaction receipt
    const receipt = await arbitrumProvider.getTransactionReceipt(tx.hash)
    Logging.info(`${receipt?.hash}, confirmed`)
    // insert the transaction details into the database
    await insertTransaction({
      sender,
      usdcReceived: amountReceived,
      arbAmount,
      arbPrice: arbPrice.data.arbitrum.usd,
      fee,
      incomingTransactionHash: event.log.transactionHash,
      outgoingTransactionHash: receipt?.hash ?? ''
    })
    Logging.info('Data inserted into the database')
  } catch (error) {
    Logging.error(error)
  } finally {
    // after processing the event, release the mutex lock
    isProcessing = false
    // process the next event in the queue if any
    if (eventQueue.length > 0) {
      // acquire the mutex lock
      isProcessing = true
      // extract the first event from the queue
      const nextEvent = eventQueue.shift()
      // if the event is valid, process it, else release the lock
      nextEvent !== undefined
        ? await processEvent(nextEvent)
        : (isProcessing = false)
    }
  }
}

// listening to only Transfer events returns the receiver address only
// so we listen to all events and filter out the Transfer events
usdc
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .on('*', async (event: ContractEventName) => {
    // here we check if the event is a Transfer event and the receiver is the listener address
    if (
      event instanceof ContractEventPayload &&
      event.fragment.name === 'Transfer' &&
      event.args[1] === LISTENER_ADDRESS
    ) {
      // if the event is valid, add it to the queue
      eventQueue.push(event)
      Logging.warn('Event added to the queue')
      // If not processing any event, start processing
      if (!isProcessing) {
        // before processing the event, acquire the mutex lock
        isProcessing = true
        // extract the first event from the queue
        const nextEvent = eventQueue.shift()
        // if the event is valid, process it, else release the lock
        nextEvent !== undefined
          ? await processEvent(nextEvent)
          : (isProcessing = false)
      }
    }
  })
  .catch(Logging.error)
