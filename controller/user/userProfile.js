const User = require("../../model/user/userModel")
const couponSchema = require("../../model/couponModel")
const bcrypt = require("bcrypt")
const alert = require("alert")

const product = require("../../model/admin/productModel")
const Order = require("../../model/orderModel")

const { CompositionSettingsContextImpl } = require("twilio/lib/rest/video/v1/compositionSettings")
const { ConversationListInstance } = require("twilio/lib/rest/conversations/v1/conversation")
const productModel = require("../../model/admin/productModel")
const categoryModel = require("../../model/admin/categoryModel")




//VIEW USER PROFILE ADRESS

const getProfile = async (req, res) => {
    try {
        console.log("Welcome to user Profile")
        const userdata = await User.findOne({ email: req.session.user_id })
        if (userdata) {

            console.log("---------------------------------------------------------------------------")
            let adress = userdata.address
            console.log("userData.Adress in Add adress", adress)
            console.log("---------------------------------------------------------------------------")
            res.render("userProfile", { userAdress: adress })
        } else {
            res.redirect("/")

        }
    } catch (err) {
        console.log("Error in loading user Profile", err)
        // res.redirect("/")
    }
}


//SHOP PRODUCT PAGE
const getShopProduct = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id });
        if (userData) {

            const categoriesData = await categoryModel.find();
            const products = await product.find({ isAvailable: true });

            const productsPerPage = 3;
            const currentPage = parseInt(req.query.page) || 1;
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const totalPage = Math.floor(products.length / productsPerPage) + 1

            const displayedProducts = products.slice(startIndex, endIndex);


            console.log("---------------------------------------------------------------------------")
            console.log("totalPage: ", totalPage)
            console.log("---------------------------------------------------------------------------")



            const uniqueCategories = new Set();
            const uniqueBrands = new Set();

            for (const category of categoriesData) {
                uniqueCategories.add(category.categoryName);
                uniqueBrands.add(category.brand);
            }

            const categories = Array.from(uniqueCategories);
            const brands = Array.from(uniqueBrands);

            console.log("Welcome to shop");
            res.render("stepifyShop", {
                userData,
                categories,
                brands,
                products: displayedProducts,
                totalPage,
                currentPage,
            });
        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.log("Error in showing the shop", err);
    }
};


//Getting data from front end

