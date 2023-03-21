const Joi = require('joi')
const Boom = require('@hapi/boom')

const run = (api) => ({
  path: '/incantation/rune/{type}/{spec}',
  method: 'POST',
  options: {
    validate: {
      params: Joi.object({
        type: Joi.string().valid('npm'),
        spec: Joi.string()
      }),
      payload: Joi.object({
        processOptions: Joi.object({
          interpreterArgs: Joi.string().optional().description('A string or array of strings composed of arguments to call the interpreter process with'),
          minUptime: Joi.number().optional().description('The minimum uptime of the script before it’s considered successfully started'),
          maxRestarts: Joi.number().optional().description(' The maximum number of times in a row a script will be restarted if it exits in less than minUptime'),
          maxMemoryRestart: Joi.string().optional().description('If sets and script’s memory usage goes about the configured number, pm2 restarts the script. Uses human-friendly suffixes: ‘K’ for kilobytes, ‘M’ for megabytes, ‘G’ for gigabytes’, etc. Eg “150M”'),
          killTimeout: Joi.number().optional().description(' (Default: 1600) The number of milliseconds to wait after a stop or restart command issues a SIGINT signal to kill the script forcibly with a SIGKILL signal.'),
          restartDelay: Joi.number().optional().description(' (Default: 0) Number of milliseconds to wait before restarting a script that has exited'),
          interpreter: Joi.string().optional().description('(Default: "node") The interpreter for your script (eg “python”, “ruby”, “bash”, etc). The value “none” will execute the ‘script’ as a binary executable.'), // should see if host can support
          execMode: Joi.string().optional().valid('fork', 'cluster').description(' If sets to ‘cluster’, will enable clustering (running multiple instances of the script).'),
          instances: Joi.number().optional().description('How many instances of script to create. Only relevant in exec_mode ‘cluster’.'),
          autorestart: Joi.boolean().optional().description('(Default true). If false, pm2 will not attempt to restart it following successful completion or process failure.')
        }),
        args: Joi.array().items(Joi.string()).description(' A string or array of strings composed of arguments to pass to the script.'),
        environment: Joi.object().unknown()
      })
    }
  },
  handler: async (req) => {
    const { type, spec } = req.params
    const { args, environment, processOptions } = req.payload
    const rune = await api.rune.get({ type, spec })
    const info = await api.incantation.start(rune, args, environment, processOptions)

    // annoying that pm2 returns the full process list. this is a hack to get the right info back on the create
    const fromList = await api.incantation.list()
    const launched = fromList.find(l => l.name === spec)
    info.process = launched.process
    return info
  }
})

const list = (api) => ({
  path: '/incantation/list',
  method: 'GET',
  handler: async () => {
    return await api.incantation.list()
  }
})

const stop = (api) => ({
  path: '/incantation/{name}/stop',
  method: 'PUT',
  handler: async (req) => {
    const name = req.params.name
    await api.incantation.stop(name)
    const fromList = await api.incantation.list()
    console.log(fromList)
    const info = fromList.find(l => l.name === name)
    if (!info) return Boom.notFound(`incantation ${name} not found`)
    return info
  }
})

const restart = (api) => ({
  path: '/incantation/{name}/restart',
  method: 'PUT',
  handler: async (req) => {
    const name = req.params.name
    const info = await api.incantation.restart(name)
    return info
  }
})

module.exports = { run, list, stop, restart }
