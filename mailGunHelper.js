const https = require('https')


let sendEmail = function({to, subject, text}, callback) {
  
  
  var auth = 'Basic ' + Buffer.from('api:2c7f4830cbe0a5d0e1237628985814cb-9525e19d-6be54c9e').toString('base64');
  let options = {
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    path: '/v3/sandbox1dad7cc785ac4dc09fef212fd8ff9677.mailgun.org/messages',
    method: 'POST',
    headers: {
      'Authorization': auth,
      'content-type': 'application/x-www-form-urlencoded'
    }
  }

  let body = {
    from: 'Zain <zainulabidin302@gmail.com>',
    to,
    subject,
    text
  }

  let postData = require('querystring').stringify(body)
  console.log(postData)
  const req = https.request(options, (res) => {
    res.setEncoding('utf8')
    let buffer = ''
    res.on('data', (data) => {buffer += data})
    res.on('end', () => {
      if (res.method === 200) {

      try {
        console.log(buffer)
        let json = JSON.parse(buffer);
        return callback(null, json)
      } catch(error) {
        return callback(error)
      }
    } else {
      callback(buffer)
    }
      
    })
  })
  req.on('error', (error) => {
    return callback(error)
  })
  req.write(postData)
  req.end(() => {

  })
}

module.exports = sendEmail