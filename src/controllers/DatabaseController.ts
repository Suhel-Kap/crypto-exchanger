import type { NextFunction, Request, Response } from 'express'
import {
  fetchAverageArbPrice,
  fetchAverageFeeCollected,
  fetchHighestArbTokenPrice,
  fetchLowestUsdcTransactions,
  fetchTop5Transactions,
  fetchTop5TransactionsBySender,
  fetchTopSendersByTotalUsdcReceived,
  fetchTotalFeeCollected,
  fetchTotalFeeCollectedByUser,
  fetchTotalFeeCollectedByUserOnDate,
  fetchTotalFeeCollectedOnDate,
  fetchTotalTransactionsCount,
  fetchTotalTransactionsCountByUser,
  fetchTotalUsdcAndArbBySender,
  fetchTransactionByIncomingHash,
  fetchTransactionByOutgoingHash,
  fetchTransactions,
  fetchTransactionsByDateRange,
  fetchTransactionsBySender,
  fetchTransactionsByUsdcThreshold
} from '../database'
import Logging from '../library/Logging'
import 'dotenv/config'
import { ethers } from 'ethers'
import { DatabaseError } from 'pg'

/**
 * All functions in this file are used to handle the incoming requests
 * make the query to database and send the response back to the user.
 */

// This function is used to fetch all the transactions from the database
const readAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    const transactions = await fetchTransactions()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    Logging.error(e.code)
    Logging.error(e.detail)
    Logging.error(e.message)
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch top 5 transactions from the database
// If the user has passed the sender address, we fetch top 5 transactions for that address
const top5Transactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // We check if the user has passed any query parameters
    if (Object.keys(req.query).length > 0) {
      // we extract the sender address from the query parameters
      const { sender } = req.query
      // we check if the address is valid, if not we send a 400 response
      if (!ethers.isAddress(sender)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid address' })
      }
      // if the address is valid, we fetch top 5 transactions for that address
      const transactions = await fetchTop5TransactionsBySender(sender)
      return res.status(200).json({ success: true, data: transactions })
    }
    const transactions = await fetchTop5Transactions()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the lowest usdc transactions from the database
const lowestUsdcTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    const transactions = await fetchLowestUsdcTransactions()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the highest arb token price from the database
const highestArbTokenPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    const transactions = await fetchHighestArbTokenPrice()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch transactions by sender address
const transactionBySender = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the sender address from the query parameters
    const { sender } = req.query
    // we check if the address is valid, if not we send a 400 response
    if (!ethers.isAddress(sender)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid address' })
    }
    // if the address is valid, we fetch transactions for that address
    const transactions = await fetchTransactionsBySender(sender)
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch transactions by outgoing hash
const transactionsByOutgoingHash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the outgoing hash from the query parameters
    const { outgoingHash } = req.query
    // we check if the hash is valid, if not we send a 400 response
    if (!ethers.isHexString(outgoingHash)) {
      return res.status(400).json({ success: false, message: 'Invalid hash' })
    }
    // if the hash is valid, we fetch transactions for that hash
    const transactions = await fetchTransactionByOutgoingHash(outgoingHash)
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch transactions by incoming hash
const transactionByIncomingHash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the incoming hash from the query parameters
    const { incomingHash } = req.query
    // we check if the hash is valid, if not we send a 400 response
    if (!ethers.isHexString(incomingHash)) {
      return res.status(400).json({ success: false, message: 'Invalid hash' })
    }
    // if the hash is valid, we fetch transactions for that hash
    const transactions = await fetchTransactionByIncomingHash(incomingHash)
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch transactions by usdc threshold
const transactionsByUsdcThreshold = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the threshold from the query parameters
    const { threshold } = req.query
    // we check if the threshold is a number, if not we send a 400 response
    if (isNaN(Number(threshold))) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid threshold' })
    }
    // if the threshold is valid, we fetch transactions for that threshold
    const transactions = await fetchTransactionsByUsdcThreshold(
      Number(threshold)
    )
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch transactions by date range
const transactionsByDataRange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the start and end date from the query parameters
    const { start, end } = req.query
    // we check if the dates are valid, if not we send a 400 response
    if (
      isNaN(Date.parse(start as string)) ||
      isNaN(Date.parse(end as string))
    ) {
      return res.status(400).json({ success: false, message: 'Invalid date' })
    }
    // end date should be greater than start date, else a 400 response is sent
    if (new Date(end as string) < new Date(start as string)) {
      return res.status(400).json({
        success: false,
        message: 'End date should be greater than start date'
      })
    }
    // if the dates are valid, we fetch transactions for that date range
    const transactions = await fetchTransactionsByDateRange(
      new Date(start as string),
      new Date(end as string)
    )
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the sum of usdc and arb by sender
const sumOfUsdcAndArbBySender = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the sender address from the query parameters
    const { sender } = req.query
    // we check if the address is valid, if not we send a 400 response
    if (!ethers.isAddress(sender)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid address' })
    }
    // if the address is valid, we fetch the sum of usdc and arb for that address
    const transactions = await fetchTotalUsdcAndArbBySender(sender)
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the total transaction count
// optionally, we can fetch the total transaction count for a specific sender
const getTransactionCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we check if the user has passed any query parameters
    if (Object.keys(req.query).length > 0) {
      // we first extract the sender address from the query parameters
      const { sender } = req.query
      // we check if the address is valid, if not we send a 400 response
      if (!ethers.isAddress(sender)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid address' })
      }
      // if the address is valid, we fetch the total transaction count for that address
      const transactions = await fetchTotalTransactionsCountByUser(sender)
      return res.status(200).json({ success: true, data: transactions })
    }
    // if the user has not passed any query parameters, we fetch the total transaction count
    const transactions = await fetchTotalTransactionsCount()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the total fee collected
