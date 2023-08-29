const Product = require("../../model/admin/productModel")
const fs = require('fs');
const path = require('path');


const alert = require("alert")


//Loading Product List
const loadProductData = async (req, res) => {
    try {
        console.log("Welcome to product list")
        const productData = await Product.find({})
        console.log(productData)
        res.render("stepifyProductList", { data: productData })
    } catch (err) {
        console.log("Error in Listing the product data")
    }
}
//Rendering the product page
const addProductData = async (req, res) => {
    try {
        console.log("Welcome to Add Product Page")
        res.render("stepifyAddProductPage")

    } catch (err) {
        console.log("Error in Addin Product", err)
    }
}

//Inserting The product Data
const insertProductData = async (req, res) => {
    try {

        const arrImages = []
        console.log("req.body", req.body)
        console.log("req.file", req.files)
   
        console.log("upload image", req.files["image"])
   
        const uploadImage = req.files ? req.files.map(file => file.filename) : []
        console.log("upload image", uploadImage)

        const ProductData = new Product({
            categoryName: req.body.categoryName,
            brand: req.body.brand,
            person: req.body.person,
            size: req.body.size,
            color: req.body.color,
            price: req.body.price,
            quantity: req.body.quantity,
            image: uploadImage,
            description: req.body.description,
        })
        const newProductData = await ProductData.save()
        console.log(newProductData)
        if (newProductData) {
            console.log("New Product Registered Successfully")
            alert("New product added")
            console.log(newProductData)
            res.redirect("/admin/product")
        } else {
            console.log("Product Registration Failed")
            alert("Error in adding product")
        }
    } catch (err) {
        console.log("Error in Product Registration", err)
    }
}

const updateProductData = async (req, res) => {
    try {
        console.log("welcome to update product page");
        const proId = req.query.id;
        const product = await Product.findById(proId)
        console.log("product in edit page loading", product)
        res.render("stepifyUpdateProduct", { product })
    } catch (err) {
        console.log("Error in loading update product", err)
    }

}


const newUpdatedProductData = async (req, res) => {
    try {
        const proId = req.query.id;
        const { categoryName, brand, person, size, color, price, quantity, description } = req.body;

       
        const existingProduct = await Product.findById(proId);

      
        if (req.files && req.files.length > 0) {
            for (const oldImage of existingProduct.image) {
             
                fs.unlinkSync(path.join(__dirname, '../../public/uploads', oldImage));
            }
        }

     
        let updatedImage = existingProduct.image;

        if (req.files && req.files.length > 0) {
            const uploadImages = req.files.map(file => file.filename);
            updatedImage = uploadImages;
        }

  
        const updatedProduct = await Product.findByIdAndUpdate(proId, {
            categoryName,
            brand,
            person,
            size,
            color,
            price,
            quantity,
            description,
            image: updatedImage
        });

        console.log("Product updated successfully");
        alert("Product data updated successfully");
        console.log(updatedProduct);
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error in product updation:", error);
    }
}

const unlistproduct = async (req, res) => {
    try {
        const proId = req.query.id
        console.log(proId)
        const proData = await Product.findById(proId)
        console.log("proData", proData)
        if (proData.isAvailable === true) {
            await Product.updateOne({ _id: proId }, { $set: { isAvailable: false } })
            console.log("Unlisted data", proData)
            alert("Product Unlisted")

        } else {
            await Product.updateOne({ _id: proId }, { $set: { isAvailable: true } })
            console.log("listed data", proData)
            alert("Product listed")
        }
        res.redirect("/admin/product")

    } catch (err) {
        console.log('in unlistController : ' + err.msg);
    }
};


module.exports = {
    loadProductData,
    addProductData,
    insertProductData,
    updateProductData,
    newUpdatedProductData,
    unlistproduct

}