const filterProduct = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id });
        if (userData) {
            const { selectedCategories, selectedBrand, sortValue, pages } = req.body;

            console.log("pages", pages)

            let query = { isAvailable: true };

            // Add selected categories to the query
            if (selectedCategories && selectedCategories.length > 0) {
                query.categoryName = { $in: selectedCategories };
            }

            // Add selected brands to the query
            if (selectedBrand && selectedBrand.length > 0) {
                query.brand = { $in: selectedBrand };
            }

            // Get sorting options
            let sortOption = {};

            if (sortValue === 1) {
                sortOption = { price: 1 }; // Low to High
            } else if (sortValue === -1) {
                sortOption = { price: -1 }; // High to Low
            }
            console.log("query: ", query)

            // Fetch products from the database using the constructed query and sorting options

            const itemsPerPage = 3;
            // const page = parseInt(req.query.page) || 1;
            const skip = (pages - 1) * itemsPerPage;

            const filteredProducts = await product
                .find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(itemsPerPage);

            const totalCount = await product.countDocuments(query);
            const totalPages = Math.ceil(totalCount / itemsPerPage);

            console.log("count of filtered product ", totalCount)
            console.log("count of filtered totalPages", totalPages)

            res.status(200).json({
                success: true,
                filteredProducts,
                totalPages,
                totalCount,
                pages
            });



        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.log("Error in getting data from frontend:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getCount = async (req, res) => {
    try {
        const data = req.body
        console.log("Data in data: ", data)

    } catch (err) {
        console.log("Error in fetching the count", err)
    }
}



//Delete Adress
const deleteAdress = async (req, res) => {
    try {
        const userdata = await User.findOne({ email: req.session.user_id })
        console.log("welcome to dete adress 0", userdata)
        if (userdata) {
            console.log("welcome to dete adress 1")

            console.log("welcome to dete adress 2")
            const adressid = req.query.id
            let source = req.query.source
            console.log(source)
            console.log(adressid)
            const updatedUser = await User.findOneAndUpdate(
                { email: req.session.user_id, "address.items._id": adressid },
                { $pull: { "address.items": { _id: adressid } } },
                { new: true })
            console.log("adress delerted successfully");
            if (source === "add") {
                res.redirect("/user-profile")
            }
            else if (source === "checkout") {
                res.redirect("/checkout")
            } else {
                res.redirect("/")
            }


        } else {
            res.redirect("/")
        }
    } catch (err) {
        console.log("Error in deleting adress", err)
    }
}

//Add adress
const addadress = async (req, res) => {
    try {
        const userdata = await User.findOne({ email: req.session.user_id })
        if (userdata) {

            // console.log("---------------------------------------------------------------------------")
            // console.log("Userdata in Add adress", userdata)
            // console.log("---------------------------------------------------------------------------")

            const adress = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                altMobile: req.body.altMobile,
                HouseName: req.body.HouseName,
                addressLine: req.body.addressLine,
                nearestLandMark: req.body.nearestLandMark,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
            }

            //userdata.address.items.push(adress)
            const data = await User.updateOne({ email: req.session.user_id }, { $push: { "address.items": adress } })
            console.log("Adress saved")

            // console.log("Adress in userData", data);
            res.redirect("/user-profile")


        } else {
            res.redirect("/")
        }

    } catch (err) {
        console.log("Error in adding adress", err)
    }
}





//CHANGE PASSWORD
const changePassword = async (req, res) => {
    const userData = await User.findOne({ email: req.session.user_id })
    try {
        if (userData) {

            console.log("Welcome to change password")
            res.render("ChangePassword")


        } else {
            res.redirect("/")
        }
    }

    catch (err) {
        console.log("Error in changing password", err)
        // res.redirect("/")
    }
}

const verifyPassword = async (req, res) => {
    const user_id = req.session.user_id
    const userData = await User.findOne({ email: user_id })
    try {

        if (userData) {
            const oldPassword = req.body.oldPassword
            const newPassword = req.body.newPassword
            const conformPassword = req.body.conformPassword



            // console.log("Old password :", oldPassword)
            // console.log("New password :", newPassword)
            // console.log("Conform password :", conformPassword)
            // console.log("req.session.user_id: ", req.session.user_id)


            if (userData && userData.password) {
                const matchPassword = await bcrypt.compare(oldPassword, userData.password)
                // console.log("Passed MatchPassword", matchPassword)
                if (matchPassword) {
                    if (newPassword === conformPassword) {
                        const bcryptPassword = await bcrypt.hash(newPassword, 10)
                        await User.findOneAndUpdate({ email: user_id }, { password: bcryptPassword })
                        console.log("Password changed")
                        alert("Password Changed")
                        res.redirect("/login")

                    } else {
                        console.log(" password is not matched")
                        alert("Passwoed is not match")

                    }
                } else {
                    console.log("Old password is incorrect")
                    alert("Old Password is incorrect")
                }


            } else {
                res.redirect("/")
            }
        }
        else {
            alert("no user data")
            res.redirect("/")
        }


    } catch (err) {
        console.log("Error in Change Password", err)
        // res.redirect("/")
    }
}

