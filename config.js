let vars = require('./.env')
let env = process.env.NODE_ENV
let exportObject
let config = {
  dev: {
    port: 3000
  },
  production: {
    port: 5000
  }
}

if (typeof(env) === 'string' && env in config) {
  exportObject = config[env]
} else {
  exportObject = config['dev']
}

exportObject.salt = vars.salt
exportObject.stripeSecretKey = vars.stripeSecretKey


module.exports = exportObject