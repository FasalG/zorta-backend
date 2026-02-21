import express from 'express';
import {
    getRentals, createRental, updateRental, deleteRental
} from '../controllers/rentalController.js';

const router = express.Router();

router.route('/')
    .get(getRentals)
    .post(createRental);

router.route('/:id')
    .put(updateRental)
    .delete(deleteRental);

export default router;
