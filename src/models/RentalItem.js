import mongoose from 'mongoose';

const rentalItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    total_quantity: { type: Number, required: true },
    available_quantity: { type: Number, required: true },
    daily_rate: { type: Number, required: true },
    weekly_rate: { type: Number, required: true },
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], required: true },
    status: { type: String, enum: ['available', 'partial', 'rented', 'maintenance'], required: true },
    description: { type: String, default: '' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

rentalItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const RentalItem = mongoose.model('RentalItem', rentalItemSchema);
export default RentalItem;
