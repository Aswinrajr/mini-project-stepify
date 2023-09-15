const couponSchema = require("../../model/couponModel")
const alert = require("alert")

//Create Coupon
const getCoupon = async (req, res) => {
    try {
        const coupons = await couponSchema.find().sort({validFrom:-1});
        console.log("coupons: ", coupons);

        const coupondata = coupons.map(coupon => {
            const validFromDate = coupon.validFrom.toISOString().split('T')[0];
            const validUntilDate = coupon.validUntil.toISOString().split('T')[0];

            return {
                id:coupon._id,
                code: coupon.offerCode,
                amount: coupon.amount,
                status:coupon.status,
                validFrom: validFromDate,
                validUntil: validUntilDate,
                couponCode: coupon.couponCode
            };
        });

        // console.log("coupondata: ", coupondata);

        res.render("generateCoupon", { data: coupondata });

    } catch (err) {
        console.log('Error in rendering Coupon Page', err);
        res.status(500).render("wentWrong")
    }
}


//Save Coupon
const saveCoupon = async (req, res) => {
    try {
        const couponData = new couponSchema({
            
            offerCode: req.body.code,
            amount: req.body.amount,
            validFrom:req.body.validFrom, 
            validUntil:req.body.validUntil,
        });

   

        // console.log("CouponData", couponData);

        let couponCode = `${couponData.offerCode}${couponData.amount}`;
        // console.log("couponCode :", couponCode);

        couponData.couponCode = couponCode;
    

        const existCoupon = await couponSchema.findOne({ offerCode: req.body.code, amount: req.body.amount });

        // console.log("Exist coupon: ", existCoupon);

        if (!existCoupon) {
            const coupon = await couponData.save();
            console.log("Coupon Saved Successfully: ", coupon);
        } else {
            alert("Coupon is already generated");
        }

        res.redirect("/admin/coupon");

    } catch (err) {
        console.log("Error in adding coupon", err);
        res.status(500).render("wentWrong")
    }
}

const listCoupon = async(req,res)=>{
    try{
        
        const couponId = req.params.id
        console.log("Coupon Id: ",couponId)

        const coupon = await couponSchema.findOne({_id:couponId})
        if(coupon.status == "Not Valid"){
          const test =   await couponSchema.findOneAndUpdate({_id:couponId},{$set:{status:"Valid"}})
          console.log("test 1",test)
        }else{
           const test2 = await couponSchema.updateOne({_id:couponId},{$set:{status:"Not Valid"}})
            console.log("test 2",test2)
           
        }
        console.log("New Coupon: ",coupon)
        res.redirect("/admin/coupon")

    }catch(err){
        console.log("Error in listing coupons",err)
        res.status(500).render("wentWrong")
    }
}

module.exports = {
    getCoupon,
    saveCoupon,
    listCoupon
}