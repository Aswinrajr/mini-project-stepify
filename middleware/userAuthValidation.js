const User = require("../model/user/userModel")


//Is_user session :True (login)

const is_userLoggedIn = (req,res,next)=>{
    console.log("Hi");
    if(req.session?.user_id){
        next()
    }else{
        console.log("wELOME TO HOEM");
        res.redirect("/")
    }
}


//is_user session : False (logout)

const is_userLoggedOut = (req,res,next)=>{
    if(req.session.user_id){
        res.redirect("/")
    }else{
        next()
    }
}

module.exports = {
   
    is_userLoggedIn,
    is_userLoggedOut
    
}