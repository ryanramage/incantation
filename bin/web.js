#!/usr/bin/env node
'use strict'
const rc = require('rc')
const Api = require('../index')
const PM2 = require('../pm2')
const { npmInstall, npmInstallNameOnly, npmInstallStatus, npmInstallLog } = require('../web/runeInstall')
const incantation = require('../web/incantation')
const seedFromString = require('../incantation/internal/seedFromString')
const Hapi = require('@hapi/hapi')
const { KeyPair, Service } = require('hyperseaport')
const HyperDHT = require('@hyperswarm/dht')
const dataDir = require('hyperseaport/lib/dataDir')
const randomBytes = require('hyperseaport/lib/randomBytes')
const options = rc('incantation', {
  PORT: 3000,
  host: 'localhost',
  baseDir: dataDir('incantation'),
  instanceUUID: randomBytes(32).toString('hex')
})
const _package = require('../package.json')

console.log(options)
if (!options.registryPublicKey) {
  console.log('ERROR: no registryPublicKey provided')
  help()
  process.exit(1)
}

const init = async () => {
  const dht = new HyperDHT()
  const seed = seedFromString(options.instanceUUID)
  const keyPair = KeyPair({ seed })
  const role = `${_package.name}@${_package.version}`
  const service = Service({ registryPublicKey: options.registryPublicKey, role, port: options.PORT, keyPair, dht })

  await service.setup()
  const pm2 = await PM2()
  const api = Api(Service, KeyPair, options.baseDir, options.instanceUUID, options.registryPublicKey, pm2, dht)
  const server = Hapi.server({
    port: options.PORT,
    host: options.host
  })
  server.route(npmInstall(options.baseDir, api))
  server.route(npmInstallNameOnly(options.baseDir, api))
  server.route(npmInstallStatus())
  server.route(npmInstallLog(options.baseDir))
  server.route(incantation.run(api))
  server.route(incantation.list(api))
  server.route(incantation.stop(api))
  server.route(incantation.restart(api))
  server.route(incantation.remove(api))
  server.route(incantation.stdout(api))
  server.route(incantation.stderr(api))

  server.route({
    path: '/rune/list',
    method: 'GET',
    handler: async (req, res) => api.rune.list()
  })
  server.route({
    path: '/',
    method: 'GET',
    handler: () => ({
      name: 'incantation',
      instanceUUID: options.instanceUUID,
      servicePublicKey: keyPair.publicKey.toString('hex'),
      version: _package.version
    })
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)

  process.once('SIGINT', function () {
    console.log('shutting down....')
    service.destroy()
    dht.destroy()
    process.exit()
  })
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()

function help () {
  console.log(`USAGE:
incantation --registryPublicKey 5b64a8956d8f2404c4f4b4e6f402ef439f610f7fe297718093641359130b0d45

`)
}
