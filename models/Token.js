const config = require('./../config')
const fileHelper = require('./../fileHelper')
const crypto = require('crypto')

function Token(email, expiresIn = 24 * 60* 30 ) {
  let isValidEmail = (typeof(email) === 'string' && email.length > 0 && /[a-zA-Z0-9]+@[a-zA-Z0-9\-].*\.[a-zA-Z]{1}/.test(email))
  if (!isValidEmail) {
    throw new Error("Email is invalid.")    
  } 
  this.token = null
  this.email = email
  this.expiresIn = expiresIn
  this.createdAt = Date.now()
}

Token.fromToken = function(token, callback) {
  // @TODO
  // TOKEN EXPIRES LOGIC

  fileHelper.fetchByIdentifier('token', token, (error, data) => {
    if (error) {
      callback(error)
    } else {
      let token = new Token(data.email, data.expiresIn)
      token.token = data.token
      token.createdAt = data.createdAt

      callback(null, token)
    }
  })
}

Token.prototype.getToken = function(callback) {
  // @TODO
  // TOKEN EXPIRES LOGIC
  if (this.token !== null) {
    return callback(null, this.token)
  }

  let token = this.email + config.salt
  let time = String(Date.now())
  this.token = crypto.createHash('sha256').update(token + time).digest('hex')
  
  this.save(callback)
}


Token.prototype.save = function(callback) {
  let token = this.toJSON()

  fileHelper.fileExists('token', this.token, (err, stat) => {
    if (err) {
      if (err.code == 'ENOENT') {
        // IF FILE NOT FOUND 
        // Create a new token
        fileHelper.save('token', this.token, token, (err) => {
          if (err) {
            callback("Can not save token." + err)
          } else {
            callback(null, this.toJSON())
          }
        })  
      } else {
        callback("Unkown error ocurred." )  
      }
    } else 
      this.refreshToken(callback)
  })
  
}
Token.prototype.delete = function(callback) {
  fileHelper.delete('token', this.token, (err) => {
    if (err) {
      callback("Can not delete token." + err)
    } else {
      callback(null)
    }
  })
}

Token.prototype.toJSON = function() {
  return {
    email: this.email,
    token: this.token,
    expiresIn: this.expiresIn,
    createdAt: this.createdAt
  }
}

Token.prototype.refreshToken = function(callback) {
  fileHelper.fetchByIdentifier('token', (error, data) => {
    if (error) {
      callback(error)
    } else {
      data['createdAt'] = Date.now()
      fileHelper.save('token', data['token'], token, (err) => {
        if (err) {
          callback("Can not refresh token." + err)
        } else {
          callback(null, data)
        }
      })
    }
  })
}

module.exports = Token