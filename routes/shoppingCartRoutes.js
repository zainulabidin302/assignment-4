var ShoppingCart = require("./../models/ShoppingCart");
var MenuItem = require("./../models/MenuItem");
var routes = {};

routes.showCart = function(req, res) {
  let shoppingCart = new ShoppingCart(req.app.user)
  shoppingCart.showCart((error, data) => {
    if (error) {
      res.writeHead(200) 
      res.end(JSON.stringify({cart: {cartItems: []}}))
    } else {
      res.writeHead(200)
      res.end(JSON.stringify({cart: data}))
    }
  })
}

routes.addToCart = function(req, res) {
  let body = req.app.requestBody;

  if ("menuItemId" in body) {
    let quantity;
    if ("quantity" in body) {
      quantity = body.quantity;
    } else {
      quantity = 1;
    }

    let cart = new ShoppingCart(req.app.user);
    MenuItem.fromId(body.menuItemId, function(error, menuItem) {
      if (error) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error
          })
        );
      } else {
        cart.addItem(menuItem, quantity, (error, updatedCart) => {
          if (error) {
            res.writeHead(400);
            res.end(
              JSON.stringify({
                error
              })
            );
          } else {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                cart: updatedCart
              })
            );
          }
        });
      }
    });
  } else {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: "menuItemId is required (quantity is optional, default is 1)"
      })
    );
  }
};
module.exports = routes;
