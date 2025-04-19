const express = require('express');
const router = express.Router();

const { isValidName, isValidPassword } = require('../utils/validators');
const { readUsers, writeUsers } = require('../utils/fileHandler');

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!isValidName(name)) {
    return res.send(`<script>alert('❌ Invalid name.'); window.location.href='/signup';</script>`);
  }

  if (!isValidPassword(password)) {
    return res.send(`<script>alert('❌ Weak password.'); window.location.href='/signup';</script>`);
  }

  try {
    const users = await readUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return res.send(`<script>alert('⚠️ Email already registered.'); window.location.href='/signup';</script>`);
    }

    const newUser = { name, email, password };
    users.push(newUser);
    await writeUsers(users);

    console.log('New user saved:', newUser);
    return res.redirect('/signup-success');

  } catch (err) {
    console.error('Error in signup:', err);
    return res.status(500).send('Internal server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.send(`<script>alert('Invalid credentials.'); window.location.href='/login';</script>`);
    }

    const script = `
      <script>
        localStorage.setItem('loggedInUser', JSON.stringify(${JSON.stringify(user)}));
        window.location.href = '/dashboard';
      </script>
    `;

    res.send(script);
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;