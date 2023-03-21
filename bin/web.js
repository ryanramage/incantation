#!/usr/bin/env node
'use strict'
const rc = require('rc')
const Api = require('../index')
const PM2 = require('../pm2')
const { npmInstall, npmInstallNameOnly, npmInstallStatus, npmInstallLog } = require('../web/runeInstall')
const incantation = require('../web/incantation')
const Hapi = require('@hapi/hapi')
const { KeyPair, Service } = require('hyperseaport')
const dataDir = require('hyperseaport/lib/dataDir')
const randomBytes = require('hyperseaport/lib/randomBytes')
const options = rc('incantation', {
  port: 3000,
  host: 'localhost',
  baseDir: dataDir('incantation'),
  instanceUUID: randomBytes(32).toString('hex')
})

console.log(options)
if (!options.registryPublicKey) {
  console.log('ERROR: no registryPublicKey provided')
  help()
  process.exit(1)
}

const init = async () => {
  const pm2 = await PM2()
  const api = Api(Service, KeyPair, options.baseDir, options.instanceUUID, options.registryPublicKey, pm2)
  const server = Hapi.server({
    port: options.port,
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

  server.route({
    path: '/rune/list',
    method: 'GET',
    handler: async (req, res) => api.rune.list()
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
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
