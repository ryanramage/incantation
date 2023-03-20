const pacote = require('pacote')
const npminstall = require('npminstall')
const NodeProjectRune = require('../nodeProjectRune')

module.exports = async (installDir, spec, { fileConsole, ...options }) => {
  await pacote.extract(spec, installDir, options)
  await npminstall({
    root: installDir,
    console: fileConsole,
    detail: true,
    production: options.production || true
  })
  return await NodeProjectRune(installDir)
}
