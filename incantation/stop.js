module.exports = (pm2) => {
  const stop = async ({name, service}) => {
    await pm2Stop(pm2, name)
    await service.destroy()
  }
  return stop 
}

function pm2Stop (pm2, name) {
   return new Promise((resolve, reject) => {
     pm2.stop(name, (err) => {
       if (err) return reject(err)
       resolve()
    })
  })
}
