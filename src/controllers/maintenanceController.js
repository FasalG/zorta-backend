import Maintenance from '../models/Maintenance.js';

// @desc    Get all maintenance records
// @route   GET /api/maintenance
export const getMaintenanceRecords = async (req, res) => {
    try {
        const records = await Maintenance.find({ user: req.user._id }).populate('item').sort({ scheduled_date: 1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a maintenance record
// @route   POST /api/maintenance
export const createMaintenanceRecord = async (req, res) => {
    try {
        const newRecord = new Maintenance({
            ...req.body,
            user: req.user._id
        });
        const record = await newRecord.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a maintenance record
// @route   PUT /api/maintenance/:id
export const updateMaintenanceRecord = async (req, res) => {
    try {
        const record = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!record) return res.status(404).json({ message: 'Maintenance record not found or unauthorized' });
        res.status(200).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a maintenance record
// @route   DELETE /api/maintenance/:id
export const deleteMaintenanceRecord = async (req, res) => {
    try {
        const record = await Maintenance.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!record) return res.status(404).json({ message: 'Maintenance record not found or unauthorized' });
        res.status(200).json({ message: 'Maintenance record deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
