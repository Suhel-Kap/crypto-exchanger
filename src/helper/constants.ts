import { ethers } from 'ethers'
import ERC20 from './abi/ERC20.abi.json'

/**
 * @notice - This is a list of addresses for the token contracts and the listener address
 */

// export const USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
// export const ARB_ADDRESS = '0x912CE59144191C1204E64559FE8253a0e49E6548'
export const USDC_ADDRESS = '0x999A3E42B39bEfe805127EE1cd80F6339255887F' // usdc on polygon mumbai
export const ARB_ADDRESS = '0x32a5533fDc651F4250F9a1884380aA840e3A157E' // arb on optimism sepollia
export const LISTENER_ADDRESS = '0x123c058C58102a4eE0E24a3c7F0Cee2590e1c0f4'

// genesis block of this application on optimism
// we will only process events after this block as this was when the application was deployed
export const GENESIS = 46286944

// providers for the two networks
// const optimismProvider = new ethers.AlchemyProvider(
//   10,
//   process.env.OPTIMISM_API_KEY
// )
// const arbitrumProvider = new ethers.AlchemyProvider(
//   42161,
//   process.env.ARBITRUM_API_KEY
// )
export const MUMBAI_PROVIDER = new ethers.AlchemyProvider(
  80001,
  process.env.MUMBAI_API_KEY
)
export const OPTIMISM_SPL_PROVIDER = new ethers.AlchemyProvider(
  11155420,
  process.env.OPTIMISM_SEPOLLIA_API_KEY
)

export const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=arbitrum&vs_currencies=usd&precision=6'

// contracts for USDC and ARB
export const USDC_CONTRACT = new ethers.Contract(
  USDC_ADDRESS,
  ERC20,
  MUMBAI_PROVIDER
)
export const ARB_CONTRACT = new ethers.Contract(
  ARB_ADDRESS,
  ERC20,
  OPTIMISM_SPL_PROVIDER
)

// interface for USDC, this is used to parse the logs
export const USDC_INTERFACE = new ethers.Interface(ERC20)

// wallet for sending ARB
export const WALLET = new ethers.Wallet(
  process.env.PVT_KEY ?? '',
  OPTIMISM_SPL_PROVIDER
)
