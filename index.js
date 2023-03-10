const RuneManager = require('./rune/runeManager')
const IncantationManager = require('./incantation/incantationManager.js')

module.exports = (Service, KeyPair, baseDir, instanceUUID, registryPublicKey, pm2) => {
  const runeManager = RuneManager(baseDir)
  const incantationManager = IncantationManager(Service, KeyPair, instanceUUID, registryPublicKey, pm2)

  const destroy = () => {
    // go through all the incantationManager and destroy
  }

  return {
    // rune methods
    install: runeManager.install,
    list: runeManager.list,
    remove: runeManager.remove,
    // incantationManager methods
    start: incantationManager.start,
    stop: incantationManager.stop,
    listRunning: incantationManager.list,
    destroy: destroy
  }
}


