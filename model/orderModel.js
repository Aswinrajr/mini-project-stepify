const mongoose = require("mongoose")

const User = require("./user/userModel")
const Product = require("./admin/productModel")

const orderData = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userMobile: {
        type: String,
        require: true
    },
    deliveryAddress: {
        type: String,
        require: true
    },
    items: [{
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            require: true
        },
        price: {
            type: Number,
            require: true
        },
        image:{
            type:String
        },

        status: {
            type: String,
            //enum: ["pending", "processing", "delivered","Req-for-return","returned"],
            default:"confirmed"
            
        },
        cancel: {
            type: Boolean,
            default: false
        }
    }],
    paymentMethod:{
        type:String,
        required:true
    },
    usedCouponCode:{
        type:String,
        

    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expectedDeliveryDate: {
        type: Date,
        require: true
    },
 
})

const order = mongoose.model("Order", orderData)
module.exports = order