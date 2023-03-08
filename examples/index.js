const PM2 = require('../pm2')
const IncantationManage = require('../incantation/incantationManager')
const NodeProjectRune = require('../rune/nodeProjectRune')
const { Service, KeyPair } = require('hyperseaport')

async function run () {
  const pm2 = await PM2()
  const rune1 = NodeProjectRune(__dirname + '/smolserver/1.0.1', './index.js')
  const rune2 = NodeProjectRune(__dirname + '/smolserver/1.0.2', './index.js')


  const instanceUUID = '1bsdaf-3232-32dff-32'
  const registryPublicKey = '5f8f4587d2a3640c7b7b55e03c77a9bfef4e3aa582ccdd25b6202995a7db15dd'

  const incantationManager = IncantationManage(Service, KeyPair, instanceUUID, registryPublicKey, pm2)
  const incantation1 = await incantationManager.start(rune1)

  setTimeout(async () => {
    //const incantation2 = await incantationManager.start(rune2)
    const list = await incantationManager.list()
    pm2.disconnect()
  }, 5000)
}

run()
