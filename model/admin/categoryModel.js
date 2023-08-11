const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    
  },
  brand:{
    type:String,
    required:true

  },
  isAvailable:{
    type:Boolean,
    default:true,
    required:true
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
