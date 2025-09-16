const express = require('express');
const router = express.Router();
const { createPost, interestedInPost } = require('../controllers/postController');

// Route to create a new hackathon post
router.post('/create', createPost);
// Route to express interest in a post
router.post('/interested', interestedInPost);

module.exports = router;
