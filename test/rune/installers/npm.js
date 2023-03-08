const test = require('tape')
const install = require('../../../rune/installers/npm')

test('test a basic install', t => {
  install('/tmp/pacote/', 'code-music-studio@1.6.0').then(result => {
    console.log(result)
    t.end()
  }).catch(e => {
    console.log('something bad happened', e)
    t.notOk('failed"')
  })
})
