const express = require('express')
const session = require('express-session')
const path = require('path')
require('dotenv').config()
const app = express()
const multer = require("multer")
const userRoute = require("./route/user/userRoute")
const adminRoute = require("./route/admin/adminRoute")
const morgan = require('morgan');

const dbConnect = require("./Database/db")

//Connect to database
dbConnect()

app.use(morgan('tiny'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
app.use(session({
    secret: "uuidv4",
    resave: false,
    saveUninitialized: true
}))

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
  


app.set('view engine', 'ejs');
app.use('/view',express.static(path.join(__dirname, './view')));
app.use('/public',express.static(path.join(__dirname, './public')));

app.use("/admin",adminRoute)
app.use("/",userRoute)



app.listen(1999,()=>{
    console.log('server running in http://localhost:1999');
})