const User = require("../../model/user/userModel")
const bcrypt = require("bcrypt")
const alert = require("alert")
const { CompositionHookListInstance } = require("twilio/lib/rest/video/v1/compositionHook")
const { ConversationListInstance } = require("twilio/lib/rest/conversations/v1/conversation")
const SID = process.env.Account_SID
const TOKEN = process.env.Auth_Token
const twilio = require("twilio")(SID, TOKEN)
console.log(SID, TOKEN)

const productModel = require("../../model/admin/productModel")


//PASSWORD BCRYPT
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (err) {
        console.log("Error in bcrypt", err)
    }
}

// TO GENERATE OTP
function generate_OTP() {
    console.log("in generate OTP")
    const digit = "0123456789"
    let OTP = ""

    for (i = 0; i < 5; i++) {
        OTP += digit[Math.floor(Math.random() * 10)]

    }
    return OTP
}

//Search
const searchProducts = async (req, res) => {
    const query = req.query.query;
    const userData = await User.findOne({email:req.session.user_id})
    try {
        const products = await productModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, 
                { brand: { $regex: query, $options: 'i' } }, 
                { categoryName: { $regex: query, $options: 'i' } }, 
            ],
        });

        res.render('webHomepage', { products, userData}); 
    } catch (err) {
        console.error(err);
      
    }

}
//WEBSITE HOME PAGE
const websiteHome = async (req, res) => {
    try {
        console.log("welcome to Website home page")
        const products = await productModel.find({ isAvailable: true });
        console.log("---------------------------------------------------------------------------")
        console.log("Product data in website home: [products]", products)
        console.log("---------------------------------------------------------------------------")
        let userData = null
        if (req.session.user_id) {


            console.log("userExist")
            userData = await User.find({ email: req.session.user_id })
            console.log("---------------------------------------------------------------------------")
            console.log("UserData in home page: [userData]", userData)
            console.log("---------------------------------------------------------------------------")


        } else {
            console.log("User no")


        }

        res.render("webHomepage", { products, userData })
    } catch (err) {
        console.log("Error in home Page")
    }
}

//SIGN UP PAGE
const usersignupPage = (req, res) => {
    try {
        console.log("Welcome to User Registration")
        res.render("userSignup", { msg: 'Sign up Now' })
    } catch (err) {
        console.log("Error in sign up ", err)
    }

}

//NEW USER REGISTRATION
const userRegistration = async (req, res) => {
    try {
        const existUser = await User.findOne({ email: req.body.email })
        if (!existUser) {
            const name = req.body.name
            const email = req.body.email
            const mobile = req.body.mobile
            const password = req.body.password

            console.log(name, email, mobile, password)
            const spassword = await securePassword(password)
            const user = new User({
                name: name,
                email: email,
                mobile: mobile,
                password: spassword
            })
            const userData = await user.save()
            res.render("userSignup", { msg: "User registered successfully Please log in" })
            // alert("User Registered Successfully")
            // res.redirect("/")
            console.log(userData)

        } else {
            res.render("userSignup", { msg: "User is alredy registered please log in" })
        }

    } catch (err) {
        //alert('Enter the fields')
        console.log("Error in User Registration", err)

        res.redirect("/signup")

    }
}

//USER LOGIN PAGE
const getUserLoginPage = (req, res) => {
    try {
        res.render("userLogin", { msg: 'Please Login' })
    } catch (err) {
        console.log("Error in loading the login page: ", err)
    }
}

//..............................RESET-PASSWORD...............................................................

// RENDERING THE MOBILE NUMBER PAGE 
const renderEnterMobileNumber = async (req, res) => {

    try {
        res.render("enterMobileNumber",)

    } catch (err) {
        console.log("Error in Rendering the Mobile number page in reset password")
    }
}

