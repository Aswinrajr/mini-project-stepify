const mongoose = require('mongoose')
const product = require("../../model/admin/productModel")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active"
    }, cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: product

        },
        quantity: {
            type: Number,
            default:1,
        },
        totalPrice: {
            type: Number,
            required: true
        },
        status:{
            type:String,
            default:"Listed"
        }
    }],
    address: {
        items: [{
            firstName: {
                type: String,
                required:true
            },
            lastName:{
                type: String,
                required:true

            },
            altMobile: {
                type:Number,
                required: true,
            },
            HouseName: {
                type: String,
                require: true
            },
            addressLine:{
                type: String,
                required:true
            },
            nearestLandMark:{
                type: String,
                required:true
            },
            pincode:{
                type:Number,
                required: true,
            },       
            city: {
                type: String,
                required:true
            },
            state: {
                type: String,
                required:true
            },
         
        }]
    },
})

module.exports = mongoose.model("User", userSchema)