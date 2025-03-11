const User = require('../models/users');

exports.getUserLeaderBoard = async (req, res, next) => {
    try {
       
        const leaderBoard = await User.find({})
            .select('id name totalExpenses')
            .sort({ totalExpenses: -1 }); 

       
        const formattedLeaderBoard = leaderBoard.map(user => ({
            id: user._id,
            name: user.name,
            total_cost: user.totalExpenses || 0 
        }));

        res.status(200).json(formattedLeaderBoard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(501).json({ message: 'Something went wrong', error: err });
    }
};
