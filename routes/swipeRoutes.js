const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersPath = path.join(__dirname, '..', 'users.json');

router.post('/swipe', (req, res) => {
  const { email, targetId, direction } = req.body;

  if (!email || !targetId || !['like', 'pass'].includes(direction)) {
    return res.status(400).send('Missing or invalid swipe data.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  const user = users.find(u => u.profile.email === email);
  const target = users.find(u => u.id === targetId);

  if (!user || !target) {
    return res.status(404).send('User or target not found.');
  }

  // Initialize interaction fields if missing
  user.interactions = user.interactions || { likes: [], passes: [], matches: [] };
  target.interactions = target.interactions || { likes: [], passes: [], matches: [] };

  let newMatch = null;

  if (direction === 'like' && !user.interactions.likes.includes(targetId)) {
    user.interactions.likes.push(targetId);

    if (target.interactions.likes.includes(user.id)) {
      // Mutual like = match!
      user.interactions.matches.push(targetId);
      target.interactions.matches.push(user.id);
      newMatch = target.profile.name;
      console.log(`🎉 New match: ${user.id} & ${target.id}`);
    }
  }

  if (direction === 'pass' && !user.interactions.passes.includes(targetId)) {
    user.interactions.passes.push(targetId);
  }

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.send({ success: true, newMatch }); // Send match info
});

module.exports = router;