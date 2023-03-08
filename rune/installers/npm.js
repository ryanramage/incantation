const pacote = require('pacote')
const npminstall = require('npminstall')
const NodeProjectRune = require('../nodeProjectRune')

module.exports = async (installDir, spec, options) => {
  await pacote.extract(spec, installDir, options)
  await npminstall({ root: installDir})
  return await NodeProjectRune(installDir)
}
