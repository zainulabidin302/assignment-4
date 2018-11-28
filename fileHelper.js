const fs = require("fs");
const path = require("path");

let lib = {};
lib.dataDir = "data";
lib.save = function(collection, id, payload, callback) {
  let filePath = path.join(__dirname, this.dataDir, collection, id);
  // let stat = fs.lstatSync(filePath)
  // if (stat.isFile) {
  fs.writeFile(filePath, JSON.stringify(payload), callback);
  // } else {
  // fs.writeFile(filePath, payload, callback)
  // }
};
lib.fileExists = function(collection, id, callback) {
  let filePath = path.join(__dirname, this.dataDir, collection, id);
  fs.lstat(filePath, callback);
};
lib.delete = function(collection, id, callback) {
  let filePath = path.join(__dirname, this.dataDir, collection, id);
  fs.unlink(filePath, callback);
};
lib.createDir = function(collection, id, callback) {
  let filePath = path.join(__dirname, this.dataDir, collection, id);
  fs.mkdir(filePath, callback);
};

lib.fetchByIdentifier = function(collection, id, callback) {
  let filePath = path.join(__dirname, this.dataDir, collection, id);
  fs.readFile(filePath, (err, data) => {
    if (err) return callback(err);
    try {
      let json = JSON.parse(data);
      callback(null, json);
    } catch (error) {
      callback(error);
    }
  });
};

lib.readdir = async function(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};
lib.stat = async function(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
};
lib.readfile = async function(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString("utf8"));
      }
    });
  });
};
module.exports = lib;
