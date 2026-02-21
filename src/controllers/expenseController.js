import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ expense_date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an expense
// @route   POST /api/expenses
export const createExpense = async (req, res) => {
    try {
        const newExpense = new Expense({
            ...req.body,
            user: req.user._id
        });
        const expense = await newExpense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!expense) return res.status(404).json({ message: 'Expense not found or unauthorized' });
        res.status(200).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!expense) return res.status(404).json({ message: 'Expense not found or unauthorized' });
        res.status(200).json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
