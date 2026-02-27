import Booking from '../models/Booking.js';
import Maintenance from '../models/Maintenance.js';
import RentalItem from '../models/RentalItem.js';

// Helper to check availability for multiple items
const checkAvailability = async (items, startDate, endDate, excludeBookingId = null, userId) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const itemRequest of items) {
        const rentalItem = await RentalItem.findOne({ _id: itemRequest.item, user: userId });
        if (!rentalItem) throw new Error(`Item ${itemRequest.item} not found`);

        // 1. Get total quantity
        const totalQty = rentalItem.total_quantity;

        // 2. Find overlapping bookings for this specific item
        const overlappingBookings = await Booking.find({
            user: userId,
            _id: { $ne: excludeBookingId },
            status: { $in: ['pending', 'active', 'confirmed'] },
            'items.item': itemRequest.item,
            $or: [
                { start_date: { $lt: end }, end_date: { $gt: start } }
            ]
        });

        const bookedQty = overlappingBookings.reduce((sum, b) => {
            const bookedItem = b.items.find(i => i.item.toString() === itemRequest.item.toString());
            return sum + (bookedItem ? bookedItem.quantity : 0);
        }, 0);

        // 3. Find overlapping maintenance
        const overlappingMaintenance = await Maintenance.find({
            user: userId,
            item: itemRequest.item,
            status: { $in: ['scheduled', 'in_progress', 'overdue'] },
            $or: [
                { scheduled_date: { $lt: end }, completed_date: { $exists: false } },
                { scheduled_date: { $lt: end }, completed_date: { $gt: start } }
            ]
        });

        // Assuming each maintenance record takes 1 unit out of service
        const maintenanceQty = overlappingMaintenance.length;

        const available = totalQty - bookedQty - maintenanceQty;

        if (itemRequest.quantity > available) {
            throw new Error(`Item "${rentalItem.name}" is not available for the selected dates. Available: ${available}, Requested: ${itemRequest.quantity}`);
        }
    }
    return true;
};

// @desc    Get all bookings
// @route   GET /api/bookings
export const getBookings = async (req, res) => {
    try {
        let bookings = await Booking.find({ user: req.user._id })
            .populate('customer')
            .populate('items.item')
            .populate('bank_detail');

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Auto-update status based on dates if not manually cancelled/closed/confirmed
        const updatedBookings = bookings.map(booking => {
            if (['cancelled', 'closed', 'confirmed'].includes(booking.status)) return booking;

            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            let newStatus = booking.status;
            if (now >= start && now <= end) {
                newStatus = 'active';
            } else if (now < start) {
                newStatus = 'pending';
            } else if (now > end) {
                // If past end date but not closed, keep it as active (awaiting return)
                newStatus = 'active';
            }

            if (newStatus !== booking.status) {
                booking.status = newStatus;
                // No save here, just in-memory for the current request
            }
            return booking;
        });

        res.status(200).json(updatedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const { items, start_date, end_date } = req.body;

        // Check availability
        await checkAvailability(items, start_date, end_date, null, req.user._id);

        // Calculate amount on backend for security/integrity
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        let calculatedAmount = 0;
        for (const itemRequest of items) {
            const rentalItem = await RentalItem.findById(itemRequest.item);
            if (rentalItem) {
                calculatedAmount += (rentalItem.daily_rate * itemRequest.quantity * diffDays);
                // Note: We could use weekly_rate logic here if diffDays >= 7
            }
        }

        const newBooking = new Booking({
            ...req.body,
            amount: calculatedAmount, // Override frontend amount
            duration_days: diffDays,
            user: req.user._id
        });
        const booking = await newBooking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
    try {
        const { items, start_date, end_date } = req.body;

        // Check availability excluding current booking
        await checkAvailability(items, start_date, end_date, req.params.id, req.user._id);

        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        let calculatedAmount = 0;
        for (const itemRequest of items) {
            const rentalItem = await RentalItem.findById(itemRequest.item);
            if (rentalItem) {
                calculatedAmount += (rentalItem.daily_rate * itemRequest.quantity * diffDays);
            }
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { ...req.body, amount: calculatedAmount, duration_days: diffDays },
            { new: true }
        ).populate('customer').populate('items.item');

        if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
        res.status(200).json({ message: 'Booking deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
