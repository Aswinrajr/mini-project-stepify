const User = require("../../model/user/userModel");
const couponSchema = require("../../model/couponModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const alert = require("alert");
const product = require("../../model/admin/productModel");
const Order = require("../../model/orderModel");
const {
  CompositionSettingsContextImpl,
} = require("twilio/lib/rest/video/v1/compositionSettings");
const {
  ConversationListInstance,
} = require("twilio/lib/rest/conversations/v1/conversation");
const productModel = require("../../model/admin/productModel");
const categoryModel = require("../../model/admin/categoryModel");
const order = require("../../model/orderModel");
const easyinvoice = require("easyinvoice");

//VIEW USER PROFILE ADRESS
const getProfile = async (req, res) => {
  try {
    console.log("Welcome to user Profile");
    const userdata = await User.findOne({ email: req.session.user_id });
    if (userdata) {
      console.log(
        "---------------------------------------------------------------------------"
      );
      let adress = userdata.address;
      console.log("userData.Adress in Add adress", adress);
      console.log(
        "---------------------------------------------------------------------------"
      );
      res.render("userProfile", { userAdress: adress });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in loading user Profile", err);
  }
};

//Search
const searchProductHome = async (req, res) => {
  const query = req.query.query;
  const userData = await User.findOne({ email: req.session.user_id });
  try {
    const products = await productModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { categoryName: { $regex: query, $options: "i" } },
      ],
    });

    res.render("webHomepage", { products, userData });
  } catch (err) {
    console.error(err);
  }
};

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
      const totalPage = Math.floor(products.length / productsPerPage) + 1;

      const displayedProducts = products.slice(startIndex, endIndex);

      console.log(
        "---------------------------------------------------------------------------"
      );
      console.log("totalPage: ", totalPage);
      console.log(
        "---------------------------------------------------------------------------"
      );

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

      console.log("pages", pages);

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
      console.log("query: ", query);

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

      console.log("count of filtered product ", totalCount);
      console.log("count of filtered totalPages", totalPages);

      res.status(200).json({
        success: true,
        filteredProducts,
        totalPages,
        totalCount,
        pages,
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
    const data = req.body;
    console.log("Data in data: ", data);
  } catch (err) {
    console.log("Error in fetching the count", err);
  }
};

//User Dahboard
const getUserDashboard = async (req, res) => {
  try {
    console.log("Welcome to user dashboard");
    const userData = await User.findOne({ email: req.session.user_id });
    res.render("userDashboard", { userData });
  } catch (err) {
    console.log("Error in Rendering the userdashboard", err);
  }
};