//REQUESTING FOR OTP
const cpSendOTP = async (req, res) => {
    try {
        const userMob = req.body.mobile
        console.log(userMob)
        const userData = await User.findOne({ mobile: userMob })
        console.log(userData)

        if (userData) {
            const OTP = generate_OTP()
            req.app.locals.sOTP = OTP
            req.app.locals.smobile = userMob
            console.log("OTP: ", OTP, "Mobile: ", userMob)
            console.log("sOTP: ", req.app.locals.sOTP, "sMobile: ", req.app.locals.smobile)
            console.log(OTP)
            //Using twilio to send
            await twilio.messages
                .create({
                    body: OTP,
                    to: userMob,
                    from: "+18149047030"
                }).then((message) => {
                    console.log(message)
                    alert("OTP Send To The Registered Mobile Number")
                    //res.render("userOTPverify")
                    res.redirect("/enter-OTP")
                })

        } else {
            res.render("enterMobileNumber")
        }

    } catch (err) {
        console.log("Error in rendering sendOtp page IN FORGOT PASSWORD", err)
    }
}


//RENDERING THE PAGE TO ENTER OTP
const renderEnterOTP = async (req, res) => {
    try {
        console.log("otp page for forgot password")
        res.render("enterOTP")

    } catch (err) {
        console.log("Error in rendering otp page for forgotpassword")
    }
}

//VERIFYING THE OTP
const cpVerifyOTP = async (req, res) => {
    try {
        console.log("req.app.locals.sOTP", req.app.locals.sOTP)
        console.log("req.body.otp", req.body.otp)
        const mobile = req.app.locals.smobile
        if (req.app.locals.sOTP === req.body.otp) {
            const userData = await User.findOne({ mobile: mobile })

            console.log(userData)
            res.redirect("/reset-password")

        } else {
            console.log("Otp incorrect")
            alert("Entered OTP Is Incorrect")
            res.render("enterOTP")
        }


    } catch (err) {
        console.log("Error in verify OTP")
    }
}

const renderResetPassword = async (req, res) => {
    try {
        console.log("Welcome to Reset password")
        res.render("setNewPassword")

    } catch (err) {
        console.log("Error in rendering reset password", err)
    }
}

const setNewPassword = async (req, res) => {
    try {
        const mobile = req.app.locals.smobile;
        const newPassword = req.body.newPassword
        const conformPassword = req.body.conformPassword
        if (newPassword === conformPassword) {
            let mobile = req.app.locals.smobile
            const bcryptPassword = await bcrypt.hash(newPassword, 10)
            let userData = await User.findOneAndUpdate({ mobile: mobile }, { password: bcryptPassword })
            console.log("NewUser Data", userData)
            res.redirect("/login")

        } else {
            console.log("Password are not match")
        }

    } catch (err) {
        console.log("Error in Resetting password", err)
    }
}



//..............................RESET-PASSWORD..............................................................



//USER VERIFICATION
const verifyUser = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        console.log(email, password)
        const products = await productModel.find({ isAvailable: true })
        const userData = await User.findOne({ email: email })
        console.log("---------------------------------------------------------------------------")
        console.log("User data for verification : [userData]", userData)
        console.log("---------------------------------------------------------------------------")



        if (userData) {
            if (userData.status === "Active") {
                const matchPassword = await bcrypt.compare(password, userData.password)
                if (matchPassword) {
                    req.session.user_id = userData.email
                    console.log("Welcome to User Profile")
                  
                    res.redirect("/")
                } else {
                  
                    res.render("userLogin", { msg: "Please enter the Registered password" })
                }
            } else {
                
                res.render("userLogin", { msg: "You are Blocked please contact admin" })
            }

        } else {
          
            res.render("userLogin", { msg: "User is not registered please sign up" })
        }


    } catch (err) {
        console.log("Error in user verification", err)
        res.redirect("/login")
    }
}

//LOAD SEND OTP PAGE
const loadSendOTP = async (req, res) => {
    try {
        console.log("You are in send otp page")
        res.render("userOTPsend")

    } catch (err) {
        console.log("Error in loading the send otp page", err)
    }
}

