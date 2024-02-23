import { z } from 'zod'

// Define the schema for the user
// The username should be a string with a minimum length of 5
// The password should be a string with a minimum length of 8
export const UserSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8)
})

// Define the typescript type for the user
export type User = z.infer<typeof UserSchema>

// Define the schema for the transaction
// The sender should be a string with a length of 42
// The usdcReceived should be a bigint
// The arbAmount should be a bigint
// The arbPrice should be a number
// The fee should be a bigint
// The incomingTransactionHash should be a string with a length of 66
// The outgoingTransactionHash should be a string with a length of 66
export const TransactionSchema = z.object({
  sender: z.string().length(42),
  usdcReceived: z.bigint(),
  arbAmount: z.bigint(),
  arbPrice: z.number(),
  fee: z.bigint(),
  incomingTransactionHash: z.string().length(66),
  outgoingTransactionHash: z.string().length(66)
})

// Define the typescript type for the transaction
export type Transaction = z.infer<typeof TransactionSchema>