//Delete Adress
const deleteAdress = async (req, res) => {
  try {
    const userdata = await User.findOne({ email: req.session.user_id });
    console.log("welcome to dete adress 0", userdata);
    if (userdata) {
      console.log("welcome to dete adress 1");

      console.log("welcome to dete adress 2");
      const adressid = req.query.id;
      let source = req.query.source;
      console.log(source);
      console.log(adressid);
      const updatedUser = await User.findOneAndUpdate(
        { email: req.session.user_id, "address.items._id": adressid },
        { $pull: { "address.items": { _id: adressid } } },
        { new: true }
      );
      console.log("adress delerted successfully");
      if (source === "add") {
        res.redirect("/user-profile");
      } else if (source === "checkout") {
        res.redirect("/checkout");
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in deleting adress", err);
  }
};

//Add adress
const addadress = async (req, res) => {
  try {
    const userdata = await User.findOne({ email: req.session.user_id });
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
      };

      //userdata.address.items.push(adress)
      const data = await User.updateOne(
        { email: req.session.user_id },
        { $push: { "address.items": adress } }
      );
      console.log("Adress saved");

      // console.log("Adress in userData", data);
      res.redirect("/user-profile");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in adding adress", err);
  }
};

//CHANGE PASSWORD
const changePassword = async (req, res) => {
  const userData = await User.findOne({ email: req.session.user_id });
  try {
    if (userData) {
      console.log("Welcome to change password");
      res.render("changePassword");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in changing password", err);
    // res.redirect("/")
  }
};

const verifyPassword = async (req, res) => {
  const user_id = req.session.user_id;
  const userData = await User.findOne({ email: user_id });
  try {
    if (userData) {
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const conformPassword = req.body.conformPassword;

      // console.log("Old password :", oldPassword)
      // console.log("New password :", newPassword)
      // console.log("Conform password :", conformPassword)
      // console.log("req.session.user_id: ", req.session.user_id)

      if (userData && userData.password) {
        const matchPassword = await bcrypt.compare(
          oldPassword,
          userData.password
        );
        // console.log("Passed MatchPassword", matchPassword)
        if (matchPassword) {
          if (newPassword === conformPassword) {
            const bcryptPassword = await bcrypt.hash(newPassword, 10);
            await User.findOneAndUpdate(
              { email: user_id },
              { password: bcryptPassword }
            );
            console.log("Password changed");
            alert("Password Changed");
            res.redirect("/login");
          } else {
            console.log(" password is not matched");
            alert("Passwoed is not match");
          }
        } else {
          console.log("Old password is incorrect");
          alert("Old Password is incorrect");
        }
      } else {
        res.redirect("/");
      }
    } else {
      alert("no user data");
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in Change Password", err);
    // res.redirect("/")
  }
};

//ADD TO CART
const addToCart = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });

    if (userData) {
      const proId = req.body.proid;
      // console.log("ProId in Addto cart", proId)
      // console.log("---------------------------------------------------------------------------")
      // console.log("UserData", userData)
      // console.log("---------------------------------------------------------------------------")
      let existProduct = userData.cart.find((element) => {
        element.productId === proId;
      });

      if (existProduct) {
        res.json("Product is alredy in cart");
      } else {
        const proData = await product.findById(proId);
        // const proData = await product.find({_id:proId,"userData.cart":"Listed"})
        console.log("Product data in add to cart :  ", proData);
        const cartProduct = {
          productId: proData._id,
          totalPrice: proData.price,
          image: proData.image[0],
        };
        console.log(
          "---------------------------------------------------------------------------"
        );

        console.log("CartProduct in add to cart : ", cartProduct);

        console.log(
          "---------------------------------------------------------------------------"
        );
        const userData = await User.updateOne(
          { email: req.session.user_id },
          { $push: { cart: cartProduct } }
        );
        // console.log("---------------------------------------------------------------------------")

        // console.log("User Data in Add to cart: ", userData)

        // console.log("---------------------------------------------------------------------------")
        res.status(200).json("Added..");
      }
    } else {
      //  res.json("please Login")
      console.log("User is not loggrd in");
      // return res.status(400).send("Not Login")
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    // res.redirect("/")
  }
};
//Adding to cart from home page
const addingToCart = async (req, res) => {
  try {
    console.log("Welcome to add to cart from the home page");
    const userData = await User.findOne({ email: req.session.user_id });
    const proid = req.body.proid;
    console.log("Proid: ", proid);

    let existProduct = userData.cart.find((element) => {
      console.log(`Checking the product id: ${element.productId} === ${proid}`);
      console.log(
        "type of element.productId: ",
        typeof element.productId.toString()
      );
      console.log("type of proid: ", typeof proid);

      // Convert proid to ObjectId and then compare
      return element.productId.toString() === proid;
    });
    console.log("extinct product: ", existProduct);

    if (existProduct) {
      console.log("Item exist in cart");
      res.json("Product is already in cart");
    } else {
      const proData = await product.findById(proid);

      console.log("Product data in add to cart :  ", proData);
      const cartProduct = {
        productId: proData._id,
        totalPrice: proData.price,
        image: proData.image[0],
      };
      console.log(
        "---------------------------------------------------------------------------"
      );

      console.log("CartProduct in add to cart : ", cartProduct);

      console.log(
        "---------------------------------------------------------------------------"
      );
      const userData = await User.updateOne(
        { email: req.session.user_id },
        { $push: { cart: cartProduct } }
      );
      console.log("Item added to cart");
      res.status(200).json("Added..");
    }
  } catch (err) {
    console.log("Error in adding cart from the home page: ", err);
  }
};

//LOARD ADD TO CART
const loadAddtoCart = async (req, res) => {
  try {
    const userData = await User.findOne({
      email: req.session.user_id,
    });

    if (userData) {
      console.log("Welcome to add to cart");
      let cartTotal = 0;

      // console.log("---------------------------------------------------------------------------")
      // console.log("UserData in load Add to cart: ", userData)
      // console.log("---------------------------------------------------------------------------")
      const cartDetails = userData.cart;
      const adress = userData.address;
      // console.log("---------------------------------------------------------------------------")
      console.log("User Cart Details in load add to cart : ", cartDetails);
      // console.log("User Adress data", adress)

      // console.log("---------------------------------------------------------------------------")
      const proIds = [];
      cartDetails.forEach((element) => {
        proIds.push(element.productId);
      });
      const products = await product.find({ _id: { $in: proIds } });
      // console.log("---------------------------------------------------------------------------")

      // console.log("Products in load add to cart: ", products)

      // console.log("---------------------------------------------------------------------------")

      //combining details in 2 data

      let cartData = new Array();
      cartDetails.forEach((data) => {
        const productdata = products.filter(
          (element) => data.productId.toString() === element._id.toString()
        );

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
          total: data.quantity * productdata[0].price,
        };
        cartTotal = cartTotal + cart.total;
        console.log(
          "---------------------------------------------------------------------------"
        );
        console.log("CardData in load to cart", cart);
        console.log("Total amount in cart = ", cartTotal);
        console.log(
          "---------------------------------------------------------------------------"
        );

        cartData.push(cart);
      });
      // console.log("---------------------------------------------------------------------------")

      // console.log("Product details; ", products)
      // console.log("---------------------------------------------------------------------------")
      res.render("userCart", { data: cartData, totalPrice: cartTotal });
    } else {
        console.log("getting the data")
    //   res.redirect("/");
    }
  } catch (err) {
    console.log("Error in loading add to cart", err);
    // res.redirect("/")
  }
};

