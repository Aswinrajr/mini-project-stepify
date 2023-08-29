const User = require("../model/user/userModel")
const alert = require("alert")


//Is_user session :True (login)

const is_userLoggedIn = (req, res, next) => {
    console.log("Hi");
    if (req.session?.user_id) {
        next()
    } else {
        console.log("wELOME TO HOEM");
        res.redirect("/")
    }
}


//is_user session : False (logout)

const is_userLoggedOut = (req, res, next) => {
    if (req.session.user_id) {
        res.redirect("/")
    } else {
        next()
    }
}

//user Bloked or not
const isBlocked = async (req, res, next) => {
    const userData = await User.findOne({ email: req.session.user_id });
    if (userData) {
        if (userData.status === "Blocked") {
   
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
                alert("You are Blocked Please contact admin")
                res.redirect("/?message=You are blocked. Please contact admin.");
            });
        } else {
   
            next();
        }
    } else {
        console.log("User not found");
        res.redirect("/");
    }
};

module.exports = {

    is_userLoggedIn,
    is_userLoggedOut,
    isBlocked

}