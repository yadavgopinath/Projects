
const { Body } = require('sib-api-v3-sdk');
const expenses = require('../models/expenses');
const users = require('../models/users');
const sequalize = require('../util/database');
const Download = require('../models/download');

const UserExpenses=require('../services/userservices');
const S3service = require('../services/S3services');

exports.addexpenses = async(req,res,next)=>{
    const t = await sequalize.transaction();
    const {amount,description,category} = req.body;
    const userid=req.user.id;
   

    if(!amount || !description || !category || !userid){
        return res.status(500).json({message:'All fields are required'});
    }
    
    try{
        const addexp= await expenses.create({
            amount:amount,
            description:description,
            category:category,
            userId:userid
        },{transaction:t});
        const user= await users.findByPk(userid,{
  attributes:['id','total_expenses']
        },{transaction:t});
       

      user.total_expenses+=parseFloat(amount);
      
        await user.save({transaction:t});
        await t.commit();
       

        return res.status(200).json({
            message: 'Expense added successfully!',
            expense: addexp,
          });

    }catch(err){
        await t.rollback();
        console.log(err);
        res.status(500).json({
            error:err,
            message:'Something went wrong'
        })

    }
}

exports.getexpenses = async(req,res,next)=>{
    try {
        const userId = req.user.id;
    
        
        const currentPage = parseInt(req.query.page) || 1;  // Default to page 1
        const itemsPerPageLimit = parseInt(req.query.limit) || 10;  // Default limit to 10 items per page
        
        // Calculate the offset (how many items to skip based on the page number)
        const offset = (currentPage - 1) * itemsPerPageLimit;
    
        // Query the total count of expenses for the user (for pagination calculation)
        const totalExpensesCount = await expenses.count({ where: { userid: userId } });
        
        // Calculate the total number of pages based on the count
        const totalPages = Math.ceil(totalExpensesCount / itemsPerPageLimit);
    
        // Fetch only the expenses for the current page
        const expensesData = await expenses.findAll({
            where: { userid: userId },
            limit: itemsPerPageLimit,
            offset: offset,
            order: [['createdAt', 'DESC']] // Adjust 'createdAt' to your actual timestamp field if different
        });
    
        
        return res.status(200).json({
          expenses: expensesData,
          totalPages: totalPages,
          currentPage: currentPage,
          success: true
        });
    
      } catch (error) {
        console.error("Error fetching expenses:", error);
        return res.status(500).json({
          error: error,
          message: 'Server error, please try again.'
        });
      }

}

exports.deleteexpenses =  async(req,res,next)=>{
    const t= await sequalize.transaction();
    const { expid} = req.params;
    
 
try{
 
    const exp = await expenses.findOne({where:{id:expid,userId:req.user.id},
        attributes:['amount','userId','id']
    },{transaction:t});
   
    if(!exp){
        await t.rollback();
        return res.status(404).json({ message: 'Expense not found.' });
    }
 
    const user = await users.findByPk(req.user.id,{
        attributes:['id','total_expenses']
    },{transaction:t})
    user.total_expenses-=parseFloat(exp.amount);
   // Directly update the user's total expenses
   await user.save({ transaction: t });
// Delete the expense
 await exp.destroy({ transaction: t });
 await t.commit();
    return res.status(200).json({ message: 'Expense deleted successfully.' });

}catch(err){
 await t.rollback();
    console.group(err);
    return res.status(500).json({
        error:err,
        message: 'Server error, please try again.'
    })
}

}


//download expense

 

exports.downloadexpenses = async(req,res)=>{
    try{
        const expenses = await UserExpenses.getExpenses(req);
    
   
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId=req.user.id;
        const filename = `Expenses${userId}/${new Date()}.txt`;
        const fileURL = await S3service.uploadToS3(stringifiedExpenses,filename);
       
        
        await Download.create({
            userId: userId,
            fileURL: fileURL
          });
        res.status(200).json({fileURL,message:'success'}); 

    }catch(err)
    {
        console.log(err);
        res.status(500).json({fileURL:'',success:false,err})
    }
    
   

}

exports.previousdownloads = async(req,res,next)=>{
    try{
    const userId=req.user.id;
    const recentDownloads = await Download.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 5
    });


    res.status(200).json({
        success: true,
        downloads: recentDownloads
    });
}catch(err){
    console.error("Error fetching last five downloads:", err);
    res.status(500).json({message:'Error fetching last five downloads:',err}); 
}

}

//edit expense

exports.editexpenses = async(req,res,next)=>{
   
    const { expid } = req.params; // Extract expense ID from route params
    const { amount, description, category } = req.body; // Extract updated data from request body
   
    const userId=req.user.id;

    try {
        const expense = await expenses.findOne({ where: { id: expid, userId: userId } });
        
        if (!expense) {
            return res.status(404).json({ message: "Expense not found." });
        }

        // Update the expense with new values
        await expense.update({ amount, description, category });

        res.status(200).json({ message: "Expense updated successfully", expense });
    }catch(err){
        console.error("Error while editing:", err);
        res.status(500).json({message:'Error while editing:',err}); 
    }
}