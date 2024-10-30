const Sequelize = require('sequelize')
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');
const { forgotpassword } = require('../controllers/forgotpassword');

const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests',{
    id:{
        type:Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    userId:{
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Reference to the Users table
            key: 'id',
          },
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

})

module.exports =ForgotPasswordRequests;
