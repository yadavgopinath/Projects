const Expense = require('../models/expenses'); 

const getExpenses = async (req, where = {}) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({ userId, ...where }).sort({ createdAt: -1 });
        return expenses;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error; 
    }
};

module.exports = {
    getExpenses
};
