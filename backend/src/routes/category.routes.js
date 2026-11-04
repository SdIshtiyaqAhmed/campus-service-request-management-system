const express = require('express');

const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');

const {
    authenticate,
    authorize
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    authenticate,
    getCategories
);

router.post(
    '/',
    authenticate,
    authorize('admin'),
    createCategory
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    updateCategory
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    deleteCategory
);

module.exports = router;
