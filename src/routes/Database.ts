import express from 'express'
import DatabaseController from '../controllers/DatabaseController'

const router = express.Router()

router.get('/all', DatabaseController.readAllTransactions)
router.get('/top5', DatabaseController.top5Transactions)
router.get('/lowest', DatabaseController.lowestUsdcTransaction)
router.get('/highestArbPrice', DatabaseController.highestArbTokenPrice)
router.get('/bySender', DatabaseController.transactionBySender)
router.get('/byOutgoingHash', DatabaseController.transactionsByOutgoingHash)
router.get('/byIncomingHash', DatabaseController.transactionByIncomingHash)
router.get('/byUsdcThreshold', DatabaseController.transactionsByUsdcThreshold)
router.get('/byDateRange', DatabaseController.transactionsByDataRange)
router.get('/bySenderSum', DatabaseController.sumOfUsdcAndArbBySender)
router.get('/transactionCount', DatabaseController.getTransactionCount)
router.get('/feeCollected', DatabaseController.getTotalFeeCollected)
router.get('/average/arb', DatabaseController.averageArbPrice)
router.get('/average/fee', DatabaseController.averageFeeCollected)
router.get('/topSenders/:limit', DatabaseController.topUsdcSenders)

export default router
