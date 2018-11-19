
function getCookie(cname) {
  var name = cname + "=";
  
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

const app = {
  domain: 'http://localhost:3000/',
  token: getCookie('token')
}



function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function request(path, method, data, callback) {
  let req = new XMLHttpRequest()
  req.open(method, app.domain + path, true)
  let str = JSON.stringify(data)

  req.setRequestHeader('content', 'application/json')
  req.setRequestHeader('accept', 'application/json')
  console.log(app.token)
  if (typeof(app.token) == 'string' && app.token.length === 64 ) {
    req.setRequestHeader('Authorization', 'Bearer ' + app.token)
  }
  
  req.onreadystatechange = (function(data) {
    if (this.readyState == 4) {
      if (this.status == 200) {
        callback(null, req.responseText)
      } else {
        callback(req.responseText)
      }
    } else {
      console.log('loading')
    }
  })
  req.send(str)
}



app.handleLogin = function(event) {
  event.preventDefault()
  
  let errorEl = event.target.querySelector('.error')
  let successEl = event.target.querySelector('.success')
  errorEl.style.display = "none"
  successEl.style.display = "none"

  let email = event.target.querySelectorAll("input")[0].value
  let password = event.target.querySelectorAll("input")[1].value

  request('auth/login', 'post', {
    email, password 
  }, (err, success) => {
    if (err) {
      errorEl.style.display = "block"
      errorEl.innerHTML = "Username or password mismatch."
    } else {
      successEl.style.display = "block"
      successEl.innerHTML = "Logged in successfully. Redirecting ...."
      console.log(success)
      setCookie('token', JSON.parse(success).user.token.token)
      setTimeout(() => {
        console.log('redirecting')
        window.location = "/public/listing"
      }, 1000)
    }
  })  
}

app.handleSignup = function(event) {
  event.preventDefault()
  
  let errorEl = event.target.querySelector('.error')
  let successEl = event.target.querySelector('.success')
  errorEl.style.display = "none"
  successEl.style.display = "none"

  let email = event.target.querySelectorAll("input")[0].value
  let password = event.target.querySelectorAll("input")[1].value
  let name = event.target.querySelectorAll("input")[2].value

  request('auth/register', 'post', {
    email, password, name
  }, (err, success) => {
    if (err) {
      errorEl.style.display = "block"
      errorEl.innerHTML = JSON.parse(err).error
    } else {
      successEl.style.display = "block"
      successEl.innerHTML = "Signup successful."
      console.log(success)
    }
  })  
}