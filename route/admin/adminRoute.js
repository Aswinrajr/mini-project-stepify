const express = require("express")
const admin_route = express()
const path = require("path")
const multer = require("multer")
const fs = require("fs")

const adminController = require("../../controller/admin/adminController")
const categoryController = require("../../controller/admin/categorycontroller")
const productController =require("../../controller/admin/productController")
const adminUserController = require("../../controller/admin/adminUserController")
const orderController  = require("../../controller/admin/orderController")
const upload = require("../../middleware/multer")
const authControl = require("../../middleware/authValidation")
const couponControl = require("../../controller/admin/couponController")

// admin_route.set("view engine", "ejs")
admin_route.set("views", path.join(__dirname, "../../view/admin"));

//Admin Registration
admin_route.get("/signup",adminController.renderAdminRegisterPage)
admin_route.post("/signup",adminController.adminRegistration)

//Admin Login Page
admin_route.get("/",authControl.is_adminLoggedOut,adminController.adminLoginPage)
admin_route.get("/login",authControl.is_adminLoggedOut,adminController.adminLoginPage)
admin_route.post("/",authControl.is_adminLoggedOut,adminController.adminVerification)
admin_route.post("/login",authControl.is_adminLoggedOut,adminController.adminVerification)

//forgot password
admin_route.get("/forgotpassword",  adminController.enterMobileNumber)
admin_route.post("/forgotpassword",  adminController.sentOTP)
admin_route.get("/verifyotp",  adminController.renderEnterOTP)
admin_route.post("/verifyotp",  adminController.adminVerifyOTP)
admin_route.get("/changepassword",  adminController.renderResetPassword)
admin_route.post("/changepassword",  adminController.setNewPassword)

admin_route.get("/dashboard",authControl.is_adminLoggedIn,adminController.loadDashboardPage)

//Admin Category Control
admin_route.get("/category",authControl.is_adminLoggedIn,categoryController.stepifyCategoryList)
admin_route.get("/category/add_category",authControl.is_adminLoggedIn,categoryController.loadAddCategoryPage)
admin_route.post("/category",authControl.is_adminLoggedIn,categoryController.AddCategoryPage)

//Update Category
admin_route.get("/category/editcategory",authControl.is_adminLoggedIn,categoryController.editCategoryPage)
admin_route.post("/category/editcategory",authControl.is_adminLoggedIn,categoryController.updateCategory)

//List and Unlist Category
admin_route.get("/category/deletecategory",authControl.is_adminLoggedIn,categoryController.unlistCategory)
admin_route.post("/category/deletecategory",authControl.is_adminLoggedIn,categoryController.stepifyCategoryList)


//Product controller --> 

//Load Product Data
admin_route.get("/product",authControl.is_adminLoggedIn,productController.loadProductData)

//Add Product
admin_route.get("/product/addproduct",authControl.is_adminLoggedIn,productController.addProductData)
admin_route.post("/product/",authControl.is_adminLoggedIn,upload.array("image",3),productController.insertProductData)

//Update Product
admin_route.get("/product/editproduct",authControl.is_adminLoggedIn,productController.updateProductData)
admin_route.post("/product/editproduct",authControl.is_adminLoggedIn,upload.array("image",3),productController.newUpdatedProductData)

//Unlist product Data
admin_route.get("/product/deleteproduct",authControl.is_adminLoggedIn,productController.unlistproduct)
admin_route.post("/product/deleteproduct",authControl.is_adminLoggedIn,productController.loadProductData)

//USER CONTROLLER
admin_route.get("/user",authControl.is_adminLoggedIn,adminUserController.listUser)
admin_route.get("/user/deleteuser",authControl.is_adminLoggedIn,adminUserController.unlistuser)
admin_route.post("/user/deleteuser",authControl.is_adminLoggedIn,adminUserController.listUser)

//ORDER CONTROLLER
admin_route.get("/order",authControl.is_adminLoggedIn,orderController.orderList)

//Change order status
admin_route.get('/delivered/:orderId/:productId',authControl.is_adminLoggedIn,orderController.orderDelivered)
admin_route.get('/shipped/:orderId/:productId',authControl.is_adminLoggedIn,orderController.orderShipped)
// admin_route.post("/shipped",orderController.orderShipped)

//Coupon Control
admin_route.get("/coupon",authControl.is_adminLoggedIn,couponControl.getCoupon)
admin_route.post("/coupon",authControl.is_adminLoggedIn,couponControl.saveCoupon)

//Listing Coupons
admin_route.get("/coupon/list-coupon/:id",authControl.is_adminLoggedIn,couponControl.listCoupon)



//Logout
admin_route.get("/logout",authControl.is_adminLoggedIn,adminController.adminLogout)


module.exports = admin_route