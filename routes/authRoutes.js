var User = require("./../models/User");
var Token = require("./../models/Token");
var routes = {};

routes.login = function(req, res) {
  let body = req.app.requestBody;

  if ("email" in body && "password" in body) {
    try {
      let user = new User(null, body["email"], null);
      user.setPassword(body["password"]);

      user.fetchByEmailAndPassword(error => {
        if (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error }));
        } else {
          let token = new Token(body["email"]);
          token.getToken((error, token) => {
            if (error) {
              console.log("aaa");

              res.end(JSON.stringify({ error }));
            } else {
              res.writeHead(200);
              let payload = user.toJSON();
              payload.token = token;
              res.end(JSON.stringify({ user: payload }));
            }
          });
        }
      });
    } catch (error) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: error.message
        })
      );
    }
  } else {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: "Email and password are mandatory fields."
      })
    );
  }
};
routes.logout = function(req, res) {
  Token.fromToken(req.app.user.token.token, (error, token) => {
    token.delete(error => {
      if (error) {
        res.writeHead(400);
        res.end(JSON.stringify(error));
      } else {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            user: null
          })
        );
      }
    });
  });
};

routes.register = function(req, res) {
  let body = req.app.requestBody;
  if ("name" in body && "email" in body && "password" in body) {
    try {
      let user = new User(body["name"], body["email"], body["streetNumber"]);
      user.setPassword(body["password"]);
      user.save(error => {
        if (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error }));
        } else {
          let token = new Token(body["email"]);
          token.getToken((error, token) => {
            if (error) {
              res.writeHead(400);
              res.end(JSON.stringify({ error }));
            } else {
              res.writeHead(200);
              let payload = user.toJSON();
              payload.token = token;
              res.end(JSON.stringify({ user: payload }));
            }
          });
        }
      });
    } catch (error) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: error.message
        })
      );
    }
  } else {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: "Name, Email and password are mandatory."
      })
    );
  }
};

module.exports = routes;
