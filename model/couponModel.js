const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    offerCode:
    {
        type: String,
        required: true,
    },
    amount:
    {
        type: Number,
        required: true
    },
    validFrom:
    {
        type: Date,
        required: true
    },
    validUntil:
    {
        type: Date,
        required: true
    },
    couponCode: {
        type: String,
        default: ''
    },
    status:
    {
        type: String,
        default: "Valid"
    },

});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
