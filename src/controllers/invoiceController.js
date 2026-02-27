import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';

// @desc    Get all invoices
// @route   GET /api/invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.user._id }).populate('customer').populate('booking');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an invoice
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
    try {
        const newInvoice = new Invoice({
            ...req.body,
            user: req.user._id
        });
        const invoice = await newInvoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Register a payment for an invoice
// @route   POST /api/invoices/:id/payments
export const registerPayment = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found or unauthorized' });
        }

        const { amount, method, transaction_id } = req.body;

        const payment = await Payment.create({
            invoice: invoice._id,
            amount,
            method,
            transaction_id,
            payment_date: new Date()
        });

        // Update invoice paid amount and status
        invoice.paid_amount += amount;
        if (invoice.paid_amount >= invoice.total_amount) {
            invoice.status = 'paid';
        }
        await invoice.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
