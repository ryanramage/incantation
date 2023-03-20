const pm2 = require('pm2')

module.exports = async () => new Promise((resolve, reject) => {
  pm2.connect(err => {
    if (err) reject(err)
    resolve(pm2)
  })
})
