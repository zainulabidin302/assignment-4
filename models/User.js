const fileHelper = require("./../fileHelper");
const path = require("path");
function User(name, email, streetNumber) {
  let isValidEmail =
    typeof email === "string" &&
    email.length > 0 &&
    /[a-zA-Z0-9]+@[a-zA-Z0-9\-].*\.[a-zA-Z]{1}/.test(email);

  if (!isValidEmail) {
    throw new Error("Email is invalid.");
  }
  this.name = name;
  this.email = email;
  this.streetNumber = streetNumber;
  this.password = null;
}
User.prototype.setPassword = function(password) {
  //@TODO
  // Hash password
  this.password = password;
};

User.prototype.save = function(callback) {
  let user = this.toJSON();
  if (this.password != null) {
    user = Object.assign({ password: this.password }, user);
  }
  fileHelper.fileExists("user", this.email, (err, stat) => {
    if (err) {
      if (err.code == "ENOENT") {
        // IF FILE NOT FOUND i.e user is not already registered with same email
        // then save user.
        fileHelper.save("user", this.email, user, err => {
          if (err) {
            callback("Can not save user." + err);
          } else {
            callback(null);
          }
        });
      } else {
        callback("Unkown error ocurred.");
      }
    } else callback("User already exists.");
  });
};

User.prototype.update = function(callback) {
  let user = this.toJSON();
  if (this.password != null) {
    user = Object.assign({ password: this.password }, user);
  }
  fileHelper.fileExists("user", this.email, (err, stat) => {
    if (err) {
      if (err.code == "ENOENT") {
        callback("User does not exists.");
      } else {
        callback(err);
      }
    } else {
      fileHelper.save("user", this.email, user, err => {
        if (err) {
          callback("Can not save user." + err);
        } else {
          callback(null);
        }
      });
    }
  });
};
User.prototype.delete = function(callback) {
  fileHelper.delete("user", this.email, err => {
    if (err) {
      callback("Can not delete user." + err);
    } else {
      callback(null);
    }
  });
};

User.prototype.toJSON = function() {
  return {
    email: this.email,
    name: this.name,
    streetNumber: this.streetNumber
  };
};

User.prototype.fetchByEmailAndPassword = function(callback) {
  fileHelper.fetchByIdentifier("user", this.email, (error, data) => {
    if (error) {
      callback(error);
    } else {
      if (data["password"] == this.password) {
        this.password = null;
        this.email = data["email"];
        this.streetNumber = data["streetNumber"];
        this.name = data["name"];
        callback(null, data);
      } else {
        callback("Username or password mismatch");
      }
    }
  });
};

User.prototype.fetchByIdentifier = function(callback) {
  fileHelper.fetchByIdentifier("user", this.email, (error, data) => {
    if (error) {
      callback(error);
    } else {
      this.password = null;
      this.email = data["email"];
      this.streetNumber = data["streetNumber"];
      this.name = data["name"];
      callback(null, data);
    }
  });
};

User.listusers = async function(recent = false) {
  let users = await fileHelper.readdir(path.join(__dirname, "../data/user"));

  return await Promise.all(
    users.map(async user => {
      let stat = await fileHelper.stat(
        path.join(__dirname, "../data/user", user)
      );

      if (recent) {
        let date1 = new Date(stat.mtime);
        let date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays > 0) {
          return null;
        }
      }
      return JSON.parse(
        await fileHelper.readfile(path.join(__dirname, "../data/user", user))
      );
    })
  );
};

User.byEmail = async email => {
  return JSON.parse(
    await fileHelper.readfile(path.join(__dirname, "../data/user", email))
  );
};
module.exports = User;
