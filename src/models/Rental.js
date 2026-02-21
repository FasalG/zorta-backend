import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    rental_number: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    start_date: { type: Date, required: true },
    due_date: { type: Date, required: true },
    return_date: { type: Date },
    duration_days: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
    status: { type: String, enum: ['active', 'overdue', 'returned', 'extended'], default: 'active' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

rentalSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
