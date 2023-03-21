const fs = require('node:fs/promises')
const path = require('path')
const makeDir = require('make-dir')
const pacote = require('pacote')
const npminstall = require('npminstall')
const NodeProjectRune = require('../nodeProjectRune')

const writeRuneStatusFile = async (installDir, runeStatus) => {
  const runeStatusFilePath = path.resolve(installDir, '.rune')
  await fs.writeFile(runeStatusFilePath, JSON.stringify(runeStatus))
}

module.exports = async (typeDir, spec, { fileConsole, installId, started, ...options }) => {
  const runeStatus = {
    installId,
    started
  }
  let installDir = null
  try {
    const manifest = await pacote.manifest(spec, options)
    const fullSpec = `${manifest.name}@${manifest.version}`
    installDir = path.resolve(typeDir, fullSpec)
    await makeDir(installDir)
    await pacote.extract(spec, installDir, options)
    await npminstall({
      root: installDir,
      console: fileConsole,
      detail: true,
      production: options.production || true
    })
    await NodeProjectRune(installDir)
  } catch (e) {
    runeStatus.status = 'failed'
    runeStatus.exception = e
  } finally {
    if (installDir) {
      if (runeStatus.status !== 'failed') runeStatus.status = 'success'
      runeStatus.finished = Date.now()
      await writeRuneStatusFile(installDir, runeStatus)
    }
    // we know what we are doing, right?
    return runeStatus // eslint-disable-line 
  }
}
