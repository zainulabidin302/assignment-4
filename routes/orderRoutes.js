const ShoppingCart = require('./../models/ShoppingCart')
const Order = require('./../models/Order')
const routes = {}

routes.order = function(req, res) { 
  var shoppingCart = new ShoppingCart(req.app.user)

  const body = req.app.requestBody

  if ('token' in body) {
    shoppingCart.isEmpty((error, empty) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(400)
          res.end(JSON.stringify({
            error: "Your cart is empty"
          }))
        } else {
          res.writeHead(400)
          res.end(JSON.stringify({
            error
          }))
        }
      } else {
        if (empty) {
          res.writeHead(400)
          res.end(JSON.stringify({
            error: "Your cart is empty"
          }))
        } else {
          let order = new Order(shoppingCart)
          order.charge(body['token'], (error, orderJSON) => {
            if (error) {
               res.writeHead(400)
               res.end(JSON.stringify({
                 error
               }))
            } else {
              res.writeHead(200)
              res.end(JSON.stringify({
                order: orderJSON
              }))
            }
          })
        }
      }
    })
  } else {
    res.writeHead(400)
    res.end(JSON.stringify({
      error: "Payment Token is missing"
    }))
  }

  
}
routes.delete = function(req, res) {  }

module.exports = routes