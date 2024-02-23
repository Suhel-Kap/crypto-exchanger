import { ethers } from 'ethers'
import calculateOnePercent from './calculateOnePercent'
import Logging from '../library/Logging'

const calculateAmount = (
  _amount: bigint,
  arbPrice: number
): {
  fee: bigint
  arbAmount: bigint
} => {
  Logging.warn(`Received ${ethers.formatUnits(_amount.toString(), 6)} USDC`)
  const { amount, fee } = calculateOnePercent(_amount)
  Logging.warn(
    `After 1% fee deduction ${ethers.formatUnits(amount.toString(), 6)} USDC`
  )

  // converts the fetched amount to BigInt and removes the decimal place by multiplying by 1e6
  // we do Math.floor to ensure that the value is rounded down to the nearest integer, as BigInt does not support decimals
  const usdArbPrice = BigInt(Math.floor(arbPrice * 1e6))

  // amount and usdArbPrice both have the same 6 decimal places, so dividing them
  // traditionally should give an answer in decimals, but since they are both BigInts and we want the answer in wei
  // multiplying by 1e18 gives the answer in wei
  // example:
  // input is 1000000n (1 USDC)
  // arbPrice is 1.936062 received from API, so we convert it to 1936062n
  // in normal arithmetic, 1000000 / 1936062 = 0.5166
  // but in BigInt arithmetic, since there are no decimals
  // (1000000n * 1e18) / 1936062n = 516512384417441176n
  // which is equivalent to 0.5165 ARB in wei
  const arbAmount = (amount * BigInt(1e18)) / usdArbPrice
  Logging.warn(`Equivalent to ${ethers.formatEther(arbAmount)} ARB on Arbitrum`)

  return { arbAmount, fee }
}

export default calculateAmount