//ADD TO CART
const addToCart = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id })

        if (userData) {

            const proId = req.body.proid
            // console.log("ProId in Addto cart", proId)

            // console.log("---------------------------------------------------------------------------")
            // console.log("UserData", userData)
            // console.log("---------------------------------------------------------------------------")
            let existProduct = userData.cart.find(element => {
                element.productId === proId
            });

            if (existProduct) {
                res.json("Product is alredy in cart")

            } else {
                const proData = await product.findById(proId)
                //const proData = await product.find({_id:proId,"userData.cart":"Listed"})
                // console.log("Product data in add to cart :  ", proData)
                const cartProduct = {
                    productId: proData._id,
                    totalPrice: proData.price
                }
                // console.log("---------------------------------------------------------------------------")

                // console.log("CartProduct in add to cart : ", cartProduct)

                // console.log("---------------------------------------------------------------------------")
                const userData = await User.updateOne({ email: req.session.user_id }, { $push: { cart: cartProduct } })
                // console.log("---------------------------------------------------------------------------")

                // console.log("User Data in Add to cart: ", userData)

                // console.log("---------------------------------------------------------------------------")
                res.status(200).json('Added..');

            }




        }

        else {
            //  res.json("please Login")
            console.log("User is not loggrd in")
            // return res.status(400).send("Not Login")
            res.redirect("/")
        }

    } catch (err) {
        console.log(err);
        // res.redirect("/")
        res.status(500).send(err.message);

    }
}

//LOARD ADD TO CART

const loadAddtoCart = async (req, res) => {
    try {
        const userData = await User.findOne({
            email: req.session.user_id
        })

        if (userData) {

            console.log("Welcome to add to cart")

            // console.log("---------------------------------------------------------------------------")
            // console.log("UserData in load Add to cart: ", userData)
            // console.log("---------------------------------------------------------------------------")
            const cartDetails = userData.cart
            const adress = userData.address
            // console.log("---------------------------------------------------------------------------")
            // console.log("User Cart Details in load add to cart : ", cartDetails)
            // console.log("User Adress data", adress)


            // console.log("---------------------------------------------------------------------------")
            const proIds = []
            cartDetails.forEach(element => {
                proIds.push(element.productId)

            })
            const products = await product.find({ _id: { $in: proIds } })
            // console.log("---------------------------------------------------------------------------")

            // console.log("Products in load add to cart: ", products)

            // console.log("---------------------------------------------------------------------------")

            //combining details in 2 data

            let cartData = new Array()
            cartDetails.forEach(data => {
                const productdata = products.filter(element => data.productId.toString() === element._id.toString())

                // console.log("---------------------------------------------------------------------------")
                // console.log("Product data in load cart", productdata)
                // console.log("---------------------------------------------------------------------------")


                const cart = {
                    id: productdata[0]._id,
                    name: productdata[0].categoryName[0],
                    image: productdata[0].image[0],
                    price: productdata[0].price,
                    status: productdata[0].status,
                    quantity: data.quantity,


                }
                // console.log("---------------------------------------------------------------------------")
                // console.log("CardData in load to cart", cart)
                // console.log("---------------------------------------------------------------------------")




                cartData.push(cart)
            })
            // console.log("---------------------------------------------------------------------------")

            // console.log("Product details; ", products)
            // console.log("---------------------------------------------------------------------------")
            res.render("userCart", { data: cartData })

        }

        else {
            res.redirect("/")
        }

    } catch (err) {
        console.log("Error in loading add to cart", err)
        // res.redirect("/")

    }
}

//Update quantity
//:cartId => :productId
const updateQuantity = async (req, res) => {
    try {
        const userData = await User.find({ email: req.session.user_id })
        console.log("welcome to update qantity")
        if (userData) {

            const cartId = req.params.cartId
            const email = req.session.user_id
            const { quantity } = req.body;

            console.log(cartId)
            console.log(email)

            const user = await User.findOneAndUpdate({ email, "cart.productId": cartId }, { $inc: { "cart.$.quantity": quantity } })
            // console.log("---------------------------------------------------------------------------")
            // console.log("user data in update quantity: ", user)
            // console.log("---------------------------------------------------------------------------")
            res.send("updated")


        } else {
            res.redirect("/")
        }
    }
    catch (err) {
        console.log("Error in update quantity in cart", err)
        // res.redirect("/")
    }
}

//Delete product

