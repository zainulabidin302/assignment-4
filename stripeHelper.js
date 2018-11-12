const https = require("https");
const config = require("./config");
const StringDecoder = require('string_decoder').StringDecoder
const querystring = require('querystring')
const lib = {};
const assert = require('assert')
lib.charge = function(
  amount,
  description,
  token,
  callback,
  options
) {
  assert(typeof(options.currency) === 'string', "Currency must be a string")
  assert(typeof(options.capture) === 'boolean', "Capture must be a boolean")
  assert(typeof(options.metadata.order_id) === 'number', "Order id must be a number")

  const body = {
    amount,
    description,
    source: token,
    currency: options.currency,
    capture: options.capture,
    "metadata[order_id]": options.metadata.order_id
  }

  const postData = querystring.stringify(body)
  console.log(postData)

  const request = https.request({
    protocol: "https:",
    hostname: "api.stripe.com",
    path: '/v1/charges',
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (response) => {
    let buffer = ''
    response.on('data', (data) => {
      buffer += data
    })
    response.on('end', () => {
      
      if (response.statusCode !== 200) {
        try {
          let json = JSON.parse(buffer)
          return callback(json)
        } catch(error) {
          return callback(error)
        }
      } else {
        try {
          let json = JSON.parse(buffer)
          console.log(json)
          return callback(null, json)
        } catch(error) {
          return callback(error)
        }
      }
    })
  });
  request.on('error', (error) => {
    return callback("ERROR", error)
  })
  request.write(postData)
  request.end((err) => {
  })
};

// let options = {
//   source: "tok_mastercard",
//   currency: "usd",
//   capture: true,
//   metadata: {
//     order_id: 1000
//   }
// }


module.exports = lib


