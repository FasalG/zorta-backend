import RentalItem from '../models/RentalItem.js';

// @desc    Get all items
// @route   GET /api/items
export const getItems = async (req, res) => {
    try {
        const items = await RentalItem.find({ user: req.user._id }).populate('category');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an item
// @route   POST /api/items
export const createItem = async (req, res) => {
    try {
        const newItem = new RentalItem({
            ...req.body,
            user: req.user._id
        });
        const item = await newItem.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create multiple items
// @route   POST /api/items/bulk
export const createBulkItems = async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Request body must be a non-empty array of items' });
        }

        const itemsWithUser = items.map(item => ({
            ...item,
            user: req.user._id
        }));

        const insertedItems = await RentalItem.insertMany(itemsWithUser);
        res.status(201).json(insertedItems);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
export const updateItem = async (req, res) => {
    try {
        const item = await RentalItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found or unauthorized' });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res) => {
    try {
        const item = await RentalItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found or unauthorized' });
        res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
