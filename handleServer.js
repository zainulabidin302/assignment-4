var routes = require('./routes')
var StringDecoder = require('string_decoder').StringDecoder
var Token = require('./models/Token')
var User = require('./models/User')

let handler = {}


handler.serveStatic = function(req, res) {
  // res.setHeader('content-type', 'text/html')
  // req.app.route.path

  let contentTypeHeader = req.headers['content-type']
  let accpetHeader = req.headers['accept']
  
  return req.app.route.handler(req, res)

}



handler.serveJSON = function(req, res) {
  res.setHeader('content-type', 'application/json')
  req.app.route.handler(req, res)
}

handler.auth = (req, res, callback) => {
  
  let authorizationHeader = req.headers['authorization']
  let authorizationHeaderIsCorrectType = typeof(authorizationHeader) === 'string'
  let authorizationHeaderIsFormated = /Bearer [a-zA-Z0-9-]{32}/.test(authorizationHeader)
  
 
  if (authorizationHeaderIsCorrectType &&
    authorizationHeaderIsFormated) {

      Token.fromToken(authorizationHeader.replace('Bearer ', ''), (error, token) => {
        if (error) {
          return callback({error: "Token is missing, malformed or unuable. #002"})
        } else {
          let user = new User(null, token.email, null)
          user.fetchByIdentifier((error) => {
            if (error) {
              return callback({error: "Token is missing, malformed or unuable. #001"})
            }
            let userObject = user.toJSON()
            userObject.token = token
            req.app.user = userObject
            req.app.loggedIn = true
            callback(null)
          })
        }
      })
      
    } 
    else {
      return callback({error: "Token is missing or malformed."})
    }
}




handler.main = function(req, res)  {
  // add custom namespace for app specific data
  req.app = {
    loggedIn: false
  }

  let url = require('url').parse(req.url)
  let route = routes.getRoute(url.path, req.method)
  req.app.route = {
    ...route, 
    path: url.path
  }
  // console.log("ROUTE", route)
  if (route == false) {
    res.setHeader('content-type', 'text/html')
    res.writeHead(404)
    return res.end("404 not found")
  }
  
  if (route.auth == true) {
    handler.auth(req, res, (error) => {
      if (error) {
        res.writeHead(401, "Unauthorized")
        return res.end(JSON.stringify({
          error
        }))
      } else {
        // Authenticated
        return handler._serveRequest(req, res)
      }
    })
  } else {
    // Authentication not required
    return handler._serveRequest(req, res)
  }
}


handler._serveRequest = function(req, res) {
  let contentTypeHeader = req.headers['content-type']
  let accpetHeader = req.headers['content-type']

  let responseHandler
  if (contentTypeHeader === 'application/json' && accpetHeader === 'application/json') {
    responseHandler = handler.serveJSON
  } else {
    responseHandler = handler.serveStatic
  }

  if (req.method.toLowerCase() !== 'get') {
    let requestBody = ''
    let decoder = new StringDecoder('utf8')
    req.on('data', (chunk) => {
        requestBody += decoder.write(chunk)
    })
    req.on('end', () => {
      try {
        if (requestBody.length === 0) {
          req.app.requestBody = {}
        } else {
          req.app.requestBody = JSON.parse(requestBody)
        }
        responseHandler(req, res)
      } catch(error) {
          res.writeHead(400, "Bad Request")
          console.log("Request body is malformed.", error)
          return res.end(JSON.stringify({error: "Body of request is not undrestood."}))
      }
    })
  } else {
    responseHandler(req, res)
  }
}

module.exports = handler