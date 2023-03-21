const Boom = require('@hapi/boom')
const Start = require('./start')
const Stop = require('./stop')
const seedFromString = require('./internal/seedFromString')

module.exports = (Service, KeyPair, instanceUUID, registryPublicKey, pm2) => {
  const incantations = {}

  const _start = Start(Service, KeyPair, instanceUUID, registryPublicKey, pm2)
  const _stop = Stop(pm2)

  const start = async (rune, args, environment, processOptions) => {
    const incantation = await _start(rune, args, environment, processOptions)
    incantations[incantation.name] = incantation
    return incantation
  }

  const stop = async (name) => {
    if (typeof name === 'object') name = name.name // be nice

    const incantation = incantations[name]
    if (incantation) await _stop(incantation)
    else await _stop({ name })
    incantations[name] = null
  }

  const pm2list = () => new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) return reject(err)
      resolve(list)
    })
  })

  const pm2restart = (name) => new Promise((resolve, reject) => {
    pm2.restart(name, (err, process) => {
      if (err) return reject(err)
      console.log('resolve', process)
      resolve(process)
    })
  })

  const list = async () => {
    const list = await pm2list()
    const running = list.map(process => {
      let incantation = incantations[process.name]
      if (!incantation) {
        // we dont have any info about this, we did not start it?
        incantation = {
          name: process.name
        }
      }
      incantation.process = process
      return incantation
    })
    return running
  }

  const restart = async (name) => {
    if (typeof name === 'object') name = name.name // be nice
    let incantation = incantations[name]
    if (incantation) return incantation
    const list = await pm2list()
    const process = list.find(p => p.name === name)
    if (!process) return Boom.notFound(`process ${name} not found`)

    const newList = await pm2restart(name)
    const restartedProcess = newList.find(p => p.name === name)

    // find the port
    const port = restartedProcess.pm2_env.env.PORT
    const portInfo = { portEnvironmentVariable: 'PORT', port }

    // start a p2p port
    const seed = seedFromString(`${instanceUUID}|${name}`)
    console.log('starting', name, 'seed', seed.toString('hex'), 'on port', portInfo)
    const keyPair = KeyPair({ seed })
    const service = Service({ registryPublicKey, role: name, port, keyPair })
    await service.setup()

    incantation = {
      name,
      port,
      publicKey: keyPair.publicKey.toString('hex'),
      service,
      process: restartedProcess.pm2_env
    }

    incantations[name] = incantation
    return incantation
  }

  return {
    start, stop, list, restart
  }
}
