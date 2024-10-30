const Expenses = require('../models/expenses');
const User = require('../models/users');
const Sequelize = require('sequelize');

const sequalize = require('../util/database');

exports.getUserLeaderBoard = async (req, res, next) => {
    try {
        const leaderBoard = await User.findAll({
            attributes: [
                'id',
                'name',
                'total_expenses' 
            ],
            order: [['total_expenses', 'DESC']] 
        });

       
        const formattedLeaderBoard = leaderBoard.map(user => ({
            id: user.id,
            name: user.name,
            total_cost: user.total_expenses || 0 
        }));

        res.status(200).json(formattedLeaderBoard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err); 
        res.status(501).json({ message: 'Something went wrong', error: err });
    }
};
