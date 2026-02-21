import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
