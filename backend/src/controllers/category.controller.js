const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({
            isActive: true
        }).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: {
                categories
            }
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const {
            name,
            description
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const normalizedName = name.trim();

        const existingCategory = await Category.findOne({
            name: {
                $regex: `^${normalizedName}$`,
                $options: 'i'
            }
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: 'A category with this name already exists'
            });
        }

        const category = await Category.create({
            name: normalizedName,
            description
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const {
            name,
            description,
            isActive
        } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        if (name !== undefined) {
            const normalizedName = name.trim();

            const duplicate = await Category.findOne({
                _id: {
                    $ne: category._id
                },
                name: {
                    $regex: `^${normalizedName}$`,
                    $options: 'i'
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'A category with this name already exists'
                });
            }

            category.name = normalizedName;
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (isActive !== undefined) {
            category.isActive = isActive;
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = false;

        await category.save();

        return res.status(200).json({
            success: true,
            message: 'Category deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
