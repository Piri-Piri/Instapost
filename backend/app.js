const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// import routes
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

// Connect to MongoDB
mongoose.connect(
    'mongodb+srv://david:' +
    process.env.MONGO_ATLAS_PW +
    '@cluster0-wuev6.mongodb.net/instapost?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('Connected to database!');
  })
  .catch((err) => {
    console.log('Connection failed: ' + err.message);
  });

// Parse Body of all Requests
app.use(bodyParser.json());
// handle uploaded images as statis content
app.use('/uploadedImages', express.static(path.join('backend/uploadedImages')));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Routing:
// - Point all "Posts" routes to posts.js
// - Point all "User" routes to user.js
app.use('/api/posts', postsRoutes)
app.use('/api/user', userRoutes)

module.exports = app;
