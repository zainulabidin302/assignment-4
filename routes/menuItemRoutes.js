var MenuItem = require('./../models/MenuItem')
var routes = {}

routes.list = function(req, res) { 
  MenuItem.listAll((error, items) => {
    if (error) {
      res.writeHead(400)
      res.end(JSON.stringify({
        error
      }))
    } else {
      res.writeHead(200)
      res.end(JSON.stringify({
        menu_items: items.map(item => item.toJSON())
      }))
    }
  })
}
module.exports = routes