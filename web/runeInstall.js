const Joi = require('joi')
const Boom = require('@hapi/boom')
const randomBytes = require('hyperseaport/lib/randomBytes')
const path = require('path')
const fs = require('fs')
const { Console } = require('node:console')
const makeDir = require('make-dir')
const packageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
const packageVersionRegex = /[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/

const npmInstallOptions = Joi.object({
  integrity: Joi.string().optional().description('Expected integrity of fetched package tarball. If specified, tarballs with mismatched integrity values will raise an EINTEGRITY error'),
  registry: Joi.string().optional().description('The npm registry to use by default. Defaults to https://registry.npmjs.org/.'),
  _authToken: Joi.string().optional().description('Authentication token string'),
  username: Joi.string().optional().description('Username used for basic authentication. For the more modern authentication method, please use the (more secure) opts._authtoken'),
  password: Joi.string().optional().description('Password used for basic authentication. For the more modern authentication method, please use the (more secure) opts._authtoken')
}).optional()

// some web install improvements
// - only one install allowed at a time
// - early return from install post with an install id
// - method to query install status from install id. [Not Found, Running, Success, Failed]
// - method to get thg logs of the install from the install id

const installsByInstallId = {}
let currentInstallId = null
let currentLogFileStream = null
let currentLogConsole = null

process.on('log', (level, ...args) => {
  if (!currentLogConsole) return
  if (level === 'error') currentLogConsole.log(args)
  else currentLogConsole.error(args)
})

const startInstall = async (baseDir) => {
  if (currentInstallId) throw (Boom.conflict('can only install one rune at a time'))
  currentInstallId = randomBytes(32).toString('hex')
  installsByInstallId[currentInstallId] = {
    status: 'Running'
  }
  const logDir = await makeDir(path.resolve(baseDir, 'install-logs'))
  currentLogFileStream = fs.createWriteStream(path.resolve(logDir, `${currentInstallId}.log`))
  currentLogConsole = new Console({
    stdout: currentLogFileStream,
    stderr: currentLogFileStream 
  })
  return { fileConsole: currentLogConsole, installId: currentInstallId }
}

const afterInstall = (status, exception) => {
  installsByInstallId[currentInstallId] = {
    status,
    exception
  }
  currentLogConsole = null
  currentInstallId = null
  currentLogFileStream.end()
  currentLogFileStream = null
}

const npmInstallStatus = () => ({
  path: '/rune/install/status/{installId}',
  method: 'GET',
  options: {
    validate: {
      params: Joi.object({
        installId: Joi.string().description('the installId when the install request was made')
      })
    }
  },
  handler: async (req) => {
    const status = installsByInstallId[req.params.installId]
    if (!status) return Boom.notFound('installId not found')
    return status
  }
})
const npmInstallLog = (baseDir) => ({
  path: '/rune/install/status/{installId}/log',
  method: 'GET',
  options: {
    validate: {
      params: Joi.object({
        installId: Joi.string().description('the installId when the install request was made')
      }),
      query: Joi.object({
        start: Joi.number().optional().description('start byte offset')
      })
    }
  },
  handler: async (req) => {
    const installId = req.params.installId
    //const status = installsByInstallId[installId]
    //if (!status) return Boom.notFound('installId not found')

    const logPath = path.resolve(baseDir, 'install-logs', `${installId}.log`)
    const opts = {}
    if (req.query.start) opts.start = req.query.start

    return fs.createReadStream(logPath, opts)
  }
})

const npmInstallNameOnly = (baseDir, api) => ({
  path: '/rune/install/npm/{name}',
  method: 'POST',
  options: {
    validate: {
      params: Joi.object({
        name: Joi.string().pattern(packageNameRegex)
      }),
      payload: npmInstallOptions
    }
  },
  handler: async (req) => {
    const { fileConsole, installId } = await startInstall(baseDir)
    api.rune.install({
      type: 'npm',
      spec: `${req.params.name}`,
      options: req.payload,
      fileConsole
    }).then(() => afterInstall('Success')).catch(e => afterInstall('Failed', e))
    return { ok: true, status: 'Running', installId }
  }
})
const npmInstall = (baseDir, api) => ({
  path: '/rune/install/npm/{name}/{version}',
  method: 'POST',
  options: {
    validate: {
      params: Joi.object({
        name: Joi.string().pattern(packageNameRegex),
        version: Joi.string().pattern(packageVersionRegex)
      }),
      payload: npmInstallOptions
    }
  },
  handler: async (req) => {
    const { fileConsole, installId } = await startInstall(baseDir)
    api.rune.install({
      type: 'npm',
      spec: `${req.params.name}@${req.params.version}`,
      options: req.payload,
      fileConsole
    }).then(() => afterInstall('Success')).catch(e => afterInstall('Failed', e))
    return { ok: true, status: 'Running', installId }
  }
})

module.exports = {
  npmInstallStatus,
  npmInstallLog,
  npmInstallNameOnly,
  npmInstall
}
