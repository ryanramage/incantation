const RuneManager = require('./rune/runeManager')
const IncantationManager = require('./incantation/incantationManager.js')

module.exports = (Service, KeyPair, baseDir, instanceUUID, registryPublicKey, pm2, dht) => {
  const runeManager = RuneManager(baseDir)
  const incantationManager = IncantationManager(Service, KeyPair, instanceUUID, registryPublicKey, pm2, dht)

  const destroy = () => {
    // go through all the incantationManager and destroy
  }

  const rune = {
    install: runeManager.install,
    list: runeManager.list,
    remove: runeManager.remove,
    get: runeManager.getRune
  }

  const incantation = {
    start: incantationManager.start,
    stop: incantationManager.stop,
    list: incantationManager.list,
    restart: incantationManager.restart,
    remove: incantationManager.remove,
    stdout: incantationManager.stdout,
    stderr: incantationManager.stderr
  }

  return {
    rune,
    incantation,
    destroy
  }
}
