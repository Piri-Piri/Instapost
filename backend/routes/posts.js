const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const PostController = require('../controllers/posts');

// Create Post (protected)
router.post('', checkAuth, extractFile, PostController.createPost);

// Edit Post (protected)
router.put('/:id', checkAuth, extractFile, PostController.editPost);

// Get all Posts
router.get('', PostController.getPosts);

// Get Post by Id
router.get('/:id', PostController.getPost);

// Delete Post by Id (protected)
router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;