//Update quantity
//:cartId => :productId
// const updateQuantity = async (req, res) => {
//     try {
//         const userData = await User.find({ email: req.session.user_id })
//         console.log("welcome to update qantity")
//         if (userData) {

//             const cartId = req.params.cartId
//             const email = req.session.user_id
//             const { quantity } = req.body;
//             let cartTotalPrice = 0;
//             console.log("Quantity: ",quantity)

//             console.log(cartId)
//             console.log(email)

//             const user = await User.findOneAndUpdate(
//                 { email, "cart.productId": cartId },
//                 { $inc: { "cart.$.quantity": quantity } },
//                 { new: true } // This option returns the updated document
//               );
//             console.log("------------------------------ user.cart---------------------------------------------")
//             console.log("user data in update quantity: ", user.cart)

//             for (const item of user.cart) {
//                 cartTotalPrice += item.quantity * item.totalPrice;
//             }
//             console.log("Total price in the cart : ",cartTotalPrice)

//             console.log("----------------------------------- user.cart----------------------------------------")
//             res.json(cartTotalPrice)

//         } else {
//             res.redirect("/")
//         }
//     }
//     catch (err) {
//         console.log("Error in update quantity in cart", err)
//         // res.redirect("/")
//     }
// }

const updateQuantity = async (req, res) => {
  try {
    const email = req.session.user_id;
    const cartId = req.params.cartId;
    const { quantity } = req.body;

    const user = await User.findOneAndUpdate(
      { email, "cart.productId": cartId },
      { $inc: { "cart.$.quantity": quantity } },
      { new: true } // This option returns the updated document
    );

    if (user) {
      let cartTotalPrice = 0;
      for (const item of user.cart) {
        cartTotalPrice += item.quantity * item.totalPrice;
      }

      console.log("Updated Cart:", user.cart);
      console.log("Total price in the cart:", cartTotalPrice);

      res.json({ cart: user.cart, totalPrice: cartTotalPrice });
    } else {
      res.json({ error: "User or cart item not found." });
    }
  } catch (err) {
    console.log("Error in updating quantity in cart:", err);
    res.status(500).json({ error: "An error occurred." });
  }
};

//Delete product

