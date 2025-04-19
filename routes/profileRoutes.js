const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const geoip = require('geoip-lite');
const router = express.Router();

const usersFilePath = path.join(__dirname, '..', 'users.json');

// Helper to generate unique user ID
function generateUserId() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// POST to update profile for existing user
router.post('/profile', async (req, res) => {
  const { profile, matching, password } = req.body;

  if (!profile || !profile.email) {
    return res.status(400).send('Missing profile or email.');
  }

  try {
    // Read existing users
    let users = [];
    if (fs.existsSync(usersFilePath)) {
      const rawData = fs.readFileSync(usersFilePath, 'utf-8');
      users = JSON.parse(rawData);
    }

    // Try to find existing user by email (stored in profile.email)
    let user = users.find(u => u.profile?.email === profile.email);

    // If no existing user, create a new one
    if (!user) {
      user = {
        id: generateUserId(),
        profile: {
          name: profile.name || '',
          email: profile.email,
          gender: '',
          role: '',
          description: '',
          relationshipGoals: '',
          softLimits: '',
          hardLimits: ''
        },
        passwordHash: password ? await bcrypt.hash(password, 10) : '',
        matching: {
          "Show me": matching?.["Show me"] || [],
          maxDistance: matching?.maxDistance || 1,
          distanceUnit: matching?.distanceUnit || "km",
          interests: matching?.interests || []
        },
        location: {
          ip: req.ip || '',
          lat: null,
          lng: null
        },
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };

      users.push(user);
    } else {
      // Update existing profile (except email)
      user.profile.name = profile.name || user.profile.name;
      user.profile.gender = profile.gender || user.profile.gender;
      user.profile.role = profile.role || user.profile.role;
      user.profile.description = profile.description || user.profile.description;
      user.profile.relationshipGoals = profile.relationshipGoals || user.profile.relationshipGoals;
      user.profile.softLimits = profile.softLimits || user.profile.softLimits;
      user.profile.hardLimits = profile.hardLimits || user.profile.hardLimits;

      // Optional password update
      if (password && password.trim().length > 0) {
        user.passwordHash = await bcrypt.hash(password, 10);
      }

      // Matching settings
      if (matching) {
        user.matching["Show me"] = matching["Show me"] || user.matching["Show me"];
        user.matching.maxDistance = matching.maxDistance || user.matching.maxDistance;
        user.matching.distanceUnit = matching.distanceUnit || user.matching.distanceUnit;
        user.matching.interests = matching.interests || user.matching.interests;
      }

      user.lastActiveAt = new Date().toISOString();
    }

    // Save users back to file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.status(200).send({ message: 'Profile saved successfully', userId: user.id });

  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).send('Internal server error.');
  }
});

module.exports = router;