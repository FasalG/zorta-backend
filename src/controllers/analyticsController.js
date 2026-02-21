import Rental from '../models/Rental.js';
import Expense from '../models/Expense.js';
import RentalItem from '../models/RentalItem.js';
import Booking from '../models/Booking.js';

// @desc    Get dashboard stats
// @route   GET /api/analytics/stats
export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalRevenue = await Rental.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);

        const activeRentalsCount = await Rental.countDocuments({ status: 'active', user: userId });

        const totalItems = await RentalItem.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$total_quantity' } } }
        ]);

        const availableItems = await RentalItem.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$available_quantity' } } }
        ]);

        const pendingBookingsCount = await Booking.countDocuments({ status: 'pending', user: userId });

        const totalExpenses = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.status(200).json({
            totalRevenue: totalRevenue[0]?.total || 0,
            activeRentalsCount,
            availableItemsCount: availableItems[0]?.total || 0,
            totalItemsCount: totalItems[0]?.total || 0,
            pendingBookingsCount,
            totalExpenses: totalExpenses[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activities
// @route   GET /api/analytics/recent
export const getRecentActivities = async (req, res) => {
    try {
        const recentRentals = await Rental.find({ user: req.user._id })
            .populate('customer', 'name')
            .populate('item', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            recentRentals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
