const express = require('express');

const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    assignRequest,
    updateRequestStatus,
    closeRequest
} = require('../controllers/request.controller');

const {
    authenticate,
    authorize
} = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/',
    authenticate,
    authorize('student'),
    createRequest
);

router.get(
    '/',
    authenticate,
    getRequests
);

router.patch(
    '/:id/close',
    authenticate,
    authorize('student'),
    closeRequest
);

router.get(
    '/:id',
    authenticate,
    getRequestById
);

router.put(
    '/:id',
    authenticate,
    updateRequest
);

router.patch(
    '/:id/assign',
    authenticate,
    authorize('admin'),
    assignRequest
);

router.patch(
    '/:id/status',
    authenticate,
    authorize('staff'),
    updateRequestStatus
);

module.exports = router;