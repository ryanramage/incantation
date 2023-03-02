const getports = require('getports')
const createPM2Opts = require('./internal/createPM2Opts')

const start = async (Service, KeyPair, instanceUUID, registryPublicKey, pm2, rune, args, environment, processOptions) => {
  // load rune
  const { role, version } = rune.getRole()
  const name = `${role}@${version}`

  const { script, cwd, portEnvironmentVariable } = rune.getRuntime()

  // create a json entry for the pm2 process
  const port = await getPort()
  const portInfo = { portEnvironmentVariable, port }
  console.log('starting', name, 'on port', portInfo)
  const options = createPM2Opts(name, script, cwd, portInfo, { args, environment, processOptions })
  const info = await pm2Start(pm2, options)
  console.log('info', info)

  // start a p2p port
  const seed = `${instanceUUID}|${name}`
  const keyPair = KeyPair({ seed })
  const service = Service({ registryPublicKey, name, port, keyPair })
  await service.setup()

  return { name }
}

module.exports = (Service, KeyPair, instanceUUID, registryPublicKey, pm2) => {
  return {
    start: (rune, args, environment, processOptions) => start(Service, KeyPair, instanceUUID, registryPublicKey, pm2, rune, args, environment, processOptions)
  }
}

function getPort () {
  return new Promise((resolve, reject) => {
    getports(1, (err, [port]) => {
      if (err) return reject(err)
      resolve(port)
    })
  })
}

function pm2Start (pm2, options) {
  return new Promise((resolve, reject) => {
    pm2.start(options, (err, apps) => {
      if (err) return reject(err)
      resolve(apps)
    })
  })
}
