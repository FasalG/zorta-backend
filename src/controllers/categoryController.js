import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
    try {
        const newCategory = new Category({
            ...req.body,
            user: req.user._id
        });
        const category = await newCategory.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found or unauthorized' });
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!category) return res.status(404).json({ message: 'Category not found or unauthorized' });
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
