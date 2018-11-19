const assert = require('assert')
let routes = {}
let userRoutes = require('./routes/userRoutes.js')
let authRoutes = require('./routes/authRoutes.js')
let menuItemRoutes = require('./routes/menuItemRoutes')
let shoppingCartRoutes = require('./routes/shoppingCartRoutes')
let orderRoutes = require('./routes/orderRoutes')

let staticRoutes = require('./routes/staticRoutes')

routes.routeList = {
  /**
  * @api {put} /user Update user profile
  * @apiName UpdateProfile
  * @apiGroup User
  * 
  * @apiParam {string} name User name
  * @apiParam {string} password Password for the user
  * @apiParam {string} [streetNumber] Address used for orders.
  *
  * @apiSuccess {object} user All fields in User object (excluding password). In addition, a Authorization token is also added in the response.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *   {
  *     "user": {
  *        "email": "jhon@host.com",
  *        "name": "Jhon",
  *        "streetNumber": "45B Park Lane",
  *        "token": {
  *           email: "",
  *           token: "",
  *           expiresIn: "",
  *           createdAt: ""
  *         }
  *     }
  *   }
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authorized
  *
  */
  '/user': [{ method: 'put', handler: userRoutes.update, auth: true },

  /**
  * @api {delete} /user Delete a user
  * @apiName DeleteUserAccount
  * @apiGroup User
  * 
  * @apiSuccess {object} user All fields in User object (excluding password). In addition, a Authorization token is also added in the response.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *   {
  *     "user": null
  *   }
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authorized
  *
  */
  { method: 'delete', handler: userRoutes.delete, auth: true }],

  /**
   * @api {post} /auth/login
   * @apiName Login
   * @apiGroup Authentication
   * @apiParam {string} email
   * @apiParam {string} password
   * 
   * @apiSuccess {object} user All fields in User object (excluding password). In addition, a Authorization token is also added in the response.
   * @apiSuccessExample {json} Success-response:
   *   HTTP/1.1 200 OK
   *   {
   *     "user": {
   *        "email": "jhon@host.com",
   *        "name": "Jhon",
   *        "streetNumber": "45B Park Lane",
   *        "token": {
   *           email: "",
   *           token: "",
   *           expiresIn: "",
   *           createdAt: ""
   *         }
   *     }
   *   }
   * @apiError (4xx) {string} error Error description
   * 
   * @apiPermission Public   
   * 
   */
  '/auth/login': { method: 'post', handler: authRoutes.login, auth: false },

  /**
   * @api {post} /auth/logout
   * @apiName Login
   * @apiGroup Authentication
   * 
   * @apiSuccess {object} user All fields in User object (excluding password). In addition, a Authorization token is also added in the response.
   * @apiSuccessExample {json} Success-response:
   *   HTTP/1.1 200 OK
   *   {
   *     "user": null
   *   }
   * @apiError (4xx) {string} error Error description
   * 
   * @apiPermission Public   
   * 
   */
  '/auth/logout': { method: 'post', handler: authRoutes.logout, auth: true },

  /**
  * @api {post} /auth/register Register a new User
  * @apiName Register
  * @apiGroup Authentication
  * 
  * @apiParam {string="xxx@xxx.xxx"} email Email address
  * @apiParam {string} name User name
  * @apiParam {string} password Password for the user
  * @apiParam {string} [streetNumber] Address used for orders.
  *
  * @apiSuccess {object} user All fields in User object (excluding password). In addition, a Authorization token is also added in the response.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *   {
  *     "user": {
  *        "email": "jhon@host.com",
  *        "name": "Jhon",
  *        "streetNumber": "45B Park Lane",
  *        "token": {
  *           email: "",
  *           token: "",
  *           expiresIn: "",
  *           createdAt: ""
  *         }
  *     }
  *   }
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Public
  *
  */
 '/auth/register': { method: 'post', handler: authRoutes.register, auth: false },

 /**
  * @api {get} /menu_item List all items in menu
  * @apiName ListItems
  * @apiGroup Order
  * 
  * @apiSuccess {object} list of all the menu items.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *{
  *  "menu_items": [
  *      {
  *          "name": "Potato Chips",
  *          "price": 10,
  *          "id": 10001
  *      },
  *    ...
  *  ]
  *}
  *
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authenticated
  *
  */
 '/menu_item': { method: 'get', handler: menuItemRoutes.list, auth: true },

 /**
  * @api {get} /cart/item Add item to cart
  * @apiName AddToCart
  * @apiGroup Order
  * @apiParam {number} menuItemId Id of a menu item
  * @apiParam {number} [quantity] quantity of item, default is 1 
  * @apiSuccess {object} updated cart.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *{
  *   "cart": {
  *      "cartItems": [
  *          {
  *              "menuItem": {
  *                  "name": "Potato Chips",
  *                  "price": 10,
  *                  "id": 10001
  *              },
  *              "quantity": 100
  *          }
  *          ....
  *      ]
  *  }
  *}
  *
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authenticated
  *
  */
 '/cart/item': { method: 'post', handler: shoppingCartRoutes.addToCart , auth: true },

 /**
  * @api {get} /cart/show Show cart 
  * @apiName ShowCart
  * @apiGroup Order
  * 
  * @apiSuccess {object} show updated cart.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  *{
  *   "cart": {
  *      "cartItems": [
  *          {
  *              "menuItem": {
  *                  "name": "Potato Chips",
  *                  "price": 10,
  *                  "id": 10001
  *              },
  *              "quantity": 100
  *          }
  *          ....
  *      ]
  *  }
  *}
  *
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authenticated
  *
  */
 '/cart/show': { method: 'post', handler: shoppingCartRoutes.showCart , auth: true },


 
 /**
  * @api {get} /cart/order Order And Pay
  * @apiName Order
  * @apiGroup Order
  * 
  * @apiParam {string} token API token for stripe which indicates the source of payment. For testing send token: tok_mastercard
  * 
  * @apiSuccess {object} show order details.
  * @apiSuccessExample {json} Success-response:
  *   HTTP/1.1 200 OK
  * { 
  *   "order": {
  *      "total": 1000,
  *      "cart": {
  *          "cartItems": [
  *              {
  *                  "menuItem": {
  *                      "name": "Potato Chips",
  *                      "price": 10,
  *                      "id": 10001
  *                  },
  *                  "quantity": 100
  *              }
  *          ]
  *      },
  *      "paymentDetails": {
  *          "id": "ch_1DVexhDgexwRntiH8GQrdDol",
  *          "object": "charge",
  *          "amount": 1000,
  *          "amount_refunded": 0,
  *         ...
  *      },
  *      "status": 2
  *  }
  * @apiError (4xx) {string} error Error description
  * 
  * @apiPermission Authenticated
  *
  */
 '/cart/order': { method: 'post', handler: orderRoutes.order , auth: true },

 
 '/public': {handler: staticRoutes}
}
routes.methodsAllowed = {
  get: true, put: true, post: true, delete: true
}

routes.getRoute = function(pathName, _method) {
  assert(typeof(pathName) === 'string', 'routes::getRoutes(pathName (Must be string))')
  assert(typeof(_method) === 'string', 'routes::getRoutes(method (Must be string))')
  
  let method = _method.toLowerCase()
  
  if ( (method.toLowerCase() in this.methodsAllowed)) {
    console.log('pathName', pathName)
    if (pathName in this.routeList) {
      if (this.routeList[pathName].constructor === Array) {
        let filterItems = this.routeList[pathName].filter(r => r.method === method)
        if (filterItems.length == 1){
          return filterItems[0]
        } else {
          console.log('Eitehr too many routes matching the same method or none mathed.')
          return false
        }
      }
      else if (method === this.routeList[pathName].method) {
        return this.routeList[pathName]
      } 
      
      else  {
        console.log('METHOD MISMATCH')
        return false
      }
    } else if (/^\/public.*/.test(pathName)) {
      return this.routeList['/public']
    } else {
      console.log('ROUTE NOT FOUND')
      
      return false
    }
  } else {
    console.log('METHOD NOT ALLOWED')
    return false
  }
}

module.exports = routes