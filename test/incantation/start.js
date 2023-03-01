const test = require('tape')
const Start = require('../../incantation/start')

test('start a rune with no info, using mocked services', t => {
  const instanceUUID = '12341234'
  const registryPublicKey = 'aaaaabbbbbcccc'

  const rune = {
    getRole: () => ({ role: 'happy', version: '1.2.2' }),
    getRuntime: () => ({ script: '/usr/local/bin/happy', cwd: '/usr/local/data/happy' })
  }

  const ServiceMock = (info) => {
    t.equals(info.registryPublicKey, registryPublicKey)
    t.equals(info.name, `${rune.getRole().role}@${rune.getRole().version}`)
    t.ok(info.port)
    return { setup: async () => 1 }
  }
  const KeyPairMock = ({ seed }) => {
    t.equals(seed, `${instanceUUID}|${rune.getRole().role}@${rune.getRole().version}`)
    return {}
  }
  const PM2Mock = {
    start: (options, cb) => {
      t.equals(options.name, `${rune.getRole().role}@${rune.getRole().version}`)
      t.equals(options.script, rune.getRuntime().script)
      t.equals(options.cwd, rune.getRuntime().cwd)
      cb()
    }
  }

  const incantation = Start(ServiceMock, KeyPairMock, instanceUUID, registryPublicKey, PM2Mock)

  incantation.start(rune).then(() => {
    t.end()
  })
})
