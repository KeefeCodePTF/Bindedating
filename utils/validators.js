// utils/validators.js

const nameRegex = /^[\p{L} '-]{2,}$/u;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

function isValidName(name) {
  return name && nameRegex.test(name.trim());
}

function isValidPassword(password) {
  return password && passwordRegex.test(password);
}

module.exports = {
  isValidName,
  isValidPassword,
};
