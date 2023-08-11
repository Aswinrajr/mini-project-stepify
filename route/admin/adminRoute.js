const express = require("express")
const admin_route = express()
const path = require("path")
const multer = require("multer")

const adminController = require("../../controller/admin/adminController")
const categoryController = require("../../controller/admin/categorycontroller")
const productController =require("../../controller/admin/productController")
const adminUserController = require("../../controller/admin/adminUserController")
const orderController  = require("../../controller/admin/orderController")
//const upload = require("../../middleware/multer")

const authControl = require("../../middleware/authValidation")



admin_route.set("view engine", "ejs")
admin_route.set("views", path.join(__dirname, "../../view/admin"));



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads"); 
    },
    filename: (req, file, cb) => {
        const name = Date.now() + "-" + file.originalname; 
        cb(null, name); 
    }
});



const upload = multer({ storage: storage });

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
admin_route.get("/dashboard/category",authControl.is_adminLoggedIn,categoryController.stepifyCategoryList)
admin_route.get("/dashboard/category/add_category",authControl.is_adminLoggedIn,categoryController.loadAddCategoryPage)
admin_route.post("/dashboard/category",authControl.is_adminLoggedIn,categoryController.AddCategoryPage)

//Update Category
admin_route.get("/dashboard/category/editcategory",authControl.is_adminLoggedIn,categoryController.editCategoryPage)
admin_route.post("/dashboard/category/editcategory",authControl.is_adminLoggedIn,categoryController.updateCategory)

//List and Unlist Category
admin_route.get("/dashboard/category/deletecategory",authControl.is_adminLoggedIn,categoryController.unlistCategory)
admin_route.post("/dashboard/category/deletecategory",authControl.is_adminLoggedIn,categoryController.stepifyCategoryList)


//Product controller --> 

//Load Product Data
admin_route.get("/dashboard/product",authControl.is_adminLoggedIn,productController.loadProductData)

//Add Product
admin_route.get("/dashboard/product/addproduct",authControl.is_adminLoggedIn,productController.addProductData)
admin_route.post("/dashboard/product/",authControl.is_adminLoggedIn,upload.array("image",3),productController.insertProductData)

//Update Product
admin_route.get("/dashboard/product/editproduct",authControl.is_adminLoggedIn,productController.updateProductData)
admin_route.post("/dashboard/product/editproduct",authControl.is_adminLoggedIn,upload.array("image",3),productController.newUpdatedProductData)

//Unlist product Data

admin_route.get("/dashboard/product/deleteproduct",authControl.is_adminLoggedIn,productController.unlistproduct)
admin_route.post("/dashboard/product/deleteproduct",authControl.is_adminLoggedIn,productController.loadProductData)

//USER CONTROLLER
admin_route.get("/dashboard/user",authControl.is_adminLoggedIn,adminUserController.listUser)

admin_route.get("/dashboard/user/deleteuser",authControl.is_adminLoggedIn,adminUserController.unlistuser)
admin_route.post("/dashboard/user/deleteuser",authControl.is_adminLoggedIn,adminUserController.listUser)

//ORDER CONTROLLER
admin_route.get("/order",authControl.is_adminLoggedIn,orderController.orderList)

//Change order status
admin_route.get('/delivered/:orderId/:productId',authControl.is_adminLoggedIn,orderController.orderDelivered)
admin_route.get('/shipped/:orderId/:productId',authControl.is_adminLoggedIn,orderController.orderShipped)
// admin_route.post("/shipped",orderController.orderShipped)

//Logout
admin_route.get("/logout",authControl.is_adminLoggedIn,adminController.adminLogout)


module.exports = admin_route