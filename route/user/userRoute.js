const express = require('express')
const user_route = express()
const path = require('path')

const userController = require("../../controller/user/userController")
const userProfileController = require("../../controller/user/userProfile")
const userAuth = require("../../middleware/userAuthValidation")


user_route.set("view engine", "ejs")
user_route.set("views", path.join(__dirname, "../../view/user"));

//USER LOGIN
user_route.get("/", userController.websiteHome)
user_route.get("/login", userAuth.is_userLoggedOut, userController.getUserLoginPage)
user_route.post("/login", userAuth.is_userLoggedOut, userController.verifyUser)

//USER SIGN UP
user_route.get("/signup", userAuth.is_userLoggedOut, userController.usersignupPage)
user_route.post("/signup", userAuth.is_userLoggedOut, userController.userRegistration)

//OTP SEND
user_route.get("/otpsend", userAuth.is_userLoggedOut, userController.loadSendOTP)
user_route.post("/otpsend", userAuth.is_userLoggedOut, userController.sendOTP)

//VERIFY OTP
user_route.post("/verify", userAuth.is_userLoggedOut, userController.verifyOTP)

//FORGOT PASSWORD
user_route.get("/enter-mobile-number", userAuth.is_userLoggedOut, userController.renderEnterMobileNumber)
user_route.post("/send-otp", userAuth.is_userLoggedOut, userController.cpSendOTP)

user_route.get("/enter-otp", userAuth.is_userLoggedOut, userController.renderEnterOTP)
user_route.post("/verify-otp", userAuth.is_userLoggedOut, userController.cpVerifyOTP)

user_route.get("/reset-password", userAuth.is_userLoggedOut, userController.renderResetPassword)
user_route.post("/set-new-password", userAuth.is_userLoggedOut, userController.setNewPassword)

//SINGLE PRODUCT VIEW
user_route.get("/productview", userController.productView)

//USER PROFILE
user_route.get("/user-profile", userAuth.is_userLoggedIn, userProfileController.getProfile)
user_route.post("/user-profile",userAuth.is_userLoggedIn, userProfileController.addadress)

//CART
user_route.post("/cart", userAuth.is_userLoggedIn, userProfileController.addToCart)
user_route.get("/cart", userAuth.is_userLoggedIn, userProfileController.loadAddtoCart)

//Quantity update
user_route.put("/updateqty/:cartId",userAuth.is_userLoggedIn, userProfileController.updateQuantity)

//delete cartproducts
user_route.get("/deletecart/:proId",userAuth.is_userLoggedIn, userProfileController.cartProductDelete)

//PROCEED TO CHECKOUT
user_route.get("/checkout",userAuth.is_userLoggedIn, userProfileController.proceedToCheckout)

//ORDER ITEMS
user_route.post("/verify-order",userAuth.is_userLoggedIn, userProfileController.verifyOrder)

//Show Order list
user_route.get("/order",userAuth.is_userLoggedIn,userProfileController.showOrder)

//Add Adress
user_route.post("/save-adress",userAuth.is_userLoggedIn, userProfileController.addAdress)

//Update Adress
user_route.get("/updateadress",userAuth.is_userLoggedIn,userProfileController.updateAdress)
// user_route.post("/updateadress",userAuth.is_userLoggedIn,userProfileController.saveAdressData)

//USER CHANGEPASSWORD
user_route.get("/change-password", userAuth.is_userLoggedIn, userProfileController.changePassword)
user_route.post("/change-password", userAuth.is_userLoggedIn, userProfileController.verifyPassword)


//user cancel order

user_route.get("/cancel/:orderId/:productId",userAuth.is_userLoggedIn,userProfileController.cancelOrder)
user_route.get("/return/:orderId/:productId",userAuth.is_userLoggedIn,userProfileController.returnOrder)





//LOGOUT
user_route.get("/logout", userController.logout)

user_route.get("/*", userProfileController.pagenotfound)



module.exports = user_route