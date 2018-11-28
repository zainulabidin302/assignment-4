const stripe = require("./../stripeHelper");
const sendEmail = require("./../mailGunHelper");
const fileHelper = require("./../fileHelper");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ORDER_STATUS = {
  NOT_STARTED: 0,
  PAYMENT_FAILURE: 1,
  PAYMENT_RECIEVED: 2,
  DISPATCHED: 3,
  RECIEVED_BY_CLIENT: 4,
  FEEDBACK_AWAITING: 5,
  FEEDBACK_DONE: 6
};

function Order(cart) {
  this.cart = cart;
  this.paymentDetails = null;
  this.status = ORDER_STATUS.NOT_STARTED;
  this.feedback = null;
}

Order.prototype.getTotal = function() {
  return this.cart.cartItems.reduce((prev, curr) => {
    return prev + curr.quantity * curr.menuItem.price;
  }, 0);
};
Order.prototype.charge = function(token, callback) {
  if (this.paymentDetails !== null) {
    return callback("Payment alreayd done.");
  }

  stripe.charge(
    this.getTotal(),
    "Order Payment",
    token,
    (error, payload) => {
      console.log(this.getTotal());
      if (error) {
        if ("error" in error) {
          return callback(error.error);
        }
        return callback(error);
      } else {
        this.paymentDetails = payload;
        this.status = ORDER_STATUS.PAYMENT_RECIEVED;
        let order = Object.assign({}, this.toJSON());

        this.save(error => {
          if (error) {
            return callback(error);
          } else {
            this.cart.delete(error => {
              if (error) {
                return callback(error);
              } else {
                sendEmail(
                  {
                    to: "zain302@hotmail.com", // order.cart.user.email for live purposes
                    subject: "Your order has been reiceved.",
                    text: "Order detials are as follows ... EMPTY :D"
                  },
                  (error, success) => {
                    if (error) {
                      console.log(
                        "Email not sent because of log somewhere in error log."
                      );
                    }
                    return callback(null, order);
                  }
                );
              }
            });
          }
        });
      }
    },
    {
      metadata: {
        order_id: 1001
      },
      currency: "usd",
      capture: true
    }
  );
};

Order.prototype.save = function(callback) {
  const id = crypto.randomBytes(16).toString("hex");
  fileHelper.fileExists("order", this.cart.user.email, (error, stat) => {
    if (error) {
      if (error.code == "ENOENT") {
        fileHelper.createDir("order", this.cart.user.email, error => {
          if (error) {
            callback(error);
          } else {
            fileHelper.save(
              "order",
              `${this.cart.user.email}/${id}`,
              this.toJSON(),
              callback
            );
          }
        });
      } else {
        return callback(error);
      }
    } else {
      if (stat.isDirectory) {
        fileHelper.save(
          "order",
          `${this.cart.user.email}/${id}`,
          this.toJSON(),
          callback
        );
      }
    }
  });
};

Order.listorders = async function(recent = false) {
  let incrementalPath = path.join(__dirname, "../data", "order");
  let usersHavingOrders = await fileHelper.readdir(path.join(incrementalPath));
  return await Promise.all(
    usersHavingOrders.map(async userDir => {
      let orders = await fileHelper.readdir(
        path.join(incrementalPath, userDir)
      );
      return await Promise.all(
        orders.map(async orderFile => {
          let stat = await fileHelper.stat(
            path.join(incrementalPath, userDir, orderFile)
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
          return {
            ...JSON.parse(
              await fileHelper.readfile(
                path.join(incrementalPath, userDir, orderFile)
              )
            ),
            email: userDir
          };
        })
      );
    })
  );

  return data;
};

Order.prototype.toJSON = function() {
  return {
    total: this.getTotal(),
    cart: this.cart.toJSON(),
    paymentDetails: this.paymentDetails,
    status: this.status
  };
};

module.exports = Order;
