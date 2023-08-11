
const productModel = require("../../model/admin/productModel");
const Order = require("../../model/orderModel")

const orderList = async (req, res) => {
    try {
        const orderList = await Order.find().sort({ createdAt: -1 });
        console.log("Order List", orderList);
        console.log("---------------------------------------------------------------------");

        const combinedOrderList = [];

        orderList.forEach(order => {
            const combinedOrder = {
                orderId: order._id,
                userId: order.userId,
                userMobile: order.userMobile,
                deliveryAddress: order.deliveryAddress,
                items: order.items.map(item => ({
                    productId: item.ProductId,
                    quantity: item.quantity,
                    price: item.price,
                    status: item.status,
                    cancel: item.cancel
                })),
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
            };

            combinedOrderList.push(combinedOrder);``
        });
        res.render('adminOrderList', {data:combinedOrderList });

    } catch (error) {
        console.error("Error fetching order list:", error);
        res.status(500).send("Internal Server Error");
    }
}

const orderDelivered = async(req,res)=>{
    try{
        if(req.session.admin_id){
            console.log("welcome to update status route")
            const {orderId, productId} = req.params;
            console.log("req.params.orderId", orderId, "req.params.productId", productId);
            await Order.updateOne({ _id: orderId, 'items.ProductId': productId }, { $set: {'items.$.status': 'Delivered'} });
             
            res.redirect("/admin/order")
        }else{
            res.redirect("/admin")
        }

    }catch(err){
        console.log("error in conform order",err)
    }
}

const orderShipped = async(req,res)=>{
    try{
        if(req.session.admin_id){
            console.log("welcome to update status route")
            const {orderId, productId} = req.params;
            console.log("req.params.orderId", orderId, "\n", productId);
            await Order.updateOne({ _id: orderId, 'items.ProductId': productId }, { $set: {'items.$.status': 'Shipped'} });
             
            res.redirect("/admin/order")
        }else{
            res.redirect("/admin")
        }

    }catch(err){
        console.log("error in conform order",err)
    }
}






module.exports = {
    orderList,
    orderDelivered,
    orderShipped
}