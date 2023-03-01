module.exports = (name, script, cwd, portInfo, { args, env, processOptions }) => {
  if (!processOptions) processOptions = {}
  if (!env) env = {}
  // control what options can be passed
  const {
    interpreterArgs,
    minUptime,
    maxRestarts,
    maxMemoryRestart,
    killTimeout,
    restartDelay,
    interpreter, // should see if host can support
    execMode,
    instances,
    autorestart
  } = processOptions

  const portEnvironmentVariable = portInfo.portEnvironmentVariable || 'PORT'
  env[portEnvironmentVariable] = portInfo.port

  const options = {
    name,
    script,
    cwd,
    args,
    env,
    interpreterArgs,
    minUptime,
    maxRestarts,
    maxMemoryRestart,
    killTimeout,
    restartDelay,
    interpreter,
    execMode,
    instances,
    autorestart
  }
  // clean up the options
  Object.keys(options).forEach(key => options[key] === undefined && delete options[key])
  return options
}
