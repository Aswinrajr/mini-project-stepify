const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   categoryName: [{
        type: String,
        require: true
    }],
    brand : {
        type: String,
        require:true
    },
    person:{
        type:String,
        required:true
    },
    size: {
        type: String,
        require: true
    },
    color: {
        type: String,
        require: true
    },
    price:{
        type:String,
        required:true,
    },
    quantity: {
        type: String,
        require: true
    },
    description:{
        type: String,
        required:true,
    },
    // mainImage:{
    //     type:String,
    //     // require:true
    // },
    image:[{
        type: String,
        // require: true
    }],
    isAvailable:{
        type:Boolean,
        default:true,
        require:true
    }
});

module.exports = mongoose.model('Products', productSchema);