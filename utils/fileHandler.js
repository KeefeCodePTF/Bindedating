const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'users.json');

function readUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        const users = JSON.parse(data);
        resolve(users);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function writeUsers(users) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  readUsers,
  writeUsers,
};
