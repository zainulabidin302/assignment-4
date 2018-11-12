const User = require('./../models/User')
const Token = require('./../models/Token')
const routes = {}

routes.update = function(req, res) { 
  let body = req.app.requestBody
  
  let name = ('name' in body) ? body.name : req.app.user.name 
  let password = ('password' in body) ? body.password: null
  let streetNumber = ('streetNumber' in body) ? body.streetNumber : req.app.user.streetNumber
  let user
  try {
     user = new User(name, req.app.user.email, streetNumber)

  } catch(error) {
    res.writeHead(400)
    return res.end(JSON.stringify({
      error: error.message
    }))      
  }
  if (password !== null) {
    user.setPassword(password)
  }
  
  user.update((error) => {
    if (error) {
      res.writeHead(400)
      res.end(JSON.stringify({
        error
      }))      
    } else {
      res.writeHead(200)
      res.end(JSON.stringify({
        user: user.toJSON()
      }))
    }
  })
}
routes.delete = function(req, res) { 
  Token.fromToken(req.app.user.token.token, (error, token) => {
    token.delete(error => {
      if (error) {
        res.writeHead(400);
        res.end(JSON.stringify(error));
      } else {

        let user = new User(null, req.app.user.email, null)
        user.delete((error) => {
          if (error) {
            res.writeHead(400);
            res.end(JSON.stringify(error));
          } else {
            
            res.writeHead(200);
            res.end(
              JSON.stringify({
                user: null
              })
            );
                
          }
        })        
      }
    });
  });
}

module.exports = routes