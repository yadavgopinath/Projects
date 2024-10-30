const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Users=sequelize.define('users',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
    },
     
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true 
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isprimiumuser : Sequelize.BOOLEAN,
      total_expenses: {  // Adding this field
        type: Sequelize.DOUBLE,
        defaultValue: 0  // Initial total expenses will be zero
      }
 
});
module.exports=Users;