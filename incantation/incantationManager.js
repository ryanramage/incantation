const Boom = require('@hapi/boom')
const Start = require('./start')
const Stop = require('./stop')

module.exports = (Service, Keypair, instanceUUID, registryPublicKey, pm2) => {
  const incantations = {}

  const _start = Start(Service, Keypair, instanceUUID, registryPublicKey, pm2)
  const _stop = Stop(pm2)

  const start = async (rune, args, environment, processOptions) => {
    const incantation = await _start(rune, args, environment, processOptions)
    incantations[incantation.name] = incantation
    return incantation
  }

  const stop = async (name) => {
    if (typeof name === 'object') name = name.name // be nice

    const incantation = incantations[name]
    if (!incantation) throw Boom.notFound(`incantation ${name} not running`)
    await _stop(incantation)
  }

  const list = async () => new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) return reject(err)
      const running = list.map(process => {
        let incantation = incantations[process.name]
        if (!incantation) {
          // we dont have any info about this, we did not start it?
          incantation = {}
        }
        incantation.process = process
        return incantation
      })
      resolve(running)
    })
  })

  return {
    start, stop, list
  }
}
