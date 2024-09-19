const User = require("../../model/user/userModel")
const alert = require("alert")

//List
const listUser =async (req,res)=>{
    try{
        console.log("Welcome to User list")
        const userData = await User.find({})
        console.log(userData)
        res.render("stepifyUserList",{data:userData})

    }catch(err){
        console.log("Error in User listing",err)
        res.status(500).render("wentWrong")

    }
}

const unlistuser = async (req, res) => {
    try {
        const userId = req.query.id
        console.log(userId)
        const userData = await User.findById(userId)
        console.log("userData", userData)
        if (userData.status === "Active") {
            await User.updateOne({ _id: userId }, { $set: {status: "Blocked"} })
            console.log("Unlisted data", userData)
            

        } else {
            await User.updateOne({ _id: userId }, { $set: { status: "Active" } })
            console.log("listed data", userData)
         
        }
        res.redirect("/admin/user")

    } catch (err) {
        console.log('in unlist userController : ' , err);
        res.status(500).render("wentWrong")
    }
};



module.exports = {
    listUser,
    unlistuser
}