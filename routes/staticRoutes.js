const fs = require('fs')
const path = require('path')
var Token = require('./../models/Token')
var User = require('./../models/User')

const readTemplate = (file, callback) => {
  let templateFilePath = path.join(__dirname, '../templates', file + '.html')
  fs.readFile(templateFilePath, {encoding: 'utf8'}, (err, data) => {
    if (err) return callback(err)
    
    
    let str = fs.readFileSync(path.join(__dirname, '../templates', "header.html" ), {encoding: 'utf8'})
    str += data
    str += fs.readFileSync(path.join(__dirname, '../templates', "footer.html" ), {encoding: 'utf8'})
    callback(null, str)
  })
}


const readAsset = (file, callback) => {
  console.log('filepath', file)
  let filePath = file.path.replace('/public', '')
  let templateFilePath = path.join(__dirname, '../assets', filePath)
  fs.readFile(templateFilePath, {encoding: 'utf8'}, (err, data) => {
    if (err) return callback(err)
    callback(null, data)
  })
}


let staticRoutes = {
  '/public/login': {
    template: 'login',
    auth: false,
  },
  '/public/signup': {
    template: 'signup',
    auth: false,

  },
  '/public/listing': {
    template: 'listing',
    auth: true,
  },
  '/public/logout': {
    template: 'logout',
    auth: true,
  },
  '/public/checkout': {
    template: 'checkout',
    auth: true
  }
}


const internalServerError = (req, res) => {
  res.writeHead(500)
  return res.end("Internal Server Error")
}

const renderTemplate = (templateName, req, res) => {
  res.setHeader('content-type', 'text/html')
  readTemplate(templateName, (err, data) => {
    if (err) {
      return internalServerError(req, res)
    }
    res.writeHead(200)
    res.end(data)
  })
}


function getCookie(str, cname) {
  var name = cname + "=";
  
  var decodedCookie = decodeURIComponent(str);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}
const handleAuth = (req, res, callback) => {
  const cookie = req.headers['cookie']
  const cookieToken = getCookie(cookie, 'token')
  let cookieTokenIsCorrectType = typeof(cookieToken) === 'string'
  let cookieTokenIsFormated = /[a-zA-Z0-9-]{32}/.test(cookieToken)
  if (cookieTokenIsCorrectType && cookieTokenIsFormated) {
    Token.fromToken(cookieToken, (error, token) => {
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
  } else {
    callback({error: ""})
  }
}

const handle = (req, res) => {
  let ext = path.extname(req.app.route.path)

  if (req.app.route.path in staticRoutes) {
    let templateName = staticRoutes[req.app.route.path].template
    if (staticRoutes[req.app.route.path].auth) {
      handleAuth(req, res, (err) => {
        if (err) return renderTemplate('401', req, res)
        return renderTemplate(templateName, req, res)
        }) 
    } else {
      return renderTemplate(templateName, req, res)
    }
  } else {
    
    readAsset(req.app.route, (err, data) => {
      
      if (err) return renderTemplate('404', req, res)

      if (ext === '.css') {
        res.setHeader('content-type', 'text/css')
        return res.end(data)
      } else if (ext === '.js') {
        res.setHeader('content-type', 'text/javascript')
        return res.end(data)
      } else {
        res.setHeader('content-type', 'text/plain')
        return res.end(data)
      }
    })

  }
}

module.exports = handle