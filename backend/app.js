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

/* handle static content */
// handle uploaded images as static content
app.use('/uploadedImages', express.static(path.join(__dirname, 'uploadedImages')));
// handle ANY angular route as static content
app.use('/', express.static(path.join(__dirname, 'instapost')));

// Enable CORS (Note: only for two app deployment required)
/* app.use((req, res, next) => {
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
}); */

/* Routing */
// - Point all "Posts" routes to posts.js
// - Point all "User" routes to user.js
app.use('/api/posts', postsRoutes)
app.use('/api/user', userRoutes)
// - Point all NON-API routes to index.html (angular)
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'instapost','index.html'));
});

module.exports = app;
