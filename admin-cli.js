const readline = require("readline");
const EventEmmiter = require("events");
let $event = new EventEmmiter();
const { Console } = require("console");
const fs = require("fs");
let stdout_logfile = fs.createWriteStream("info.log");
let stderr_logfile = fs.createWriteStream("error.log");

// let $logger = new Console(stdout_logfile, stderr_logfile);
let $logger = new Console(process.stdout, process.stderr);

const Order = require("./models/Order");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ">"
});

const handler = {
  help: () => {
    console.table(
      COMMANDS.map(command => {
        return {
          "Long Option": command.long_option,
          "Short Option": command.short_option,
          Description: command.description
        };
      })
    );
  },
  orders: async () => {
    try {
      let users = await Order.listorders();
      let ordersCount = users.filter(a => a.filter(b => b !== null).length > 0)
        .length;
      if (ordersCount === 0) {
        return console.log("No orders found!");
      }
      users.forEach(orders => {
        orders.forEach(item => {
          if (item.cart && item.cart.cartItems) {
            console.table({
              payment:
                item.payment !== null
                  ? `DONE (${item.paymentDetails.id})`
                  : "Not yet",
              total: item.total,
              user: item.email
            });
          } else {
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  orders_recent: async () => {
    try {
      let users = await Order.listorders(true);

      let ordersCount = users.filter(a => a.filter(b => b !== null).length > 0)
        .length;
      if (ordersCount === 0) {
        return console.log("No orders found!");
      }
      users.forEach(orders => {
        orders.forEach(item => {
          if (item && item.cart && item.cart.cartItems) {
            console.table({
              payment:
                item.payment !== null
                  ? `DONE (${item.paymentDetails.id})`
                  : "Not yet",
              total: item.total,
              user: item.email
            });
          } else {
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  users: async () => {
    if (users.filter(item => item !== null).length === 0) {
      console.log("Users not found");
    } else {
      console.table(users);
    }
  },
  users_recent: async () => {
    let users = await User.listusers(true);
    if (users.filter(item => item !== null).length === 0) {
      console.log("Users not found");
    } else {
      console.table(users);
    }
  },
  user_email: async email => {
    if (typeof email === "object" && email instanceof Array) {
      console.log(email);
      try {
        let user = await User.byEmail(email[0]);
        console.table(user);
      } catch (error) {
        if (error.code && error.code === "ENOENT") {
          console.log("user not found");
        } else {
          console.log("error");
        }
      }
    } else {
      console.log("plasea provide a valid email");
    }
  }
};

let COMMANDS = [
  {
    long_option: "help",
    short_option: "h",
    args: 0,
    handler: handler.help,
    description: "Show this help message."
  },
  {
    long_option: "orders",
    short_option: "o",
    args: 0,
    handler: handler.orders,
    description: "Show all the orders available."
  },
  {
    long_option: "orders-recent",
    short_option: "or",
    args: 0,
    handler: handler.orders_recent,
    description: "Show orders for the last 24 hours only."
  },
  {
    long_option: "users",
    short_option: "u",
    args: 0,
    handler: handler.users,
    description: "Show all users in the system."
  },
  {
    long_option: "users-recent",
    short_option: "ur",
    args: 0,
    handler: handler.users_recent,
    description: "Show users that are registerd only 24 or less."
  },
  {
    long_option: "user-email",
    short_option: "ue",
    args: 1,
    handler: handler.user_email,
    description:
      "Show users data againt email. It takes a single parameter which is email."
  }
];

COMMANDS.forEach(command => {
  $event.on(command.long_option, args => {
    command.handler(args);
  });
});

let commandProcessor = cmd => {
  let cmdParts = cmd.split(" ");
  if (cmdParts.length > 0) {
    let mainCommand = cmdParts[0];
    if (typeof mainCommand === "string" && mainCommand.length > 0) {
      let results = COMMANDS.filter(
        item =>
          item.long_option === mainCommand || item.short_option === mainCommand
      );

      if (results.length === 1) {
        argsLength = results[0].args;

        // We emmit event on long_option because
        // We have registered event on that.
        mainCommand = results[0].long_option;
        if (argsLength > 0) {
          // mainCommand contains the long_option
          // of the command.
          if (cmdParts.slice(1).length === argsLength) {
            $event.emit(mainCommand, cmdParts.slice(1));
          } else {
            $logger.error(
              "%s : command %s requires %d arguments",
              new Date().toISOString(),
              mainCommand,
              argsLength
            );
          }
        } else {
          $event.emit(mainCommand);
        }
      } else {
        $logger.error(
          '%s : command "%s" not found',
          new Date().toISOString(),
          cmd
        );
      }
    } else {
      $logger.error(
        "%s : No command was detected",
        new Date().toISOString(),
        cmd
      );
    }
  } else {
    $logger.error(
      "%s : Command %s was invalid",
      new Date().toISOString(),
      cmdParts
    );
  }
};

let handleline = line => {
  let cmd = commandProcessor(line.trim());
};

rl.on("line", handleline);
