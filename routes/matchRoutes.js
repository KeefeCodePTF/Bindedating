const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { matchUsers } = require('../utils/matchHelpers');  // Import the function

function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function convertToKm(distance, unit) {
    return unit === 'miles' ? distance * 1.60934 : distance;
}

router.post('/match', (req, res) => {
    const currentUser = req.body;

    const usersPath = path.join(__dirname, '../data/users.json');
    const allUsers = fs.existsSync(usersPath)
      ? JSON.parse(fs.readFileSync(usersPath))
      : [];

    const matches = matchUsers(currentUser, allUsers);  // Use the imported function
    res.json(matches);
});

router.get('/matches/:email', (req, res) => {
    const email = req.params.email;
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'users.json')));
  
    const currentUser = users.find(u => u.profile.email === email);
    if (!currentUser) return res.status(404).send('User not found.');
  
    const matchedIds = currentUser.interactions?.matches || [];
  
    const matches = users.filter(u => matchedIds.includes(u.id));
    res.json(matches);
  });

module.exports = router;