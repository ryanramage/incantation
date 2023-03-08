const path = require('path')
const rimraf = require('rimraf')
const npm = require('./installers/npm')
const NodeProjectRune = require('./nodeProjectRune')

const getInstallPath = (baseDir, type, spec) => {
  const typeDir = path.resolve(baseDir, type)
  const installPath = path.resolve(typeDir, spec)
  return installPath
}

const install = async (baseDir, {type, spec, ...options}) => {
  const installPath = getInstallPath(baseDir, type, spec)
  const installDir = await makeDir(installPath)
  if (type === 'npm') return npm(installDir, spec, options) 
}

const getRune = async (baseDir, {type, spec}) => {
  const installPath = getInstallPath(baseDir, type, spec)
  if (type === 'npm') return await NodeProjectRune(installPath)
}

const list = async (baseDir) => {
  console.log(baseDir)
}

const remove = async (baseDir, {type, spec}) => {
  const installPath = getInstallPath(baseDir, type, spec)
  await rimraf(installPath) 
}

module.exports = (baseDir) => ({
  install: async (details) => await install(baseDir, details),
  list: async () => await list(baseDir),
  getRune: async (summary) => await getRune(baseDir, summary),
  remove: async (summary) => await remove(baseDir, summary)
})
