function generateUserId() {
    return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  
  module.exports = { generateUserId };