const price = require('./price')

test('it specifies the correct cooldown value', () => {
  expect(price.cooldown).toBe(5)
})

test('it appends an empty string to the output when there are no previous values', () => {
  const result = price.calculateDifferenceString('bitcoin', 15358.45, {})

  expect(result).toBe('')
})

test('it appends the correct change in value when the price increases', () => {
  const result = price.calculateDifferenceString('bitcoin', 15358.45, {
    bitcoin: 14287.89
  })

  expect(result).toBe(' (+1070.56)')
})

test('it appends the correct change in value when the price decreases', () => {
  const result = price.calculateDifferenceString('bitcoin', 15358.45, {
    bitcoin: 17864.21
  })

  expect(result).toBe(' (-2505.76)')
})

test('it appends the correct change in value when the price stays the same', () => {
  const result = price.calculateDifferenceString('bitcoin', 15358.45, {
    bitcoin: 15358.45
  })

  expect(result).toBe(' (+0.00)')
})
