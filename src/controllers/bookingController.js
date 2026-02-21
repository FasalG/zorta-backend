import Booking from '../models/Booking.js';
import Rental from '../models/Rental.js';

// @desc    Get all bookings
// @route   GET /api/bookings
export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('customer').populate('item');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
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
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
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

// @desc    Convert booking to rental
// @route   POST /api/bookings/:id/convert
export const convertToRental = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        // Create a new rental based on the booking
        const rental = await Rental.create({
            rental_number: 'RNT-' + Date.now().toString().slice(-6),
            user: req.user._id,
            customer: booking.customer,
            item: booking.item,
            booking: booking._id,
            start_date: booking.start_date,
            due_date: booking.end_date,
            duration_days: booking.duration_days,
            total_amount: booking.amount,
            paid_amount: 0,
            payment_status: 'unpaid',
            status: 'active'
        });

        // Update booking status to confirmed
        booking.status = 'confirmed';
        await booking.save();

        res.status(201).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
