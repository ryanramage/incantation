const Joi = require('joi')
const packageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
const packageVersionRegex = /[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/

const npmInstallOptions = Joi.object({
  integrity: Joi.string().optional().description('Expected integrity of fetched package tarball. If specified, tarballs with mismatched integrity values will raise an EINTEGRITY error'),
  registry: Joi.string().optional().description('The npm registry to use by default. Defaults to https://registry.npmjs.org/.'),
  _authToken: Joi.string().optional().description('Authentication token string'),
  username: Joi.string().optional().description('Username used for basic authentication. For the more modern authentication method, please use the (more secure) opts._authtoken'),
  password: Joi.string().optional().description('Password used for basic authentication. For the more modern authentication method, please use the (more secure) opts._authtoken')
}).optional()

const npmInstallNameOnly = api => ({
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
  handler: async (req) => api.rune.install({
    type: 'npm',
    spec: `${req.params.name}`,
    options: req.payload
  })

})
const npmInstall = api => ({
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
  handler: async (req) => api.rune.install({
    type: 'npm',
    spec: `${req.params.name}@${req.params.version}`,
    options: req.payload
  })
})

module.exports = { npmInstallNameOnly, npmInstall }
