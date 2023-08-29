const express = require('express')
const user_route = express()
const path = require('path')

const userController = require("../../controller/user/userController")
const userProfileController = require("../../controller/user/userProfile")
const userAuth = require("../../middleware/userAuthValidation")
const razorpayController = require('../../controller/user/razorpayControler');


// user_route.set("view engine", "ejs")
user_route.set("views", path.join(__dirname, "../../view/user"));

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

//USER LOGIN
user_route.get("/", userController.websiteHome)
user_route.get("/login", userAuth.is_userLoggedOut, userController.getUserLoginPage)
user_route.post("/login", userAuth.is_userLoggedOut, userController.verifyUser)

//SINGLE PRODUCT VIEW
user_route.get("/productview", userController.productView)


//Rendering Shop Page
user_route.get("/shop", userProfileController.getShopProduct)
user_route.post('/shop/update-filters', userProfileController.filterProduct);
user_route.post("/shop/count",userProfileController.getCount)


//USER PROFILE
user_route.get("/user-profile", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.getProfile)
user_route.post("/user-profile", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.addadress)

//Add Adress
user_route.post("/save-adress", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.addAdress)

//Update Adress
user_route.get("/update-adress", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.updateAdress)
user_route.post("/update-adress", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.saveAdressData)

//delete adress
user_route.get("/deleteadress", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.deleteAdress)

//USER CHANGEPASSWORD
user_route.get("/change-password", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.changePassword)
user_route.post("/change-password", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.verifyPassword)

//CART
user_route.post("/cart", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.addToCart)
user_route.get("/cart", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.loadAddtoCart)

//delete cartproducts
user_route.get("/deletecart/:proId", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.cartProductDelete)

//Quantity update
user_route.put("/updateqty/:cartId", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.updateQuantity)


//PROCEED TO CHECKOUT
user_route.get("/checkout", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.proceedToCheckout)
user_route.post("/validate-coupon",userAuth.is_userLoggedIn,userAuth.isBlocked,userProfileController.validateCoupon)
user_route.get("/verify-payment",userAuth.is_userLoggedIn,userAuth.isBlocked,userProfileController.verifyOnlinePayment)
user_route.post("/online-payment",userAuth.is_userLoggedIn,userAuth.isBlocked,userProfileController.OrderRazorpay)
// user_route.post("/verify-razorpay-payment",userAuth.is_userLoggedIn,userAuth.isBlocked,userProfileController.verifyRazorpay)

// user_route.post('/create-razorpay-order', razorpayController.createOrder)
// user_route.post('/verify-razorpay-payment', razorpayController.verifyPayment);

//ORDER ITEMS
user_route.post("/verify-order", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.verifyOrder)

//Show Order list
user_route.get("/order", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.showOrder)

//user cancel order
user_route.get("/cancel/:orderId/:productId", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.cancelOrder)
user_route.get("/return/:orderId/:productId", userAuth.is_userLoggedIn, userAuth.isBlocked, userProfileController.returnOrder)




//LOGOUT
user_route.get("/logout", userAuth.is_userLoggedIn, userAuth.isBlocked, userController.logout)

//404 page not found
user_route.get("/*", userProfileController.pagenotfound)



module.exports = user_route