const cartProductDelete = async (req, res) => {
    const userData = await User.findOne({ email: req.session.user_id })
    try {
        if (userData) {

            console.log("welcome to delete cart")
            const proId = req.params.proId
            // console.log("---------------------------------------------------------------------------")
            // console.log(" product data cartproduct data : ProId", proId)
            // console.log("---------------------------------------------------------------------------")

            const userData = await User.findOneAndUpdate({ email: req.session.user_id }, { $pull: { cart: { productId: proId } } })
            // console.log("---------------------------------------------------------------------------")
            // console.log("UserData in cart : [userData]", userData);
            // console.log("---------------------------------------------------------------------------")
            res.redirect("/cart")

        } else {
            res.redirect("/")
        }
    }
    catch (err) {
        console.log("Error in Deleteing the ptoduct in cart", err)
        // res.redirect("/")
    }
}

//PROCEED TO CHECKOUT

const proceedToCheckout = async (req, res) => {
    try {
        const validCoupon = await couponSchema.find({ status: "Valid" })
        const userdata = await User.findOne({ email: req.session.user_id })
        if (userdata) {
            console.log("..........................................................")
            console.log("Coupon Data in the user: ", validCoupon)
            console.log("..........................................................")


            // console.log("---------------------------------------------------------------------------")
            // console.log("user data in userCart: ", userdata)
            const userAdress = userdata.address
            // console.log("user adress", userAdress)
            // console.log("---------------------------------------------------------------------------")
            // console.log("---------------------------------------------------------------------------")
            const userCart = userdata.cart
            // console.log("Cart data in userCart: ", userCart)
            // console.log("---------------------------------------------------------------------------")
            // console.log("---------------------------------------------------------------------------")
            let subtotal = 0;
            // const products = await product.find()
            // console.log("All the product in the database",products)
            // console.log("---------------------------------------------------------------------------")

            const proIds = []
            userCart.forEach(element => {
                proIds.push(element.productId)
            })
            // console.log("---------------------------------------------------------------------------")
            // console.log("All the products id in cart", proIds)

            // console.log("---------------------------------------------------------------------------")
            // console.log("---------------------------------------------------------------------------")
            const products = await product.find({ _id: { $in: proIds } })
            // console.log("All the product data in the cart", products)
            // console.log("---------------------------------------------------------------------------")

            //collecting datas

            const checkOutAdress = userdata.address.items;
            let checkOutProduct = new Array()

            // console.log("---------------------listing our data start---------------------------------")

            userCart.forEach(data => {
                const productData = products.filter(element => data.productId.toString() === element._id.toString())

                // console.log("---------------------------------------------------------------------------")
                // console.log("ProductData in cart", productData)

                // console.log("---------------------------------------------------------------------------")

                const checKOutData = {
                    productId: productData[0]._id,
                    userName: userdata.name,
                    userMobile: userdata.mobile,
                    userAdress: checkOutAdress,

                    productName: productData[0].categoryName,
                    productPrice: productData[0].price,
                    productQuantity: data.quantity,
                    totalPrice: data.quantity * productData[0].price


                }
                checkOutProduct.push(checKOutData)
                // console.log("Individual product data for check outs", checKOutData)
                // console.log("---------------------listing our data end---------------------------------")
                subtotal = subtotal + checKOutData.totalPrice
                // console.log("SubTotal: ", subtotal)
            })


            // console.log("---------------------checkoutdata---------------------------------")

            // console.log("Checkoutdetails", checkOutProduct)


            res.render("userCheckoutpage", { data: checkOutProduct, subtotal, userAdress, validCoupon })

        } else {
            res.redirect("/")
        }

    } catch (err) {
        console.log("error in proceed to checkout", err)
        // res.redirect("/")
    }
}

