const { createHash } = require('crypto')

const hash = createHash('md5')

module.exports = (str) => {
  const hash = createHash('sha256')
  return hash.update(str).digest()
}
