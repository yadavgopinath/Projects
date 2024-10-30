const Sequalize=require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order',{
    id:{
        type:Sequalize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    paymentid : Sequalize.STRING,
    orderid : Sequalize.STRING,
    status :Sequalize.STRING
})

module.exports = Order;