const cartProductDelete = async (req, res) => {
  const userData = await User.findOne({ email: req.session.user_id });
  try {
    if (userData) {
      console.log("welcome to delete cart");
      const proId = req.params.proId;
      // console.log("---------------------------------------------------------------------------")
      // console.log(" product data cartproduct data : ProId", proId)
      // console.log("---------------------------------------------------------------------------")

      const userData = await User.findOneAndUpdate(
        { email: req.session.user_id },
        { $pull: { cart: { productId: proId } } }
      );
      // console.log("---------------------------------------------------------------------------")
      // console.log("UserData in cart : [userData]", userData);
      // console.log("---------------------------------------------------------------------------")
      res.redirect("/cart");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in Deleteing the ptoduct in cart", err);
    // res.redirect("/")
  }
};

//PROCEED TO CHECKOUT

const proceedToCheckout = async (req, res) => {
  try {
    const validCoupon = await couponSchema.find({ status: "Valid" });
    const userdata = await User.findOne({ email: req.session.user_id });
    if (userdata) {
      console.log("..........................................................");
      if (validCoupon) {
        console.log("Coupon Data in the user: ", validCoupon);
      }
      console.log("..........................................................");

      // console.log("---------------------------------------------------------------------------")
      // console.log("user data in userCart: ", userdata)
      const userAdress = userdata.address;
      // console.log("user adress", userAdress)
      // console.log("---------------------------------------------------------------------------")
      // console.log("---------------------------------------------------------------------------")
      const userCart = userdata.cart;
      // console.log("Cart data in userCart: ", userCart)
      // console.log("---------------------------------------------------------------------------")
      // console.log("---------------------------------------------------------------------------")
      let subtotal = 0;
      // const products = await product.find()
      // console.log("All the product in the database",products)
      // console.log("---------------------------------------------------------------------------")

      const proIds = [];
      userCart.forEach((element) => {
        proIds.push(element.productId);
      });
      // console.log("---------------------------------------------------------------------------")
      // console.log("All the products id in cart", proIds)

      // console.log("---------------------------------------------------------------------------")
      // console.log("---------------------------------------------------------------------------")
      const products = await product.find({ _id: { $in: proIds } });
      // console.log("All the product data in the cart", products)
      // console.log("---------------------------------------------------------------------------")

      //collecting datas

      const checkOutAdress = userdata.address.items;
      let checkOutProduct = new Array();

      // console.log("---------------------listing our data start---------------------------------")

      userCart.forEach((data) => {
        const productData = products.filter(
          (element) => data.productId.toString() === element._id.toString()
        );

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
          totalPrice: data.quantity * productData[0].price,
        };
        checkOutProduct.push(checKOutData);
        // console.log("Individual product data for check outs", checKOutData)
        // console.log("---------------------listing our data end---------------------------------")
        subtotal = subtotal + checKOutData.totalPrice;
        // console.log("SubTotal: ", subtotal)
      });

      // console.log("---------------------checkoutdata---------------------------------")
      console.log(
        "---------------------checkoutdata---------------------------------"
      );
      console.log("Checkoutdetails", checkOutProduct);
      console.log(
        "---------------------checkoutdata---------------------------------"
      );
      console.log("subtotal", subtotal);
      console.log(
        "---------------------checkoutdata---------------------------------"
      );
      console.log("userAdress", userAdress);
      console.log(
        "---------------------checkoutdata---------------------------------"
      );
      // console.log("validCoupon", validCoupon)
      console.log(
        "---------------------checkoutdata---------------------------------"
      );

      console.log(typeof subtotal);

      res.render("userCheckoutpage", {
        data: checkOutProduct,
        subtotal,
        userAdress,
        validCoupon,
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("error in proceed to checkout", err);
    // res.redirect("/")
  }
};

const validateCoupon = async (req, res) => {
  try {
    console.log("Welcome to the user Checkout Page");
    const { couponCode } = req.body;
    console.log("Coupon Code in Validate coupon: ", couponCode);

    const existCoupon = await couponSchema.findOne({ couponCode: couponCode });
    console.log("existCoupon: ", existCoupon);

    if (existCoupon) {
      const currentDate = new Date();
      const isoCurrentDate = currentDate.toISOString().split("T")[0];

      const validFromDate = existCoupon.validFrom.toISOString().split("T")[0];
      const validUntilDate = existCoupon.validUntil.toISOString().split("T")[0];

      console.log("isoCurrentDate: ", isoCurrentDate);
      console.log("validUntilDate: ", validUntilDate);
      console.log("validFromDate: ", validFromDate);

      if (validFromDate <= isoCurrentDate && validUntilDate >= isoCurrentDate) {
        console.log("Date validation success inside if");

        const userData = await User.findOne({
          email: req.session.user_id,
          userCoupens: { $elemMatch: { couponId: existCoupon._id } },
        });

        if (userData) {
          console.log("Coupon is already used by this user.");
          return res.status(400).json({ error: "Coupon is already used." }); // Sending an error response
        } else {
          console.log("Exist Coupon: ", existCoupon.amount);
          // res.json({amount:existCoupon.amount})
          console.log(
            "Coupon Validated Succesfully",
            existCoupon.amount,
            existCoupon.couponCode
          );
          return res.json({
            message: "Coupon validated successfully.",
            amount: existCoupon.amount,
            code: existCoupon.couponCode,
          });
        }
      } else {
        console.log("Coupon is Expired");
        return res.json({ err: "Coupon is Expired", amount: 0 });
      }
    } else {
      console.log("Coupon not found.");
      return res.json({ err: "Coupon not found." });
    }
  } catch (err) {
    console.log("Error in validating the coupon in user checkout", err);
    // res.status(500).json({ err: "An error occurred while validating the coupon." });
  }
};

//Veryfy online payment
const verifyOnlinePayment = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });
    console.log("User Data in Online payment:", userData);
    if (userData) {
      console.log("user data", userData);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in VerifyOnline payment: ", err);
  }
};

//Add adress in checkout

const addAdress = async (req, res) => {
  try {
    console.log("Welcome to add adress in checkout");
    const userdata = await User.findOne({ email: req.session.user_id });
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
      };

      console.log("Adress", adress);

      const adressData = await User.updateOne(
        { email: req.session.user_id },
        { $push: { "address.items": adress } }
      );
      console.log("Adress saved", adressData);

      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in adding adress in checkout page", err);
    // res.redirect("/")
  }
};

