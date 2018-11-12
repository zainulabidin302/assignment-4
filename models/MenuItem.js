const fileHelper = require('./../fileHelper')
function MenuItem(name, price, id = null) {
  this.name = name
  this.price = price
  this.id = id
}
MenuItem.fromId = function(id, callback) {
    MenuItem.listAll((error, data) => {
      if (error) {
        callback(error)
      } else {
        console.log(data)
        let filterItems = data.filter(item => item.id === id)
        
        if (filterItems.length > 0) {
          let found = filterItems[0]
          callback(null, new MenuItem(found.name, found.price, found.id))
        } else {
          callback(`Item not found with id ${id}`)
        }
      }

    })
}

MenuItem.listAll = function(callback) {
  fileHelper.fetchByIdentifier('menu_item', 'items.json', (error, data) => {
    if (error) {
      callback(error)
    } else {
      callback(null, data.map(item => new MenuItem(item.name, item.price, item.id)))
    }
  })
}
MenuItem.prototype.toJSON = function() {
  return {
    name: this.name,
    price: this.price,
    id: this.id
  }
}
module.exports = MenuItem