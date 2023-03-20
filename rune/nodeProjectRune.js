const path = require('path')

async function getBinPath (baseDir) {
  const { getBinPath } = await import('get-bin-path')
  return await getBinPath({ cwd: baseDir })
}
module.exports = async (installedDir) => {
  const packageInfo = require(path.resolve(installedDir, './package.json'))
  const fullScriptPath = await getBinPath(installedDir)

  return {
    getRole: () => ({ role: packageInfo.name, version: packageInfo.version }),
    getSpec: () => `${packageInfo.name}@${packageInfo.version}`,
    getRuntime: () => ({
      script: fullScriptPath,
      cwd: installedDir,
      portEnvironmentVariable: 'PORT'
    })
  }
}