//update adress
const updateAdress = async (req, res) => {
  try {
    const userdata = await User.findOne({ email: req.session.user_id });
    console.log("Welcome to update route", req.session.user_id);
    if (userdata) {
      const { id, source } = req.query;
      console.log("Adress id ", id, "source: ", source);
      const userData = await User.findOne(
        { email: req.session.user_id, "address.items._id": id },
        { "address.items.$": 1 }
      );
      console.log("userData", userData.address.items);
      const data = userData.address.items;
      console.log("userData", data);
      res.render("updateadress", { userAdress: data, source });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in Update Adress", err);
  }
};

const saveAdressData = async (req, res) => {
  try {
    const userEmail = req.session.user_id;
    const addressIdToUpdate = req.query.id; // Assuming you're passing the address ID in the query
    let source = req.query.source;
    console.log("source : ", source);
    console.log("req.query.source : ", req.query.source);

    const userData = await User.findOne({ email: userEmail });
    console.log(
      "Welcome to update adress in checkout",
      addressIdToUpdate,
      userEmail
    );
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
      if (source == "add") {
        res.redirect("/user-profile");
      } else if (source == "checkout") {
        res.redirect("/checkout");
      } else {
        console.log("In update else");
        res.redirect("/");
      }
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
      const { addressId, paymentMethod, amounttopay, usedCouponCode } =
        req.body;

      console.log(
        "addressId: ",
        addressId,
        "paymentMethod: ",
        paymentMethod,
        "usedCouponCode: ",
        usedCouponCode,
        "amounttopay: ",
        amounttopay
      );

      const address = userData.address.items.find(
        (item) => item._id == addressId
      );
      const userCart = userData.cart;
      const orderDate = new Date();
      console.log("userCart: ", userCart);

      const expectedDeliveryDate = new Date(orderDate);
      expectedDeliveryDate.setDate(orderDate.getDate() + 7);

      const newCoupon = await couponSchema.findOne({
        couponCode: usedCouponCode,
      });
      console.log("Inside verify order: ", newCoupon);
      console.log("User Coupons", usedCouponCode);
      let couponAmount;
      if (newCoupon) {
        couponAmount = newCoupon.amount;
      } else {
        couponAmount = 0;
      }
      let totalPrice = 0;

      //productid quantity price
      const items = [];
      for (const item of userCart) {
        items.push({
          ProductId: item.productId,
          quantity: item.quantity,
          price: item.totalPrice * item.quantity - couponAmount,
          image: item.image,
        });
        totalPrice =
          totalPrice + (item.totalPrice * item.quantity - couponAmount);
        console.log(
          "totalPrice: ",
          totalPrice + (item.totalPrice * item.quantity - couponAmount)
        );
      }
      console.log("Total price: ", totalPrice);

      const deliveryAddress = `${address.firstName} ${address.lastName},\n ${address.altMobile},\n ${address.HouseName},\n ${address.addressLine},\n${address.city}, ${address.state},\n${address.nearestLandMark},\n${address.pincode}`;

      await Order.create({
        userId: userData._id,
        userMobile: address.altMobile,
        deliveryAddress,
        items,
        paymentMethod,
        usedCouponCode,
        expectedDeliveryDate: expectedDeliveryDate.toISOString().split("T")[0],
        totalAmount: totalPrice,
      });

      for (const item of userCart) {
        console.log("Haii achuuuuu");
        const proId = item.productId;
        const quantity = parseInt(item.quantity);
        const product = await productModel.findOne({ _id: proId });
        const productQuantity = parseInt(product.quantity);
        const updateQuantity = productQuantity - quantity;
        const productUpdated = await productModel.findOneAndUpdate(
          { _id: proId },
          { $set: { quantity: updateQuantity } }
        );
        console.log("Updated product: ", updateQuantity);
      }
      userData.cart = [];
      await userData.save();

      if (newCoupon) {
        const user = await User.findOneAndUpdate(
          { email: req.session.user_id },
          {
            $push: {
              userCoupens: {
                couponId: newCoupon._id,
                couponCode: newCoupon.couponCode,
              },
            },
          }
        );
        console.log("USER dATA BASE:", user);
      } else {
        console.log("No coupons used");
      }

      res.render("orderConform");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in verify order", err);
    res.status(500).send(err);
  }
};

//confirmation
const verifyOrderConform = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.render("orderConform");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in Conform page", err);
  }
};

//USER ORDER LIST
const showOrder = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });

    if (userData) {
      const orderData = await Order.find(
        { userId: userData._id },
        {
          deliveryAddress: 1,
          paymentMethod: 1,
          items: 1,
          createdAt: 1,
          expectedDeliveryDate: 1,
        }
      ).sort({ createdAt: -1 });
      const productIds = orderData.flatMap((order) =>
        order.items.map((item) => item.ProductId)
      );
      const products = await productModel.find({ _id: { $in: productIds } });
      console.log("----------------------------------------------------------");
      console.log(
        "orderData: ",
        orderData,
        "productIds: ",
        productIds,
        "products: ",
        products
      );

      console.log("----------------------------------------------------------");

      const combinedData = orderData.flatMap((order) => {
        const combinedItems = order.items.map((item) => {
          const product = products.find((product) =>
            product._id.equals(item.ProductId)
          );
          return {
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            deliveryAddress: order.deliveryAddress,
            categoryName: product.categoryName[0],
            brand: product.brand,
            productImage: product.image[0],
            status: item.status,
            createdAt: order.createdAt.toISOString().split("T")[0],
            productId: item.ProductId,
            expectedDeliveryDate: order.expectedDeliveryDate
              ? order.expectedDeliveryDate.toISOString().split("T")[0]
              : null,
          };
        });

        return combinedItems;
      });
      console.log("Combined data: ", combinedData);

      res.render("userOrderList", { userData, combinedData });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in Showing the User order list", err);
  }
};
//Order List onclick
const viewOrder = async (req, res) => {
  try {
    console.log("Welcome to orderList onclick");
    const orderId = req.query.orderId;
    console.log("OrderId: ", orderId);
    const orderData = await Order.findOne({ _id: orderId });
    console.log("Order Data: ", orderData);

    const deliveryDate = orderData.expectedDeliveryDate
      .toISOString()
      .split("T")[0];

    res.render("orderViewProduct", { data: orderData, deliveryDate });
  } catch (err) {
    console.log("Error in showing the Order details: ", err);
  }
};

