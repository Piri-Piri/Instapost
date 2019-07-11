const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
}

// multer configuration (destination and filename)
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type')
    if (isValid) {
      error = null;
    }
    callback(error, 'backend/uploadedImages')
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});


// Create Post (protected)
router.post('', checkAuth, multer({ storage: storage }).single('image'), (req, res, next) => {
  const srvURL = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageURL: srvURL + '/uploadedImages/' + req.file.filename,
    creator: req.userData.userId
  })
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully!',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imageURL: createdPost.imageURL
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "Creating a post failed!"
    });
  });
});

// Edit Post (protected)
router.put('/:id', checkAuth, multer({ storage: storage }).single('image'), (req, res, next) => {
  let imageURL = req.body.imageURL;
  if (req.file) {
    const srvURL = req.protocol + '://' + req.get('host');
    imageURL = srvURL + '/uploadedImages/' + req.file.filename
  }
  const updatedPost = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imageURL: imageURL,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, updatedPost).then(result => {
    if (result.nModified > 0) {
      res.status(200).json({ message: 'Update succesful!' });
    } else {
      res.status(401).json({ message: 'Unauthorized!' });
    }
  })
  .catch(err => {
    res.status(500).json({ message: 'Post could NOT be updated!' });
  });
});

// Get all Posts
router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched succesfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  })
  .catch(err => {
    res.status(500).json({ message: 'Fetching posts failed!' });
  });
});

// Get Post by Id
router.get('/:id', (req, res, next) => {
   Post.findById(req.params.id).then(document => {
    if (document) {
      res.status(200).json(document);
    } else {
      res.status(404).json({
        message: 'Post not found!'
      });
    }
  })
  .catch(err => {
    res.status(500).json({ message: 'Fetching post failed!' });
  });
});

// Delete Post by Id (protected)
router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Deletion successful!' });
      } else {
        res.status(401).json({ message: 'Unauthorized!' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting post failed!' });
    });
});

module.exports = router;
