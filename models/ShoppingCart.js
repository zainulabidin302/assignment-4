var fileHelper = require('./../fileHelper')
var MenuItem = require('./../models/MenuItem')
function ShoppingCart(user = null, items = null) {
  this.user = user
  this.cartItems = []
}

function CartItem(item, quantity) {
  this.menuItem = item
  this.quantity = quantity
}

CartItem.prototype.toJSON = function() {
  return {menuItem: this.menuItem.toJSON(), quantity: this.quantity}
}

ShoppingCart.prototype.toJSON = function() {
  return {
    cartItems: this.cartItems.map(a => a.toJSON()),
    // No need to save email as it exist as a filename.
  }
}

ShoppingCart.prototype._addItem = function(newMenuItem, quantity, callback) {
  let filter = this.cartItems.filter(item => item.menuItem.id === newMenuItem.id)
  if (filter.length > 0) {
    callback("Item already exists.")
  } else {
    this.cartItems.push(new CartItem(newMenuItem, quantity))
    this.save(callback)
  }
}

ShoppingCart.prototype.addItem = function(newMenuItem, quantity, callback) {
  
  fileHelper.fetchByIdentifier('shopping_cart', this.user.email, (error, data) => {
    if (error) {
        if (error.code == 'ENOENT') {
          fileHelper.save('shopping_cart', this.user.email, this.toJSON(), (error) => {
            this._addItem(newMenuItem, quantity, callback)
          })
        } else {
          callback(error)
        }
    } else {
      this.cartItems = data.cartItems.map(item => new CartItem(new MenuItem(item.menuItem.name, item.menuItem.price, item.menuItem.id), item.quantity))
      this._addItem(newMenuItem, quantity, callback)
    }
  })

  
}

ShoppingCart.prototype.delete = function(callback) {
  fileHelper.delete('shopping_cart', this.user.email, (error) => {
    if (error) {
      callback(error)
    } else {
      this.cartItems = []
      this.user = null
      callback(null)
    }
  })
}

ShoppingCart.prototype.save = function(callback) {
  fileHelper.save('shopping_cart', this.user.email, this.toJSON(), (error) => {
    if (error) {
      if (error.code == 'ENOENT') {
        callback("Cart is empty")
      } else {
        callback(error)
      }
    } else {
      callback(null, this.toJSON())
    }
  })
}
ShoppingCart.prototype.isEmpty = function(callback) {
  this._loadCart((error) => {
    if (error) {
      return callback(error)
    } else {
      return callback(null, this.cartItems.length < 1)
    }
  })
}
ShoppingCart.prototype._loadCart = function(callback) {
  fileHelper.fetchByIdentifier('shopping_cart', this.user.email, (error, data) => {
    if (error) {
      return callback(error)
    } else {
      try {
        this.cartItems = data.cartItems.map(item => new CartItem(new MenuItem(item.menuItem.name, item.menuItem.price, item.menuItem.id), item.quantity))  
        callback(null)
      } catch(error) {
        callback(error)
      }
    }
  })
}
ShoppingCart.prototype.showCart = function(callback) {
  
  fileHelper.fetchByIdentifier('shopping_cart', this.user.email, (error, data) => {
    if (error) {
      if (error.code == "ENOENT") {
        return callback("Your cart is empty.")
      } else {
        return callback(error)
      }
      
    } else {
      try {
        this.cartItems = data.cartItems.map(item => new CartItem(new MenuItem(item.menuItem.name, item.menuItem.price, item.menuItem.id), item.quantity))
        
        callback(null, this.toJSON())
      } catch(error) {
        callback(error)
      }
    }
  })
}

module.exports = ShoppingCart