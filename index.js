const express = require('express')
const session = require('express-session')
const path = require('path')
require('dotenv').config()
const app = express()
const multer = require("multer")
const userRoute = require("./route/user/userRoute")
const adminRoute = require("./route/admin/adminRoute")
const morgan = require('morgan');
const flash = require("connect-flash");

//Requiring middleware session
const sessionMiddleware = require("./middleware/sessionHandling")

const dbConnect = require("./Database/db")

//Connect to database
dbConnect()

// app.use(morgan('tiny'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware.setCacheHeaders)
app.use(sessionMiddleware.configureSession())
app.use(sessionMiddleware.setNoCacheHeaders)
app.use(flash());

app.set('view engine', 'ejs');
app.use('/view', express.static(path.join(__dirname, './view')));
app.use('/public', express.static(path.join(__dirname, './public')));

app.use("/admin", adminRoute)
app.use("/", userRoute)



app.listen(1999, () => {
    console.log('server running in http://localhost:1999');
})