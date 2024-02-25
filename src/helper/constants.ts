import { ethers } from 'ethers'
import ERC20 from './abi/ERC20.abi.json'

/**
 * @notice - This is a list of addresses for the token contracts and the listener address
 */

export const USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
export const ARB_ADDRESS = '0x912CE59144191C1204E64559FE8253a0e49E6548'
export const LISTENER_ADDRESS = '0x123c058C58102a4eE0E24a3c7F0Cee2590e1c0f4'
export const LISTENER_ADDRESS_TOPIC =
  '0x000000000000000000000000123c058c58102a4ee0e24a3c7f0cee2590e1c0f4'

// genesis block of this application on optimism
// we will only process events after this block as this was when the application was deployed
export const GENESIS = 116103990

export const OPTIMISM_PROVIDER = new ethers.AlchemyProvider(
  10,
  process.env.OPTIMISM_API_KEY
)
export const ARBITRUM_PROVIDER = new ethers.AlchemyProvider(
  42161,
  process.env.ARBITRUM_API_KEY
)

export const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=arbitrum&vs_currencies=usd&precision=6'

// contracts for USDC and ARB
export const USDC_CONTRACT = new ethers.Contract(
  USDC_ADDRESS,
  ERC20,
  OPTIMISM_PROVIDER
)
export const ARB_CONTRACT = new ethers.Contract(
  ARB_ADDRESS,
  ERC20,
  ARBITRUM_PROVIDER
)

// interface for USDC, this is used to parse the logs
export const USDC_INTERFACE = new ethers.Interface(ERC20)

// wallet for sending ARB
export const WALLET = new ethers.Wallet(
  process.env.PVT_KEY ?? '',
  ARBITRUM_PROVIDER
)
