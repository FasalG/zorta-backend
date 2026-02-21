import Rental from '../models/Rental.js';

// @desc    Get all rentals
// @route   GET /api/rentals
export const getRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ user: req.user._id })
            .populate('customer')
            .populate('item')
            .populate('booking')
            .sort({ createdAt: -1 });
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a rental
// @route   POST /api/rentals
export const createRental = async (req, res) => {
    try {
        const newRental = new Rental({
            ...req.body,
            user: req.user._id
        });
        const rental = await newRental.save();
        res.status(201).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a rental
// @route   PUT /api/rentals/:id
export const updateRental = async (req, res) => {
    try {
        const rental = await Rental.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!rental) return res.status(404).json({ message: 'Rental not found or unauthorized' });
        res.status(200).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a rental
// @route   DELETE /api/rentals/:id
export const deleteRental = async (req, res) => {
    try {
        const rental = await Rental.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!rental) return res.status(404).json({ message: 'Rental not found or unauthorized' });
        res.status(200).json({ message: 'Rental deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