//CANCEL ORDER
const cancelOrder = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });
    console.log("Welcome to cancl order", userData);
    if (userData) {
      console.log("Welcome to cancel order inside if");
      const { orderId, productId } = req.params;
      console.log("orderId: ", orderId, "productId: ", productId);

      const ocancel = await Order.findOneAndUpdate(
        { _id: orderId, "items.ProductId": productId },
        { $set: { "items.$.status": "Requested for Cancel" } }
      );
      console.log("ocancel", ocancel);
      res.redirect("/order");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in cancel order", err);
    // res.redirect("/")
  }
};

const returnOrder = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });
    if (userData) {
      console.log("Welcome to return order");
      const { orderId, productId } = req.params;
      const reason = req.query.reason;
      console.log("reason: ", reason);
      console.log("orderId: ", orderId, "productId: ", productId);
      const orderData = await Order.findOneAndUpdate(
        { _id: orderId, "items.ProductId": productId },
        { $set: { "items.$.status": "Requested for Return" } }
      );

      if (reason != "defective") {
        const items = orderData.items;
        console.log("need to add quantity: ", items[0].quantity);
        let productQuantity = await productModel.findOne(
          { _id: productId },
          { quantity: 1, _id: 0 }
        );
        console.log("productQuantity: ", productQuantity.quantity);

        const number = productQuantity.quantity;
        const add = parseInt(number) + parseInt(items[0].quantity);
        console.log("productQuantity after updated: ", add);

        const updated = await productModel.findOneAndUpdate(
          { _id: productId },
          { $set: { quantity: add } }
        );
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId, "items.ProductId": productId },
          { $set: { "items.$.reason": "Recieved A wrong Item" } }
        );
        console.log("Updated", updated);
      } else {
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId, "items.ProductId": productId },
          { $set: { "items.$.reason": "Item is defactive" } }
        );
      }
      res.redirect("/order");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in cancel order", err);
    // res.redirect("/")
  }
};

const OrderRazorpay = async (req, res) => {
  try {
    // Find user data based on the session user ID
    const userData = await User.findOne({ email: req.session.user_id });

    if (!userData) {
      console.log("User data not found");
      return res.status(404).send("User not found");
    }

    // Extract payment data from the request body
    const transferData = req.body;
    console.log("trasferData: ", transferData);
    const paymentData = transferData.paymentData;
    let coupon;
    if (transferData.onlineCouponUsed) {
      coupon = transferData.onlineCouponUsed.code;
    }

    console.log("Coupon used in online payment: ", coupon);
    const couponData = await couponSchema.findOne({ couponCode: coupon });
    console.log("Coupondata in deduction: ", couponData);
    let amountDeducted = 0;
    if (couponData) {
      amountDeducted = couponData.amount;
    } else {
      amountDeducted = 0;
    }
    console.log("Amount to dedict is : ", amountDeducted);

    if (!paymentData) {
      console.log("No payment data provided");
      return res.status(400).send("No payment data provided");
    }

    console.log("Payment Data in cart:", paymentData);

    // Find the selected delivery address based on addressId
    const addressId = userData.address.items.find(
      (item) => item._id == paymentData.addressId
    );
    console.log("Address Id: ", addressId);

    const deliveryAddress = `${addressId.firstName} ${addressId.lastName},\n ${addressId.altMobile},\n ${addressId.HouseName},\n ${addressId.addressLine},\n${addressId.city}, ${addressId.state},\n${addressId.nearestLandMark},\n${addressId.pincode}`;
    console.log("deliveryAddress: ", deliveryAddress);

    // Extract the user's cart
    const cart = userData.cart;
    console.log("User Cart in Razorpay: ", cart);

    // Extract product IDs from the user's cart
    const productIds = cart.map((item) => item.productId);
    console.log("Product IDs in user's cart", productIds);

    // Calculate order-related dates
    const orderDate = new Date();
    const expectedDeliveryDate = new Date(orderDate);
    expectedDeliveryDate.setDate(orderDate.getDate() + 7);

    // Create an array of items for the order
    const items = cart.map((item) => ({
      ProductId: item.productId,
      quantity: item.quantity,
      price: item.totalPrice * item.quantity,
      image: item.image,
    }));
    console.log("Items: ", items);

    // Create a new order document
    const order = await Order.create({
      userId: userData._id,
      userMobile: addressId.altMobile,
      deliveryAddress: deliveryAddress,
      items,
      usedCouponCode: coupon,
      totalAmount: paymentData.amount,
      paymentMethod: paymentData.paymentmode,
      expectedDeliveryDate: expectedDeliveryDate.toISOString().split("T")[0],
    });
    if (couponData) {
      const user = await User.findOneAndUpdate(
        { email: req.session.user_id },
        {
          $push: {
            userCoupens: {
              couponId: couponData._id,
              couponCode: couponData.couponCode,
            },
          },
        }
      );
      console.log("USER dATA BASE:", user);
    } else {
      console.log("No coupons used");
    }
    console.log("Order Placed Successfully", order);

    // Clear the user's cart
    userData.cart = [];
    await userData.save();

    // Send a success response
    res.status(200).json({ status: "success", message: "Payment successful" });
  } catch (err) {
    console.error("Error in Razorpay payment processing", err);
  }
};