// optionally, we can fetch the total fee collected for a specific sender and/or date
const getTotalFeeCollected = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we check if the user has passed any query parameters
    const length = Object.keys(req.query).length
    // if yes, we act accordingly
    if (length > 0) {
      // if length is 1, we check if the user has passed just date or sender and we act accordingly
      if (length === 1 && req.query.sender !== undefined) {
        const { sender } = req.query
        if (!ethers.isAddress(sender)) {
          return res
            .status(400)
            .json({ success: false, message: 'Invalid address' })
        }
        const transactions = await fetchTotalFeeCollectedByUser(sender)
        return res.status(200).json({ success: true, data: transactions })
      }
      if (length === 1 && req.query.date !== undefined) {
        const { date } = req.query
        if (isNaN(Date.parse(date as string))) {
          return res
            .status(400)
            .json({ success: false, message: 'Invalid date' })
        }
        const transactions = await fetchTotalFeeCollectedOnDate(
          new Date(date as string)
        )
        return res.status(200).json({ success: true, data: transactions })
      }
      // if length is 2, we check if user has passed both date and sender and we act accordingly
      if (
        length === 2 &&
        req.query.sender !== undefined &&
        req.query.date !== undefined
      ) {
        const { sender, date } = req.query
        if (!ethers.isAddress(sender)) {
          return res
            .status(400)
            .json({ success: false, message: 'Invalid address' })
        }
        if (isNaN(Date.parse(date as string))) {
          return res
            .status(400)
            .json({ success: false, message: 'Invalid date' })
        }
        const transactions = await fetchTotalFeeCollectedByUserOnDate(
          sender,
          new Date(date as string)
        )
        return res.status(200).json({ success: true, data: transactions })
      }
    }
    // if the user has not passed any query parameters, we fetch the total fee collected
    const transactions = await fetchTotalFeeCollected()
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the average arb price
const averageArbPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    const average = await fetchAverageArbPrice()
    return res.status(200).json({ success: true, data: average })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the average fee collected
const averageFeeCollected = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    const average = await fetchAverageFeeCollected()
    return res.status(200).json({ success: true, data: average })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

// This function is used to fetch the top usdc senders
const topUsdcSenders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // we extract the limit from the query parameters
    const { limit } = req.params
    // we check if the limit is a number, if not we send a 400 response
    if (isNaN(Number(limit))) {
      return res.status(400).json({ success: false, message: 'Invalid limit' })
    }
    const transactions = await fetchTopSendersByTotalUsdcReceived(Number(limit))
    return res.status(200).json({ success: true, data: transactions })
  } catch (e: any) {
    // we check if the error is an instance of DatabaseError
    // if it is, we log the error code, detail and message
    // if it is not, we log the error
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
    } else {
      Logging.error(e)
    }
    return res.status(500).json({ success: false, message: e.detail })
  }
}

export default {
  readAllTransactions,
  top5Transactions,
  lowestUsdcTransaction,
  highestArbTokenPrice,
  transactionBySender,
  transactionsByOutgoingHash,
  transactionByIncomingHash,
  transactionsByUsdcThreshold,
  transactionsByDataRange,
  sumOfUsdcAndArbBySender,
  getTransactionCount,
  getTotalFeeCollected,
  averageArbPrice,
  averageFeeCollected,
  topUsdcSenders
}
