const test = require('tape')
const Micromanagement = require('../index')
const PM2 = require('../pm2')

test('full lifecycle', async t => {
  const instanceUUID = '12341234'
  const registryPublicKey = 'aaaaabbbbbcccc'
  const baseDir = '/tmp/micromanagement'

  const ServiceMock = () => ({ setup: async () => 1, destroy: async () => {
    console.log('destroy')
  } })
  const KeyPairMock = () => ({})
  const pm2 = await PM2()
  const micromanagement = Micromanagement(ServiceMock, KeyPairMock, baseDir, instanceUUID, registryPublicKey, pm2) 
  const rune = await micromanagement.install({
    type: 'npm',
    spec: 'code-music-studio'
  })
  const incantation = await micromanagement.start(rune)
  await micromanagement.stop(incantation)
  await pm2.disconnect()
  t.end()
}) 