const validateCoupon = async (req, res) => {
    try {
        const couponArray = []
        console.log("welcome to user Checkout Page")
        const { couponCode } = req.body;
        console.log("Coupon Code in Validate copupon: ", couponCode)
        //  console.log("subtotal in Validate copupon: ",subtotal)
        const existCoupon = await couponSchema.findOne({couponCode:couponCode})
        console.log("Coupon found in database copupon: ",existCoupon)
        if(existCoupon){

            let currentDate = new Date();
            currentDate =currentDate.toISOString().split('T')[0]

            const validFromDate = existCoupon.validFrom.toISOString().split('T')[0];
            const validUntilDate = existCoupon.validUntil.toISOString().split('T')[0];

     

            console.log("currentDate : ",currentDate)
            console.log("validFrom : ",validFrom)
            console.log("validUntil : ",validUntil)
            console.log("validFromDate : ",validFromDate)
            console.log("validUntilDate : ",validUntilDate)

            if(validFromDate<=currentDate && currentDate <= validUntilDate){

                console.log("Date validdation sucesss inside if")

                if(couponArray.length===0){
                    couponArray.push(couponCode)
                    console.log("couponArray :",couponArray)
                }else{
                    console.log('Coupon Arry is not empty')
                }


            }else{

                return res.json({ message: "Coupon is Expired" });

            }




        }else{
              return res.json({ message: "Coupon not found." });
        }
        res.send("haii")


    } catch (err) {
        console.log("Error in vaidating the coupon in user checkout", err)
    }
}

//Add adress in checkout

const addAdress = async (req, res) => {
    try {
        console.log("Welcome to add adress in checkout")
        const userdata = await User.findOne({ email: req.session.user_id })
        if (userdata) {


            // console.log("---------------------------------------------------------------------------")
            // console.log("Userdata in Add adress", userdata)

            // console.log("---------------------------------------------------------------------------")
            // console.log("req.body", req.body)
            const adress = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                altMobile: req.body.altMobile,
                HouseName: req.body.HouseName,
                addressLine: req.body.addressLine,
                nearestLandMark: req.body.nearestLandMark,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
            }

            console.log("Adress", adress)


            const adressData = await User.updateOne({ email: req.session.user_id }, { $push: { "address.items": adress } })
            console.log("Adress saved", adressData)

            res.redirect("/checkout")




        } else {
            res.redirect("/")
        }


    } catch (err) {
        console.log("Error in adding adress in checkout page", err)
        // res.redirect("/")
    }

}

//update adress
const updateAdress = async (req, res) => {
    try {
        const userdata = await User.findOne({ email: req.session.user_id })
        console.log("Welcome to update route", req.session.user_id)
        if (userdata) {
            const { id } = req.query
            console.log("Adress id ", id)
            const userData = await User.findOne({ email: req.session.user_id, "address.items._id": id }, { "address.items.$": 1 })
            console.log("userData", userData.address.items)
            const data = userData.address.items
            console.log("userData", data)
            res.render("updateadress", { userAdress: data })

        } else {

            res.redirect("/")
        }

    } catch (err) {
        console.log("Error in Update Adress", err)
    }
}

const saveAdressData = async (req, res) => {
    try {
        const userEmail = req.session.user_id;
        const addressIdToUpdate = req.query.id; // Assuming you're passing the address ID in the query

        const userData = await User.findOne({ email: userEmail });
        console.log("Welcome to update adress in checkout", addressIdToUpdate, userEmail)
        if (userData) {

            const newAddress = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                altMobile: req.body.altMobile,
                HouseName: req.body.HouseName,
                addressLine: req.body.addressLine,
                nearestLandMark: req.body.nearestLandMark,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
            };

            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail, "address.items._id": addressIdToUpdate },
                { $set: { "address.items.$": newAddress } },
                { new: true }
            );
            res.redirect("/checkout")



        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.log("Error in updating address", err);
    }
};






