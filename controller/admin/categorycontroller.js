const Category = require("../../model/admin/categoryModel")
const alert = require("alert")

const stepifyCategoryList = async (req, res) => {
    try {
        console.log("Welcome to category list");
        
        
      const categoryData = await Category.find({});
      res.render("stepifyCategoryList", { data: categoryData });   
    } catch (err) {
      console.log("loadCategory_Controller: " + err.message);
    }
};

const loadAddCategoryPage = (req,res)=>{
    try{
        console.log("welcome to ADD category")
        res.render("stepifyAddCategory")

    }catch(err){
        console.log("Error in Add Category",err)
    }
}

const AddCategoryPage = async(req,res)=>{
    try{
        const {categoryName,brand} = req.body
        const formattedCategoryName = capitalizeFirstLetter(categoryName);
        const formattedBrand = capitalizeFirstLetter(brand);


         const existCategory = await Category.findOne({
            $or: [
                {
                    categoryName: {
                        $regex: new RegExp('^' + formattedCategoryName + '$', 'i')
                    },
                    brand: {
                        $regex: new RegExp('^' + formattedBrand + '$', 'i')
                    }
                }
            ]
        });
        if(existCategory){
            console.log("The category is alredy exist")
            alert("Category Alredy Exist Please Add New Category")
            res.redirect("/admin/category/add_category")
        }else{
            const newCategory = new Category({
                categoryName:formattedCategoryName,
                brand:formattedBrand
            })
            const newCategoryData = await newCategory.save()
            console.log("newCategory",newCategoryData)
            if(newCategoryData){
                console.log("New Category Added successfully")
                alert("New Category Added Successfully")
                res.redirect("/admin/category")
            }
            else{
                console.log("Error in saving Category")
                alert("Error Occured In Saving Category Please Try Again")
            }
        }
    }catch(err){
        console.log("Error in adding category",err)
    }
}

function capitalizeFirstLetter(inputString) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}



const editCategoryPage = async(req,res)=>{
    try{
        console.log("welcome to update catagory page");
        const catId = req.query.id;
        const category = await Category.findById(catId)
        console.log("category in edit page loading",category)
        res.render("stepifyUpdateCategory",{category})
    }catch(err){
        console.log("Error in loading update category",err)
    }

}

const updateCategory = async (req, res) => {
    try {
      const catId = req.query.id;
      const { categoryName,brand } = req.body;
      await Category.findByIdAndUpdate(catId, { categoryName,brand});
      console.log("Category updated successfully")  
      alert("Category Updated Successfully")  
      res.redirect("/admin/category");
    } catch (error) {
      console.error("Error:", error);   
    }
}



const unlistCategory = async (req,res)=>{
    try{
        const catId = req.query.id
        console.log(catId)
        const catData = await Category.findById(catId)
        console.log("catData",catData)
        if(catData.isAvailable === true){
            await Category.updateOne({_id:catId},{$set:{isAvailable:false}})
            console.log("Unlisted data",catData)
            alert("Caregory Unlisted From Database")
            
        }else{
             await Category.updateOne({_id:catId},{$set:{isAvailable:true}})
             console.log("listed data",catData)
             alert("Caregory Listed From Database")
        }
        res.redirect("/admin/category")
        
    }catch(err){
        console.log('in unlistController : '+err.msg);
    }
};



module.exports = {

    stepifyCategoryList,
    loadAddCategoryPage,
    AddCategoryPage,

    editCategoryPage,
    updateCategory,

    unlistCategory
}