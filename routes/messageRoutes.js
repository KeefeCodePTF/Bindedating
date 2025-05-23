const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const messagesPath = path.join(__dirname, '..', 'data', 'messages.json');
const usersPath = path.join(__dirname, '..', 'users.json');

router.post('/message', (req, res) => {
  const { fromId, toId, content } = req.body;

  if (!fromId || !toId || !content) {
    return res.status(400).send('Missing data.');
  }

  const newMessage = {
    from: fromId,
    to: toId,
    content,
    timestamp: new Date().toISOString()
  };

  const messages = fs.existsSync(messagesPath)
    ? JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))
    : [];

  messages.push(newMessage);
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

  res.send({ success: true });
});

router.get('/messages/:userId/:matchId', (req, res) => {
  const { userId, matchId } = req.params;

  const messages = fs.existsSync(messagesPath)
    ? JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))
    : [];

  const conversation = messages.filter(m =>
    (m.from === userId && m.to === matchId) ||
    (m.from === matchId && m.to === userId)
  );

  res.send(conversation);
});

module.exports = router;