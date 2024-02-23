const calculateOnePercent = (
  _amount: bigint
): {
  amount: bigint
  fee: bigint
} => {
  // taking 1% as fee, i.e. 99% of the amount received is sent to the sender
  const amount = (_amount * BigInt(99)) / BigInt(100)
  const fee = _amount - amount

  return { amount, fee }
}

export default calculateOnePercent
