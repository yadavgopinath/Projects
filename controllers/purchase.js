const  Razorpay = require('razorpay');
const Order = require('../models/order');
const { where } = require('sequelize');
const userController =require('./users');


exports.prchasepremium = async(req,res)=>{
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500; // Set your amount
        rzp.orders.create({ amount, currency: 'INR' }, async (error, order) => {
            if (error) {
               
                return res.status(500).json({ message: 'Failed to create order', error });
            }

            // Create the order in your database
            await req.user.createOrder({ orderid: order.id, status: 'PENDING' });

            // Respond with order ID and Razorpay key
            return res.status(201).json({ order, key_id: rzp.key_id });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong', error: err });
    }
};  



exports.updatetransactionstatus =async (req,res)=>{
    try{
        userId=req.user.id;
        const {payment_id,order_id} = req.body;
       
        const order = await Order.findOne({where:{orderid:order_id}});
        const promise1 = order.update({paymentid:payment_id,status:'SUCCESSFUL'})
        const promise2 = req.user.update({isprimiumuser:true});
Promise.all([promise1,promise2]).then(()=>{
    return res.status(202).json({success:true,message:"Transaction Successfull",token:userController.generateAccessToken(userId,undefined,true)});
}).catch((error)=>{
    throw new Error(error);
})

    }catch(err){
        console.log(err);
        res.status(403).json({error:err,message:"Something Went Wrong"});
    }
}