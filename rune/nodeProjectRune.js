const path = require('path')

async function getBinPath (baseDir) {
  const { getBinPath } = await import('get-bin-path')
  return await getBinPath({cwd: baseDir})
}
module.exports = async (installedDir) => {

  const package = require(path.resolve(installedDir, './package.json'))
  const fullScriptPath = await getBinPath(installedDir) 

  return {
    getRole: () => ({ role: package.name, version: package.version }),
    getRuntime: () => ({
      script: fullScriptPath,
      cwd: installedDir,
      portEnvironmentVariable: 'PORT'
    })
  }
}
