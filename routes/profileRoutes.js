const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'public/uploads/' });
const usersFilePath = path.join(__dirname, '..', 'users.json');

const { generateUserId } = require('../utils/idGenerator');
const { reverseGeocode } = require('../utils/locationService');

// 🟡 POST /profile/initial – handles signup.html submissions
router.post('/initial', upload.array('media', 9), async (req, res) => {
  const { name, email, password, birthday, gender, attraction, role, interests } = req.body;

  if (!name || !email || !password || !birthday) {
    return res.status(400).send('Missing required fields.');
  }

  try {
    const users = fs.existsSync(usersFilePath)
      ? JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
      : [];

    if (users.find(u => u.profile?.email === email)) {
      return res.status(400).send('Email already registered.');
    }

    const newUser = {
      id: generateUserId(),
      profile: {
        name,
        email,
        birthday,
        gender,
        role,
        attraction: attraction ? attraction.split(',') : [],
        interests: interests ? interests.split(',') : [],
        description: '',
        relationshipGoals: '',
        limits: ''
      },
      passwordHash: await bcrypt.hash(password, 10),
      media: req.files?.map(f => f.filename) || [],
      matching: {
        maxDistance: 100,
        distanceUnit: 'km',
        maxOlder: 0,
        maxYounger: 0
      },
      location: {
        ip: req.ip || '',
        lat: null,
        lng: null,
        city: ''
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    // Optional: Get user location from localStorage
    const locationHeader = req.headers['x-user-location'];
    if (locationHeader) {
      const { lat, lng } = JSON.parse(locationHeader);
      newUser.location.lat = lat;
      newUser.location.lng = lng;

      // 🧠 Use reverse geocoding
      reverseGeocode(lat, lng, (err, city) => {
        if (!err && city) {
          newUser.location.city = city;
        }
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return res.status(200).send({ message: 'User created', userId: newUser.id });
      });
    } else {
      users.push(newUser);
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      return res.status(200).send({ message: 'User created', userId: newUser.id });
    }

  } catch (err) {
    console.error('❌ Error creating user:', err);
    return res.status(500).send('Internal server error.');
  }
});

// 🟡 POST /profile/update – handles profile.html edits
router.post('/update', async (req, res) => {
  const {
    email,
    description,
    relationshipGoals,
    limits,
    distance,
    distanceUnit,
    maxOlder,
    maxYounger
  } = req.body;

  if (!email) return res.status(400).send('Missing email.');

  try {
    const users = fs.existsSync(usersFilePath)
      ? JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
      : [];

    const user = users.find(u => u.profile?.email === email);
    if (!user) return res.status(404).send('User not found.');

    user.profile.description = description;
    user.profile.relationshipGoals = relationshipGoals;
    user.profile.limits = limits;

    user.matching.maxDistance = parseInt(distance) || 100;
    user.matching.distanceUnit = distanceUnit || 'km';
    user.matching.maxOlder = parseInt(maxOlder) || 0;
    user.matching.maxYounger = parseInt(maxYounger) || 0;

    user.lastActiveAt = new Date().toISOString();

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return res.status(200).send({ message: 'Profile updated', userId: user.id });

  } catch (err) {
    console.error('❌ Error updating profile:', err);
    return res.status(500).send('Internal server error.');
  }
});

module.exports = router;
