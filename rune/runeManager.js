const path = require('path')
const fs = require('node:fs/promises')
const rimraf = require('rimraf')
const npm = require('./installers/npm')
const makeDir = require('make-dir')
const NodeProjectRune = require('./nodeProjectRune')

const getTypeDir = (baseDir, type) => {
  const typeDir = path.resolve(baseDir, type)
  return typeDir
}
const getInstallPath = (baseDir, type, spec) => {
  return path.resolve(baseDir, type, spec)
}

const install = async (baseDir, { type, spec, ...options }) => {
  const typePath = getTypeDir(baseDir, type)
  const typeDir = await makeDir(typePath)
  if (type === 'npm') return npm(typeDir, spec, options)
}

const getRune = async (baseDir, { type, spec }) => {
  const installPath = getInstallPath(baseDir, type, spec)
  if (type === 'npm') return await NodeProjectRune(installPath)
}

const list = async (baseDir) => {
  const npm = path.resolve(baseDir, 'npm')
  const nodeRunes = await fs.readdir(npm)
  const nodeRuneSummary = nodeRunes.map(spec => ({ type: 'npm', spec }))
  return nodeRuneSummary
}

const remove = async (baseDir, { type, spec }) => {
  const installPath = getInstallPath(baseDir, type, spec)
  await rimraf(installPath)
}

module.exports = (baseDir) => ({
  install: async (details) => await install(baseDir, details),
  list: async () => await list(baseDir),
  getRune: async (summary) => await getRune(baseDir, summary),
  remove: async (summary) => await remove(baseDir, summary)
})
