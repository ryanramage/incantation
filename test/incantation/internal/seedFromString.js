const test = require('tape')
const seedFromString = require('../../../incantation/internal/seedFromString')

test('two different modules have a different seed', t => {
  const name1 = `1bsdaf-3232-32dff-32|smolserve@1.0.0`
  const name2 = `1bsdaf-3232-32dff-32|smolserve@1.0.1`
  console.log(name1.length)
  const seed1 = seedFromString(name1)
  const seed2 = seedFromString(name2)

  t.notEquals(seed1, seed2)
  t.equals(seed1.length, 32)
  t.equals(seed2.length, 32)
  t.end()
})
