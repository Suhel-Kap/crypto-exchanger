import calculateAmount from '../helper/calculateAmount'

describe('calculateAmount', () => {
  // Mock the API response for arbPrice
  const mockArbPrice = 2.0 // 2 USDC

  test('calculates converted arbAmount', () => {
    // Mock the input amount
    const amount = 1000000n // 1 USDC
    // Expected arbAmount calculated manually (using the same calculation logic as in the function)
    const expectedArbAmount = 495000000000000000n // 0.495 ARB
    // Expected fee calculated manually (using the same calculation logic as in the function)
    const expectedFee = 10000n // 0.01 USDC

    // Call the function with the mock data
    const result = calculateAmount(amount, mockArbPrice)

    // Assert that the function returns the expected result
    expect(result.arbAmount).toEqual(expectedArbAmount)
    expect(result.fee).toEqual(expectedFee)
  })
})
