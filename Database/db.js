const mongoose = require('mongoose')

const dbConnect = (req,res)=>{
  // mongoose.connect("mongodb://127.0.0.1:27017/Project_Ecommerse", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
 
 mongoose.connect("mongodb+srv://aswinrajr07:yPXdXgF4ThtnerDz@cluster0.xf8fs26.mongodb.net/Project_Ecommerse", { useNewUrlParser: true, useUnifiedTopology: true }).then(()=> {
  console.log("connected to the database atlas")
}).catch((err) => {
  console.error("Error in connecting the database", err)
})
  
}

module.exports = dbConnect