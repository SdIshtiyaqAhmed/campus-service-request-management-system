const express = require('express');

const {
    getUsers,
    getUser,
    updateUser,
    getStatistics
} = require('../controllers/admin.controller');

const {
    authenticate,
    authorize
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.get('/statistics', getStatistics);

module.exports = router;
