const npm = require('./installers/npm')

const install = async (baseDir, {type, spec, ...options}) => {
  if (type === 'npm') return npm(baseDir, spec, options) 
}

const list = (baseDir) => {
  console.log(baseDir)
}
const remove = (baseDir, name) => {
  console.log(baseDir, name)
}

module.exports = (baseDir) => ({
  install: async (details) => await install(baseDir, details),
  list: () => list(baseDir),
  remove: (name) => remove(baseDir, name)
})
