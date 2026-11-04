const express = require('express');

const {
    getComments,
    createComment
} = require('../controllers/comment.controller');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/requests/:id/comments',
    authenticate,
    getComments
);

router.post(
    '/requests/:id/comments',
    authenticate,
    createComment
);

module.exports = router;
