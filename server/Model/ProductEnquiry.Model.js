const mongoose = require('mongoose');

const ProductEnquirySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ProductEnquiry = mongoose.model('ProductEnquiry', ProductEnquirySchema);
module.exports = ProductEnquiry;