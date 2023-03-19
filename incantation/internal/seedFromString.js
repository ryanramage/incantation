const { createHash } = require('crypto')

module.exports = (str) => {
  const hash = createHash('sha256')
  return hash.update(str).digest()
}
