const pacote = require('pacote')
const npminstall = require('npminstall')
const makeDir = require('make-dir')
const path = require('path')
const NodeProjectRune = require('../nodeProjectRune')

module.exports = async (baseDir, spec, options) => {
  const installPath = path.resolve(baseDir, spec)
  const installDir = await makeDir(installPath)
  const details = await pacote.extract(spec, installDir, options)
  await npminstall({ root: installDir})

  const rune = await NodeProjectRune(installDir)
  return rune
}
