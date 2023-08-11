const Admin = require("../../model/admin/adminModel")
const User = require("../../model/user/userModel")
const bcrypt = require("bcrypt");
const alert = require("alert")
const { CompositionHookListInstance } = require("twilio/lib/rest/video/v1/compositionHook")
const { ConversationListInstance } = require("twilio/lib/rest/conversations/v1/conversation")
const SID = process.env.Account_SID
const TOKEN = process.env.Auth_Token
const twilio = require("twilio")(SID, TOKEN)
console.log(SID, TOKEN)


// PASSWORD BYCRYPT
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

function generate_OTP() {
    console.log("in generate OTP")
    const digit = "0123456789"
    let OTP = ""

    for (i = 0; i < 5; i++) {
        OTP += digit[Math.floor(Math.random() * 10)]

    }
    return OTP
}


//LOAD LOGIN PAGE
const adminLoginPage = (req, res) => {
    try {
        console.log("Showing the Admin login page")
        res.render("adminLoginPage", { msg: '' })

    } catch (err) {
        console.log("Error in Loading admin page: ", err)

    }
}

//LOAD SIGNUP PAGE
const renderAdminRegisterPage = (req, res) => {
    try {
        console.log("Welcome to admin registration")
        res.render("adminSignUpPage", { msg: '' })
    } catch (err) {
        console.log("Error in loading admin page")
    }
}

//REGISTER NEW ADMIN
const adminRegistration = async (req, res) => {
    try {
        const existAdmin = await Admin.findOne()
        if (existAdmin) {
            res.render("adminSignUpPage", { msg: "Admin alredy exist please Log In" })

        } else {
            const name = req.body.name
            const email = req.body.email
            const mobile = req.body.mobile
            const password = req.body.password

            console.log(name, email, mobile, password)
            const spassword = await securePassword(password)
            const admin = new Admin({
                name: name,
                email: email,
                mobile: mobile,
                password: spassword
            })
            const adminData = await admin.save()
            // alert("Admin Registered successfully")
            res.redirect("/admin")
            console.log(adminData)
        }

    } catch (err) {
        // alert("Admin Is alredy Registered Please Log In")
        // res.redirect("/admin")
        console.log("Error in Admin Registration", err)
    }
}

//ADMIN LOGIN

const adminVerification = async (req, res) => {
    const adminEmail = req.body.email
    const adminPassword = req.body.password
    console.log(adminEmail, adminPassword)

    try {

        const adminData = await Admin.findOne({ email: adminEmail })
        console.log("Searching For Admin Data")
        console.log(adminData)
        if (adminData) {
            const matchPassword = await bcrypt.compare(adminPassword, adminData.password)
            if (matchPassword) {
                req.session.admin_id = adminData.email
                console.log("welcome to dashboard", req.session.admin_id)
                // res.render("adminDashboard",{adminData})
                res.redirect("/admin/dashboard")
            } else {
                console.log("Error in admin validation")
                //alert("Your Password is Incorrect Please Enter Registered Password")
                res.render("adminLoginPage", { msg: "Your Password is Incorrect Please Enter Registered Password" })
            }
        } else {
            console.log("Admin Data is not found plz registerd details")
            //alert("Please enter the registered Email and Password")
            res.render("adminLoginPage", { msg: "Please enter the registered Email and Password" })
        }
    } catch (err) {
        console.log("Error in admin Login", err)


    }
}

//FORGOT PASSWORD
const enterMobileNumber = async (req, res) => {
    try {
        res.render("otpForgotPassword", { msg: '' })

    } catch (err) {
        console.log("Error in rendering forgotpassword")
    }
}

//SENT OTP
const sentOTP = async (req, res) => {
    try {
        const adminMob = req.body.mobile


        const adminData = await Admin.findOne({ mobile: adminMob })
        console.log(adminData)

        if (adminData) {
            const OTP = generate_OTP()
            req.app.locals.aOTP = OTP
            req.app.locals.amobile = adminMob
            console.log("OTP: ", OTP, "Mobile: ", adminMob)
            console.log("aOTP: ", req.app.locals.aOTP, "aMobile: ", req.app.locals.amobile)
            console.log(OTP)
            //Using twilio to send
            await twilio.messages
                .create({
                    body: OTP,
                    to: adminMob,
                    from: "+18149047030"
                }).then((message) => {
                    console.log(message)
                    alert("OTP Send To The Registered Mobile Number")
                    res.redirect("/admin/verifyotp")
                })

        } else {
            res.render("otpForgotPassword", { msg: "" })
        }

    } catch (err) {
        console.log("Error in rendering sendOtp page", err)
    }
}

//render otp page

const renderEnterOTP = async (req, res) => {
    try {
        res.render("verifyotp", { msg: "" })

    } catch (err) {
        console.log("Error in rendering otp", err)

    }
}
//verifyotp
const adminVerifyOTP = async (req, res) => {
    try {
        console.log("req.app.locals.aOTP", req.app.locals.aOTP)
        console.log("req.body.otp", req.body.otp)
        const mobile = req.app.locals.amobile
        if (req.app.locals.aOTP === req.body.otp) {
            const adminData = await Admin.findOne({ mobile: mobile })
            console.log(adminData)
            res.redirect("/admin/changepassword")
        } else {
            console.log("Otp incorrect")
            alert("Entered OTP Is Incorrect")
            res.redirect("/admin/otpsend")
        }


    } catch (err) {
        console.log("Error in verify OTP")
    }
}
//change password
const renderResetPassword = async (req, res) => {
    try {

        res.render("forgotpassword", { msg: "" })

    } catch (err) {
        console.log("Error in rendering admin reset password")
    }
}

//verify password
const setNewPassword = async (req, res) => {
    try {
        const newpassword = req.body.newpassword
        const confirmpassword = req.body.confirmpassword
        const mobile = req.app.locals.amobile
        console.log("req.app.locals.amobile", req.app.locals.amobile)

        console.log("newpassword: ", newpassword, "req.body.newpassword: ", req.body.newpassword)
        console.log("confirmPassword: ", confirmpassword, "req.body.confirmpassword: ", req.body.confirmpassword)
        if (newpassword === confirmpassword) {
            const setNewPassword = await bcrypt.hash(newpassword, 10)
            console.log(setNewPassword)
            const adminData = await Admin.findOneAndUpdate({ mobile: mobile }, { password: setNewPassword })
            console.log("Password changed", adminData)
            res.redirect("/admin")

        } else {
            console.log("Password incorrect")
            alert("Password not match")
            res.redirect("/admin/forgotpassword")
        }

    } catch (err) {
        console.log("Error in change password")
    }
}




//LOAD ADMIN DASHBOARD
const loadDashboardPage = async (req, res) => {
    console.log(req.session.admin_id)
    try {
        const adminData = await Admin.findOne({ email: req.session.admin_id })
        if (adminData) {

            console.log("welcome to dashboard")
            res.render("adminDashboard", { adminData })

        } else {
            console.log("Admin Verification Failed")
            res.redirect("/admin")
        }
    } catch (err) {
        console.log("Error in loading Dashboard", err)
    }
}


//ADMIN LOGOUT
const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        console.log("admin logout successfully")
        res.redirect("/admin")
        alert("Admin Logout Successfully")
    } catch (err) {
        console.log("Error in admin logout")
    }
}



module.exports = {
    enterMobileNumber,
    sentOTP,
    renderEnterOTP,
    adminVerifyOTP,
    renderResetPassword,
    setNewPassword,

    adminLoginPage,
    renderAdminRegisterPage,
    adminRegistration,
    adminVerification,
    loadDashboardPage,
    adminLogout
}