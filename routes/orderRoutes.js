const ShoppingCart = require('./../models/ShoppingCart')
const Order = require('./../models/Order')
const stripehelper = require('../stripeHelper')
const routes = {}

routes.order = function(req, res) { 
  var shoppingCart = new ShoppingCart(req.app.user)

  const body = req.app.requestBody

  if ('number' in body && 'exp_month' in body && 'exp_year' in body && 'cvc' in body ) {
    shoppingCart.isEmpty((error, empty) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(400)
          res.end(JSON.stringify({
            error: "Your cart is empty"
          }))
        } else {
          console.log("ERROR", error)
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
          stripehelper.createToken(body['number'], body['exp_month'], body['exp_year'], body['cvc'], (err, success) => {
            if (err) {
              res.json(JSON.stringify("Your credit card information is invalid. please try again."))
            }
            
            order.charge(success.id, (error, orderJSON) => {
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



          })

          
        }
      }
    })
  } else {
    res.writeHead(400)
    res.end(JSON.stringify({
      error: "number (credit card number), exp_month, exp_year, cvc is required"
    }))
  }

  
}
routes.delete = function(req, res) {  }

module.exports = routes