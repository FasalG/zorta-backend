import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    booking_number: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    duration_days: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
