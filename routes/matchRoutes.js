const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { matchUsers } = require('../utils/matchHelpers');

const usersPath = path.join(__dirname, '..', 'users.json');

// Helpers
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function convertToKm(distance, unit) {
  return unit === 'miles' ? distance * 1.60934 : distance;
}

// Load users safely
function loadUsers() {
  return fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    : [];
}

// POST /match – Legacy entry point for match evaluation
router.post('/match', (req, res) => {
  const currentUser = req.body;
  const allUsers = loadUsers();
  const matches = matchUsers(currentUser, allUsers);
  res.json(matches);
});

// GET /matches/:email – Retrieve a user's confirmed matches
router.get('/matches/:email', (req, res) => {
  const users = loadUsers();
  const { email } = req.params;

  const currentUser = users.find(u => u.profile.email === email);
  if (!currentUser) return res.status(404).send('User not found.');

  const matchedIds = currentUser.interactions?.matches || [];
  const matches = users.filter(u => matchedIds.includes(u.id));
  res.json(matches);
});

// GET /potential-matches/:email – Retrieve swipeable users
router.get('/potential-matches/:email', (req, res) => {
  const users = loadUsers();
  const { email } = req.params;

  const currentUser = users.find(u => u.profile.email === email);
  if (!currentUser) return res.status(404).send('User not found.');

  const excludedIds = new Set([
    currentUser.id,
    ...(currentUser.interactions?.likes || []),
    ...(currentUser.interactions?.passes || []),
    ...(currentUser.interactions?.matches || [])
  ]);

  const potentialUsers = users.filter(u => !excludedIds.has(u.id));
  res.json(potentialUsers);
});

module.exports = router;