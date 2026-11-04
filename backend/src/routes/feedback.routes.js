const express = require('express');

const {
    createFeedback,
    getRequestFeedback,
    getFeedback
} = require('../controllers/feedback.controller');

const {
    authenticate,
    authorize
} = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/requests/:id/feedback',
    authenticate,
    authorize('student'),
    createFeedback
);

router.get(
    '/requests/:id/feedback',
    authenticate,
    getRequestFeedback
);

router.get(
    '/feedback',
    authenticate,
    authorize('admin'),
    getFeedback
);

module.exports = router;
