
const { Body } = require('sib-api-v3-sdk');
const mongoose = require('mongoose');
const expenses = require('../models/expenses');
const users = require('../models/users');
const { Parser } = require('json2csv');

const Download = require('../models/download');

const UserExpenses=require('../services/userservices');
const S3service = require('../services/S3services');

exports.addexpenses = async(req,res,next)=>{
   
    const {amount,description,category} = req.body;
    const userId = req.user._id;

   

    if (!amount || !description || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try{
        const addexp= new expenses({
            amount,
            description,
            category,
            userId
        });
        await addexp.save();
        const user= await users.findById(userId);
       

        user.totalExpenses += parseFloat(amount);
      
        await user.save();
       

        return res.status(200).json({
            message: 'Expense added successfully!',
            expense: addexp,
          });

    }catch(err){

        console.log(err);
        res.status(500).json({
            error:err,
            message:'Something went wrong'
        })

    }
}

exports.getexpenses = async(req,res,next)=>{
    try {
        const userId = req.user._id;
    
        
        const currentPage = parseInt(req.query.page) || 1;  // Default to page 1
        const itemsPerPageLimit = parseInt(req.query.limit) || 2;  // Default limit to 10 items per page
        
        // Calculate the offset (how many items to skip based on the page number)
        const skip = (currentPage - 1) * itemsPerPageLimit;
    
        // Query the total count of expenses for the user (for pagination calculation)
        const totalExpensesCount = await expenses.countDocuments({ userId });
        
        // Calculate the total number of pages based on the count
        const totalPages = Math.ceil(totalExpensesCount / itemsPerPageLimit);
    
        // Fetch only the expenses for the current page
        const expensesData = await expenses.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(itemsPerPageLimit);
    
        
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
    const { expid } = req.params;
    const userId = req.user._id;
    
 
try{
 
    const exp = await expenses.findOne({ _id: expid, userId });

   
    if(!exp){
        return res.status(404).json({ message: 'Expense not found.' });
    }
 
    const user = await users.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    user.totalExpenses -= parseFloat(exp.amount) || 0;
        await user.save();
 await exp.deleteOne();
    return res.status(200).json({ message: 'Expense deleted successfully.' });

}catch(err){

    console.group(err);
    return res.status(500).json({
        error:err,
        message: 'Server error, please try again.'
    })
}

}


//download expense

 

exports.downloadexpenses = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from auth middleware

        // Fetch all expenses for the logged-in user
        const allExpenses = await expenses.find({ userId });

        if (!allExpenses || allExpenses.length === 0) {
            return res.status(404).json({ message: 'No expenses found.' });
        }

        // Convert expenses to CSV format
        const fields = ['amount', 'description', 'category', 'createdAt'];
        const parser = new Parser({ fields });
        const csv = parser.parse(allExpenses);

        // Send CSV file for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
        res.status(200).send(csv);

    } catch (err) {
        console.error('Error downloading expenses:', err);
        res.status(500).json({ message: 'Error fetching expenses', error: err.message });
    }
};

exports.previousdownloads = async (req, res) => {
    try {
        const userId = req.user._id;
        const recentDownloads = await Download.find({ userId }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json({ success: true, downloads: recentDownloads });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching last five downloads', error: err.message });
    }
};

//edit expense

exports.editexpenses = async(req,res,next)=>{
   
    const { expid } = req.params; // Extract expense ID from route params

    const { amount, description, category } = req.body; // Extract updated data from request body
   
    const userId=req.user._id;

    try {
        const expense = await expenses.findOne({_id: expid, userId });
        
        if (!expense) {
            return res.status(404).json({ message: "Expense not found." });
        }
        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        await expense.save();

        res.status(200).json({ message: "Expense updated successfully", expense });
    }catch(err){
        console.error("Error while editing:", err);
        res.status(500).json({message:'Error while editing:',err}); 
    }
}