//SENDING OTP
const sendOTP = async (req, res) => {
    try {
        const userMob = req.body.mobile

        console.log(userMob)
        const userData = await User.findOne({ mobile: userMob })
        console.log(userData)

        if (userData) {
            const OTP = generate_OTP()
            req.app.locals.sOTP = OTP
            req.app.locals.smobile = userMob
            console.log("OTP: ", OTP, "Mobile: ", userMob)
            console.log("sOTP: ", req.app.locals.sOTP, "sMobile: ", req.app.locals.smobile)
            console.log(OTP)
            //Using twilio to send
            await twilio.messages
                .create({
                    body: OTP,
                    to: userMob,
                    from: "+18149047030"
                }).then((message) => {
                    console.log(message)
                    alert("OTP Send To The Registered Mobile Number")
                    res.render("userOTPverify")
                })

        } else {
            res.render("userOTPsend")
        }

    } catch (err) {
        console.log("Error in rendering sendOtp page", err)
    }
}

//VERIFY OTP
const verifyOTP = async (req, res) => {
    try {
        console.log("req.app.locals.sOTP", req.app.locals.sOTP)
        console.log("req.body.otp", req.body.otp)
        const mobile = req.app.locals.smobile
        if (req.app.locals.sOTP === req.body.otp) {
            const userData = await User.findOne({ mobile: mobile })
            req.session.user_id = userData.email
            console.log(userData)
            res.redirect("/")

        } else {
            console.log("Otp incorrect")
            alert("Entered OTP Is Incorrect")
            res.redirect("/otpsend")
        }


    } catch (err) {
        console.log("Error in verify OTP")
    }
}

//VIEW OF A SINGLE PRODUCT
const productView = async (req, res) => {
    try {
        const proId = req.query.id
        let existincart = false;
        let isLoggedIn = false;

        console.log("in product view : [proId]", proId)
        let userData = null
        console.log("Session id: ", req.session.user_id)
        if (req.session.user_id) {
            userData = await User.find({ email: req.session.user_id })
            console.log("Session id: ", req.session.user_id)
            console.log("---------------------------------------------------------------------------")
            console.log("User data in product view: [userData]", userData)
            console.log("---------------------------------------------------------------------------")

            userData[0].cart.forEach(element => {
                console.log(element.productId == proId);
                if (element.productId == proId) {
                    console.log("Found....😊");
                    existincart = true
                }
            })
            isLoggedIn = true;

        } 
        else {
            console.log("No user")
            alert("Please Login to Continue Shopping")
          
        }
        console.log("---------------------------------------------------------------------------")
        console.log("products in cart exist/not: [proId]", proId)
        console.log("---------------------------------------------------------------------------")


        const proData = await productModel.findById({ _id: proId })
        console.log("---------------------------------------------------------------------------")
        console.log("Product data in product view : [proData]: ", proData)
        console.log("---------------------------------------------------------------------------")
        console.log("---------------------------------------------------------------------------")
        console.log("user data in product view :[userData]: ", userData)
        console.log("---------------------------------------------------------------------------")
        res.render("productView", { proData, userData, existincart,isLoggedIn  })

    } catch (err) {
        console.log("Error in product View", err)
    }
}

const addToCart = async (req, res) => {
    try {
        let userData = null
        if (req.session.user_id) {
            userData = await User.find({ email: req.session.user_id })
            console.log("---------------------------------------------------------------------------")
            console.log("User data in addto cart: [userdata]: ", userData)
            console.log("---------------------------------------------------------------------------")
        } else {
            console.log("No user")
            alert("Please Login to Continue Shopping")
        }
    } catch (err) {
        console.log("Error in Add to Cart")
    }
}

const logout = async (req, res) => {
    req.session.destroy()
    console.log("User Logout Successfully")

    res.redirect("/")
}

module.exports = {
    websiteHome,
    usersignupPage,
    userRegistration,
    getUserLoginPage,
    loadSendOTP,
    sendOTP,
    verifyOTP,
    productView,
    verifyUser,
    addToCart,
    logout,

    //forgot password
    renderEnterMobileNumber,
    cpSendOTP,
    renderEnterOTP,
    cpVerifyOTP,
    renderResetPassword,
    setNewPassword,
    searchProducts
}