//BuyNow

const buyNow = async (req, res) => {
  try {
    if (req.session.user_id) {
      const { id } = req.query;
      console.log("id in buy now: ", id);
      const product = await productModel.findOne({ _id: id });
      const user = await User.findOne({ email: req.session.user_id });
      const validCoupon = await couponSchema.find({ status: "Valid" });
      const userAdress = user.address;
      const subtotal = parseInt(product.price);
      console.log("Adress in buy now: ", userAdress, subtotal, validCoupon);
      const Products = {
        productName: product.categoryName,
        productPrice: product.price,
        productQuantity: 1,
        totalPrice: 1 * product.price,
      };
      const walletProduct = [];
      walletProduct.push(Products);

      console.log("Product for buy: ", walletProduct);
      res.render("userCheckoutpage", {
        data: walletProduct,
        userAdress,
        subtotal,
        validCoupon,
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in buy now page", err);
  }
};

//Invoice

//---------------------------------invoice....................................

const generateInvoice = async (
  order,
  productDetails,
  subTotal,
  address,
  orderCanceled,
  orderStatus
) => {
  console.log(
    "order: ",
    order,
    "productDetails :",
    productDetails,
    "subTotal: ",
    subTotal,
    "address: ",
    subTotal
  );
  try {
    const invoiceOptions = {
      documentTitle: "Invoice",
      currency: "INR",
      taxNotation: "GST",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      images: {
        logo: "",
      },
      sender: {
        company: "Stepify",
        address: "5th Avenue Kozhikode",
        zip: "693105",
        city: "Kozhikode",
        country: "Kerala",
        phone: "7589641475",
      },
      client: {
        company: "Delivery Adress",
        address: order.deliveryAddress,
      },
      information: {
        number: order._id,
        date: order.createdAt.toLocaleDateString(),
        "due-date": order.expectedDeliveryDate.toLocaleDateString(),
      },

      products: [],

      "bottom-notice": "Kindly pay your invoice within 15 days.",
    };

    // Add products to the invoice
    productDetails.forEach((data) => {
      invoiceOptions.products.push({
        quantity: data.quantity,
        description: `${data.brand} - ${data.categoryId}`,
        "tax-rate": 0,
        price: data.price,
      });
    });

    const result = await easyinvoice.createInvoice(invoiceOptions);
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    return pdfBuffer;
  } catch (error) {
    console.log("Error generating invoice:", error);
    throw error;
  }
};

const pdf = async (req, res) => {
  try {
    const orderId = req.query.id;
    const userDetails = await User.findOne({ email: req.session.user_id });
    const orderData = await Order.findOne({ _id: orderId });

    const orderProducts = orderData.items;

    const productDetails = await Promise.all(
      orderProducts.map(async (orderProduct) => {
        const productInfo = await productModel.findOne({
          _id: orderProduct.ProductId,
        });

        return {
          categoryId: productInfo.categoryName[0],
          brand: productInfo.brand,
          quantity: orderProduct.quantity,
          price: productInfo.price,
        };
      })
    );

    // Calculate subTotal
    const subTotal = orderProducts.reduce((total, item) => {
      return total + item.price;
    }, 0);

    // Assuming you have specific fields for orderCancellation and orderStatus in orderData
    const orderCanceled = orderData.cancel;
    const orderStatus = orderData.status;

    const invoiceBuffer = await generateInvoice(
      orderData,
      productDetails,
      subTotal,
      userDetails.address,
      orderCanceled,
      orderStatus
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(invoiceBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//Wallet
const getWallet = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findOne({ email: req.session.user_id });
      res.render("userWallet", { msg: "", amount: userData.wallet });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in rendering the wallet", err);
  }
};

const pagenotfound = (req, res) => {
  res.status(404).render("pageNotFound");
};

const depositWallet = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });
    let walletAmount = userData.wallet;
    console.log("User data in Deposit Wallet: ", walletAmount);
    const amount = req.body.depositAmount;
    if (amount <= 500 && amount >= 100) {
      console.log("Amount to be deposited : ", amount);
      walletAmount = parseInt(walletAmount) + parseInt(amount);
      console.log("Wallet balence after adding the amount is: ", walletAmount);
      userData.wallet = walletAmount;
      await userData.save();
      console.log("Wallet updated successfully", userData);
      res.redirect("/user-wallet");
    } else {
      res.render("userWallet", {
        msg: "Deposit amount between 100 to 500 only",
        amount: walletAmount,
      });
    }
  } catch (err) {
    console.log("Error in depositing money to the wallet: ", err);
  }
};

//wishlist
const addWishlist = async (req, res) => {
    try {
      console.log("Welcome to wishlist, user ID:", req.session.user_id);
      
      if (req.session.user_id) {
        const userData = await User.findOne({ email: req.session.user_id });
        if (!userData) {
          return res.status(400).json({ message: "User not found" });
        }
  
        console.log("User data retrieved:", userData);
  
        // Check if wishlist exists, if not, initialize it
        if (!userData.wishList) {
          userData.wishList = [];
        }
  
        const { proId } = req.body;
        console.log("Wishlist before update: ", userData.wishList, "proId: ", proId);
  
        // Check if product exists in the product collection
        const product = await productModel.findOne({ _id: proId });
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
  
        console.log("Product Found: ", product);
  
        // Check if product already exists in the wishlist
        const existProduct = userData.wishList.some((item) =>
          item.productId.equals(proId)
        );
  
        console.log("Product exists in wishlist: ", existProduct);
  
        if (!existProduct) {
          // Push product ID to wishlist array
          userData.wishList.push({ productId: proId });
          
          console.log("Updated wishlist: ", userData.wishList);
  
          // Save the updated user document
          await userData.save();
  
          console.log("Wishlist updated and saved");
        //   return res
        //     .status(200)
        //     .json({ message: "Product added to wishlist successfully" });
        alert("wishlist added")
        res.redirect("/getwishlist")
        } else {
          console.log("Item already exists in the wishlist");
          return res
            .status(400)
            .json({ message: "Item already exists in the wishlist" });
        }
      } else {
        console.log("User is not logged in, redirecting to homepage");
        res.redirect("/");
      }
    } catch (err) {
      console.error("Error in wishlist:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

const getWishList = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.user_id });
    const userWishlist = userData.wishList;
    console.log("Wishlist for User: ", userWishlist);
    const productIds = userWishlist.map(
      (wishlistItem) => wishlistItem.productId
    );
    const products = await productModel.find({ _id: { $in: productIds } });
    console.log("All the product in the wishlist: ", products);

    res.render("userWishlist", { products });
  } catch (err) {
    console.log("Error in getting the page of the wishlist", err);
  }
};

