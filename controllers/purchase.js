const  Razorpay = require('razorpay');
const Order = require('../models/order');
const userController =require('./users');
const User=require('../models/users');


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

    
            const newOrder = new Order({
                userId: req.user._id,
                orderid: order.id,
                status: 'PENDING'
            });

            await newOrder.save();
           
            return res.status(201).json({ order, key_id: rzp.key_id });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong', error: err });
    }
};  



exports.updatetransactionstatus =async (req,res)=>{
    try{
        userId=req.user._id;
        const {payment_id,order_id} = req.body;
       
        const order = await Order.findOne({orderid:order_id});
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

    
        order.paymentid = payment_id;
        order.status = 'SUCCESSFUL';

      
        await Promise.all([
            order.save(),
            User.findByIdAndUpdate(userId, { isPremiumUser: true }) // Assuming your User model has an `isPremiumUser` field
        ]);

        return res.status(202).json({
            success: true,
            message: "Transaction Successful",
            token: userController.generateAccessToken(userId, undefined, true)
        });

    } catch (err) {
        console.log(err);
        res.status(403).json({ error: err, message: "Something Went Wrong" });
    }
};