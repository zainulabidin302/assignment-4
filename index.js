const http = require('http')
const config = require('./config')
const handlerServer = require('./handleServer')

let server = http.createServer(handlerServer.main)

server.listen(config.port, function() {
  console.log('Server listening on ', config.port)
})

