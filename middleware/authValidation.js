const Admin = require("../model/admin/adminModel")
const bcrypt = require("bcrypt")

// is admin exist in data base
const isAdminExist = async(req,res,next)=>{
    const adminData = await Admin.findOne({email:req.body.email,mobile:req.body.mobile})
    if(adminData){
        console.log("Admin Alredy exist")
        res.redirect("/admin")
    }else{
        next()
    }
}

//Is_admin session :True (login)

const is_adminLoggedIn = (req,res,next)=>{
    if(req.session.admin_id){
        next()
    }else{
        console.log("")
        res.redirect("/admin")
    }
}

//is_admin session : False (logout)

const is_adminLoggedOut = (req,res,next)=>{
    if(req.session.admin_id){
        res.redirect("/admin/dashboard")
    }else{
        console.log("in admin logout middleware")
        next()
    }
}

module.exports = {
    isAdminExist,
    is_adminLoggedIn,
    is_adminLoggedOut
    
}