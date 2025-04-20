const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const uploadRoutes = require('./routes/uploadRoutes');

app.use(uploadRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dating-app', 'public')));

// HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app', 'public', 'index.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app', 'public', 'signup.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app','public', 'login.html'));
});
app.get('/signup-success', (req, res) => {
  res.send('<h1>Signup successful!</h1><a href="/">Back to Home</a>');
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app','public', 'dashboard.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app', 'public', 'profile.html'));
});
app.get('/swipe', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app', 'public', 'swipe.html'));
});
app.get('/swipecard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dating-app', 'public', 'swipecard.html'));
});


// Use routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// Use profileRoutes
const profileRoutes = require('./routes/profileRoutes');
app.use('/profile', profileRoutes); 

// User matchRoutes
const matchRoutes = require('./routes/matchRoutes');
app.use(matchRoutes);

// Use Swipe routes
const swipeRoutes = require('./routes/swipeRoutes');
app.use(swipeRoutes);

//Use Message Routes
const messageRoutes = require('./routes/messageRoutes.js');
app.use(messageRoutes);

// ✅ ROUTES LOADED (move this AFTER all app.use(...) calls)
function printRoutes(router, prefix = '') {
  if (!router || !router.stack) {
    console.log('⚠️  No routes found in this router.');
    return;
  }

  router.stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .map(m => m.toUpperCase())
        .join(', ');
      console.log(`➡️  ${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const path = layer.regexp?.source
        ?.replace('^\\/', '/')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\$$/, '') || '';
      printRoutes(layer.handle, prefix + path);
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log('\n✅ ROUTES LOADED:');
  printRoutes(app._router);
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