//delete from Wishlist
const deleteWishlist = async (req, res) => {
  try {
    if (req.session.user_id) {
      const { id } = req.query;
      console.log("Product id to delete from wishlist: ", id);
      console.log("Typeof id", typeof id);
      const userEmail = req.session.user_id;
      const wishlist = await User.updateOne(
        { email: userEmail },
        { $pull: { wishList: { productId: id } } }
      );
      console.log("Wishlist: ", wishlist);
      res.redirect("/getwishlist");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("Error in deleting wishlist", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const contact = async (req, res) => {
  try {
    console.log("Welcome to contact");
    res.render("contact");
  } catch (err) {
    console.log("Errin contact", err);
    res.status(500).render("wentWrong");
  }
};

const blog = async (req, res) => {
  try {
    console.log("Welcome to contact");
    res.render("blog");
  } catch (err) {
    console.log("Errin contact", err);
    res.status(500).render("wentWrong");
  }
};

const redeemreferal = async (req, res) => {
  try {
    const code = req.body.referal;
    console.log("code: ", code);

    const referedUser = await User.findOne({
      referalCode: code,
      status: "Active",
    });
    console.log("refered user: ", referedUser);
    const email = referedUser.email;
    if (referedUser) {
      const accepedUser = await User.findOne({
        email: req.session.user_id,
        status: "Active",
      });

      const usedCode = accepedUser.usedReferal;
      if (usedCode === false) {
        console.log("Mnet added");
        let acceptedUserWallet = accepedUser.wallet;
        let referedUserWallet = referedUser.wallet;

        console.log("acceptedUserWallet: ", acceptedUserWallet);
        console.log("referedUserWallet: ", referedUserWallet);

        acceptedUserWallet += 75;
        referedUserWallet += 75;

        console.log("acceptedUserWallet: ", acceptedUserWallet);
        console.log("referedUserWallet: ", referedUserWallet);

        await User.findOneAndUpdate(
          { email: req.session.user_id, status: "Active" },
          { $set: { wallet: acceptedUserWallet, usedReferal: true } }
        );
        await User.findOneAndUpdate(
          { email: email, status: "Active" },
          { $set: { wallet: referedUserWallet } }
        );
        console.log("Monet added tp bot wallet");
      } else {
        console.log("Used referal");
        alert("Referl code is alredy used");
      }
    } else {
      console.log("referal code not exist");
      alert("Invalid user Referal Code");
    }
  } catch (err) {
    console.log("Error in reedeem referal code:", err);
    res.status(500).render("wentWrong");
  }
};

module.exports = {
  getUserDashboard,
  addWishlist,

  getProfile,
  deleteAdress,
  saveAdressData,
  changePassword,
  verifyPassword,
  addToCart,

  addingToCart,

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
  getCount,

  verifyOnlinePayment,

  OrderRazorpay,
  searchProductHome,
  viewOrder,

  verifyOrderConform,
  pdf,

  getWallet,
  depositWallet,
  buyNow,
  getWishList,
  deleteWishlist,
  contact,
  blog,
  redeemreferal,
};
