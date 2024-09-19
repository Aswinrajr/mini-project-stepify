const mongoose = require("mongoose");

const dbConnect = (req, res) => {
  mongoose
    .connect(
      "mongodb+srv://aswinrajr07:6ZNOuiYwUjPkYs7N@cluster0.xf8fs26.mongodb.net/Stepify_Ecommerse",
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log("connected to the database");
    })
    .catch((err) => {
      console.error("Error in connecting the database", err);
    });
};

module.exports = dbConnect;
