const User = require("../../model/user/userModel")
const alert = require("alert")
const listUser =async (req,res)=>{
    try{
        console.log("Welcome to User list")
        const userData = await User.find({})
        console.log(userData)
        res.render("stepifyUserList",{data:userData})

    }catch(err){
        console.log("Error in User listing",err)

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
            alert("user Unlisted")

        } else {
            await User.updateOne({ _id: userId }, { $set: { status: "Active" } })
            console.log("listed data", userData)
            alert("User listed")
        }
        res.redirect("/admin/dashboard/user")

    } catch (err) {
        console.log('in unlist userController : ' , err);
    }
};

// const loadUserData = async (req, res) => {
//     try {
//         console.log("Welcome to User list")
//         const productData = await Product.find({})
//         res.render("stepifyProductList", { data: productData })
//     } catch (err) {
//         console.log("Error in Listing the product data")
//     }
// }

module.exports = {
    listUser,
    unlistuser
}