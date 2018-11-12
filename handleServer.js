var routes = require('./routes')
var StringDecoder = require('string_decoder').StringDecoder
var Token = require('./models/Token')
var User = require('./models/User')
let handler = {
  
}

handler.main = function(req, res)  {
  
  let url = require('url').parse(req.url)
  let route = routes.getRoute(url.path, req.method)
  res.setHeader('content-type', 'application/json' )

  if (req.headers['content-type'] !== 'application/json' && req.headers['accept'] !== 'application/json') {
    res.writeHead(400, "Bad Request")
    return res.end(JSON.stringify({
      error: "Content-type and Accept headers must be application/json"
    }))
  }

  /**
   * 
   * Custom namespace
   */
  req.app = {
  }
  

  if (route == false) {
    res.writeHead(404, "Route not found")
    return res.end(JSON.stringify({error: "Route Not found."}))
  } 
  


  if (route.auth == true) {
    
    let authorizationHeader = req.headers['authorization']
    let authorizationHeaderIsCorrectType = typeof(authorizationHeader) === 'string'
    let authorizationHeaderIsFormated = /Bearer [a-zA-Z0-9-]{32}/.test(authorizationHeader)

    if (authorizationHeaderIsCorrectType &&
      authorizationHeaderIsFormated) {
        console.log('token String', authorizationHeader.replace('Bearer ', ''))
        Token.fromToken(authorizationHeader.replace('Bearer ', ''), (error, token) => {
          if (error) {
            res.writeHead(401, "Unauthorized")
            return res.end(JSON.stringify({
              error: "Token is missing, malformed or unuable."
            }))
          } else {
            let user = new User(null, token.email, null)
            user.fetchByIdentifier((error) => {
              if (error) {
                res.writeHead(401, "Unauthorized")
                return res.end(JSON.stringify({
                  error: "Unexpected error orccured, please try relogin." + error
                }))
              }
              let userObject = user.toJSON()
              userObject.token = token
              req.app.user = userObject

              serveRequest(req, res, route)
            })
          }
        })
        
    } else {
      res.writeHead(401, "Unauthorized")
      return res.end(JSON.stringify({
        error: "Token is missing or malformed."
      }))
    }
  } else {
    // serve routes which don't require 
    // Authentication
    serveRequest(req, res, route)
  }



}


function serveRequest(req, res, route) {
  let requestBody = ''
  let decoder = new StringDecoder('utf8')
  if (req.method.toLowerCase() !== 'get') {
    req.on('data', (chunk) => {
      if (chunk.length > 0) {
        requestBody += decoder.write(chunk)
      }
    })
    req.on('end', () => {
      try {
        if (requestBody.length === 0) {
          req.app.requestBody = {}
        } else {
          req.app.requestBody = JSON.parse(requestBody)
        }
        route.handler(req, res)
      } catch(error) {
          res.writeHead(400, "Bad Request")
          console.log("Request body is malformed.", error)
          return res.end(JSON.stringify({error: "Body of request is not undrestood."}))
      }
    })
  } else {
    route.handler(req, res)
  }
}

module.exports = handler