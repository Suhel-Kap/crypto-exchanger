import calculateOnePercent from '../helper/calculateOnePercent'

function generateTestData (
  start: number,
  end: number,
  step: number
): bigint[][] {
  const testData = []
  for (let i = start; i <= end; i += step) {
    testData.push([
      BigInt(i),
      BigInt(Math.floor(i * 0.99)),
      BigInt(i - Math.floor(i * 0.99))
    ])
  }
  return testData
}

const testData = generateTestData(0, 1000000, 1000)

// Define the test using test.each
test.each(testData)(
  'calculateOnePercent correctly reduces input by 1 percent: %s => %s',
  (input, expectedArbAmount, expectedFee) => {
    const result = calculateOnePercent(input)
    expect(result.amount).toBe(expectedArbAmount)
    expect(result.fee).toBe(expectedFee)
  }
)
