import express from 'express';
import {
    getBookings, createBooking, updateBooking, deleteBooking, convertToRental
} from '../controllers/bookingController.js';

const router = express.Router();

router.route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id')
    .put(updateBooking)
    .delete(deleteBooking);

router.post('/:id/convert', convertToRental);

export default router;
