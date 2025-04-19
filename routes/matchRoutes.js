const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { matchUsers } = require('../utils/matchHelpers');

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
  
  function matchUsers(currentUser, allUsers) {
    const matches = [];
  
    for (const user of allUsers) {
      if (user.profile.email === currentUser.profile.email) continue; // Skip self
  
      // 1. GENDER MATCH (Show me logic)
      const targetGenders = currentUser.matching["Show me"] || [];
      if (!targetGenders.includes(user.profile.gender)) continue;
  
      // 2. DISTANCE CHECK — always enforced
      if (currentUser.location && user.location) {
        const userDistance = getDistanceInKm(
          currentUser.location.lat,
          currentUser.location.lon,
          user.location.lat,
          user.location.lon
        );
  
        const maxDistKm = convertToKm(currentUser.matching.maxDistance, currentUser.matching.distanceUnit);
        if (userDistance > maxDistKm) continue;
      }
  
      // 3. SHARED INTERESTS
      const userInterests = user.matching.interests || [];
      const myInterests = currentUser.matching.interests || [];
  
      const hasSharedInterest = myInterests.some(interest => userInterests.includes(interest));
      const bothWantOnlineOnly =
        myInterests.includes("Online only") ? userInterests.includes("Online only") : true;
  
      if (!hasSharedInterest || !bothWantOnlineOnly) continue;
  
      // 4. ROLE MATCHING: e.g., "Dominants" in interests → match only if user.profile.role === "Dominant"
      const interestToRoleMap = {
        "Dominants": "Dominant",
        "Submissives": "Submissive",
        "Switch": "Switch"
      };
  
      const lookingForRoles = myInterests
        .map(i => interestToRoleMap[i])
        .filter(Boolean); // Only mapped roles
  
      if (lookingForRoles.length > 0 && !lookingForRoles.includes(user.profile.role)) {
        continue;
      }
  
      matches.push(user);
    }
  
    return matches;
  }

  router.post('/match', (req, res) => {
    const currentUser = req.body;
  
    const usersPath = path.join(__dirname, '../data/users.json');
    const allUsers = fs.existsSync(usersPath)
      ? JSON.parse(fs.readFileSync(usersPath))
      : [];
  
    const matches = matchUsers(currentUser, allUsers);
    res.json(matches);
  });
  
  router.get('/matches/:email', (req, res) => {
    const email = req.params.email;
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'users.json')));
  
    const currentUser = users.find(u => u.profile.email === email);
    if (!currentUser) return res.status(404).send('User not found.');
  
    const matches = matchUsers(currentUser, users);
    res.json(matches);
  });
  
  module.exports = router;