const verifyOrder = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id });
        if (userData) {

            const { addressId, paymentMethod } = req.body;

            const address = userData.address.items.find(item => item._id == addressId)
            const userCart = userData.cart;

            //productid quantity price 
            const items = []
            for (const item of userCart) {
                items.push({
                    ProductId: item.productId,
                    quantity: item.quantity,
                    price: item.totalPrice * item.quantity,

                })
            }

            const deliveryAddress = `${address.firstName} ${address.lastName},\n ${address.altMobile},\n ${address.HouseName},\n ${address.addressLine},\n${address.city}, ${address.state},\n${address.nearestLandMark},\n${address.pincode}`;

            await Order.create({
                userId: userData._id,
                userMobile: address.altMobile,
                deliveryAddress,
                items,
                paymentMethod
            })


            res.render("orderConform")




        } else {

            res.redirect("/")
        }
    } catch (err) {

        console.log("Error in verify order", err);
        res.status(500).send(err)
        // res.redirect("/")
    }
};

//USER ORDER LIST
const showOrder = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id })
        // console.log("UserData", userData)

        if (userData) {

            // console.log("userId", userData._id)

            const orderData = await Order.find({ userId: userData._id }, { deliveryAddress: 1, paymentMethod: 1, items: 1, createdAt: 1 }).sort({ createdAt: -1 })
            // console.log("------------------------------------------------------------------------------------------------------")
            // console.log("HAII ORDER DATA", orderData)
            // console.log("------------------------------------------------------------------------------------------------------")

            const productIds = orderData.flatMap(order => order.items.map(item => item.ProductId));
            const products = await productModel.find({ _id: { $in: productIds } });

            const combinedData = orderData.flatMap(order => {
                const combinedItems = order.items.map(item => {
                    const product = products.find(product => product._id.equals(item.ProductId));
                    // console.log("status undo nokkan",product)
                    return {
                        orderId: order._id,
                        paymentMethod: order.paymentMethod,
                        deliveryAddress: order.deliveryAddress,
                        categoryName: product.categoryName[0],
                        productImage: product.image[0],
                        status: item.status,
                        createdAt: order.createdAt,
                        productId: item.ProductId
                    };
                });

                return combinedItems;
            });

            console.log("------------------------------------------------------------------------------------------------------");
            console.log("Combined Data:", combinedData);
            console.log("------------------------------------------------------------------------------------------------------");

            res.render("userOrderList", { userData, combinedData });



        } else {
            res.redirect("/");
        }

    } catch (err) {
        console.log("Error in Showing the User order list", err);
        // res.redirect("/")
    }
}


//CANCEL ORDER
const cancelOrder = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id })
        console.log("Welcome to cancl order", userData)
        if (userData) {

            console.log("Welcome to cancel order inside if")
            const { orderId, productId } = req.params;
            console.log("orderId: ", orderId, "productId: ", productId)

            const ocancel = await Order.findOneAndUpdate({ _id: orderId, "items.ProductId": productId }, { $set: { "items.$.status": "Cancel" } })
            console.log("ocancel", ocancel)
            res.redirect("/order")


        } else {
            res.redirect("/")
        }
    } catch (err) {
        console.log("Error in cancel order", err)
        // res.redirect("/")
    }
}

const returnOrder = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user_id })
        if (userData) {

            console.log("Welcome to return order")
            const { orderId, productId } = req.params;
            console.log("orderId: ", orderId, "productId: ", productId)
            await Order.updateOne({ _id: orderId, "items.ProductId": productId }, { $set: { "items.$.status": "Return" } })
            res.redirect("/order")

        } else {
            res.redirect("/")
        }

    } catch (err) {
        console.log("Error in cancel order", err)
        // res.redirect("/")
    }
}


const pagenotfound = (req, res) => {
    res.render("pageNotFound")
}


module.exports = {
    getProfile,
    deleteAdress,
    saveAdressData,
    changePassword,
    verifyPassword,
    addToCart,
    loadAddtoCart,
    updateQuantity,
    cartProductDelete,
    proceedToCheckout,
    validateCoupon,
    addadress,
    pagenotfound,
    addAdress,
    updateAdress,
    verifyOrder,

    showOrder,

    cancelOrder,
    returnOrder,

    getShopProduct,
    filterProduct,
    getCount





}